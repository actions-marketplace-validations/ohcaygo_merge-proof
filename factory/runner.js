"use strict";
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { fork } = require("node:child_process");
const { ensure, FactoryError } = require("./common");
function size(dir) {
  let bytes = 0;
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) bytes += size(p);
    else bytes += fs.lstatSync(p).size;
  }
  return bytes;
}
class Runner {
  constructor({
    root = path.join(os.tmpdir(), "merge-proof-factory"),
    timeoutMs = 120000,
    maxBytes = 192 * 1024 * 1024,
    fixtureSource = null,
  } = {}) {
    this.root = root;
    this.timeoutMs = timeoutMs;
    this.maxBytes = maxBytes;
    this.fixtureSource = fixtureSource;
    fs.mkdirSync(root, { recursive: true, mode: 0o700 });
  }
  async run(scope, runId) {
    ensure(/^[a-f0-9]{64}$/.test(runId), "RUN_FAILED");
    const directory = fs.mkdtempSync(path.join(this.root, runId + "-"));
    fs.chmodSync(directory, 0o700);
    let child;
    let timer;
    let monitor;
    try {
      return await new Promise((resolve, reject) => {
        child = fork(path.join(__dirname, "worker.js"), [], {
          cwd: directory,
          detached: true,
          execPath: "/bin/sh",
          execArgv: [
            path.join(__dirname, "limits.sh"),
            process.execPath,
            "--max-old-space-size=128",
          ],
          env: {
            PATH: process.env.PATH,
            HOME: directory,
            TMPDIR: directory,
            LANG: "C.UTF-8",
            GIT_CONFIG_NOSYSTEM: "1",
            GIT_CONFIG_GLOBAL: "/dev/null",
            GIT_TERMINAL_PROMPT: "0",
            GIT_LFS_SKIP_SMUDGE: "1",
          },
          stdio: ["ignore", "ignore", "ignore", "ipc"],
        });
        let result;
        let failure;
        const kill = () => {
          try {
            process.kill(-child.pid, "SIGKILL");
          } catch {}
        };
        timer = setTimeout(() => {
          failure = new FactoryError("RUN_FAILED");
          kill();
        }, this.timeoutMs);
        monitor = setInterval(() => {
          try {
            if (size(directory) > this.maxBytes) {
              failure = new FactoryError("RUN_FAILED");
              kill();
            }
          } catch {
            failure = new FactoryError("RUN_FAILED");
            kill();
          }
        }, 100);
        child.once("error", () => {
          failure = new FactoryError("RUN_FAILED");
        });
        child.on("message", (m) => {
          result = m;
        });
        child.once("close", () => {
          kill();
          if (failure || !result?.ok)
            reject(failure || new FactoryError("RUN_FAILED"));
          else resolve(result.result);
        });
        child.send({
          directory,
          scope,
          source: this.fixtureSource || `https://github.com/${scope.repo}.git`,
          localFixture: !!this.fixtureSource,
        });
      });
    } finally {
      clearTimeout(timer);
      clearInterval(monitor);
      fs.rmSync(directory, { recursive: true, force: true, maxRetries: 3 });
    }
  }
}
module.exports = { Runner };
