"use strict";
const fs = require("node:fs");
const path = require("node:path");
const { capture } = require("../test/fixtures");
const { prove } = require("../proof");
const { html, text } = require("../receipt");
const c = capture();
c.checks.value[0].conclusion = "skipped";
const r = prove(c);
r.example = "SYNTHETIC_FIXTURE_NOT_CUSTOMER_EVIDENCE";
for (const [name, content] of Object.entries({
  "receipt.json": JSON.stringify(r, null, 2) + "\n",
  "receipt.html": html(r).replace(
    "<main>",
    "<main><p>Synthetic deterministic fixture — not customer evidence.</p>",
  ),
  "receipt.txt": "SYNTHETIC FIXTURE — NOT CUSTOMER EVIDENCE\n\n" + text(r),
}))
  fs.writeFileSync(path.join(__dirname, name), content);
