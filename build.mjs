import fs from 'node:fs';
const files=['index.html','style.css','app.js','engine.js','icon.svg','manifest.webmanifest','banks.js'];for(const f of fs.readdirSync('dist/logos'))files.push('logos/'+f);if(fs.existsSync('dist/private-seed.json'))files.push('private-seed.json');
const types={html:'text/html;charset=utf-8',css:'text/css;charset=utf-8',js:'application/javascript;charset=utf-8',svg:'image/svg+xml',webmanifest:'application/manifest+json',json:'application/json;charset=utf-8',png:'image/png'};
const assets=Object.fromEntries(files.map(f=>[f,{type:types[f.split('.').at(-1)],content:fs.readFileSync('dist/'+f,f.endsWith('.png')?'base64':'utf8'),base64:f.endsWith('.png')}]));
fs.mkdirSync('dist/server',{recursive:true});fs.writeFileSync('dist/server/index.js',fs.readFileSync('worker-template.js','utf8').replace('__ASSETS__',JSON.stringify(assets)));
if(fs.existsSync('.openai/hosting.json')){const m=JSON.parse(fs.readFileSync('.openai/hosting.json'));delete m.static;fs.writeFileSync('.openai/hosting.json',JSON.stringify(m,null,2));fs.mkdirSync('dist/.openai',{recursive:true});fs.copyFileSync('.openai/hosting.json','dist/.openai/hosting.json')}
console.log('Worker and static GitHub Pages assets ready.');
