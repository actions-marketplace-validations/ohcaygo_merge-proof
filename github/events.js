"use strict";
const {hash}=require("./common");
function record(store,type,key,fields={}) {
  store.data.lifecycle ||= {};
  const id=hash([type,key]);
  if(store.data.lifecycle[id]) return;
  store.data.lifecycle[id]={event_id:id,type,schema_version:1,source:"server",occurred_at:new Date().toISOString(),...fields};
}
module.exports={record};
