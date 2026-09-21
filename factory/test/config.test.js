"use strict";
const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
test("restricted API keys preserve strict live/test separation", (t) => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "mp-config-"));
  t.after(() => fs.rmSync(dir, {recursive:true, force:true}));
  const file = path.join(dir, "config.json");
  for (const mode of ["test", "live"]) {
    for (const kind of ["sk", "rk", "pk"]) {
      for (const keyMode of ["test", "live"]) {
        fs.writeFileSync(file, JSON.stringify({mode, origin:"https://merge-proof.ohcaygo.com", stripeSecret:`${kind}_${keyMode}_fixture`}));
        const run = spawnSync(process.execPath, ["-e", `require(${JSON.stringify(path.resolve(__dirname, "../server.js"))}).loadConfig()`], {env:{PATH:process.env.PATH, FACTORY_CONFIG:file}, encoding:"utf8"});
        const accepted = kind !== "pk" && mode === keyMode;
        assert.equal(run.status === 0, accepted, `${mode} configuration with ${kind}_${keyMode}`);
        if (!accepted) assert.match(run.stderr, /WRONG_PAYMENT_MODE/);
      }
    }
  }
});
