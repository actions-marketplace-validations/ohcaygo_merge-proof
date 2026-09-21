"use strict";
const $ = (id) => document.getElementById(id);
let order;
let poll;
async function api(route, body) {
  const r = await fetch("/api/" + route, {
    method: body === undefined ? "GET" : "POST",
    headers: body === undefined ? {} : { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const data = await r.json();
  if (!r.ok) throw Error(data.error);
  return data;
}
const text = (id, value) => ($(id).textContent = value);
function show(id, value) {
  $(id).hidden = !value;
}
function render(o) {
  order = o;
  text("state", o.state);
  show("eligibility", false);
  show("payment", false);
  show("authorization", !!o.payment && (!o.authorized || o.state === "PAID"));
  show("scope", o.state === "AWAITING_SCOPE_CONFIRMATION");
  show("delivery", o.runs.length > 0);
  show(
    "failure",
    ["RETRY", "REFUND_REQUIRED", "MANUAL_EXCEPTION"].includes(o.state),
  );
  $("authorization").elements.url.value = "https://github.com/" + o.repo;
  $("authorization").elements.pr.value = o.pr;
  text("scope-details", o.scope ? JSON.stringify(o.scope, null, 2) : "");
  text(
    "failure-detail",
    o.failure
      ? `${o.failure}. ${o.state === "REFUND_REQUIRED" ? "Refund review is required and has been recorded for Ryan. No automatic refund has been issued." : o.state === "MANUAL_EXCEPTION" ? "Your exception is recorded for Ryan." : "The pack was not delivered for this attempt. Retry, request help, or escalate a refund."}`
      : "",
  );
  show("retry", o.state === "RETRY");
  show("manual", o.state === "RETRY");
  show("refund", o.state === "RETRY");
  $("downloads").replaceChildren();
  for (const [i, run] of o.runs.entries()) {
    const section = document.createElement("section");
    const title = document.createElement("h3");
    title.textContent = `${i ? "Reassessment" : "Original report"} — ${run.verdict}`;
    section.append(title);
    for (const name of run.files) {
      const link = document.createElement("a");
      link.href = `/download/${run.id}/${name}`;
      link.textContent = name;
      section.append(link);
    }
    $("downloads").append(section);
  }
  show("reassess", o.reassessmentAvailable && o.state === "DELIVERED");
  text(
    "expiry",
    "Downloads and reassessment expire " +
      new Date(o.expiresAt).toLocaleString() +
      ".",
  );
  clearTimeout(poll);
  if (["RUNNING", "ELIGIBLE"].includes(o.state))
    poll = setTimeout(refresh, 3000);
  if (o.state === "RUNNING")
    text(
      "message",
      "Analysis is running. This page will update when the pack is ready.",
    );
  if (o.state === "DELIVERED")
    text(
      "message",
      "Your evidence pack is ready. Download and retain your files.",
    );
}
async function refresh() {
  try {
    render(await api("order"));
  } catch (e) {
    if (e.message !== "UNAUTHORIZED") text("message", e.message);
  }
}
function act(element, fn) {
  element.addEventListener(
    element.tagName === "FORM" ? "submit" : "click",
    async (e) => {
      e.preventDefault();
      const buttons = [
        ...element.querySelectorAll("button"),
        ...(element.tagName === "BUTTON" ? [element] : []),
      ];
      buttons.forEach((b) => (b.disabled = true));
      try {
        text("message", "Working…");
        await fn();
      } catch (e) {
        text("message", e.message.replaceAll("_", " "));
        await refresh();
      } finally {
        buttons.forEach((b) => (b.disabled = false));
      }
    },
  );
}
act($("eligibility"), async () => {
  const f = new FormData($("eligibility"));
  const required = String(f.get("required"))
    .split("\n")
    .filter((x) => x.trim())
    .map((line) => {
      const at = line.lastIndexOf("|");
      return {
        name: line.slice(0, at).trim(),
        appId: Number(line.slice(at + 1).trim()),
      };
    });
  const o = await api("eligibility", {
    url: f.get("url"),
    pr: Number(f.get("pr")),
    required,
  });
  if (o.eligibility !== "ELIGIBLE") {
    text("message", o.eligibility + ": " + o.reason);
    return;
  }
  show("access", true);
  $("private-link").value = location.origin + "/#access=" + o.token;
  text("message", "Eligible. Save your private access link before continuing.");
  render(o);
});
act($("pay"), async () => {
  const { url } = await api("checkout", {});
  location.assign(url);
});
act($("refresh"), refresh);
act($("authorization"), async () => {
  const f = new FormData($("authorization"));
  await api("authorize", { url: f.get("url"), pr: Number(f.get("pr")) });
  render(await api("scope", {}));
  text("message", "Review and confirm the exact scope below.");
});
act($("run"), async () => {
  await api("run", { scopeHash: order.scopeHash });
  await refresh();
});
act($("reassess"), async () => {
  render(await api("scope", {}));
  text("message", "Confirm the current candidate for your one reassessment.");
});
act($("retry"), async () => {
  if (!order.authorized) {
    show("authorization", true);
    return;
  }
  render(await api("scope", {}));
});
act($("manual"), async () =>
  render(await api("exception", { state: "MANUAL_EXCEPTION" })),
);
act($("refund"), async () =>
  render(await api("exception", { state: "REFUND_REQUIRED" })),
);
(async () => {
  if (location.hash.startsWith("#access=")) {
    const token = location.hash.slice(8);
    history.replaceState(null, "", "/legacy");
    try {
      render(await api("access", { token }));
    } catch {
      text("message", "This private access link is invalid or has expired.");
    }
  } else {
    if (location.hash === "#paid") history.replaceState(null, "", "/legacy");
    await refresh();
  }
  try {
    const o = await api("offer");
    text("price", o.price + (o.mode === "test" ? " · TEST MODE" : ""));
  } catch {
    text("price", "Checkout is temporarily unavailable.");
  }
})();

act($("refresh-scope"), async () => {
  render(await api("scope", {}));
  text("message", "Scope refreshed. Confirm the current states below.");
});
