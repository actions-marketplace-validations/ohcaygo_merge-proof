"use strict";
const crypto = require("node:crypto");
const { ensure, FactoryError } = require("./common");
class Stripe {
  constructor(config, { fetchImpl = fetch } = {}) {
    this.config = config;
    this.fetch = fetchImpl;
  }
  async get(endpoint) {
    ensure(this.config.stripeSecret, "PAYMENT_NOT_CONFIGURED", 503);
    let r;
    try {
      r = await this.fetch("https://api.stripe.com/v1" + endpoint, {
        headers: { Authorization: `Bearer ${this.config.stripeSecret}` },
        redirect: "error",
        signal: AbortSignal.timeout(15000),
      });
    } catch {
      throw new FactoryError("PAYMENT_UNAVAILABLE", 503);
    }
    ensure(r.ok, "PAYMENT_UNAVAILABLE", 503);
    return r.json();
  }
  async offer() {
    const c = this.config;
    ensure(
      c.paymentLinkId && c.priceId && c.stripeSecret && c.webhookSecret,
      "PAYMENT_NOT_CONFIGURED",
      503,
    );
    const link = await this.get(
      "/payment_links/" +
        encodeURIComponent(c.paymentLinkId) +
        "?expand[]=line_items.data.price",
    );
    ensure(
      link.active &&
        link.livemode === (c.mode === "live") &&
        link.line_items?.data?.length === 1 &&
        !link.line_items.has_more,
      "PAYMENT_NOT_CONFIGURED",
      503,
    );
    const item = link.line_items.data[0];
    ensure(
      item.price?.id === c.priceId &&
        !item.price.recurring &&
        item.quantity === 1 &&
        !item.adjustable_quantity?.enabled,
      "PAYMENT_NOT_CONFIGURED",
      503,
    );
    const url = new URL(link.url);
    ensure(
      url.origin === "https://buy.stripe.com",
      "PAYMENT_NOT_CONFIGURED",
      503,
    );
    ensure(
      link.after_completion?.type === "redirect" &&
        link.after_completion.redirect?.url === c.origin + "/#paid",
      "PAYMENT_RETURN_NOT_CONFIGURED",
      503,
    );
    ensure(
      Number.isSafeInteger(item.price.unit_amount) &&
        typeof item.price.currency === "string",
      "PAYMENT_NOT_CONFIGURED",
      503,
    );
    const digits = new Intl.NumberFormat("en", {
      style: "currency",
      currency: item.price.currency,
    }).resolvedOptions().maximumFractionDigits;
    return {
      url: url.href,
      price: new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: item.price.currency,
      }).format(item.price.unit_amount / 10 ** digits),
      mode: c.mode,
    };
  }
  verify(raw, signature, now = Date.now()) {
    ensure(
      this.config.webhookSecret && typeof signature === "string",
      "INVALID_SIGNATURE",
      400,
    );
    const parts = signature.split(",").map((s) => s.split("="));
    const timestamp = parts.find((p) => p[0] === "t")?.[1];
    ensure(
      /^\d+$/.test(timestamp || "") &&
        Math.abs(now / 1000 - Number(timestamp)) <= 300,
      "INVALID_SIGNATURE",
      400,
    );
    const expected = crypto
      .createHmac("sha256", this.config.webhookSecret)
      .update(timestamp + ".")
      .update(raw)
      .digest();
    ensure(
      parts.some(
        ([k, v]) =>
          k === "v1" &&
          /^[a-f0-9]{64}$/.test(v) &&
          crypto.timingSafeEqual(expected, Buffer.from(v, "hex")),
      ),
      "INVALID_SIGNATURE",
      400,
    );
    const event = JSON.parse(raw.toString());
    ensure(
      event.livemode === (this.config.mode === "live"),
      "WRONG_PAYMENT_MODE",
    );
    return event;
  }
  async confirmed(event) {
    if (
      ![
        "checkout.session.completed",
        "checkout.session.async_payment_succeeded",
      ].includes(event.type)
    )
      return null;
    const id = event.data?.object?.id;
    ensure(/^cs_[A-Za-z0-9_]+$/.test(id || ""), "INVALID_PAYMENT");
    const s = await this.get(
      `/checkout/sessions/${id}?expand[]=line_items.data.price`,
    );
    if (s.payment_status !== "paid") return null;
    ensure(
      s.id === id &&
        s.mode === "payment" &&
        s.status === "complete" &&
        s.livemode === (this.config.mode === "live"),
      "INVALID_PAYMENT",
    );
    ensure(s.payment_link === this.config.paymentLinkId, "WRONG_SKU");
    const items = s.line_items;
    ensure(
      items?.data?.length === 1 &&
        !items.has_more &&
        items.data[0].price?.id === this.config.priceId &&
        items.data[0].quantity === 1,
      "WRONG_SKU",
    );
    ensure(
      Number.isSafeInteger(s.amount_total) &&
        s.amount_total >= 0 &&
        /^[a-z]{3}$/.test(s.currency),
      "INVALID_PAYMENT",
    );
    ensure(
      typeof s.customer_details?.email === "string" &&
        s.customer_details.email.length <= 254,
      "INVALID_PAYMENT",
    );
    ensure(typeof s.payment_intent === "string", "INVALID_PAYMENT");
    return {
      sessionId: id,
      transactionId: s.payment_intent,
      customerId: s.customer || null,
      email: s.customer_details.email,
      amount: s.amount_total,
      currency: s.currency,
      reference: s.client_reference_id,
      priceId: this.config.priceId,
      confirmedAt: new Date().toISOString(),
      mode: this.config.mode,
    };
  }
}
module.exports = { Stripe };
