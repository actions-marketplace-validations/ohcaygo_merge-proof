"use strict";
const { randomBytes, createHash } = require("node:crypto");
const { assert } = require("./common");
const random = () => randomBytes(32).toString("hex");
const digest = (x) => createHash("sha256").update(x).digest("hex");
class Customers {
  constructor(service, { fetchImpl = fetch } = {}) {
    this.service = service;
    this.config = service.config;
    this.fetch = fetchImpl;
    // Short-lived user tokens never enter durable receipts or accounting state.
    this.sessions = new Map();
    this.states = new Map();
  }
  cookie(name, value, seconds) {
    return `${name}=${value}; HttpOnly; SameSite=Lax; Path=/proof/; Max-Age=${seconds}${this.config.origin.startsWith("https:") ? "; Secure" : ""}`;
  }
  value(req, name) {
    return req.headers.cookie
      ?.split(";")
      .map((x) => x.trim())
      .find((x) => x.startsWith(name + "="))
      ?.slice(name.length + 1);
  }
  start() {
    assert(
      this.config.clientId && this.config.clientSecret,
      "CUSTOMER_LOGIN_NOT_CONFIGURED",
    );
    for (const [k, v] of this.states) if (v < Date.now()) this.states.delete(k);
    assert(this.states.size < 1000, "LOGIN_BUSY");
    const state = random();
    this.states.set(digest(state), Date.now() + 600000);
    const url = new URL("https://github.com/login/oauth/authorize");
    url.search = new URLSearchParams({
      client_id: this.config.clientId,
      redirect_uri: this.config.origin + "/proof/callback",
      state,
    }).toString();
    return { url: url.href, cookie: this.cookie("mp_login", state, 600) };
  }
  async callback(req, url) {
    const state = url.searchParams.get("state"),
      cookie = this.value(req, "mp_login");
    assert(
      state && state === cookie && this.states.get(digest(state)) > Date.now(),
      "LOGIN_STATE_INVALID",
    );
    this.states.delete(digest(state));
    assert(!url.searchParams.has("error"), "LOGIN_CANCELED");
    const code = url.searchParams.get("code");
    assert(code && code.length < 1024, "LOGIN_INVALID");
    const r = await this.fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      redirect: "error",
      signal: AbortSignal.timeout(15000),
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        code,
        redirect_uri: this.config.origin + "/proof/callback",
      }),
    });
    assert(r.ok, "LOGIN_UNAVAILABLE");
    const data = await r.json();
    assert(
      typeof data.access_token === "string" && !data.error,
      "LOGIN_UNAVAILABLE",
    );
    const user = await this.api(data.access_token, "/user");
    assert(Number.isSafeInteger(user.id), "LOGIN_UNAVAILABLE");
    for (const [k, v] of this.sessions)
      if (v.expiresAt < Date.now()) this.sessions.delete(k);
    assert(this.sessions.size < 1000, "LOGIN_BUSY");
    const id = random();
    this.sessions.set(digest(id), {
      token: data.access_token,
      userId: user.id,
      expiresAt: Date.now() + Math.min(data.expires_in || 3600, 3600) * 1000,
    });
    return this.cookie("mp_session", id, 3600);
  }
  session(req) {
    const id = this.value(req, "mp_session");
    assert(id, "LOGIN_REQUIRED");
    const s = this.sessions.get(digest(id));
    assert(s && s.expiresAt > Date.now(), "LOGIN_REQUIRED");
    return s;
  }
  logout(req) {
    const id = this.value(req, "mp_session");
    if (id) this.sessions.delete(digest(id));
    return this.cookie("mp_session", "", 0);
  }
  async api(token, endpoint) {
    assert(
      /^\/(user(?:\/installations(?:\/\d+\/repositories)?|\/memberships\/orgs\/[\w.-]+)?|repos\/[\w.-]+\/[\w.-]+)(?:\?|$)/.test(
        endpoint,
      ),
      "INVALID_ENDPOINT",
    );
    const r = await this.fetch("https://api.github.com" + endpoint, {
      redirect: "error",
      signal: AbortSignal.timeout(15000),
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "Merge-Proof",
      },
    });
    assert(r.ok, "ACCESS_UNAVAILABLE_OR_DENIED");
    return r.json();
  }
  async list(session, endpoint, key) {
    const out = [];
    for (let page = 1; page <= 10; page++) {
      const data = await this.api(
        session.token,
        `${endpoint}?per_page=100&page=${page}`,
      );
      assert(Array.isArray(data[key]), "ACCESS_UNAVAILABLE_OR_DENIED");
      out.push(...data[key]);
      if (out.length >= data.total_count || data[key].length < 100) return out;
    }
    throw Object.assign(new Error("REPOSITORY_LIST_LIMIT"), {
      code: "REPOSITORY_LIST_LIMIT",
    });
  }
  async installations(session) {
    return (
      await this.list(session, "/user/installations", "installations")
    ).filter(
      (i) => String(i.app_id) === String(this.config.appId) && !i.suspended_at,
    );
  }
  async repository(session, installationId, repositoryId) {
    assert(
      Number.isSafeInteger(installationId) &&
        Number.isSafeInteger(repositoryId),
      "INVALID_SCOPE",
    );
    const installation = (await this.installations(session)).find(
      (i) => i.id === installationId,
    );
    assert(installation, "ACCESS_DENIED");
    const repos = await this.list(
      session,
      `/user/installations/${installationId}/repositories`,
      "repositories",
    );
    const repo = repos.find((r) => r.id === repositoryId);
    assert(repo, "ACCESS_DENIED");
    this.service.meter.connect(installationId, installation.account.id);
    this.service.save();
    return { repo, installation };
  }
  async billingOwner(session, installation) {
    if (installation.account.type === "User")
      return installation.account.id === session.userId;
    if (installation.account.type !== "Organization") return false;
    const membership = await this.api(
      session.token,
      `/user/memberships/orgs/${installation.account.login}`,
    );
    return (
      membership.state === "active" &&
      membership.role === "admin" &&
      membership.organization?.id === installation.account.id
    );
  }
}
module.exports = { Customers };
