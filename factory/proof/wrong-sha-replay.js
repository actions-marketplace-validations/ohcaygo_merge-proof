'use strict';
// Controlled withholding experiment on preserved, authentic public checks.
// Does not alter any SHA, review, check outcome or original capture.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const {integrate} = require('../evidence');
const {hash} = require('../common');
const file = path.join(__dirname,'public-results/pallets-click-3781.json');
const source = fs.readFileSync(file);
const item = JSON.parse(source);
const capture = structuredClone(item.capture);
capture.checks = capture.checks.filter(c => c.headSha !== capture.ciSha);
const chosen = capture.checks.find(c => c.conclusion === 'success');
assert.ok(chosen);
const required = [{name:chosen.name, appId:chosen.appId}];
const local = structuredClone(item.result);
local.findings = local.findings.filter(f => !['CI_RAN_ON_FINAL_HEAD','HUMAN_APPROVAL_PRESENT'].includes(f.id));
local.verdict = local.findings.length ? 'NOT_PROVEN' : 'VERIFIED';
const result = integrate(local,capture,required);
assert.equal(result.evidence.ci.state,'CI_STALE_OR_OTHER_SHA');
assert.equal(result.verdict,'NOT_PROVEN');
fs.writeFileSync(path.join(__dirname,'public-results/wrong-sha-withholding.json'),JSON.stringify({method:'CONTROLLED WITHHOLDING REPLAY, not a claim about the live repository: remove all landed-SHA checks from the authentic click #3781 capture; retain only genuine candidate-SHA checks, select one of those check names, and require evidence for the original landed SHA. No SHA/outcome/approval is fabricated. Original live capture remains unchanged.',sourceSha256:hash(source),required,capture,result},null,2)+'\n');
console.log('PASS: authentic wrong-SHA checks cannot verify the landed state');
