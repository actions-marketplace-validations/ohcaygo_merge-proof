#!/usr/bin/env node
"use strict";
// Reads a snapshot without taking the product's exclusive writer lock.
const fs = require("node:fs");
const { aggregate } = require("./events");
const [file, since = "", until = "", source = ""] = process.argv.slice(2);
if (!file) throw Error("Usage: node github/funnel-export.js STATE_JSON [SINCE_ISO] [UNTIL_ISO] [SOURCE]");
for (const date of [since,until]) if(date && new Date(date).toISOString()!==date) throw Error("Use a full UTC ISO date, e.g. 2026-09-12T00:00:00.000Z");
console.log(JSON.stringify({schema_version:1,interval:"since inclusive, until exclusive",rows:aggregate(JSON.parse(fs.readFileSync(file,"utf8")),{since,until,source})},null,2));
