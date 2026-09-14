"use strict";
// Read-only public methodology run. No write API, tokens, purchases, or source execution.
const fs = require("node:fs");
const path = require("node:path");
const os = require("node:os");
const { GitHub } = require("../github");
const { Runner } = require("../runner");
const { hash } = require("../common");
const { integrate } = require("../evidence");
(async () => {
  const github = new GitHub();
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "merge-proof-public-"));
  const runner = new Runner({ root });
  const summaries = [];
  const out = path.resolve(__dirname, "public-results");
  fs.mkdirSync(out, { recursive: true });
  try {
    for (const [repo, pr] of [
      ["pallets/click", 3827],
      ["pallets/itsdangerous", 428],
      ["pallets/click", 3781],
      ["pallets/itsdangerous", 133],
    ]) {
      const scope = await github.scope(repo, pr);
      const capture = await github.capture(scope);
      const local = await runner.run(
        scope,
        hash(repo + pr + capture.capturedAt),
      );
      const successful = capture.checks.find(
        (c) => c.headSha === scope.ciSha && c.conclusion === "success",
      );
      const any = successful || capture.checks[0];
      const required = any
        ? [{ name: any.name, appId: any.appId }]
        : [{ name: "No captured check available", appId: 15368 }];
      const result = integrate(local, capture, required);
      const item = {
        method:
          "Live public GitHub capture plus isolated Git analysis. Purposive one-PR sample. These repositories are not customers. Required check selected from captured checks, not inferred branch policy.",
        scope,
        required,
        capture,
        result,
      };
      fs.writeFileSync(
        path.join(out, repo.replace("/", "-") + "-" + pr + ".json"),
        JSON.stringify(item, null, 2) + "\n",
      );
      summaries.push({
        repo,
        pr,
        headSha: scope.headSha,
        ci: result.evidence.ci.state,
        approval: result.evidence.approval.state,
        verdict: result.verdict,
        captureHash: hash(JSON.stringify(capture)),
      });
    }
    fs.writeFileSync(
      path.join(out, "summary.json"),
      JSON.stringify(
        {
          capturedAt: new Date().toISOString(),
          sourceCommit: "dab4c4b896a4ff704603e4945edfce87c43fd4e5",
          results: summaries,
          cleanup: fs.readdirSync(root).length === 0,
        },
        null,
        2,
      ) + "\n",
    );
    console.log(JSON.stringify(summaries, null, 2));
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
})().catch(() => {
  console.error(
    "PUBLIC_PROOF_FAILED: inspect connectivity, API quota, supported history and bounds.",
  );
  process.exitCode = 1;
});
