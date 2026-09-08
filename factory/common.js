"use strict";
const crypto = require("node:crypto");
class FactoryError extends Error {
  constructor(code, status = 400) {
    super(code);
    this.code = code;
    this.status = status;
  }
}
const ensure = (condition, code, status) => {
  if (!condition) throw new FactoryError(code, status);
};
const hash = (value) => crypto.createHash("sha256").update(value).digest("hex");
const random = () => crypto.randomBytes(32).toString("hex");
const sha = (value) =>
  typeof value === "string" && /^[a-f0-9]{40}$/.test(value);
const escape = (value) =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
function parseRepo(value) {
  ensure(typeof value === "string", "NOT_ELIGIBLE");
  const match =
    /^https:\/\/github\.com\/([A-Za-z0-9_-]+)\/([A-Za-z0-9_.-]+?)(?:\.git)?\/?$/.exec(
      value,
    );
  ensure(match && ![".", ".."].includes(match[2]), "NOT_ELIGIBLE");
  return `${match[1]}/${match[2]}`;
}
function scrub(value) {
  return JSON.parse(
    JSON.stringify(value).replace(
      /(?:gh[pousr]_[A-Za-z0-9_]+|github_pat_[A-Za-z0-9_]+|sk_(?:live|test)_[A-Za-z0-9]+|whsec_[A-Za-z0-9]+|Bearer\s+[A-Za-z0-9._-]+)/g,
      "[REDACTED]",
    ),
  );
}
module.exports = {
  FactoryError,
  ensure,
  hash,
  random,
  sha,
  escape,
  parseRepo,
  scrub,
};
