"use strict";
const { assert, available, unavailable, repoName } = require("./common");
class Client {
  constructor({
    token = null,
    fetchImpl = fetch,
    maxRequests = 240,
    maxDurationMs = 120000,
  } = {}) {
    this.token = token;
    this.fetch = fetchImpl;
    this.remaining = maxRequests;
    this.deadline = Date.now() + maxDurationMs;
  }
  async request(endpoint, { method = "GET", body } = {}) {
    assert(
      /^\/(repos\/[\w.-]+\/[\w.-]+(?:[/?]|$)|app\/installations\/\d+\/access_tokens$|graphql$)/.test(
        endpoint,
      ),
      "INVALID_ENDPOINT",
    );
    assert(--this.remaining >= 0, "API_BUDGET_EXHAUSTED");
    assert(Date.now() < this.deadline, "COLLECTION_TIME_LIMIT");
    const response = await this.fetch(`https://api.github.com${endpoint}`, {
      method,
      headers: {
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "Merge-Proof-Exact-State",
        ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
        ...(body ? { "Content-Type": "application/json" } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
      redirect: "error",
      signal: AbortSignal.timeout(15000),
    });
    if (!response.ok)
      throw Object.assign(new Error("GITHUB_UNAVAILABLE"), {
        code: "GITHUB_UNAVAILABLE",
        status: response.status,
      });
    // Bound bytes while streaming, not after an unbounded allocation.
    const chunks = [];
    let size = 0;
    for await (const chunk of response.body) {
      size += chunk.length;
      assert(size <= 4 * 1024 * 1024, "RESPONSE_LIMIT");
      chunks.push(chunk);
    }
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  }
  get(endpoint) {
    return this.request(endpoint);
  }
  async list(endpoint, key) {
    const all = [];
    for (let page = 1; page <= 5; page++) {
      const data = await this.get(
        `${endpoint}${endpoint.includes("?") ? "&" : "?"}per_page=100&page=${page}`,
      );
      const rows = key ? data[key] : data;
      assert(Array.isArray(rows));
      all.push(...rows);
      if (rows.length < 100) {
        if (key && Number.isInteger(data.total_count))
          assert(all.length >= data.total_count, "TRUNCATED_EVIDENCE");
        return all;
      }
    }
    throw Object.assign(new Error("PAGINATION_LIMIT"), {
      code: "PAGINATION_LIMIT",
    });
  }
  async observe(fn) {
    try {
      return available(await fn());
    } catch (e) {
      return unavailable(
        e.status ? `GITHUB_HTTP_${e.status}` : e.code || "SOURCE_ERROR",
      );
    }
  }
  async authorize(repo, expectedId) {
    assert(repoName(repo));
    const r = await this.get(`/repos/${repo}`);
    assert(
      r.id === expectedId && r.full_name.toLowerCase() === repo.toLowerCase(),
      "ACCESS_DENIED",
    );
    return r;
  }
}
module.exports = { Client };
