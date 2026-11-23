const {chromium}=require('playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:800}});
const errs=[];p.on('pageerror',e=>errs.push(e.message));
fs.writeFileSync('/tmp/pq-test.html','<style>[hidden]{display:none!important}</style>'+fs.readFileSync(__dirname+'/../index.html','utf8'));
await p.goto('file:///tmp/pq-test.html');await p.waitForTimeout(400);
const r=await p.evaluate(()=>{const out=[];const CUR=PK.CUR;
 // 1 estrutura
 const order=Object.keys(CUR);
 order.forEach(c=>CUR[c].pre.forEach(x=>{if(!CUR[x])out.push('PRE INEXISTENTE '+c+'->'+x);else{const [g1,p1]=CUR[x].l.split('-').map(Number),[g2,p2]=CUR[c].l.split('-').map(Number);if(g1*10+p1>g2*10+p2)out.push('PRE POSTERIOR '+c+'<-'+x);}}));
 PK.allQs().forEach(q=>{if(!CUR[q.cid])out.push('SEM CID '+q.q);if(![1,2,3].includes(q.dif))out.push('DIF '+q.q);
  const [g,pp]=q.lk.split('-').map(Number),[g2,p2]=CUR[q.cid].l.split('-').map(Number);if(g2*10+p2>g*10+pp)out.push('CONCEITO FUTURO NA FASE '+q.q);
  if(CUR[q.cid].l.split('-')[0]!==q.lk.split('-')[0]&&false)out.push('x')});
 // 2 aluno novo: nada elegível
 S.know={};const n0=PK.eligibleQs().length;
 // 3 ver só 0-0
 PK.markSeen(['rede.def','rede.host']);const a=PK.eligibleQs();
 const bad=a.filter(q=>!['rede.def','rede.host'].includes(q.cid)).length;
 // 4 pre não visto: ver ip.privado sem ip.v4/roteador
 S.know={};PK.markSeen(['ip.privado']);const n4=PK.eligibleQs().length;
 // 5 percorrer fases em ordem: sempre só conceitos vistos e pré vistos
 S.know={};let viol=0;GAMES.forEach((g,gi)=>g.phases.forEach((ph,pi)=>{PK.markSeen(ph.filter(q=>q.t==='learn').flatMap(q=>q.teach));PK.eligibleQs().forEach(q=>{const [g2,p2]=q.lk.split('-').map(Number);if(g2*10+p2>gi*10+pi)viol++})}));
 const total=PK.allQs().length,fin=PK.eligibleQs().length;
 // 6 backfill
 S.know={};S.done={'0-0':true,'0-1':true};backfillKnow();const bf=PK.eligibleQs().length;
 // 7 mastery
 S.know={};PK.markSeen(['rede.def']);for(let i=0;i<7;i++){PK.knowOf('rede.def').ok++}const m1=PK.masteryOf('rede.def');S.know['rede.def'].bad=6;const m2=PK.masteryOf('rede.def');
 const byC={};PK.allQs().forEach(q=>byC[q.cid]=(byC[q.cid]||0)+1);
 return {out,n0,n_0_0:a.length,bad,n4,viol,total,fin,bf,m1,m2,byC}});
console.log(JSON.stringify(r,null,1),errs);await b.close()})();
