import {SUPABASE_URL, SUPABASE_ANON_KEY} from './config.js';
export const emptyState=()=>({records:[],payments:{},collections:{}});
export const newKey=()=>Array.from(crypto.getRandomValues(new Uint8Array(32)),b=>b.toString(16).padStart(2,'0')).join('');
export function validateState(s){
 if(!s || !Array.isArray(s.records) || !s.payments || !s.collections || typeof s.payments!=='object'||typeof s.collections!=='object'|| Array.isArray(s.payments)||Array.isArray(s.collections))throw Error('Yedek dosyası geçersiz.');
 const ids=new Set();
 for(const r of s.records){
  if(!r || typeof r.id!=='string'|| !/^[a-zA-Z0-9_-]{1,100}$/.test(r.id)||ids.has(r.id)||!['expense','income','card','loan'].includes(r.kind)||typeof r.name!=='string'||!r.name.trim()||r.name.length>500||!Number.isFinite(r.amount)||r.amount<0)throw Error('Kayıt biçimi geçersiz.');
  ids.add(r.id);
  for(const f of ['balance','adjustment'])if(r[f]!==undefined&&!Number.isFinite(r[f]))throw Error('Borç tutarı geçersiz.');
  if(['expense','income'].includes(r.kind)&&!/^\d{4}-(0[1-9]|1[0-2])$/.test(r.start||r.month||''))throw Error('Başlangıç ayı geçersiz.');
  if(r.duration!=null&&(!Number.isInteger(r.duration)||r.duration<1))throw Error('Süre geçersiz.');
  if(r.day!=null&&(!Number.isInteger(r.day)||r.day<1||r.day>31))throw Error('Gün geçersiz.');
 }
 for(const group of [s.payments,s.collections])for(const [m,entries]of Object.entries(group)){
  if(!/^\d{4}-(0[1-9]|1[0-2])$/.test(m)||!entries||typeof entries!=='object'||Array.isArray(entries))throw Error('Ödeme dönemi geçersiz.');
  for(const [id,v]of Object.entries(entries))if(!/^[a-zA-Z0-9_-]{1,100}$/.test(id)||!Number.isFinite(v)||v<0)throw Error('Ödeme tutarı geçersiz.');
 }
 return structuredClone(s);
}
export async function rpc(name,args){
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),10000);
 try{
  const r=await fetch(SUPABASE_URL+'/rest/v1/rpc/'+name,{method:'POST',headers:{apikey:SUPABASE_ANON_KEY,'Content-Type':'application/json'},body:JSON.stringify(args),signal:controller.signal});
  const data=await r.json();
  if(!r.ok){const e=Error(data.message||'Buluta ulaşılamadı');e.code=data.code;throw e;}return data;
 }finally{clearTimeout(timer)}
}
export class Vault{
 constructor(storage=localStorage){this.storage=storage;this.slot='gelir-gider-vault-v1';this.version=0;this.loadedRaw=storage.getItem(this.slot);this.data=this.loadedRaw?JSON.parse(this.loadedRaw):{key:newKey(),revision:-1,dirty:false,state:emptyState()};if(!/^[a-f0-9]{64}$/.test(this.data.key)||!Number.isSafeInteger(this.data.revision))throw Error('Yerel kasa bozuk; üzerine yazılmadı.');validateState(this.data.state);this.persist();}
 persist(){if(this.storage.getItem(this.slot)!==this.loadedRaw)throw Error('Başka sekmede değişiklik var. Bu sayfayı yenileyin.');const raw=JSON.stringify(this.data);this.storage.setItem(this.slot,raw);this.loadedRaw=raw;}
 change(state){const before=structuredClone(this.data);this.data.state=validateState(state);this.data.dirty=true;try{this.persist();this.version++;}catch(e){this.data=before;throw e;}}
 async sync(){
  if(this.running)return this.running;
  this.running=this.doSync().finally(()=>this.running=null);return this.running;
 }
 async doSync(){
  const version=this.version;
  if(this.data.dirty){
   const rev=await rpc('write_finance_vault',{p_key:this.data.key,p_payload:this.data.state,p_revision:this.data.revision});
   this.data.revision=rev;this.data.dirty=this.version!==version;this.persist();
  }else{
   const remote=await rpc('read_finance_vault',{p_key:this.data.key});
   if(this.version!==version)return this.doSync();
   if(remote){this.data.state=validateState(remote.payload);this.data.revision=remote.revision;this.persist();}
  }
  if(this.data.dirty)return this.doSync();
 }
 async recover(key){
  if(!/^[a-f0-9]{64}$/.test(key))throw Error('Kurtarma anahtarı 64 küçük harf/rakam olmalı.');
  if(this.running)await this.running;
  const version=this.version,remote=await rpc('read_finance_vault',{p_key:key});
  if(!remote)throw Error('Bu anahtarla bulut kaydı bulunamadı.');
  if(version!==this.version)throw Error('Bu sırada kayıt değişti; tekrar deneyin.');
  const before=this.data;
  this.data={key,revision:remote.revision,dirty:false,state:validateState(remote.payload)};
  try{this.persist();this.version++;}catch(e){this.data=before;throw e;}
 }
}
