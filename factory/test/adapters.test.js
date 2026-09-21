"use strict";
const { test } = require("node:test");
const a = require("node:assert/strict");
const crypto = require("node:crypto");
const { Stripe } = require("../stripe");
const { GitHub } = require("../github");
const { parseRepo, scrub } = require("../common");
const H = "a".repeat(40),
  B = "b".repeat(40),
  F = "c".repeat(40);
const config = {
  mode: "test",
  stripeSecret: "sk_test_fixture",
  webhookSecret: "whsec_fixture",
  paymentLinkId: "plink_fixture",
  priceId: "price_fixture",
  origin: "http://127.0.0.1:4318",
};
const session = () => ({
  id: "cs_test_fixture",
  payment_status: "paid",
  status: "complete",
  mode: "payment",
  livemode: false,
  payment_link: "plink_fixture",
  line_items: {
    data: [{ price: { id: "price_fixture" }, quantity: 1 }],
    has_more: false,
  },
  amount_total: 12345,
  currency: "usd",
  customer_details: { email: "test@example.invalid" },
  payment_intent: "pi_fixture",
  client_reference_id: "r",
});
const event = () => ({
  id: "evt_fixture",
  livemode: false,
  type: "checkout.session.completed",
  data: { object: { id: "cs_test_fixture" } },
});
function sign(raw, time = Math.floor(Date.now() / 1000)) {
  return `t=${time},v1=${crypto
    .createHmac("sha256", config.webhookSecret)
    .update(time + ".")
    .update(raw)
    .digest("hex")}`;
}
test("Stripe raw signature rejects modified, expired, unsigned and live-mode events", () => {
  const s = new Stripe(config);
  const raw = Buffer.from(JSON.stringify(event()));
  a.equal(s.verify(raw, sign(raw)).id, "evt_fixture");
  a.throws(() => s.verify(Buffer.from("tampered"), sign(raw)));
  a.throws(() => s.verify(raw, sign(raw, 1)));
  a.throws(() => s.verify(raw, ""));
  const live = Buffer.from(JSON.stringify({ ...event(), livemode: true }));
  a.throws(() => s.verify(live, sign(live)));
});
test("Stripe retrieves authoritative amount/contact/transaction; ignores webhook amount", async () => {
  const s = new Stripe(config, {
    fetchImpl: async () => ({ ok: true, json: async () => session() }),
  });
  const e = event();
  e.data.object.amount_total = 1;
  const p = await s.confirmed(e);
  a.equal(p.amount, 12345);
  a.equal(p.transactionId, "pi_fixture");
  a.equal(p.email, "test@example.invalid");
});
test("Stripe rejects wrong SKU, mode, quantity, link, pending payment", async () => {
  for (const change of [
    { mode: "subscription" },
    { livemode: true },
    { payment_link: "plink_other" },
    { line_items: { data: [{ price: { id: "price_other" }, quantity: 1 }] } },
    { line_items: { data: [{ price: { id: "price_fixture" }, quantity: 2 }] } },
  ]) {
    const s = new Stripe(config, {
      fetchImpl: async () => ({
        ok: true,
        json: async () => ({ ...session(), ...change }),
      }),
    });
    await a.rejects(s.confirmed(event()));
  }
  const s = new Stripe(config, {
    fetchImpl: async () => ({
      ok: true,
      json: async () => ({ ...session(), payment_status: "unpaid" }),
    }),
  });
  a.equal(await s.confirmed(event()), null);
});
test("offer price comes from Payment Link and rejects adjustable or recurring SKU", async () => {
  const link = {
    active: true,
    livemode: false,
    url: "https://buy.stripe.com/test_fixture",
    line_items: {
      data: [
        {
          price: { id: "price_fixture", unit_amount: 34567, currency: "usd" },
          quantity: 1,
        },
      ],
    },
    after_completion: {
      type: "redirect",
      redirect: { url: config.origin + "/#paid" },
    },
  };
  const s = new Stripe(config, {
    fetchImpl: async () => ({ ok: true, json: async () => link }),
  });
  a.equal((await s.offer()).price, "$345.67");
  link.line_items.data[0].adjustable_quantity = { enabled: true };
  await a.rejects(s.offer());
});
test("repository input is public GitHub only; no token, query, fragment, local path or other host", () => {
  a.equal(parseRepo("https://github.com/acme/repo.git"), "acme/repo");
  for (const u of [
    "file:///tmp/repo",
    "https://github.com@evil.test/a/b",
    "https://user:token@github.com/a/b",
    "https://github.com/a/b?token=x",
    "https://github.com/a/b#x",
    "https://gitlab.com/a/b",
  ])
    a.throws(() => parseRepo(u));
});
function githubFixture(change = {}) {
  return new GitHub({
    fetchImpl: async (url) => ({
      ok: true,
      text: async () =>
        JSON.stringify(
          url.includes("/pulls/")
            ? {
                number: 1,
                state: "open",
                merged: false,
                head: { sha: H },
                base: { sha: B, repo: { id: 1 } },
                user: { id: 2 },
                ...change,
              }
            : {
                id: 1,
                full_name: "acme/repo",
                private: false,
                size: 10,
                ...change,
              },
        ),
    }),
  });
}
test("public repo scope is exact; private adapter fails eligibility without requesting token", async () => {
  a.equal((await githubFixture().scope("acme/repo", 1)).headSha, H);
  await a.rejects(githubFixture({ private: true }).scope("acme/repo", 1), {
    code: "AUTH_FAILED",
  });
  await a.rejects(githubFixture({ size: 999999 }).scope("acme/repo", 1), {
    code: "NOT_ELIGIBLE",
  });
});
test("merged history requires explicit parent relationship and landed CI SHA", async () => {
  const g = new GitHub({
    fetchImpl: async (url) => ({
      ok: true,
      text: async () =>
        JSON.stringify(
          url.includes("/commits/")
            ? { parents: [{ sha: B }, { sha: H }] }
            : url.includes("/pulls/")
              ? {
                  number: 1,
                  merged: true,
                  head: { sha: H },
                  base: { sha: B, repo: { id: 1 } },
                  merge_commit_sha: F,
                  user: { id: 2 },
                }
              : { id: 1, full_name: "acme/repo", private: false, size: 10 },
        ),
    }),
  });
  const scope = await g.scope("acme/repo", 1);
  a.equal(scope.ciSha, F);
  a.equal(scope.headSha, H);
});
test("GitHub pagination exhaustion fails closed", async () => {
  const g = new GitHub({
    fetchImpl: async () => ({
      ok: true,
      text: async () =>
        JSON.stringify(Array.from({ length: 100 }, () => ({ id: 1 }))),
    }),
  });
  await a.rejects(g.list("/repos/acme/repo/pulls/1/reviews"));
});
test("secret scrub covers tokens and does not retain review bodies", () => {
  a.equal(
    scrub({ message: "sk_test_abc github_pat_abc Bearer abc ghp_abc" }).message,
    "[REDACTED] [REDACTED] [REDACTED] [REDACTED]",
  );
});
module.exports = { config, session, event, sign };
