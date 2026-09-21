"use strict";
const { test } = require("node:test");
const a = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const os = require("node:os");
const { execFileSync, spawnSync } = require("node:child_process");
const fixtures = require("../../test/helpers");
const git = require("../../src/git");
const { analyze } = require("../../src/analyze");
const { analyzeMetadata } = require("../local-evidence");
const { available } = require("../common");
const { parseActionYaml } = require("../../test/action-meta");
test("remote metadata reader produces same local findings as real full Git history", (t) => {
  t.after(fixtures.cleanup);
  for (const make of [fixtures.cleanScenario, fixtures.driftScenario]) {
    const dir = make(),
      h = git.resolve(dir, "HEAD"),
      b = git.resolve(dir, "main"),
      m = git.mergeBase(dir, b, h);
    const local = analyze({ repoPath: dir, base: b, head: h });
    const c = {
      identity: { repository: "fixture/public", headSha: h, baseSha: b },
      git: available({
        headSha: h,
        baseSha: b,
        mergeBase: m,
        candidateFiles: git.changedFiles(dir, m, h),
        baseFiles: git.changedFiles(dir, m, b),
        baseAdvanceCommits: git.commitCount(dir, m, b),
        dates: {
          [h]: git.commitDate(dir, h),
          [b]: git.commitDate(dir, b),
          [m]: git.commitDate(dir, m),
        },
      }),
    };
    const remote = analyzeMetadata(c);
    a.equal(remote.verdict, local.verdict);
    a.deepEqual(remote.findings, local.findings);
    a.deepEqual(remote.metrics, local.metrics);
  }
});
test("existing composite Action shell runs real CLI unchanged, outputs JSON/markdown and enforces exit 2", (t) => {
  t.after(fixtures.cleanup);
  const dir = fixtures.driftScenario(),
    root = path.resolve(__dirname, "../..");
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "mp-action-"));
  t.after(() => fs.rmSync(tmp, { recursive: true, force: true }));
  const action = parseActionYaml(
    fs.readFileSync(path.join(root, "action.yml"), "utf8"),
  );
  const env = {
    ...process.env,
    MP_BASE: "main",
    MP_HEAD: "HEAD",
    MP_IGNORE: "",
    RUNNER_TEMP: tmp,
    GITHUB_ACTION_PATH: root,
    GITHUB_OUTPUT: path.join(tmp, "outputs"),
    GITHUB_STEP_SUMMARY: path.join(tmp, "summary"),
  };
  execFileSync("bash", ["-c", action.runs.steps[0].run], { cwd: dir, env });
  const r = JSON.parse(
    fs.readFileSync(path.join(tmp, "merge-proof.json"), "utf8"),
  );
  a.equal(r.schemaVersion, 1);
  a.equal(r.verdict, "NOT_PROVEN");
  a.match(fs.readFileSync(env.GITHUB_OUTPUT, "utf8"), /verdict=NOT_PROVEN/);
  a.match(fs.readFileSync(env.GITHUB_STEP_SUMMARY, "utf8"), /NOT_PROVEN/);
  const result = spawnSync("bash", ["-c", action.runs.steps[2].run], {
    cwd: dir,
    env: { ...env, MP_VERDICT: r.verdict, MP_FAIL_ON: "not-proven" },
  });
  a.equal(result.status, 2);
});
