"use strict";
const { html } = require("./receipt");
const { assert } = require("./common");
const { page, script, interactive } = require("./public");
async function handle(service, req, res, url) {
  if (!url.pathname.startsWith("/proof/")) return false;
  const send = (status, data, type = "application/json") => {
    res.writeHead(status, { "Content-Type": type });
    res.end(type === "application/json" ? JSON.stringify(data) : data);
  };
  // Receipt embeds no scripts, external resources or source contents.
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'none'; script-src 'self'; connect-src 'self'; style-src 'unsafe-inline'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'",
  );
  try {
    if (req.method === "GET" && url.pathname === "/proof/") {
      send(200, page, "text/html; charset=utf-8");
      return true;
    }
    if (req.method === "GET" && url.pathname === "/proof/app.js") {
      send(200, script, "application/javascript");
      return true;
    }
    let raw = Buffer.alloc(0);
    if (req.method === "POST") {
      for await (const chunk of req) {
        raw = Buffer.concat([raw, chunk]);
        assert(raw.length <= 262144, "REQUEST_TOO_LARGE");
      }
      if (url.pathname === "/proof/webhook") {
        send(202, await service.webhook(raw, req.headers));
        return true;
      }
      // Browser writes require same origin; non-browser bearer calls have no ambient cookies.
      assert(
        !req.headers.origin || req.headers.origin === service.config.origin,
        "ORIGIN_DENIED",
      );
      assert(
        req.headers["content-type"]?.startsWith("application/json"),
        "INVALID_CONTENT_TYPE",
      );
    }
    const token =
      req.headers.authorization?.match(/^Bearer ([^\s]+)$/)?.[1] || null;
    if (req.method === "POST" && url.pathname === "/proof/run") {
      const input = JSON.parse(raw);
      const out = await service.run(input.repo, input.pr, {
        token,
        publish: input.publish === true,
      });
      send(201, { ...out, url: `/proof/receipts/${out.receipt.receiptId}` });
      return true;
    }
    const match = url.pathname.match(
      /^\/proof\/receipts\/([a-f0-9-]{36})(\/refresh)?$/,
    );
    if (
      match &&
      ((req.method === "GET" && !match[2]) ||
        (req.method === "POST" && match[2]))
    ) {
      const out = await service.read(match[1], token, {
        refresh: Boolean(match[2]),
      });
      if (
        url.searchParams.get("format") === "json" ||
        (match[2] && url.searchParams.get("format") !== "html")
      )
        send(200, out);
      else
        send(
          200,
          interactive(html(out.receipt, out.current)),
          "text/html; charset=utf-8",
        );
      return true;
    }
    send(404, { error: "NOT_FOUND" });
  } catch (e) {
    // Do not leak provider response, repository identity or token through errors.
    send(e.code === "PROOF_BUSY" ? 409 : 403, {
      error:
        e.code === "PROOF_BUSY" ? "PROOF_BUSY" : "PROOF_UNAVAILABLE_OR_DENIED",
    });
  }
  return true;
}
module.exports = { handle };
