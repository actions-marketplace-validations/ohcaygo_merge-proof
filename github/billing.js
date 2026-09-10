"use strict";
const { Stripe } = require("../factory/stripe");
const { assert, randomUUID } = require("./common");
// Extends the existing Stripe adapter; historical factory payments stay separate.
class Billing extends Stripe {
  constructor(service, config, options) {
    super(config, options);
    this.service = service;
    this.store = service.store;
    this.store.data.proBilling ||= { checkouts: {}, events: [], payments: {} };
    this.data = this.store.data.proBilling;
    assert(["test", "live"].includes(config.mode), "WRONG_PAYMENT_MODE");
    assert(!this.data.mode || this.data.mode === config.mode, "BILLING_LEDGER_MODE_MISMATCH");
    this.data.mode = config.mode;
  }
  async request(endpoint, form, key) {
    assert(this.config.stripeSecret, "PAYMENT_NOT_CONFIGURED");
    const r = await this.fetch("https://api.stripe.com/v1" + endpoint, {
      method: form ? "POST" : "GET",
      redirect: "error",
      signal: AbortSignal.timeout(15000),
      headers: {
        Authorization: `Bearer ${this.config.stripeSecret}`,
        "Stripe-Version": "2025-06-30.basil",
        ...(form
          ? {
              "Content-Type": "application/x-www-form-urlencoded",
              "Idempotency-Key": key,
            }
          : {}),
      },
      ...(form ? { body: new URLSearchParams(form).toString() } : {}),
    });
    assert(r.ok, "PAYMENT_UNAVAILABLE");
    return r.json();
  }
  async price(id, subscription) {
    assert(/^price_[A-Za-z0-9]+$/.test(id || ""), "PAYMENT_NOT_CONFIGURED");
    const p = await this.request(`/prices/${id}`);
    assert(
      p.active &&
        p.livemode === (this.config.mode === "live") &&
        p.currency === "usd" &&
        p.unit_amount === (subscription ? 2900 : 500) &&
        (subscription
          ? p.recurring?.interval === "month" &&
            p.recurring.interval_count === 1 &&
            p.recurring.usage_type === "licensed"
          : !p.recurring),
      "WRONG_SKU",
    );
  }
  async checkout(installationId, kind, quantity) {
    assert(["pro", "topup"].includes(kind), "INVALID_PURCHASE");
    const accountKey =
      this.service.meter.data.installations[installationId].account;
    const account = this.service.meter.account(installationId),
      usage = this.service.meter.usage(installationId);
    if (kind === "pro") {
      assert(
        !account.subscription || account.subscription.periodEnd <= Date.now(),
        "SUBSCRIPTION_ALREADY_EXISTS",
      );
      assert(
        quantity > 0 &&
          Number.isSafeInteger(quantity) &&
          quantity === usage.activeDevelopers.length,
        "REVIEW_ACTIVE_DEVELOPERS",
      );
    }
    const priceId =
      kind === "pro" ? this.config.proPriceId : this.config.topupPriceId;
    await this.price(priceId, kind === "pro");
    if (!account.customerId) {
      const customer = await this.request(
        "/customers",
        { "metadata[merge_proof_account]": accountKey },
        `mp-customer-${accountKey}`,
      );
      assert(/^cus_[A-Za-z0-9]+$/.test(customer.id || ""), "INVALID_CUSTOMER");
      account.customerId = customer.id;
      this.store.save();
    }
    const pending = Object.values(this.data.checkouts).find(
      (c) =>
        c.accountKey === accountKey &&
        c.kind === kind &&
        c.state === "PENDING" &&
        c.createdAt > Date.now() - 86400000,
    );
    if (pending) {
      assert(
        pending.quantity === (kind === "pro" ? quantity : 1),
        "CHECKOUT_PENDING",
      );
      if (pending.url) return { url: pending.url };
    }
    const c = pending || {
      id: randomUUID(),
      accountKey,
      kind,
      quantity: kind === "pro" ? quantity : 1,
      priceId,
      state: "PENDING",
      createdAt: Date.now(),
    };
    this.data.checkouts[c.id] = c;
    this.store.save();
    const session = await this.request(
      "/checkout/sessions",
      {
        mode: kind === "pro" ? "subscription" : "payment",
        "line_items[0][price]": priceId,
        "line_items[0][quantity]": String(c.quantity),
        client_reference_id: c.id,
        "metadata[merge_proof_purchase]": c.id,
        ...(account.customerId
          ? { customer: account.customerId }
          : kind === "topup"
            ? { customer_creation: "always" }
            : {}),
        success_url: this.config.origin + "/proof/?checkout=confirming",
        cancel_url: this.config.origin + "/proof/?checkout=canceled",
        ...(kind === "pro"
          ? { "subscription_data[metadata][merge_proof_account]": accountKey }
          : {}),
      },
      `mp-checkout-${c.id}`,
    );
    assert(
      /^cs_[A-Za-z0-9_]+$/.test(session.id) &&
        new URL(session.url).origin === "https://checkout.stripe.com",
      "INVALID_CHECKOUT",
    );
    c.sessionId = session.id;
    c.url = session.url;
    this.store.save();
    return { url: c.url };
  }
  async webhook(raw, signature) {
    const event = this.verify(raw, signature);
    assert(typeof event.id === "string", "INVALID_PAYMENT");
    // Serialize reconciliation; providers may deliver different events concurrently.
    assert(!this.busy, "PAYMENT_RETRY");
    this.busy = true;
    try {
      if (this.data.events.includes(event.id)) return;
      if (
        [
          "checkout.session.completed",
          "checkout.session.async_payment_succeeded",
        ].includes(event.type)
      ) {
        const id = event.data?.object?.id;
        assert(/^cs_[A-Za-z0-9_]+$/.test(id || ""), "INVALID_PAYMENT");
        const s = await this.request(
          `/checkout/sessions/${id}?expand[]=line_items.data.price`,
        );
        const c = this.data.checkouts[s.client_reference_id];
        if (!c) return; // Not this product; legacy handler retains its obligations.
        assert(
          s.id === c.sessionId &&
            s.livemode === (this.config.mode === "live") &&
            s.status === "complete",
          "INVALID_PAYMENT",
        );
        if (s.payment_status !== "paid") return;
        if (c.state === "PAID") {
          this.data.events.push(event.id);
          this.store.save();
          return;
        }
        assert(
          s.line_items?.data?.length === 1 &&
            !s.line_items.has_more &&
            s.line_items.data[0].price.id === c.priceId &&
            s.line_items.data[0].quantity === c.quantity &&
            s.currency === "usd" &&
            s.amount_total === (c.kind === "pro" ? 2900 * c.quantity : 500),
          "WRONG_SKU",
        );
        const account = this.service.meter.data.accounts[c.accountKey];
        assert(
          typeof s.customer === "string" &&
            (!account.customerId || account.customerId === s.customer),
          "WRONG_CUSTOMER",
        );
        if (c.kind === "topup") {
          assert(
            s.mode === "payment" &&
              /^pi_[A-Za-z0-9_]+$/.test(s.payment_intent || ""),
            "INVALID_PAYMENT",
          );
          assert(
            !this.data.payments[s.payment_intent] ||
              this.data.payments[s.payment_intent] === c.id,
            "PAYMENT_ALREADY_BOUND",
          );
          this.service.meter.topup(c.accountKey, s.payment_intent);
          this.data.payments[s.payment_intent] = c.id;
        } else {
          assert(
            s.mode === "subscription" &&
              /^sub_[A-Za-z0-9]+$/.test(s.subscription || ""),
            "INVALID_PAYMENT",
          );
          await this.subscription(
            c.accountKey,
            s.subscription,
            s.customer,
            c.quantity,
          );
        }
        account.customerId = s.customer;
        c.state = "PAID";
      } else if (
        [
          "invoice.paid",
          "customer.subscription.updated",
          "customer.subscription.deleted",
        ].includes(event.type)
      ) {
        const object = event.data?.object;
        const accountKey = Object.keys(this.service.meter.data.accounts).find(
          (k) =>
            this.service.meter.data.accounts[k].customerId === object?.customer,
        );
        if (accountKey) {
          const a = this.service.meter.data.accounts[accountKey];
          if (a.subscription)
            await this.subscription(
              accountKey,
              a.subscription.id,
              a.customerId,
            );
        }
      }
      this.service.resumeEntitled?.();
      this.data.events.push(event.id);
      this.store.save();
    } finally {
      this.busy = false;
    }
  }
  async subscription(accountKey, id, customer, expectedQuantity) {
    const s = await this.request(
      `/subscriptions/${id}?expand[]=latest_invoice`,
    );
    assert(
      s.customer === customer &&
        s.livemode === (this.config.mode === "live") &&
        s.items?.data?.length === 1 &&
        !s.items.has_more,
      "WRONG_SUBSCRIPTION",
    );
    const item = s.items.data[0];
    assert(
      item.price.id === this.config.proPriceId &&
        Number.isSafeInteger(item.quantity) &&
        item.quantity > 0,
      "WRONG_SKU",
    );
    const a = this.service.meter.data.accounts[accountKey];
    if (s.status === "active" && s.latest_invoice?.status === "paid") {
      const invoice = s.latest_invoice;
      const lines = invoice.lines;
      const line = lines?.data?.[0];
      const parent = line?.parent?.subscription_item_details;
      assert(
        invoice.customer === customer &&
          invoice.livemode === (this.config.mode === "live") &&
          lines?.data?.length === 1 && !lines.has_more &&
          parent?.subscription === s.id && parent.subscription_item === item.id &&
          parent.proration === false &&
          line.pricing?.price_details?.price === this.config.proPriceId &&
          Number.isSafeInteger(line.quantity) && line.quantity > 0 &&
          (!expectedQuantity || line.quantity === expectedQuantity) &&
          line.currency === "usd" && line.amount === line.quantity * 2900 &&
          line.period?.start === item.current_period_start &&
          line.period?.end === item.current_period_end,
        "UNVERIFIED_PAID_PERIOD",
      );
      this.service.meter.paidPeriod(accountKey, {
        id: s.id,
        quantity: line.quantity,
        periodStart: item.current_period_start * 1000,
        periodEnd: item.current_period_end * 1000,
        verifiedPaid: true,
        status: s.status,
        cancelAtPeriodEnd: s.cancel_at_period_end,
        invoiceId: s.latest_invoice.id,
      });
    } else if (a.subscription) {
      a.subscription.status = s.status;
      a.subscription.cancelAtPeriodEnd = s.cancel_at_period_end;
      if (["canceled", "unpaid", "incomplete_expired"].includes(s.status))
        a.subscription.verifiedPaid = false;
    }
  }
  async portal(installationId) {
    const a = this.service.meter.account(installationId);
    assert(a.customerId, "NO_BILLING_ACCOUNT");
    const configuration = this.config.billingPortalConfiguration;
    assert(
      /^bpc_[A-Za-z0-9]+$/.test(configuration || ""),
      "BILLING_PORTAL_NOT_CONFIGURED",
    );
    const portal = await this.request(
      `/billing_portal/configurations/${configuration}`,
    );
    assert(
      portal.active &&
        portal.features?.subscription_update?.enabled === false &&
        portal.features?.subscription_cancel?.mode === "at_period_end",
      "BILLING_PORTAL_NOT_CONFIGURED",
    );
    const s = await this.request(
      "/billing_portal/sessions",
      {
        customer: a.customerId,
        configuration,
        return_url: this.config.origin + "/proof/",
      },
      randomUUID(),
    );
    assert(
      new URL(s.url).origin === "https://billing.stripe.com",
      "INVALID_PORTAL",
    );
    return { url: s.url };
  }
  async quantity(installationId, confirmedQuantity) {
    assert(!this.busy, "PAYMENT_RETRY");
    this.busy = true;
    try {
      const meter = this.service.meter,
        a = meter.account(installationId),
        s = a.subscription;
      assert(s && s.verifiedPaid, "NO_SUBSCRIPTION");
      const count = meter.participants(a, s.periodStart, Date.now()).length;
      assert(
        Number.isSafeInteger(confirmedQuantity) &&
          confirmedQuantity === count &&
          count > 0,
        "REVIEW_ACTIVE_DEVELOPERS",
      );
      a.confirmedQuantity = count;
      this.store.save();
      await this.syncQuantity(a, count);
      return {
        quantity: count,
        effectiveAt: new Date(s.periodEnd).toISOString(),
        message:
          "Confirmed quantity applies to the next monthly invoice; current paid allowance stays unchanged. No proration.",
      };
    } finally {
      this.busy = false;
    }
  }
  async syncQuantity(a, count) {
    const s = await this.request(`/subscriptions/${a.subscription.id}`);
    assert(
      s.customer === a.customerId &&
        s.items?.data?.length === 1 &&
        s.items.data[0].price.id === this.config.proPriceId,
      "WRONG_SUBSCRIPTION",
    );
    const item = s.items.data[0];
    // Never undo a cancellation made in the provider portal, even if its
    // webhook has not reached our local snapshot yet.
    assert(!s.cancel_at_period_end && s.status === "active", "SUBSCRIPTION_ENDING");
    if (
      !a.quantityOperation ||
      a.quantityOperation.count !== count ||
      a.quantityOperation.complete
    )
      a.quantityOperation = { id: randomUUID(), count, complete: false };
    this.store.save();
    // The Stripe quantity controls the next renewal invoice. Existing paid-period
    // allowance comes only from its immutable paid-period entry in Meter.
    await this.request(
      `/subscriptions/${s.id}`,
      count === 0
        ? { cancel_at_period_end: "true" }
        : {
            "items[0][id]": item.id,
            "items[0][quantity]": String(count),
            proration_behavior: "none",
          },
      `mp-quantity-${a.quantityOperation.id}`,
    );
    a.quantityOperation.complete = true;
    a.nextQuantity = count;
    a.quantityEffectiveAt = a.subscription.periodEnd;
    this.store.save();
  }
  async reconcileQuantities() {
    if (this.busy) return;
    this.busy = true;
    try {
      for (const a of Object.values(this.service.meter.data.accounts)) {
        const s = a.subscription;
        if (
          !s?.verifiedPaid ||
          s.periodEnd <= Date.now() ||
          s.cancelAtPeriodEnd
        )
          continue;
        const count = this.service.meter.participants(
          a,
          s.periodStart,
          Date.now(),
        ).length;
        const ceiling = a.confirmedQuantity || s.quantity;
        const desired = Math.min(count, ceiling);
        // Do not cancel a just-started month before its developers have a chance
        // to participate. A zero-activity month ends without another paid month.
        if (desired === 0 && s.periodEnd - Date.now() > 3600000) continue;
        if (desired !== (a.nextQuantity ?? s.quantity))
          await this.syncQuantity(a, desired);
      }
    } finally {
      this.busy = false;
    }
  }
}
module.exports = { Billing };
