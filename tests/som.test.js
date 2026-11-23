// Testa sons e vibração: navegar = leve, avançar/recompensa = mais rico, sem erros
const {chromium}=require('playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch({args:['--autoplay-policy=no-user-gesture-required']});const p=await b.newPage({viewport:{width:390,height:800}});
const errs=[];p.on('pageerror',e=>errs.push(e.message));
fs.writeFileSync('/tmp/pq-test4.html','<style>[hidden]{display:none!important}</style>'+fs.readFileSync(__dirname+'/../src/jogo.html','utf8'));
await p.addInitScript(()=>{window.__v=[];navigator.vibrate=function(x){window.__v.push(x);return true}});
await p.goto('file:///tmp/pq-test4.html');
await p.evaluate(()=>{localStorage.clear();S.onb=true;S.plan=5;save();closeWelcome();render()});
const names=await p.evaluate(()=>Object.keys(SFX));
const res=await p.evaluate(()=>{var bad=[];Object.keys(SFX).forEach(n=>{try{SFX[n]()}catch(e){bad.push(n+':'+e.message)}});return bad});
console.log('sons',names.join(','),'falhas',res);
await p.evaluate(()=>{window.__v=[]});
await p.click('[data-act=tab][data-t]:nth-of-type(2)').catch(()=>{});
console.log('navegar (aba) vibra',JSON.stringify(await p.evaluate(()=>window.__v)));
await p.evaluate(()=>{window.__v=[];startLesson({kind:'phase',key:'0-0',qs:GAMES[0].phases[0]})});
await p.click('.lfoot [data-act]');
console.log('avançar vibra',JSON.stringify(await p.evaluate(()=>window.__v)));
console.log('erros',errs);await b.close()})();
