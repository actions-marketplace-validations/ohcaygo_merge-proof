"use strict";
const { ensure, FactoryError, sha } = require("./common");
// Public GitHub only in V1. Private repos are rejected BEFORE payment. No PAT,
// installation token, write access, secret access, or private-repo data handling.
class GitHub {
  constructor({ fetchImpl = fetch } = {}) {
    this.fetch = fetchImpl;
  }
  async get(endpoint) {
    ensure(/^\/repos\/[\w.-]+\/[\w.-]+(?:\/|$)/.test(endpoint), "AUTH_FAILED");
    let response;
    try {
      response = await this.fetch(`https://api.github.com${endpoint}`, {
        headers: {
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
          "User-Agent": "Merge-Proof-Standard-Evidence-Pack",
        },
        redirect: "error",
        signal: AbortSignal.timeout(15000),
      });
    } catch {
      throw new FactoryError("RUN_FAILED", 503);
    }
    ensure(
      response.ok,
      response.status === 404 ? "AUTH_FAILED" : "RUN_FAILED",
      503,
    );
    const text = await response.text();
    ensure(text.length <= 4 * 1024 * 1024, "RUN_FAILED");
    return JSON.parse(text);
  }
  async list(endpoint, key) {
    const all = [];
    for (let page = 1; page <= 5; page++) {
      const data = await this.get(
        `${endpoint}${endpoint.includes("?") ? "&" : "?"}per_page=100&page=${page}`,
      );
      const items = key ? data[key] : data;
      ensure(Array.isArray(items), "RUN_FAILED");
      all.push(...items);
      if (items.length < 100) return all;
    }
    throw new FactoryError("RUN_FAILED"); // Truncation is never absence or success.
  }
  async scope(repo, pr) {
    ensure(Number.isSafeInteger(pr) && pr > 0, "NOT_ELIGIBLE");
    const info = await this.get(`/repos/${repo}`);
    ensure(
      info.private === false &&
        info.full_name.toLowerCase() === repo.toLowerCase(),
      "AUTH_FAILED",
    );
    ensure(info.size <= 128 * 1024, "NOT_ELIGIBLE");
    const p = await this.get(`/repos/${repo}/pulls/${pr}`);
    ensure(p.number === pr && p.base?.repo?.id === info.id, "AMBIGUOUS_SHA");
    ensure(
      sha(p.head?.sha) && sha(p.base?.sha) && Number.isSafeInteger(p.user?.id),
      "AMBIGUOUS_SHA",
    );
    ensure(p.state === "open" || p.merged === true, "UNSUPPORTED_HISTORY");
    let baseSha = p.base.sha,
      ciSha = p.head.sha,
      shape = "open-candidate";
    if (p.merged) {
      ensure(sha(p.merge_commit_sha), "AMBIGUOUS_SHA");
      const landed = await this.get(
        `/repos/${repo}/commits/${p.merge_commit_sha}`,
      );
      // Only an explicit two-parent merge proves the candidate's relationship
      // without guessing which original commits survived squash/rebase.
      ensure(
        landed.parents?.length === 2 && landed.parents[1].sha === p.head.sha,
        "UNSUPPORTED_HISTORY",
      );
      baseSha = landed.parents[0].sha;
      ciSha = p.merge_commit_sha;
      shape = "two-parent-merge";
    }
    return {
      repo: info.full_name,
      repoId: info.id,
      pr,
      headSha: p.head.sha,
      baseSha,
      ciSha,
      shape,
      authorId: p.user?.id,
    };
  }
  async capture(scope) {
    const out = {
      ...scope,
      capturedAt: new Date().toISOString(),
      checks: [],
      reviews: [],
    };
    try {
      const checks = await this.list(
        `/repos/${scope.repo}/commits/${scope.ciSha}/check-runs?filter=all`,
        "check_runs",
      );
      // Keep nearby wrong-SHA evidence visible, without promoting it to proof.
      if (scope.ciSha !== scope.headSha) {
        try {
          checks.push(
            ...(await this.list(
              `/repos/${scope.repo}/commits/${scope.headSha}/check-runs?filter=all`,
              "check_runs",
            )),
          );
        } catch {
          out.otherShaLookup = "UNRESOLVABLE";
        }
      } else if (checks.length === 0) {
        try {
          const commit = await this.get(
            `/repos/${scope.repo}/commits/${scope.headSha}`,
          );
          const parent = commit.parents?.[0]?.sha;
          if (sha(parent))
            checks.push(
              ...(await this.list(
                `/repos/${scope.repo}/commits/${parent}/check-runs?filter=all`,
                "check_runs",
              )),
            );
        } catch {
          out.otherShaLookup = "UNRESOLVABLE";
        }
      }
      out.checks = checks.map((c) => ({
        id: c.id,
        name: c.name,
        appId: c.app?.id,
        headSha: c.head_sha,
        status: c.status,
        conclusion: c.conclusion,
        completedAt: c.completed_at,
      }));
    } catch {
      out.ciError = "CI_UNRESOLVABLE";
    }
    try {
      const reviews = await this.list(
        `/repos/${scope.repo}/pulls/${scope.pr}/reviews`,
      );
      out.reviews = reviews.map((r) => ({
        id: r.id,
        userId: r.user?.id,
        userType: r.user?.type,
        association: r.author_association,
        state: r.state,
        commitId: r.commit_id,
        submittedAt: r.submitted_at,
      }));
    } catch {
      out.reviewError = "APPROVAL_UNRESOLVABLE";
    }
    const after = await this.scope(scope.repo, scope.pr);
    ensure(
      ["repoId", "headSha", "baseSha", "ciSha", "shape"].every(
        (k) => scope[k] === after[k],
      ),
      "AMBIGUOUS_SHA",
    );
    return out;
  }
}
module.exports = { GitHub };
