"use strict";
const {
  sha,
  repoName,
  assert,
  available,
  unavailable,
  hash,
} = require("./common");
const { requirements } = require("./rules");
const commitMeta = (c) => ({
  sha: c.sha,
  parents: (c.parents || []).map((p) => p.sha),
  date: c.commit?.committer?.date || null,
});
// The linked GitHub account and its declared type. Nothing free-text: commit
// author name/email, review bodies and commit messages stay uncollected.
const account = (u) =>
  u && Number.isSafeInteger(u.id) && typeof u.login === "string"
    ? { id: u.id, login: u.login, type: typeof u.type === "string" ? u.type : null }
    : null;
// The two rule sources, projected to parameters only. Shared by proof
// collection and by the read-only merge-gate status check, so both see exactly
// the same requirements.
async function collectRules(client, repo, baseRef, branchProtected) {
  const root = `/repos/${repo}`;
  return {
    classic: await client.observe(async () => {
      try {
        const c = await client.get(
          `${root}/branches/${encodeURIComponent(baseRef)}/protection`,
        );
        return {
          required_signatures: c.required_signatures
            ? { enabled: c.required_signatures.enabled }
            : null,
          required_linear_history: c.required_linear_history
            ? { enabled: c.required_linear_history.enabled }
            : null,
          required_status_checks: c.required_status_checks
            ? {
                strict: c.required_status_checks.strict,
                contexts: c.required_status_checks.contexts || [],
                checks: (c.required_status_checks.checks || []).map((x) => ({
                  context: x.context,
                  app_id: x.app_id,
                })),
              }
            : null,
          required_pull_request_reviews: c.required_pull_request_reviews
            ? Object.fromEntries(
                [
                  "required_approving_review_count",
                  "dismiss_stale_reviews",
                  "require_code_owner_reviews",
                  "require_last_push_approval",
                ].map((k) => [k, c.required_pull_request_reviews[k] ?? false]),
              )
            : null,
          required_conversation_resolution: c.required_conversation_resolution
            ? { enabled: c.required_conversation_resolution.enabled }
            : null,
        };
      } catch (e) {
        // A protected branch can return 404 for denied access. Do not infer absence.
        if (e.status === 404 && branchProtected === false) return null;
        throw e;
      }
    }),
    active: await client.observe(async () =>
      (
        await client.list(`${root}/rules/branches/${encodeURIComponent(baseRef)}`)
      ).map((r) => ({
        type: r.type,
        ruleset_id: r.ruleset_id,
        ruleset_source_type: r.ruleset_source_type,
        parameters: r.parameters || null,
      })),
    ),
  };
}
async function identity(client, repo, pr) {
  const root = `/repos/${repo}`;
  const r = await client.get(root),
    p = await client.get(`${root}/pulls/${pr}`);
  assert(
    r.full_name.toLowerCase() === repo.toLowerCase() &&
      Number.isSafeInteger(r.id) &&
      typeof r.private === "boolean",
  );
  assert(
    p.number === pr &&
      p.base?.repo?.id === r.id &&
      sha(p.head?.sha) &&
      typeof p.base?.ref === "string",
  );
  const branch = await client.get(
    `${root}/branches/${encodeURIComponent(p.base.ref)}`,
  );
  assert(sha(branch.commit?.sha) && typeof branch.protected === "boolean");
  return {
    repository: r.full_name,
    repositoryId: r.id,
    visibility: r.private ? "private" : "public",
    authorization: client.token ? "GITHUB_TOKEN" : "PUBLIC_ANONYMOUS",
    pr,
    headSha: p.head.sha,
    headRef: p.head.ref,
    headRepository: p.head.repo?.full_name || null,
    headRepositoryId: p.head.repo?.id || null,
    baseRef: p.base.ref,
    baseSha: branch.commit.sha,
    branchProtected: branch.protected,
    prState: p.state,
    merged: p.merged === true,
    mergeCommitSha: p.merge_commit_sha,
    authorId: p.user?.id,
    // Account identity only. Git header name/email are unvalidated client
    // strings and are never stored.
    author: account(p.user),
    mergedBy: account(p.merged_by),
    githubMergeable: p.mergeable ?? "UNKNOWN",
    githubMergeState: p.mergeable_state || "UNKNOWN",
  };
}
async function collectOnce(
  client,
  repo,
  pr,
  { mergeGroup = null, historical = false } = {},
) {
  assert(repoName(repo) && Number.isSafeInteger(pr) && pr > 0, "INVALID_SCOPE");
  const i = await identity(client, repo, pr),
    root = `/repos/${repo}`;
  if (historical) {
    assert(i.merged && sha(i.mergeCommitSha), "UNSUPPORTED_HISTORICAL_SHAPE");
    const landed = commitMeta(
      await client.get(`${root}/commits/${i.mergeCommitSha}`),
    );
    assert(
      landed.sha === i.mergeCommitSha &&
        landed.parents.length === 2 &&
        landed.parents[1] === i.headSha &&
        sha(landed.parents[0]),
      "UNSUPPORTED_HISTORICAL_SHAPE",
    );
    i.analysisMode = "HISTORICAL_TWO_PARENT_MERGE";
    i.observedCurrentBaseSha = i.baseSha;
    i.baseSha = landed.parents[0];
  }
  const rules = await collectRules(client, repo, i.baseRef, i.branchProtected);
  const req = requirements(rules);
  const git = await client.observe(async () => {
    const d = await client.get(
      `${root}/compare/${i.baseSha}...${i.headSha}?per_page=1`,
    );
    const m = d.merge_base_commit?.sha;
    assert(sha(m));
    const getDiff = async (to) => {
      const x = await client.get(`${root}/compare/${m}...${to}?per_page=1`);
      assert(
        x.merge_base_commit?.sha === m &&
          Array.isArray(x.files) &&
          x.files.length < 300 &&
          Number.isSafeInteger(x.total_commits),
        "INCOMPLETE_GIT_METADATA",
      );
      assert(
        x.files.every(
          (f) => typeof f.filename === "string" && f.filename.length > 0,
        ),
      );
      return {
        files: [...new Set(x.files.map((f) => f.filename))].sort(),
        count: x.total_commits,
      };
    };
    const h = await getDiff(i.headSha),
      b = await getDiff(i.baseSha);
    const hc = commitMeta(await client.get(`${root}/commits/${i.headSha}`));
    const bc = commitMeta(await client.get(`${root}/commits/${i.baseSha}`));
    assert(hc.sha === i.headSha && bc.sha === i.baseSha);
    return {
      headSha: i.headSha,
      baseSha: i.baseSha,
      mergeBase: m,
      candidateFiles: h.files,
      baseFiles: b.files,
      baseAdvanceCommits: b.count,
      dates: {
        [m]: d.merge_base_commit.commit?.committer?.date || null,
        [i.headSha]: hc.date,
        [i.baseSha]: bc.date,
      },
    };
  });
  let target = unavailable("CURRENT_COMBINED_STATE_UNAVAILABLE");
  if (historical)
    target = available({
      kind: "LANDED_TWO_PARENT_MERGE",
      sha: i.mergeCommitSha,
      headSha: i.headSha,
      baseSha: i.baseSha,
    });
  if (i.prState === "open" && !i.merged) {
    if (req.mergeQueue || mergeGroup) {
      target = await client.observe(async () => {
        assert(
          mergeGroup &&
            sha(mergeGroup.head_sha) &&
            mergeGroup.base_sha === i.baseSha &&
            mergeGroup.base_ref === `refs/heads/${i.baseRef}`,
          "MERGE_GROUP_UNAVAILABLE",
        );
        assert(
          typeof mergeGroup.head_ref === "string" &&
            mergeGroup.head_ref.startsWith("refs/heads/gh-readonly-queue/"),
          "MERGE_GROUP_UNAVAILABLE",
        );
        const ref = await client.get(
          `${root}/git/ref/${mergeGroup.head_ref.slice(5).split("/").map(encodeURIComponent).join("/")}`,
        );
        assert(ref.object?.sha === mergeGroup.head_sha, "MERGE_GROUP_CHANGED");
        // No inference from a queue branch name: prove this exact PR head is an ancestor.
        const lineage = await client.get(
          `${root}/compare/${i.headSha}...${mergeGroup.head_sha}?per_page=1`,
        );
        assert(
          lineage.merge_base_commit?.sha === i.headSha,
          "CANDIDATE_NOT_IN_GROUP",
        );
        const baseLineage = await client.get(
          `${root}/compare/${i.baseSha}...${mergeGroup.head_sha}?per_page=1`,
        );
        assert(
          baseLineage.merge_base_commit?.sha === i.baseSha,
          "BASE_NOT_IN_GROUP",
        );
        const selection = await client.observe(async () => {
          const [owner, name] = repo.split("/");
          const data = await client.request("/graphql", {
            method: "POST",
            body: {
              query:
                "query($owner:String!,$name:String!,$pr:Int!){repository(owner:$owner,name:$name){databaseId pullRequest(number:$pr){headRefOid mergeQueueEntry{id state baseCommit{oid} headCommit{oid}}}}}",
              variables: { owner, name, pr },
            },
          });
          const repository = data.data?.repository,
            p = repository?.pullRequest,
            q = p?.mergeQueueEntry;
          assert(
            !data.errors &&
              repository?.databaseId === i.repositoryId &&
              p?.headRefOid === i.headSha &&
              q?.headCommit?.oid === mergeGroup.head_sha &&
              q?.baseCommit?.oid === i.baseSha &&
              ["AWAITING_CHECKS", "MERGEABLE", "LOCKED"].includes(q.state),
            "CURRENT_QUEUE_SELECTION_UNAVAILABLE",
          );
          return {
            id: q.id,
            state: q.state,
            headSha: q.headCommit.oid,
            baseSha: q.baseCommit.oid,
            candidateSha: p.headRefOid,
          };
        });
        return {
          kind: "MERGE_GROUP",
          sha: mergeGroup.head_sha,
          headSha: i.headSha,
          baseSha: i.baseSha,
          ref: mergeGroup.head_ref,
          selection,
        };
      });
    } else if (git.state === "AVAILABLE" && git.value.mergeBase === i.baseSha) {
      target = available({
        kind: "HEAD_CONTAINS_CURRENT_BASE",
        sha: i.headSha,
        headSha: i.headSha,
        baseSha: i.baseSha,
      });
    } else {
      target = await client.observe(async () => {
        assert(sha(i.mergeCommitSha), "TEST_MERGE_UNAVAILABLE");
        const ref = await client.get(`${root}/git/ref/pull/${pr}/merge`);
        const m = commitMeta(
          await client.get(`${root}/commits/${i.mergeCommitSha}`),
        );
        assert(
          ref.object?.sha === i.mergeCommitSha &&
            m.sha === i.mergeCommitSha &&
            m.parents.length === 2 &&
            m.parents[0] === i.baseSha &&
            m.parents[1] === i.headSha,
          "TEST_MERGE_NOT_CURRENT",
        );
        return {
          kind: "PR_TEST_MERGE",
          sha: m.sha,
          headSha: i.headSha,
          baseSha: i.baseSha,
          parents: m.parents,
        };
      });
    }
  }
  const remote = await client.observe(async () => {
    assert(
      repoName(i.headRepository) && Number.isSafeInteger(i.headRepositoryId),
      "HEAD_REPOSITORY_UNAVAILABLE",
    );
    const r = await client.get(`/repos/${i.headRepository}`);
    assert(r.id === i.headRepositoryId);
    const ref = await client.get(
      `/repos/${i.headRepository}/git/ref/heads/${encodeURIComponent(i.headRef)}`,
    );
    return {
      repositoryId: r.id,
      ref: i.headRef,
      expectedSha: i.headSha,
      observedSha: ref.object?.sha || null,
      confirmed: ref.object?.sha === i.headSha,
    };
  });
  const checks = await client.observe(async () => {
    const all = [];
    for (const s of [
      ...new Set([i.headSha, target.value?.sha].filter(Boolean)),
    ]) {
      const rows = await client.list(
        `${root}/commits/${s}/check-runs?filter=all`,
        "check_runs",
      );
      for (const c of rows) {
        // Our receipt check is delivery, not an independent input to its proof.
        if (c.name === require("./check").NAME) continue;
        assert(
          Number.isSafeInteger(c.id) &&
            sha(c.head_sha) &&
            Number.isSafeInteger(c.app?.id),
        );
        all.push({
          id: c.id,
          name: c.name,
          appId: c.app.id,
          appSlug: typeof c.app.slug === "string" ? c.app.slug : null,
          sha: c.head_sha,
          status: c.status,
          conclusion: c.conclusion,
          startedAt: c.started_at,
          completedAt: c.completed_at,
          suiteId: c.check_suite?.id || null,
        });
      }
    }
    return [...new Map(all.map((c) => [c.id, c])).values()].sort(
      (a, b) => a.id - b.id,
    );
  });
  const statuses = await client.observe(async () => {
    const all = [];
    for (const s of [
      ...new Set([i.headSha, target.value?.sha].filter(Boolean)),
    ]) {
      for (const c of await client.list(`${root}/commits/${s}/statuses`)) {
        assert(Number.isSafeInteger(c.id));
        all.push({
          id: c.id,
          name: c.context,
          sha: s,
          state: c.state,
          updatedAt: c.updated_at,
        });
      }
    }
    return all.sort((a, b) => a.id - b.id);
  });
  const execution = await client.observe(async () => {
    assert(target.state === "AVAILABLE", "TARGET_UNAVAILABLE");
    const runs = await client.list(
      `${root}/actions/runs?head_sha=${target.value.sha}`,
      "workflow_runs",
    );
    assert(runs.length <= 20, "WORKFLOW_LIMIT");
    const all = [];
    for (const r of runs) {
      assert(
        sha(r.head_sha) &&
          Number.isSafeInteger(r.id) &&
          Number.isSafeInteger(r.run_attempt),
      );
      for (const j of await client.list(
        `${root}/actions/runs/${r.id}/attempts/${r.run_attempt}/jobs`,
        "jobs",
      )) {
        const checkId = Number(
          (j.check_run_url || "").match(/\/check-runs\/(\d+)$/)?.[1],
        );
        all.push({
          runId: r.id,
          workflowId: r.workflow_id,
          attempt: r.run_attempt,
          runSha: r.head_sha,
          // actor started the run; triggeringActor started the latest attempt.
          actor: account(r.actor),
          triggeringActor: account(r.triggering_actor),
          jobId: j.id,
          checkId: Number.isSafeInteger(checkId) ? checkId : null,
          sha: j.head_sha,
          status: j.status,
          conclusion: j.conclusion,
          runStatus: r.status,
          runConclusion: r.conclusion,
          steps: (j.steps || []).map((s) => ({
            number: s.number,
            status: s.status,
            conclusion: s.conclusion,
            startedAt: s.started_at,
            completedAt: s.completed_at,
          })),
        });
      }
    }
    return all.sort((a, b) => a.jobId - b.jobId);
  });
  const reviews = await client.observe(async () => {
    const rows = await client.list(`${root}/pulls/${pr}/reviews`);
    assert(
      new Set(rows.map((r) => r.user?.login)).size <= 30,
      "REVIEWER_LIMIT",
    );
    const perms = new Map();
    const out = [];
    for (const r of rows) {
      assert(
        Number.isSafeInteger(r.id) &&
          Number.isSafeInteger(r.user?.id) &&
          typeof r.user?.login === "string",
      );
      if (!perms.has(r.user.login))
        perms.set(
          r.user.login,
          await client.observe(async () => {
            const p = await client.get(
              `${root}/collaborators/${encodeURIComponent(r.user.login)}/permission`,
            );
            return (
              p.user?.permissions?.push === true ||
              ["write", "maintain", "admin"].includes(p.permission)
            );
          }),
        );
      out.push({
        id: r.id,
        userId: r.user.id,
        login: r.user.login,
        userType: r.user.type,
        state: r.state,
        sha: r.commit_id,
        submittedAt: r.submitted_at,
        writePermission: perms.get(r.user.login),
      });
    }
    return out.sort((a, b) => a.id - b.id);
  });
  // Who and what GitHub records as having produced this change. One bounded
  // page; a longer branch is marked truncated rather than silently cut.
  const actors = await client.observe(async () => {
    const rows = await client.get(`${root}/pulls/${pr}/commits?per_page=100`);
    assert(Array.isArray(rows), "COMMIT_ACTORS_UNAVAILABLE");
    return {
      author: i.author,
      mergedBy: i.mergedBy,
      truncated: rows.length >= 100,
      commits: rows.map((c) => ({
        sha: c.sha,
        author: account(c.author),
        committer: account(c.committer),
        verified: c.commit?.verification?.verified === true,
        verificationReason: c.commit?.verification?.reason || null,
      })),
    };
  });
  return {
    identity: i,
    rules,
    git,
    target,
    remote,
    checks,
    statuses,
    execution,
    reviews,
    actors,
  };
}
async function collect(client, repo, pr, options) {
  const startedAt = new Date().toISOString();
  const first = await collectOnce(client, repo, pr, options);
  const second = await collectOnce(client, repo, pr, options);
  return {
    ...second,
    source: "github-rest",
    startedAt,
    observedAt: new Date().toISOString(),
    consistency:
      hash(first) === hash(second)
        ? "STABLE_OBSERVATION"
        : "CHANGED_DURING_COLLECTION",
  };
}
module.exports = { collect, collectOnce, identity, collectRules };
