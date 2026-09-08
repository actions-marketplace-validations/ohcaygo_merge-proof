"use strict";
// Builds an existing Pages project upload; does not publish or configure hosting.
const fs = require("node:fs");
const path = require("node:path");
const { createHash } = require("node:crypto");
const [out, existingPdf] = process.argv.slice(2);
if (!out || !existingPdf) throw new Error("Usage: node build-pages.js <new-output-directory> <existing-public-sample.pdf>");
const pdf = fs.readFileSync(existingPdf);
if (createHash("sha256").update(pdf).digest("hex") !== "6250cbc8cc33bf7030339197c95ced5c36440c223a9b02c61c98fa2c5a323a80")
  throw new Error("Existing public sample differs from verified deployment; inspect before replacing it.");
fs.mkdirSync(out); // Fail if the directory exists; never overwrite another bundle.
for (const name of ["index.html", "app.js", "style.css"])
  fs.copyFileSync(path.join(__dirname, "../public", name), path.join(out, name));
fs.copyFileSync(path.join(__dirname, "../../samples/kiota.html"), path.join(out, "sample.html"));
fs.writeFileSync(path.join(out, "kiota-sample-assessment.pdf"), pdf);
fs.copyFileSync(path.join(__dirname, "pages-worker.mjs"), path.join(out, "_worker.js"));
fs.writeFileSync(path.join(out, "_routes.json"), JSON.stringify({version:1, include:["/api/*", "/download/*", "/webhooks/stripe"], exclude:[]}, null, 2) + "\n");
fs.writeFileSync(path.join(out, "_headers"), `/*
  X-Content-Type-Options: nosniff
  X-Frame-Options: DENY
  Referrer-Policy: no-referrer
  Cache-Control: no-store
  Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self' https://buy.stripe.com
`);
console.log("Pages upload bundle prepared; deployment has not occurred.");
