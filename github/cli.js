#!/usr/bin/env node
"use strict";
const fs = require("node:fs");
const path = require("node:path");
const { Client } = require("./client");
const { collect } = require("./collect");
const { prove, freshness } = require("./proof");
const { text, html } = require("./receipt");
async function main(argv) {
  if (argv.includes("--help") || argv.length < 2) {
    console.log(
      "node github/cli.js OWNER/REPO PR [--out NEW_DIRECTORY] [--previous receipt.json]\nReads GitHub evidence. Optional MP_GITHUB_TOKEN stays in the environment. Local merge-proof CLI remains offline.",
    );
    return;
  }
  const [repo, pr, ...args] = argv;
  let out = null,
    previous = null;
  for (let i = 0; i < args.length; i += 2) {
    if (args[i] === "--out") out = args[i + 1];
    else if (args[i] === "--previous") previous = args[i + 1];
    else throw Error("INVALID_ARGUMENT");
  }
  const c = await collect(
    new Client({ token: process.env.MP_GITHUB_TOKEN }),
    repo,
    Number(pr),
  );
  const r = prove(c),
    current = previous
      ? freshness(JSON.parse(fs.readFileSync(previous, "utf8")), c)
      : freshness(r, c);
  if (out) {
    fs.mkdirSync(out, { mode: 0o700 });
    fs.writeFileSync(
      path.join(out, "receipt.json"),
      JSON.stringify(r, null, 2),
      { mode: 0o600, flag: "wx" },
    );
    fs.writeFileSync(
      path.join(out, "receipt.html"),
      html(r, previous ? undefined : current),
      { mode: 0o600, flag: "wx" },
    );
    if (previous)
      fs.writeFileSync(
        path.join(out, "previous-currentness.json"),
        JSON.stringify(current, null, 2),
        { mode: 0o600, flag: "wx" },
      );
  }
  console.log(text(r, previous ? undefined : current));
  process.exitCode =
    r.verdict === "FAIL" ? 3 : r.verdict === "NOT_PROVEN" ? 2 : 0;
}
if (require.main === module)
  main(process.argv.slice(2)).catch(() => {
    console.error(
      "Merge Proof: collection unavailable; previous receipts remain unchanged.",
    );
    process.exitCode = 3;
  });
module.exports = { main };
