"use strict";
const {hash}=require("./common");
function record(store,type,key,fields={}) {
  store.data.lifecycle ||= {};
  const id=hash([type,key]);
  if(store.data.lifecycle[id]) return;
  const account = fields.account && store.data.meter?.accounts?.[fields.account];
  store.data.lifecycle[id]={acquisition_source: account?.acquisitionSource || "unknown",event_id:id,type,schema_version:1,source:"server",occurred_at:new Date().toISOString(),...fields};
}
function aggregate(data, {since = "", until = "", source = ""} = {}) {
  const groups = {};
  for (const e of Object.values(data.lifecycle || {})) {
    const attribution = e.acquisition_source === "unknown" ? data.meter?.accounts?.[e.account]?.acquisitionSource || "unknown" : e.acquisition_source || "unknown";
    if ((since && e.occurred_at < since) || (until && e.occurred_at >= until) || (source && attribution !== source)) continue;
    const key = JSON.stringify([e.occurred_at.slice(0,10), attribution, e.type]);
    const g = groups[key] ||= {day:e.occurred_at.slice(0,10), source:attribution, stage:e.type, events:0, accounts:new Set()};
    g.events++; if(e.account) g.accounts.add(e.account);
  }
  return Object.values(groups).map(g=>({...g,accounts:g.accounts.size})).sort((a,b)=>JSON.stringify(a).localeCompare(JSON.stringify(b)));
}
module.exports={record, aggregate};
