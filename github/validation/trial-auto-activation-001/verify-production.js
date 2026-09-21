const fs=require('fs'),crypto=require('crypto'),a=require('assert/strict');
const root='/opt/merge-proof/current',cfg=JSON.parse(fs.readFileSync('/etc/merge-proof/pro.json'));
cfg.origin ||= JSON.parse(fs.readFileSync('/etc/merge-proof/live.json')).origin;
const state=()=>JSON.parse(fs.readFileSync(cfg.stateDir+'/state.json'));
(async()=>{
 const enc=x=>Buffer.from(JSON.stringify(x)).toString('base64url'),n=Math.floor(Date.now()/1000),p=enc({alg:'RS256',typ:'JWT'})+'.'+enc({iat:n-60,exp:n+540,iss:String(cfg.appId)}),jwt=p+'.'+crypto.createSign('RSA-SHA256').update(p).sign(cfg.privateKey,'base64url');
 const req=async(path,method='GET')=>{const r=await fetch('https://api.github.com'+path,{method,headers:{Authorization:'Bearer '+jwt,Accept:'application/vnd.github+json'}});a.ok(r.ok,'GitHub '+r.status);const raw=await r.text();return raw?JSON.parse(raw.replace(/("id"\s*:\s*)(\d{16,})/g,'$1"$2"')):{};};
 const deliveries=await req('/app/hook/deliveries?per_page=30');let replay=null;
 for(const d of deliveries.filter(x=>x.event==='installation'&&x.action==='created')){
  const detail=await req('/app/hook/deliveries/'+d.id);
  if(detail.request?.payload?.installation?.id!==161208536)continue;
  a.ok(state().github.events.includes(d.guid),'Original signed install accepted');
  if(!d.redelivery) continue; a.ok(d.status_code>=200&&d.status_code<300, "Redelivery status "+d.status_code); replay={guid:d.guid,event:d.event,status:d.status,statusCode:d.status_code,redeliveryDelivered:true};break;
 }
 a.ok(replay,'Production installation event available');
 const trial=state().meter.accounts['github:323341515'].trial; a.deepEqual(trial,JSON.parse(fs.readFileSync('/tmp/trial-production-acceptance.json')).trial); a.equal(Object.values(state().lifecycle).filter(e=>e.type==='trial_started'&&e.account==='github:323341515').length,1);
 const billing=new (require(root+'/github/billing').Billing)({store:{data:{},save(){}}},{...cfg.billing,origin:cfg.origin});await billing.price(cfg.billing.proPriceId,true);
 const page=await fetch(cfg.origin+'/proof/');a.equal(page.status,200);let html=await page.text();
 const decode=h=>{const key=parseInt(h.slice(0,2),16);return h.slice(2).match(/../g).map(x=>String.fromCharCode(parseInt(x,16)^key)).join('');};
 html=html.replace(/<a href="\/cdn-cgi\/l\/email-protection#([a-f0-9]+)"><span class="__cf_email__" data-cfemail="([a-f0-9]+)">\[email&#160;protected\]<\/span><\/a>/g,(_,href,data)=>{a.equal(decode(href),'support@ohcaygo.com');a.equal(decode(data),'support@ohcaygo.com');return '<a href="mailto:support@ohcaygo.com">support@ohcaygo.com</a>';}).replace('<script data-cfasync="false" src="/cdn-cgi/scripts/5c5dd728/cloudflare-static/email-decode.min.js"></script>','');
 a.equal(html,require(root+'/github/customer-public').page);
 const script=await fetch(cfg.origin+'/proof/app.js');a.equal(script.status,200);a.equal(await script.text(),require(root+'/github/customer-public').script);
 const anonymous=await fetch(cfg.origin+'/proof/receipts/'+trial.receiptId+'?format=json');a.equal(anonymous.status,403);a.equal((await anonymous.json()).error,'LOGIN_REQUIRED');
 const out={at:new Date().toISOString(),publicPageMatchesCandidateAfterCloudflareEmailProtection:true,publicScriptMatchesCandidate:true,anonymousReceiptDenied:true,liveStripe29MonthlyLicensed:true,replay,trialUnchangedAfterReplay:trial,trialStartedEvents:1};
 fs.writeFileSync('/tmp/trial-production-final.json',JSON.stringify(out,null,2));console.log(JSON.stringify(out,null,2));
})().catch(e=>{console.error(String(e.stack).slice(0,700));process.exitCode=1});
