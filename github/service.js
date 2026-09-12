"use strict";
const { collect } = require("./collect");
const { prove, freshness } = require("./proof");
const { Client } = require("./client");
const { assert, repoName, randomUUID } = require("./common");
const { installationClient, verifyWebhook } = require("./app");
const policies = require("./policy");
const ledger = require("./ledger");
const { actor } = require("./actors");
class ProofService {
  constructor({
    store,
    config = {},
    clientFactory = (o) => new Client(o),
    appClient = (installationId, repositoryId) =>
      installationClient(config, installationId, repositoryId),
  }) {
    this.store = store;
    this.config = config;
    this.clientFactory = clientFactory;
    this.appClient = appClient;
    this.busy = false;
    store.data.github ||= {
      receipts: {},
      subscriptions: {},
      events: [],
      queue: [],
      revisions: {},
      completed: [],
    };
    this.data = store.data.github;
    // Existing installations keep reporting-only behavior. A blocking gate is
    // never switched on for a repository that did not ask for it.
    this.data.policies ||= {};
    ledger.area(store);
    this.meter = config.hosted ? new (require("./meter").Meter)(store) : null;
    this.customers = this.meter
      ? new (require("./customer").Customers)(this)
      : null;
    if (this.meter)
      for (const a of Object.values(this.meter.data.accounts))
        if (a.scan?.state === "RUNNING") a.scan.state = "INTERRUPTED";
    for (const job of this.data.queue) job.processing = false;
  }
  save() {
    this.store.save();
  }
  // Per repository, owner-chosen, defaulting to report-only.
  policyFor(repositoryId) {
    return this.data.policies?.[repositoryId] || null;
  }
  setPolicy(repositoryId, presetId, setByUserId = null) {
    assert(Number.isSafeInteger(repositoryId) && repositoryId > 0, "INVALID_SCOPE");
    const chosen = policies.select(presetId);
    this.data.policies[repositoryId] = {
      preset: chosen.id,
      setAt: new Date().toISOString(),
      setByUserId: Number.isSafeInteger(setByUserId) ? setByUserId : null,
    };
    this.save();
    return policies.normalize(this.data.policies[repositoryId]);
  }
  gateFor(receipt, current) {
    return policies.evaluate(
      receipt,
      current,
      this.policyFor(receipt.identity.repositoryId),
    );
  }
  startScan(installationId, repositoryId, repo) {
    const account = this.meter.account(installationId);
    const old = account.scan;
    if (old) {
      assert(old.repositoryId === repositoryId, "SCAN_TASTE_ALREADY_RESERVED");
      if (["RUNNING", "COMPLETE"].includes(old.state)) return old;
    }
    assert(!this.scanBusy, "SCAN_BUSY");
    this.scanBusy = true;
    const job = (account.scan = {
      ...old,
      id: old?.id || randomUUID(),
      installationId,
      repositoryId,
      repo,
      limit: 5,
      state: "RUNNING",
      completed: 0,
      total: null,
      result: null,
    });
    this.save();
    this.scanJob = (async () => {
      try {
        const client = await this.appClient(installationId, repositoryId);
        await client.authorize(repo, repositoryId);
        const result = await require("./scan").scan(client, repo, {
          limit: 5,
          canceled: () =>
            job.state === "CANCELED" ||
            !this.meter.data.installations[installationId]?.active,
          progress: (completed, total) => {
            job.completed = completed;
            job.total = total;
            this.save();
          },
        });
        if (job.state !== "CANCELED") {
          job.result = result;
          job.state = result.rows.some(
            (r) =>
              r.state === "UNAVAILABLE" &&
              r.reason !== "UNSUPPORTED_HISTORICAL_SHAPE",
          )
            ? "RETRY_AVAILABLE"
            : "COMPLETE";
        }
      } catch (e) {
        if (job.state !== "CANCELED") job.state = "RETRY_AVAILABLE";
      } finally {
        this.scanBusy = false;
        this.save();
      }
    })();
    return job;
  }
  async exclusive(fn) {
    assert(!this.busy, "PROOF_BUSY");
    this.busy = true;
    try {
      return await fn();
    } finally {
      this.busy = false;
    }
  }
  async run(
    repo,
    pr,
    {
      token = null,
      publish = false,
      client = null,
      mergeGroup = null,
      installationId = null,
    } = {},
  ) {
    return this.exclusive(async () => {
      assert(
        repoName(repo) && Number.isSafeInteger(pr) && pr > 0,
        "INVALID_SCOPE",
      );
      assert(Object.keys(this.data.receipts).length < 1000, "RECEIPT_CAPACITY");
      client ||= this.clientFactory({ token });
      if (this.meter) {
        this.meter.account(installationId);
        const repository = await client.get(`/repos/${repo}`);
        const pull = await client.get(`/repos/${repo}/pulls/${pr}`);
        this.meter.check(installationId, {
          repositoryId: repository.id,
          pr,
          headSha: pull.head?.sha,
        });
      }
      const revision = this.data.revisions[repo.toLowerCase()] || 0;
      const capture = await collect(client, repo, pr, { mergeGroup });
      const receipt = prove(capture, { appId: this.config.appId });
      assert(
        !publish || capture.identity.visibility === "public",
        "PRIVATE_SHARING_DENIED",
      );
      const current = freshness(receipt, capture);
      if (revision !== (this.data.revisions[repo.toLowerCase()] || 0))
        Object.assign(current, {
          state: "STALE",
          reason: "EVENT_DURING_COLLECTION",
        });
      const collectionComplete =
        receipt.verdict !== "FAIL" &&
        capture.consistency === "STABLE_OBSERVATION" &&
        [
          capture.git,
          capture.target,
          capture.remote,
          capture.checks,
          capture.statuses,
          capture.execution,
          capture.reviews,
          capture.rules.classic,
          capture.rules.active,
        ].every(
          (item) =>
            item.state === "AVAILABLE" &&
            !require("./common").hasUnavailable(item),
        );
      // No await between allowance validation, debit, receipt, and durable save.
      const metering = this.meter
        ? this.meter.complete(
            installationId,
            receipt,
            current,
            collectionComplete,
          )
        : null;
      const gate = this.gateFor(receipt, current);
      this.data.receipts[receipt.receiptId] = {
        receipt,
        current,
        gate,
        published: publish,
        installationId,
        metering,
      };
      for (const row of Object.values(this.data.receipts))
        if (
          row.receipt.receiptId !== receipt.receiptId &&
          row.receipt.identity.repositoryId === receipt.identity.repositoryId &&
          row.receipt.identity.pr === receipt.identity.pr &&
          row.receipt.identity.headSha !== receipt.identity.headSha
        )
          row.current = {
            state: "STALE",
            reason: "PR_HEAD_CHANGED",
            next: "RE-PROOF REQUIRED",
          };
      if (
        collectionComplete &&
        current.state === "CURRENT" &&
        (!this.meter || metering.charged)
      )
        this.data.completed.push({
          id: randomUUID(),
          type: "proof.completed",
          receiptId: receipt.receiptId,
          repositoryId: receipt.identity.repositoryId,
          at: receipt.issuedAt,
        });
      this.save();
      return { receipt, current, gate };
    });
  }
  async access(id, token) {
    const row = this.data.receipts[id];
    assert(row, "NOT_FOUND");
    if (this.meter) this.meter.account(row.installationId);
    // Every read rechecks visibility/access against immutable repository ID.
    // A public receipt URL is not authorization to a repository made private.
    const client = this.clientFactory({ token: token || null });
    const repo = await client.authorize(
      row.receipt.identity.repository,
      row.receipt.identity.repositoryId,
    );
    assert(token || (row.published && repo.private === false), "ACCESS_DENIED");
    return row;
  }
  resumeEntitled() {
    if (!this.meter) return;
    for (const sub of Object.values(this.data.subscriptions)) {
      if (sub.refreshState !== "ALLOWANCE_EXHAUSTED") continue;
      try {
        if (
          this.meter.usage(sub.installationId).remaining > 0 &&
          !this.data.queue.some(
            (q) => q.repositoryId === sub.repositoryId && q.pr === sub.pr,
          )
        ) {
          this.data.queue.push({ ...sub });
          sub.refreshState = "QUEUED";
        }
      } catch {} // Revoked installations stay stopped.
    }
  }
  async read(id, token, { refresh = false } = {}) {
    const row = await this.access(id, token);
    if (refresh) {
      await this.exclusive(async () => {
        try {
          const revision =
            this.data.revisions[
              row.receipt.identity.repository.toLowerCase()
            ] || 0;
          const c = await collect(
            this.clientFactory({ token }),
            row.receipt.identity.repository,
            row.receipt.identity.pr,
            {
              mergeGroup:
                row.receipt.summary.target.value?.kind === "MERGE_GROUP"
                  ? {
                      head_sha: row.receipt.summary.target.value.sha,
                      head_ref: row.receipt.summary.target.value.ref,
                      base_sha: row.receipt.identity.baseSha,
                      base_ref: `refs/heads/${row.receipt.identity.baseRef}`,
                    }
                  : null,
            },
          );
          row.current = freshness(row.receipt, c);
          if (
            revision !==
            (this.data.revisions[
              row.receipt.identity.repository.toLowerCase()
            ] || 0)
          )
            row.current = { state: "STALE", reason: "EVENT_DURING_REFRESH" };
        } catch {
          row.current =
            row.current.state === "STALE"
              ? { ...row.current, refreshState: "UNAVAILABLE" }
              : freshness(row.receipt, null);
        }
        this.save();
      });
    }
    // Saved CURRENT is never presented as live current on an unrefreshed view.
    const current =
      refresh || row.current.state === "STALE"
        ? row.current
        : {
            ...row.current,
            state: "UNAVAILABLE",
            reason: "REFRESH_REQUIRED",
            next: "Refresh evidence to establish currentness.",
          };
    return {
      receipt: row.receipt,
      current,
      // Recomputed against the currentness actually being shown, so an
      // unrefreshed or stale view never displays a satisfied merge gate.
      gate: this.gateFor(row.receipt, current),
      latestReceiptId:
        this.data.subscriptions[
          `${row.receipt.identity.repositoryId}:${row.receipt.identity.pr}`
        ]?.latestReceiptId || null,
    };
  }
  async webhook(raw, headers) {
    verifyWebhook(
      raw,
      headers["x-hub-signature-256"],
      this.config.webhookSecret,
    );
    const id = headers["x-github-delivery"],
      event = headers["x-github-event"];
    assert(
      typeof id === "string" && /^[\w-]{1,100}$/.test(id),
      "INVALID_DELIVERY",
    );
    if (this.data.events.includes(id)) return { duplicate: true };
    assert(this.data.events.length < 10000, "DELIVERY_CAPACITY");
    const p = JSON.parse(raw);
    if (event === "ping") return { received: true };
    if (this.meter && event === "installation") {
      const installationId = p.installation?.id;
      assert(Number.isSafeInteger(installationId) && installationId > 0,
        "INVALID_WEBHOOK_SCOPE");
      if (["deleted", "suspend"].includes(p.action)) {
        this.meter.disconnect(installationId);
        this.data.queue = this.data.queue.filter(
          (q) => q.installationId !== installationId,
        );
        for (const [key, s] of Object.entries(this.data.subscriptions))
          if (s.installationId === installationId)
            delete this.data.subscriptions[key];
      } else if (
        ["created", "unsuspend", "new_permissions_accepted"].includes(p.action)
      ) {
        assert(Number.isSafeInteger(p.installation.account?.id) &&
          p.installation.account.id > 0, "INVALID_WEBHOOK_SCOPE");
        this.meter.connect(installationId, p.installation.account?.id);
      } else return { ignored: true };
      this.data.events.push(id);
      this.save();
      return { accepted: true };
    }
    if (this.meter && event === "installation_repositories") {
      const installationId = p.installation?.id;
      assert(Number.isSafeInteger(installationId) && installationId > 0,
        "INVALID_WEBHOOK_SCOPE");
      assert(Array.isArray(p.repositories_removed || []) &&
        (p.repositories_removed || []).every(r => Number.isSafeInteger(r?.id) && r.id > 0),
        "INVALID_WEBHOOK_SCOPE");
      this.meter.account(installationId);
      for (const removed of p.repositories_removed || []) {
        this.data.queue = this.data.queue.filter(
          (q) =>
            q.installationId !== installationId ||
            q.repositoryId !== removed.id,
        );
        for (const [key, s] of Object.entries(this.data.subscriptions))
          if (
            s.installationId === installationId &&
            s.repositoryId === removed.id
          )
            delete this.data.subscriptions[key];
      }
      this.data.events.push(id);
      this.save();
      return { accepted: true };
    }
    // Own check publication is delivery, not independent CI proof or a refresh trigger.
    if (
      event === "check_run" &&
      String(p.check_run?.app?.id) === String(this.config.appId)
    )
      return { ignored: true };
    if (
      event === "check_suite" &&
      String(p.check_suite?.app?.id) === String(this.config.appId)
    )
      return { ignored: true };
    const repo = p.repository?.full_name,
      repositoryId = p.repository?.id,
      installationId = p.installation?.id;
    assert(
      repoName(repo) &&
        Number.isSafeInteger(repositoryId) &&
        Number.isSafeInteger(installationId),
      "INVALID_WEBHOOK_SCOPE",
    );
    if (this.meter) this.meter.account(installationId);
    if (
      this.meter &&
      event === "pull_request" &&
      p.action === "opened" &&
      !this.config.serviceIdentityIds?.includes(p.pull_request?.user?.id)
    )
      this.meter.activity(
        installationId,
        p.pull_request?.user,
        "PR_OPENED",
        `${repositoryId}:${p.pull_request?.number}`,
      );
    if (
      this.meter &&
      event === "push" &&
      p.deleted !== true &&
      Array.isArray(p.commits) && p.commits.length > 0 &&
      /^[a-f0-9]{40}$/.test(p.after || "") && !/^0+$/.test(p.after) &&
      p.sender?.type === "User" &&
      !this.config.serviceIdentityIds?.includes(p.sender.id)
    )
      this.meter.activity(
        installationId,
        p.sender,
        "PUSH",
        `${repositoryId}:${p.after}:${id}`,
      );
    const supported = [
      "pull_request",
      "pull_request_review",
      "check_run",
      "check_suite",
      "status",
      "workflow_run",
      "push",
      "merge_group",
      "repository_ruleset",
      "branch_protection_rule",
      "repository",
      "installation_repositories",
    ];
    if (!supported.includes(event)) return { ignored: true };
    this.data.events.push(id);
    // Recorded before anything is staled, so the ledger preserves what was
    // known at the decision point rather than what is known afterwards.
    if (
      event === "pull_request" &&
      p.action === "closed" &&
      p.pull_request?.merged === true
    )
      this.recordMerge(repo, repositoryId, installationId, p.pull_request);
    this.data.revisions[repo.toLowerCase()] =
      (this.data.revisions[repo.toLowerCase()] || 0) + 1;
    for (const row of Object.values(this.data.receipts))
      if (row.receipt.identity.repositoryId === repositoryId)
        row.current = {
          state: "STALE",
          historicalVerdict: row.receipt.verdict,
          reason: `GITHUB_EVENT:${event}`,
          asOf: new Date().toISOString(),
          next: "RE-PROOF REQUIRED",
        };
    if (event === "pull_request" && p.pull_request?.state === "open") {
      const pr = p.pull_request.number;
      assert(Number.isSafeInteger(pr) && pr > 0);
      const key = `${repositoryId}:${pr}`;
      assert(
        this.data.subscriptions[key] ||
          Object.keys(this.data.subscriptions).length < 100,
        "SUBSCRIPTION_CAPACITY",
      );
      this.data.subscriptions[key] = {
        ...this.data.subscriptions[key],
        repo,
        repositoryId,
        pr,
        installationId,
      };
    }
    if (event === "pull_request" && p.pull_request?.state === "closed")
      delete this.data.subscriptions[
        `${repositoryId}:${p.pull_request.number}`
      ];
    for (const s of Object.values(this.data.subscriptions).filter(
      (s) => s.repositoryId === repositoryId,
    )) {
      if (event === "merge_group")
        s.mergeGroup =
          p.action === "checks_requested"
            ? Object.fromEntries(
                ["head_sha", "head_ref", "base_sha", "base_ref"].map((k) => [
                  k,
                  p.merge_group?.[k] || null,
                ]),
              )
            : null;
      if (
        !this.data.queue.some(
          (q) =>
            !q.processing && q.repositoryId === repositoryId && q.pr === s.pr,
        )
      )
        this.data.queue.push({ ...s, mergeGroup: s.mergeGroup || null });
      else if (event === "merge_group") {
        const q = this.data.queue.find(
          (q) =>
            !q.processing && q.repositoryId === repositoryId && q.pr === s.pr,
        );
        q.mergeGroup = s.mergeGroup;
      }
    }
    this.save();
    return { accepted: true };
  }
  // One immutable row per merge. A receipt bound to a different commit than
  // the one that landed is recorded as exactly that, never as proof of it.
  recordMerge(repo, repositoryId, installationId, pull) {
    const mergedHeadSha = pull.head?.sha || null;
    const rows = Object.values(this.data.receipts).filter(
      (r) =>
        r.receipt.identity.repositoryId === repositoryId &&
        r.receipt.identity.pr === pull.number,
    );
    const bound = rows.filter(
      (r) => r.receipt.identity.headSha === mergedHeadSha,
    );
    const chosen =
      (bound.length ? bound : rows)
        .slice()
        .sort(
          (a, b) =>
            Date.parse(a.receipt.issuedAt) - Date.parse(b.receipt.issuedAt),
        )
        .pop() || null;
    return ledger.record(this.store, {
      repository: repo,
      repositoryId,
      pr: pull.number,
      installationId,
      baseRef: pull.base?.ref || null,
      mergedAt: pull.merged_at || null,
      mergeCommitSha: pull.merge_commit_sha || null,
      mergedHeadSha,
      mergedBy: actor(pull.merged_by),
      proof: ledger.proofSnapshot(
        chosen,
        mergedHeadSha,
        chosen ? this.gateFor(chosen.receipt, chosen.current) : null,
      ),
    });
  }
  async drain() {
    if (this.busy || this.draining || !this.data.queue.length) return;
    this.draining = true;
    const job = this.data.queue[0];
    job.processing = true;
    this.save();
    try {
      const client = await this.appClient(job.installationId, job.repositoryId);
      await client.authorize(job.repo, job.repositoryId);
      if (this.config.publishChecks)
        for (const row of Object.values(this.data.receipts)) {
          if (
            row.receipt.identity.repositoryId === job.repositoryId &&
            row.receipt.identity.pr === job.pr &&
            row.checkId &&
            row.current.state === "STALE"
          )
            try {
              await client.request(
                `/repos/${job.repo}/check-runs/${row.checkId}`,
                {
                  method: "PATCH",
                  body: {
                    status: "completed",
                    // Under an enforcing policy a superseded proof must not
                    // keep satisfying the required check: GitHub treats
                    // `neutral` as a pass.
                    conclusion: require("./policy").staleConclusion(
                      this.policyFor(job.repositoryId),
                    ),
                    output: {
                      title: "STALE — RE-PROOF REQUIRED",
                      summary: `Historical ${row.receipt.verdict} remains available. Relevant evidence changed; refresh is pending.`,
                    },
                  },
                },
              );
            } catch {
              // Optional delivery failure must not stop independent evidence collection.
              row.checkDelivery = "UNAVAILABLE";
            }
        }
      const out = await this.run(job.repo, job.pr, {
        client,
        mergeGroup: job.mergeGroup,
        installationId: job.installationId,
      });
      if (this.config.publishChecks) {
        try {
          const check = await require("./check").publish(
            client,
            out.receipt,
            out.current,
            this.config.origin,
            out.gate,
          );
          if (Number.isSafeInteger(check?.id)) {
            this.data.receipts[out.receipt.receiptId].checkId = check.id;
            this.data.receipts[out.receipt.receiptId].checkOn =
              check.publishedOn || null;
          }
        } catch {
          this.data.receipts[out.receipt.receiptId].checkDelivery =
            "UNAVAILABLE";
        }
      }
      const sub = this.data.subscriptions[`${job.repositoryId}:${job.pr}`];
      if (sub) sub.latestReceiptId = out.receipt.receiptId;
      this.data.queue.shift();
    } catch (error) {
      if (error.code === "ALLOWANCE_EXHAUSTED") {
        this.data.queue.shift();
        const sub = this.data.subscriptions[`${job.repositoryId}:${job.pr}`];
        if (sub) sub.refreshState = "ALLOWANCE_EXHAUSTED";
        return;
      }
      job.attempts = (job.attempts || 0) + 1;
      if (job.attempts >= 3) {
        this.data.queue.shift();
        const sub = this.data.subscriptions[`${job.repositoryId}:${job.pr}`];
        if (sub) sub.refreshState = "UNAVAILABLE";
      }
    } finally {
      job.processing = false;
      this.save();
      this.draining = false;
    }
  }
}
module.exports = { ProofService };
