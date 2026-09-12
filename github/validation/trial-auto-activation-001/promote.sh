#!/bin/sh
set -eu
release=/opt/merge-proof/releases/trial-0a635a7
previous=/opt/merge-proof/releases/ruleset-671b6e9
backup=/var/lib/merge-proof/backups/pre-trial-0a635a7
test "$(readlink -f /opt/merge-proof/current)" = "$previous"
test "$(sha256sum /tmp/merge-proof-trial-final.tar | cut -d ' ' -f 1)" = 3b3eaa9dc37e5f847d9ce6eaa29b67856224a49548edcc9dd0d581995172d3b3
test -s /tmp/trial-production-app-preflight.json
mkdir "$release"
tar -xf /tmp/merge-proof-trial-final.tar -C "$release"
printf '%s\n' 0a635a7f9035d027d97aad7b10287e7b925a0e4c > "$release/DEPLOYED_COMMIT"
chown -R root:root "$release"
mkdir -m 700 "$backup"
systemctl stop merge-proof
cp -a /var/lib/merge-proof/state "$backup/factory"
cp -a /var/lib/merge-proof/pro-live "$backup/pro"
# A failed boot may return to old code only before any trial has started.
recover() {
 systemctl stop merge-proof
 if node -e 'const fs=require("fs"),d=JSON.parse(fs.readFileSync("/var/lib/merge-proof/pro-live/state.json"));process.exit(Object.values(d.meter.accounts).some(a=>a.trial)?1:0)'; then
  ln -sfn "$previous" /opt/merge-proof/current
  systemctl start merge-proof
 else
  echo 'Trial state retained; old code cannot safely resume. Forward repair required.' >&2
 fi
}
trap recover EXIT
ln -sfn "$release" /opt/merge-proof/current
systemctl start merge-proof
node <<'JS'
const fs=require('fs'),a=require('assert/strict');
const cfg=JSON.parse(fs.readFileSync('/etc/merge-proof/live.json'));
(async()=>{for(let i=0;i<10;i++){try{
 const r=await fetch('http://127.0.0.1:4327/proof/app.js',{headers:{'x-mp-proxy-key':cfg.proxySecret,'x-mp-client-ip':'127.0.0.1'}});
 a.equal(r.status,200);a.equal(await r.text(),require('/opt/merge-proof/current/github/customer-public').script);
 console.log('Exact authenticated production asset PASS');return;
}catch(e){if(i===9)throw e;await new Promise(r=>setTimeout(r,500));}}})().catch(()=>{console.error('PRODUCTION_SMOKE_FAILED');process.exitCode=1});
JS
systemctl is-active merge-proof
trap - EXIT
readlink -f /opt/merge-proof/current
cat "$release/DEPLOYED_COMMIT"
