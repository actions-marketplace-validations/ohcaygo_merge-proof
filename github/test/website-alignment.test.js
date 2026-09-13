"use strict";
const {test}=require('node:test'),a=require('node:assert/strict'),vm=require('node:vm');
const {status}=require('../automation-status');
const {script}=require('../customer-public');
const scope={installationId:2,repositoryId:1,pr:1};
const usage={plan:'AWAITING_FIRST_PROOF',automationAllowed:true,activeDevelopers:[]};
test('automation derives six truthful scoped states without changing storage or leaking errors',()=>{
 const d={activation:{},subscriptions:{},queue:[]};
 a.equal(status(d,2,1,[],usage).state,'EMPTY');
 a.match(status(d,2,1,[],usage).message,/trial has not started/);
 a.doesNotMatch(status(d,2,1,[],{...usage,plan:'TRIAL'}).message,/trial has not started/);
 d.activation['2:1']={...scope};
 a.equal(status(d,2,1,[],usage).state,'PENDING');
 d.activation['2:1'].error='PRIVATE_PROVIDER_BODY';
 d.activation['2:1'].retryAt=Date.now()+300000;
 const before=JSON.stringify(d);
 a.equal(status(d,2,1,[],usage).state,'RETRYING');
 a.doesNotMatch(JSON.stringify(status(d,2,1,[],usage)),/PRIVATE_PROVIDER_BODY|retryAt|installationId/);
 a.equal(JSON.stringify(d),before);
 d.activation['2:1'].error='SUBSCRIPTION_CAPACITY';
 a.equal(status(d,2,1,[],usage).state,'ATTENTION');
 d.activation['2:1'].complete=true;
 a.equal(status(d,2,1,[{number:1}],usage).state,'PENDING');
 d.subscriptions['1:1']={...scope,refreshState:'CURRENT'};
 a.equal(status(d,2,1,[{number:1}],usage).state,'WORKING');
 d.queue.push({...scope,attempts:1});
 a.equal(status(d,2,1,[{number:1}],usage).state,'RETRYING');
 d.queue=[];d.subscriptions['1:1'].refreshState='UNAVAILABLE';
 a.equal(status(d,2,1,[{number:1}],usage).state,'ATTENTION');
 a.equal(status(d,2,1,[{number:1}],{...usage,automationAllowed:false,plan:'PAUSED'}).state,'PAUSED');
 // A different installation's failure is never exposed in this repository view.
 d.subscriptions['1:1']={...scope,installationId:3,refreshState:'UNAVAILABLE'};
 a.equal(status(d,2,1,[{number:1}],usage).state,'PENDING');
});
function element(){return {value:'',hidden:false,disabled:false,textContent:'',options:[],append(x){this.options.push(x);},replaceChildren(){this.options=[];},closest(){return {hidden:false};}};}
async function render(billingOwner){
 const els=new Map();const get=id=>{if(!els.has(id))els.set(id,element());return els.get(id);};
 get('installation').value=2;get('repository').value=1;
 const response={billingOwner,usage,automation:{state:'PENDING',message:'Finding open PRs and collecting evidence.'},pulls:[],receipts:[],merges:{records:[],total:0,completeness:'Fixture'}};
 const context=vm.createContext({document:{getElementById:get,createElement:element},location:{search:''},URLSearchParams,setInterval(){},fetch:async url=>({ok:url.includes('account?'),json:async()=>url.includes('account?')?response:{error:'LOGIN_REQUIRED'}})});
 vm.runInContext(script,context);await vm.runInContext('load()',context);return get;
}
test('non-billing-owner UI never fabricates zero and hides billing quantity controls',async()=>{
 const get=await render(false);
 a.match(get('developers').textContent,/billing owner can review/);a.doesNotMatch(get('developers').textContent,/\$0|0 active developers/);
 for(const id of ['subscribe','quantity','portal'])a.equal(get(id).hidden,true);
 a.equal(get('monitoring').textContent,'Finding open PRs and collecting evidence.');
});
test('authorized billing owner retains actual zero and legitimate billing controls',async()=>{
 const get=await render(true);a.match(get('developers').textContent,/0 active developers · expected \$0/);a.equal(get('subscribe').hidden,false);
});
