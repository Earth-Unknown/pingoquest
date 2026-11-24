// Evento do Linux: cada etapa é um chamado no terminal, uma por dia.
const {chromium}=require('playwright');
const SOL={lx_acesso:['whoami','hostname','pwd'],lx_comandos:['ls -a','ls -l','cat .recado'],lx_pastas:['cd /var/log','cd','cd docs'],
 lx_arquivos:['mkdir projetos','touch projetos/ideias.txt','cp relatorio.txt projetos/','mv rascunho.txt final.txt','rm lixo.txt'],
 lx_logs:['tail /var/log/app.log','grep ERRO /var/log/app.log','grep ERRO /var/log/app.log | wc -l'],
 lx_esteira:['grep pendente vendas.txt > pendentes.txt','echo fim do relatorio >> pendentes.txt','wc -l pendentes.txt'],
 lx_portaria:['ls -l','chmod +x backup.sh','./backup.sh','chmod -w nota.txt']};
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:800}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+__dirname+'/../index.html');
await p.evaluate(()=>{localStorage.clear();S.onb=true;S.picked=true;S.onbC={redes:true,linux:true};S.curso='linux';save()});await p.reload();
await p.evaluate(()=>{var w=document.getElementById('welcome');if(w)w.hidden=true;window.__today='2026-11-24'});
const res={};
// 1) bloqueado: nada destravado na trilha
res.bloq=await p.evaluate(()=>{var ev=evById('servidor-no-ar');evStart(ev.id,'s1');return{lesson:!document.getElementById('lesson').hidden,ready:evChamado(ev.steps[0]).ok}});
// 2) destrava tudo e joga as 7 etapas, uma por dia
await p.evaluate(()=>{GAMES.forEach(function(g,gi){for(var k=0;k<3;k++)S.done[gi+'-'+k]=true});save()});
const ids=Object.keys(SOL);
for(let d=0;d<ids.length;d++){
  await p.evaluate(d=>{window.__today=addDays('2026-11-24',d)},d);
  const r=await p.evaluate(async([d,cmds,id])=>{
    var ev=evById('servidor-no-ar');evStart(ev.id,'s'+(d+1));
    var em=document.getElementById('lesson').hidden;
    for(const c of cmds){document.getElementById('tin').value=c;tmSubmit()}
    await new Promise(r=>setTimeout(r,1700));
    var P=S.ev[ev.id]||{steps:{}};
    var again=evInfo(ev).canStart;
    closeLesson();C=null;
    return{hidden:em,passos:Object.keys(P.steps).length,pieces:P.pieces,ok:P.steps['s'+(d+1)]&&P.steps['s'+(d+1)].c>=1,again:again}
  },[d,SOL[ids[d]],ids[d]]);
  res['d'+(d+1)]=r;
}
res.fim=await p.evaluate(()=>({items:S.inv.items,coll:S.inv.coll,pieces:S.ev['servidor-no-ar'].pieces,status:S.ev['servidor-no-ar'].status,ledger:Object.keys(S.ledger).filter(k=>k.indexOf('servidor')>0).length}));
const ok=res.bloq.lesson===false&&res.bloq.ready===false&&ids.every((id,d)=>{const r=res['d'+(d+1)];return r.hidden===false&&r.passos===d+1&&r.ok&&r.again===false})&&res.fim.pieces===9&&res.fim.status==='completed'&&res.fim.items.includes('terminal')&&res.fim.coll.servidor===1&&!errs.length;
console.log('evento-linux',ok?'OK':'FALHOU',JSON.stringify(res),errs);await b.close();process.exit(ok?0:1)})();
