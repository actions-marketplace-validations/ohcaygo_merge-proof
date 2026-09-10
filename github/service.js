"use strict";
const { collect } = require("./collect");
const { prove, freshness } = require("./proof");
const { Client } = require("./client");
const { assert, repoName, randomUUID } = require("./common");
const { installationClient, verifyWebhook } = require("./app");
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
    for (const job of this.data.queue) job.processing = false;
  }
  save() {
    this.store.save();
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
      const revision = this.data.revisions[repo.toLowerCase()] || 0;
      const capture = await collect(client, repo, pr, { mergeGroup });
      const receipt = prove(capture);
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
      // Failure is diagnostic history, not a completed-proof metering event.
      this.data.receipts[receipt.receiptId] = {
        receipt,
        current,
        published: publish,
        installationId,
      };
      if (
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
        )
      )
        this.data.completed.push({
          id: randomUUID(),
          type: "proof.completed",
          receiptId: receipt.receiptId,
          repositoryId: receipt.identity.repositoryId,
          at: receipt.issuedAt,
        });
      this.save();
      return { receipt, current };
    });
  }
  async access(id, token) {
    const row = this.data.receipts[id];
    assert(row, "NOT_FOUND");
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
    return { receipt: row.receipt, current };
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
            await client.request(
              `/repos/${job.repo}/check-runs/${row.checkId}`,
              {
                method: "PATCH",
                body: {
                  status: "completed",
                  conclusion: "neutral",
                  output: {
                    title: "STALE — RE-PROOF REQUIRED",
                    summary: `Historical ${row.receipt.verdict} remains available. Relevant evidence changed; refresh is pending.`,
                  },
                },
              },
            );
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
          );
          if (Number.isSafeInteger(check?.id))
            this.data.receipts[out.receipt.receiptId].checkId = check.id;
        } catch {
          this.data.receipts[out.receipt.receiptId].checkDelivery =
            "UNAVAILABLE";
        }
      }
      const sub = this.data.subscriptions[`${job.repositoryId}:${job.pr}`];
      if (sub) sub.latestReceiptId = out.receipt.receiptId;
      this.data.queue.shift();
    } catch {
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
