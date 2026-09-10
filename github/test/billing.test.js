"use strict";
const { test } = require("node:test");
const a = require("node:assert/strict");
const { Meter } = require("../meter");
const { Billing } = require("../billing");
const { createHmac } = require("node:crypto");
function harness() {
  const store = { data: {}, save() {} };
  const meter = new Meter(store);
  meter.connect(2, 9);
  const b = new Billing(
    { store, meter },
    {
      mode: "test",
      webhookSecret: "s".repeat(40),
      proPriceId: "price_pro",
      topupPriceId: "price_top",
      origin: "https://example.test",
    },
  );
  const now = Math.floor(Date.now() / 1000);
  const subscription = {
    id: "sub_test",
    customer: "cus_test",
    status: "active",
    livemode: false,
    items: {
      data: [
        {
          quantity: 2,
          price: { id: "price_pro" },
          current_period_start: now - 100,
          current_period_end: now + 1000,
        },
      ],
    },
    latest_invoice: { id: "in_test", status: "paid" },
  };
  const session = {
    id: "cs_test",
    client_reference_id: "purchase",
    customer: "cus_test",
    mode: "payment",
    payment_intent: "pi_test",
    status: "complete",
    payment_status: "paid",
    currency: "usd",
    amount_total: 500,
    livemode: false,
    line_items: { data: [{ price: { id: "price_top" }, quantity: 1 }] },
  };
  b.data.checkouts.purchase = {
    id: "purchase",
    sessionId: "cs_test",
    accountKey: "github:9",
    kind: "topup",
    quantity: 1,
    priceId: "price_top",
    state: "PENDING",
  };
  b.request = async (p) =>
    p.startsWith("/subscriptions/") ? subscription : session;
  return { store, meter, b, session, subscription };
}
function event(type, id = "evt_1", object = { id: "cs_test" }) {
  const raw = Buffer.from(
    JSON.stringify({ id, type, livemode: false, data: { object } }),
  );
  const t = Math.floor(Date.now() / 1000);
  return [
    raw,
    `t=${t},v1=${createHmac("sha256", "s".repeat(40))
      .update(t + ".")
      .update(raw)
      .digest("hex")}`,
  ];
}
test("verified top-up grants exactly five across duplicate events and delivery types", async () => {
  const h = harness();
  await h.b.webhook(...event("checkout.session.completed"));
  await h.b.webhook(...event("checkout.session.completed"));
  await h.b.webhook(
    ...event("checkout.session.async_payment_succeeded", "evt_2"),
  );
  a.equal(h.meter.usage(2).topupBalance, 5);
});
test("unpaid, wrong quantity, invalid signature grant nothing", async () => {
  const h = harness();
  h.session.payment_status = "unpaid";
  await h.b.webhook(...event("checkout.session.completed"));
  a.equal(h.meter.usage(2).topupBalance, 0);
  h.session.payment_status = "paid";
  h.session.line_items.data[0].quantity = 2;
  await a.rejects(
    h.b.webhook(...event("checkout.session.completed")),
    /WRONG_SKU/,
  );
  await a.rejects(h.b.webhook(Buffer.from("{}"), "bad"));
  a.equal(h.meter.usage(2).topupBalance, 0);
});
test("two paid developers get 100 monthly proofs, duplicate invoices preserve usage, topups survive renewal", async () => {
  const h = harness();
  await h.b.subscription("github:9", "sub_test", "cus_test", 2);
  a.equal(h.meter.usage(2).includedBalance, 100);
  const r = {
    receiptId: "one",
    issuedAt: new Date().toISOString(),
    verdict: "NOT_PROVEN",
    identity: { repositoryId: 1, pr: 1, headSha: "a".repeat(40) },
  };
  h.meter.complete(2, r, { state: "CURRENT" }, true);
  await h.b.subscription("github:9", "sub_test", "cus_test", 2);
  a.equal(h.meter.usage(2).includedBalance, 99);
  h.meter.topup("github:9", "pi_extra");
  h.subscription.items.data[0].current_period_start += 50;
  await h.b.subscription("github:9", "sub_test", "cus_test", 2);
  a.equal(h.meter.usage(2).includedBalance, 100);
  a.equal(h.meter.usage(2).topupBalance, 5);
  a.equal(h.meter.complete(2, r, { state: "CURRENT" }, true).charged, false);
});
test("human identity dedups across installations, bots and guessed attribution excluded", () => {
  const h = harness();
  h.meter.connect(3, 9);
  const user = { id: 20, type: "User", login: "dev" };
  h.meter.activity(2, user, "PR_OPENED", "1:1");
  h.meter.activity(3, user, "PUSH", "2:sha");
  h.meter.activity(3, { id: 21, type: "Bot", login: "bot" }, "PUSH", "2:sha");
  h.meter.activity(3, { login: "unknown" }, "PUSH", "2:sha");
  a.equal(h.meter.usage(2).activeDevelopers.length, 1);
  a.equal(h.meter.usage(2).activeDevelopers[0].activity.length, 2);
});
test("quantity increase needs confirmation, changes next invoice without expanding current allowance", async () => {
  const h = harness();
  await h.b.subscription("github:9", "sub_test", "cus_test", 2);
  const account = h.meter.data.accounts["github:9"];
  account.customerId = "cus_test";
  for (let id = 1; id <= 3; id++)
    h.meter.activity(
      2,
      { id, type: "User", login: "dev" + id },
      "PUSH",
      "commit" + id,
    );
  const writes = [];
  h.b.request = async (p, form, key) => {
    if (form) {
      writes.push({ form, key });
      return h.subscription;
    }
    return h.subscription;
  };
  await h.b.reconcileQuantities();
  a.equal(writes.length, 0);
  await a.rejects(h.b.quantity(2, 4), /REVIEW_ACTIVE_DEVELOPERS/);
  const result = await h.b.quantity(2, 3);
  a.equal(writes[0].form.proration_behavior, "none");
  a.equal(result.quantity, 3);
  a.equal(h.meter.usage(2).includedBalance, 100);
  a.equal(account.nextQuantity, 3);
});
