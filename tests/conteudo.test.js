const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:800}});
const errs=[];p.on('pageerror',e=>errs.push(e.message));
let h=require('fs').readFileSync(''+__dirname+'/../index.html','utf8');h='<style>[hidden]{display:none!important}</style>'+h;require('fs').writeFileSync('/tmp/pq-test2.html',h);
await p.goto('file:///tmp/pq-test2.html');await p.waitForTimeout(500);
const r=await p.evaluate(()=>{const seen={},out=[];GAMES.forEach((g,gi)=>g.phases.forEach((ph,pi)=>ph.forEach(q=>{if(q.t==='learn')return;
if(seen[q.q])out.push('DUP '+q.q);seen[q.q]=1;
if(q.t==='mc'&&(q.a<0||q.a>=q.o.length))out.push('MC '+q.q);
if(q.t==='mp'&&(q.pairs.length<3||q.pairs.length>4))out.push('MP '+q.q);
if(q.t==='fill'){const n=(q.text.match(/___/g)||[]).length;if(n!==q.ans.length)out.push('FILL '+q.q)}
if(q.t==='cl'&&q.items.length<2)out.push('CL '+q.q)})));return out});
console.log(r,errs);await b.close()})();
