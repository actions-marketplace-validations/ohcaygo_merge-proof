"use strict";
// Runs only shipped Merge-Proof code and Git object reads. Never checkout,
// execute, install, or load customer code, hooks, submodules, or configuration.
const fs = require("node:fs");
const { execFileSync } = require("node:child_process");
const { analyze } = require("../src/analyze");
const { scrub } = require("./common");
process.once("message", ({ directory, scope, source, localFixture }) => {
  try {
    const git = (args) =>
      execFileSync(
        "git",
        [
          "-c",
          "core.hooksPath=/dev/null",
          "-c",
          "protocol.file.allow=" + (localFixture ? "always" : "never"),
          "-c",
          "protocol.ext.allow=never",
          "-c",
          "credential.helper=",
          "-c",
          "http.followRedirects=false",
          ...args,
        ],
        {
          cwd: directory,
          encoding: "utf8",
          timeout: 30000,
          maxBuffer: 8 * 1024 * 1024,
          stdio: ["ignore", "pipe", "pipe"],
        },
      );
    git(["init", "--bare", "."]);
    git([
      "fetch",
      "--no-tags",
      "--no-recurse-submodules",
      source,
      scope.baseSha,
      scope.headSha,
      scope.ciSha,
    ]);
    if (git(["rev-parse", "--is-shallow-repository"]).trim() !== "false")
      throw Error("UNSUPPORTED_HISTORY");
    const counts = Number(
      git([
        "rev-list",
        "--count",
        "--all",
        scope.baseSha,
        scope.headSha,
      ]).trim(),
    );
    if (counts > 100000) throw Error("NOT_ELIGIBLE");
    if (!git(["merge-base", scope.baseSha, scope.headSha]).trim())
      throw Error("UNSUPPORTED_HISTORY");
    const result = analyze({
      repoPath: directory,
      base: scope.baseSha,
      head: scope.headSha,
      version: require("../package.json").version,
    });
    result.repository = { path: scope.repo, shallow: false };
    result.ignoreFile = null;
    process.send({ ok: true, result: scrub(result) });
  } catch {
    process.send({ ok: false, code: "RUN_FAILED" });
  } finally {
    process.disconnect();
  }
});
