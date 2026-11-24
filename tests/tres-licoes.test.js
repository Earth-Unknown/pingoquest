// Toda parada tem 3 lições jogáveis (paradas com 2 fases ganham uma revisão como lição 3)
const {chromium}=require('playwright');
(async()=>{
  const b=await chromium.launch(),errs=[];let falhas=0;
  for(const curso of ['redes','linux']){
    const p=await b.newPage();p.on('pageerror',e=>errs.push(e.message));
    await p.addInitScript(c=>{localStorage.setItem('pingoquest-v3',JSON.stringify({curso:c,onb:true,onbC:{[c]:true}}))},curso);
    await p.goto('file://'+process.cwd()+'/index.html');await p.waitForTimeout(400);
    const r=await p.evaluate(()=>GAMES.map((g,i)=>[i,g.phases.length,g.phases.every(ph=>ph.length>0)]).filter(x=>x[1]<3||!x[2]));
    if(r.length){falhas++;console.log('FALHA',curso,JSON.stringify(r))}else console.log('ok',curso);
    await p.close();
  }
  if(errs.length){falhas++;console.log(errs)}
  await b.close();process.exit(falhas?1:0);
})();
