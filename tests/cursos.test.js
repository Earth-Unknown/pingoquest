// Troca de curso: progresso separado por curso, o resto (energia, avatar) compartilhado.
const {chromium}=require('playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:800}});
const errs=[];p.on('pageerror',e=>errs.push(e.message));
let h=fs.readFileSync(__dirname+'/../index.html','utf8');
fs.writeFileSync('/tmp/pq-cursos.html',h);
await p.goto('file:///tmp/pq-cursos.html');
await p.evaluate(()=>{localStorage.clear()});await p.reload();
await p.evaluate(()=>{S.onb=true;S.done={'0-0':1};S.gems=77;save()});await p.reload();
await p.evaluate(()=>{document.getElementById('welcome').hidden=true;tab='path';render()});
await p.evaluate(()=>{tab='profile';render()});await p.click('.ccard[data-id=linux]');await p.click('[data-act=curso][data-id=linux]');await p.waitForTimeout(400);
const a=await p.evaluate(()=>({c:CURSO,done:Object.keys(S.done).length,n:GAMES.length,gems:S.gems}));
await p.evaluate(()=>{S.done['0-0']=1;S.done['0-1']=1;save()});
await p.evaluate(()=>{document.getElementById('welcome').hidden=true});
await p.evaluate(()=>{tab='profile';render()});await p.click('.ccard[data-id=redes]');await p.click('[data-act=curso][data-id=redes]');await p.waitForTimeout(400);
const c=await p.evaluate(()=>({c:CURSO,done:Object.keys(S.done).length,gems:S.gems}));
const ok=a.c==='linux'&&a.done===0&&a.n===15&&a.gems===77&&c.c==='redes'&&c.done===1&&c.gems===77;
console.log(ok?'cursos OK':'cursos FALHOU',JSON.stringify([a,c]),errs);await b.close()})();
