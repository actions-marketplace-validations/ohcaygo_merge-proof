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
    const customers = service.customers;
    if (customers && req.method === "GET" && url.pathname === "/proof/login") {
      const login = customers.start();
      res.setHeader("Set-Cookie", login.cookie);
      res.writeHead(302, { Location: login.url });
      res.end();
      return true;
    }
    if (
      customers &&
      req.method === "GET" &&
      url.pathname === "/proof/callback"
    ) {
      try {
        res.setHeader("Set-Cookie", await customers.callback(req, url));
        res.writeHead(303, { Location: "/proof/" });
        res.end();
      } catch {
        res.writeHead(303, {
          Location: "/proof/?login=canceled-or-unavailable",
        });
        res.end();
      }
      return true;
    }
    if (req.method === "GET" && url.pathname === "/proof/") {
      send(
        200,
        customers ? require("./customer-public").page : page,
        "text/html; charset=utf-8",
      );
      return true;
    }
    if (req.method === "GET" && url.pathname === "/proof/app.js") {
      send(
        200,
        customers ? require("./customer-public").script : script,
        "application/javascript",
      );
      return true;
    }
    if (req.method === "GET" && url.pathname === "/proof/receipt.js") {
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
      if (url.pathname === "/proof/stripe-webhook" && service.billing) {
        await service.billing.webhook(raw, req.headers["stripe-signature"]);
        send(200, { received: true });
        return true;
      }
      // Browser writes require same origin; non-browser bearer calls have no ambient cookies.
      assert(
        customers
          ? req.headers.origin === service.config.origin
          : !req.headers.origin || req.headers.origin === service.config.origin,
        "ORIGIN_DENIED",
      );
      assert(
        req.headers["content-type"]?.startsWith("application/json"),
        "INVALID_CONTENT_TYPE",
      );
    }
    let token =
      req.headers.authorization?.match(/^Bearer ([^\s]+)$/)?.[1] || null;
    let session;
    if (customers) {
      session = customers.session(req);
      token = session.token;
      if (url.pathname === "/proof/logout" && req.method === "POST") {
        res.setHeader("Set-Cookie", customers.logout(req));
        send(200, { disconnected: true });
        return true;
      }
      if (url.pathname === "/proof/installations" && req.method === "GET") {
        const installations = await customers.installations(session);
        send(200, {
          installations: installations.map((i) => ({
            id: i.id,
            account: i.account.login,
          })),
          installUrl: service.config.installUrl || null,
        });
        return true;
      }
      if (url.pathname === "/proof/repositories" && req.method === "GET") {
        const id = Number(url.searchParams.get("installation"));
        assert(
          (await customers.installations(session)).some((i) => i.id === id),
          "ACCESS_DENIED",
        );
        const rows = await customers.list(
          session,
          `/user/installations/${id}/repositories`,
          "repositories",
        );
        send(200, {
          repositories: rows.map((r) => ({ id: r.id, name: r.full_name })),
        });
        return true;
      }
      if (
        [
          "/proof/account",
          "/proof/run",
          "/proof/scan",
          "/proof/scan/cancel",
          "/proof/checkout",
          "/proof/portal",
          "/proof/quantity",
        ].includes(url.pathname)
      ) {
        const input = raw.length
          ? JSON.parse(raw)
          : Object.fromEntries(url.searchParams);
        const installationId = Number(input.installation),
          repositoryId = Number(input.repository);
        const { repo, installation } = await customers.repository(
          session,
          installationId,
          repositoryId,
        );
        if (url.pathname === "/proof/account" && req.method === "GET") {
          const receipts = Object.values(service.data.receipts)
            .filter(
              (r) =>
                r.installationId === installationId &&
                r.receipt.identity.repositoryId === repositoryId,
            )
            .slice(-30)
            .reverse()
            .map((r) => ({
              id: r.receipt.receiptId,
              pr: r.receipt.identity.pr,
              verdict: r.receipt.verdict,
              current:
                r.current.state === "STALE" ? "STALE" : "REFRESH_REQUIRED",
              issuedAt: r.receipt.issuedAt,
            }));
          const client = service.clientFactory({ token });
          const pulls = await client.get(
            `/repos/${repo.full_name}/pulls?state=open&per_page=30`,
          );
          const usage = service.meter.usage(installationId);
          let billingOwner = false;
          try {
            billingOwner = await customers.billingOwner(session, installation);
          } catch {}
          if (!billingOwner) usage.activeDevelopers = [];
          send(200, {
            usage,
            receipts,
            billingOwner,
            pulls: pulls.map((p) => ({ number: p.number, title: p.title })),
            billingAvailable: !!service.billing,
          });
          return true;
        }
        if (url.pathname === "/proof/run" && req.method === "POST") {
          assert(
            Number.isSafeInteger(input.pr) && input.pr > 0,
            "INVALID_SCOPE",
          );
          const key = `${repositoryId}:${input.pr}`;
          service.data.subscriptions[key] = {
            ...service.data.subscriptions[key],
            repo: repo.full_name,
            repositoryId,
            installationId,
            pr: input.pr,
          };
          service.save();
          const client = await service.appClient(installationId, repositoryId);
          const out = await service.run(repo.full_name, input.pr, {
            client,
            installationId,
          });
          service.data.subscriptions[key].latestReceiptId =
            out.receipt.receiptId;
          service.save();
          send(201, {
            ...out,
            url: `/proof/receipts/${out.receipt.receiptId}`,
          });
          return true;
        }
        if (url.pathname === "/proof/scan") {
          const account = service.meter.account(installationId);
          if (req.method === "POST")
            service.startScan(installationId, repositoryId, repo.full_name);
          assert(
            !account.scan || account.scan.repositoryId === repositoryId,
            "SCAN_REPOSITORY_MISMATCH",
          );
          send(200, {
            scan: account.scan,
            bound:
              "Up to 5 merged PRs from the 30 most recently updated closed PRs. Unsupported history remains unavailable. This scan uses no live proofs.",
          });
          return true;
        }
        if (url.pathname === "/proof/scan/cancel" && req.method === "POST") {
          const scan = service.meter.account(installationId).scan;
          assert(
            scan && scan.repositoryId === repositoryId,
            "SCAN_REPOSITORY_MISMATCH",
          );
          if (scan.state === "RUNNING") scan.state = "CANCELED";
          service.save();
          send(200, { state: scan.state });
          return true;
        }
        if (
          ["/proof/checkout", "/proof/portal", "/proof/quantity"].includes(
            url.pathname,
          ) &&
          req.method === "POST"
        ) {
          // Paying-account owner only. Repository admin is not organization billing authority.
          assert(
            await customers.billingOwner(session, installation),
            "BILLING_OWNER_REQUIRED",
          );
          assert(service.billing, "BILLING_NOT_CONFIGURED");
          if (url.pathname === "/proof/quantity") {
            send(
              200,
              await service.billing.quantity(installationId, input.quantity),
            );
            return true;
          }
          send(
            200,
            url.pathname === "/proof/checkout"
              ? await service.billing.checkout(
                  installationId,
                  input.kind,
                  input.quantity,
                )
              : await service.billing.portal(installationId),
          );
          return true;
        }
      }
      const receiptId = url.pathname.match(
        /^\/proof\/receipts\/([a-f0-9-]{36})/,
      )?.[1];
      if (receiptId) {
        const row = service.data.receipts[receiptId];
        assert(row, "NOT_FOUND");
        await customers.repository(
          session,
          row.installationId,
          row.receipt.identity.repositoryId,
        );
      }
    }
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
          interactive(html(out.receipt, out.current))
            .replace('src="/proof/app.js"', 'src="/proof/receipt.js"')
            .replace(
              "</main>",
              `<p><a href="?format=json">Download JSON</a> · <a href="/proof/">Your account</a></p>${out.latestReceiptId && out.latestReceiptId !== out.receipt.receiptId && /^[a-f0-9-]{36}$/.test(out.latestReceiptId) ? `<p><a href="/proof/receipts/${out.latestReceiptId}">View latest receipt</a></p>` : ""}</main>`,
            ),
          "text/html; charset=utf-8",
        );
      return true;
    }
    send(404, { error: "NOT_FOUND" });
  } catch (e) {
    // Do not leak provider response, repository identity or token through errors.
    const safe = [
      "PROOF_BUSY",
      "LOGIN_REQUIRED",
      "ALLOWANCE_EXHAUSTED",
      "BILLING_NOT_CONFIGURED",
      "BILLING_OWNER_REQUIRED",
      "REVIEW_ACTIVE_DEVELOPERS",
      "CHECKOUT_PENDING",
      "SCAN_TASTE_ALREADY_RESERVED",
      "SCAN_BUSY",
      "SCAN_REPOSITORY_MISMATCH",
    ];
    send(e.code === "PROOF_BUSY" ? 409 : 403, {
      error: safe.includes(e.code) ? e.code : "PROOF_UNAVAILABLE_OR_DENIED",
    });
  }
  return true;
}
module.exports = { handle };
