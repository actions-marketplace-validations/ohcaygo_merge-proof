"use strict";
const { test } = require("node:test");
const a = require("node:assert/strict");
const { scan } = require("../scan");
const { Client } = require("../client");
const { fixtureFetch, H, B, M } = require("./fixtures");
function client(unsupported = false) {
  const f = fixtureFetch({
    mutate: (p, v) => {
      if (p.endsWith("/pulls/1"))
        return { ...v, state: "closed", merged: true };
      if (unsupported && p.endsWith("/commits/" + M))
        return { ...v, parents: [{ sha: B }] };
      return v;
    },
  });
  return new Client({
    fetchImpl: (u, o) =>
      new URL(u).pathname.endsWith("/pulls")
        ? Promise.resolve(
            new Response(
              JSON.stringify([
                { number: 1, merged_at: "2026-09-09T00:00:00Z" },
              ]),
            ),
          )
        : f.fetchImpl(u, o),
  });
}
test("historical scan uses actual proof and local semantics but never substitutes current policy for historical policy", async () => {
  const s = await scan(client(), "fixture/public", { limit: 1 });
  a.equal(s.rows[0].state, "EXAMINED");
  const r = s.rows[0].receipt;
  a.equal(r.identity.headSha, H);
  a.equal(r.identity.baseSha, B);
  a.equal(r.summary.target.value.sha, M);
  a.equal(r.local.verdict, "VERIFIED");
  a.equal(r.verdict, "NOT_PROVEN");
  a.ok(r.gaps.includes("HISTORICAL_RULES_AND_APPROVAL_VALIDITY_UNAVAILABLE"));
});
test("unsupported historical shape and invalid bound remain unavailable", async () => {
  const s = await scan(client(true), "fixture/public", { limit: 1 });
  a.equal(s.rows[0].state, "UNAVAILABLE");
  a.equal(s.rows[0].reason, "UNSUPPORTED_HISTORICAL_SHAPE");
  await a.rejects(
    scan(client(), "fixture/public", { limit: 11 }),
    /INVALID_SCAN_SCOPE/,
  );
});
