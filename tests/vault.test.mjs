import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Vault,validateState,emptyState} from '../vault.js';
const storage=()=>{const m=new Map();return {getItem:k=>m.get(k)??null,setItem:(k,v)=>m.set(k,v)}};
const record=()=>({records:[{id:'test',kind:'expense',name:'Test',amount:125,start:'2026-11',duration:null}],payments:{},collections:{}});
test('local edits persist across reopening and invalid import is rejected',()=>{const s=storage(),v=new Vault(s);v.change(record());assert.deepEqual(new Vault(s).data.state,record());assert.throws(()=>validateState({records:[{id:'\" onclick=bad'}],payments:{},collections:{}}));});
test('storage failures never report a successful local edit',()=>{const s=storage(),v=new Vault(s);s.setItem=()=>{throw Error('quota')};assert.throws(()=>v.change(record()));assert.deepEqual(v.data.state,emptyState());});
test('stale tabs cannot overwrite another tab',()=>{const s=storage(),a=new Vault(s),b=new Vault(s);a.change(record());assert.throws(()=>b.change(emptyState()));assert.deepEqual(new Vault(s).data.state,record());});
test('cloud save, recovery on cleared device, rejected wrong key and conflict',async()=>{
 const rows=new Map();globalThis.fetch=async(url,opt)=>{const p=JSON.parse(opt.body);let data=null,ok=true;
 if(url.endsWith('read_finance_vault'))data=rows.get(p.p_key)??null;
 else {const old=rows.get(p.p_key);if((old?.revision??-1)!==p.p_revision){ok=false;data={message:'SYNC_CONFLICT'};}else{data=p.p_revision+1;rows.set(p.p_key,{payload:p.p_payload,revision:data});}}
 return {ok,json:async()=>data};};
 const a=new Vault(storage());a.change(record());await a.sync();assert.equal(a.data.dirty,false);
 const b=new Vault(storage());await b.recover(a.data.key);assert.deepEqual(b.data.state,record());
 await assert.rejects(b.recover('f'.repeat(64)));assert.deepEqual(b.data.state,record());
 a.change({...record(),collections:{'2026-11':{test:125}}});await a.sync();b.change(emptyState());await assert.rejects(b.sync(),/SYNC_CONFLICT/);assert.equal(b.data.dirty,true);
});
test('edit made while initial cloud read waits is uploaded',async()=>{let release;let writes=0;globalThis.fetch=async(url,opt)=>{if(url.endsWith('read_finance_vault')){await new Promise(r=>release=r);return {ok:true,json:async()=>null}}writes++;return {ok:true,json:async()=>0}};const v=new Vault(storage());const pending=v.sync();v.change(record());release();await pending;assert.equal(writes,1);assert.equal(v.data.dirty,false);});
