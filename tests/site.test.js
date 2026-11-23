// O index.html da raiz precisa estar atualizado com src/jogo.html (rode `sh build-site.sh`) e abrir sem erro como página completa
const {chromium}=require('playwright');const fs=require('fs'),cp=require('child_process');
(async()=>{const root=__dirname+'/..';
const before=fs.readFileSync(root+'/index.html','utf8');cp.execSync('sh build-site.sh',{cwd:root});
const after=fs.readFileSync(root+'/index.html','utf8');
console.log('raiz atualizada',before===after);
const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:800}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+root+'/index.html');await p.waitForTimeout(600);
console.log(JSON.stringify(await p.evaluate(()=>({modo:document.compatMode,boasVindas:!document.getElementById('welcome').hidden,baú:getComputedStyle(document.getElementById('chestfx')).display}))),errs);
await b.close()})();
