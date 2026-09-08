"use strict";
// Read-only local admin inbox. This command never calls Stripe or issues refunds.
const fs = require("node:fs");
const path = require("node:path");
const { loadConfig } = require("./server");
const c = loadConfig();
const file = path.join(c.stateDir, "state.json");
if (!fs.existsSync(file)) {
  console.log("No factory state exists.");
  process.exit(0);
}
const state = JSON.parse(fs.readFileSync(file, "utf8"));
console.log(
  JSON.stringify(
    state.exceptions.map((e) => {
      const payment = e.payment || state.orders[e.orderId]?.payment;
      return {
        ...e,
        payment: payment
          ? {
              sessionId: payment.sessionId,
              transactionId: payment.transactionId,
              email: payment.email,
              amount: payment.amount,
              currency: payment.currency,
            }
          : null,
      };
    }),
    null,
    2,
  ),
);
