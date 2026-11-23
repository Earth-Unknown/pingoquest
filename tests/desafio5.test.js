// Testa a Fase 2: 5 acertos seguidos na trilha -> convite para 3 perguntas extras (só na trilha)
const {chromium}=require('playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:800}});
const errs=[];p.on('pageerror',e=>errs.push(e.message));
fs.writeFileSync('/tmp/pq-test3.html','<style>[hidden]{display:none!important}</style>'+fs.readFileSync(__dirname+'/../index.html','utf8'));
await p.goto('file:///tmp/pq-test3.html');await p.waitForTimeout(300);
await p.evaluate(()=>{localStorage.clear();S.know={};S.xch={};S.onb=true;S.plan=5;S.hearts=3;save();closeWelcome();render();
  ['rede.def','rede.host','lan','internet','meio.transmissao'].forEach(c=>PK.markSeen([c]));
  window.ans=function(wrong){var q=curQ();
    if(q.t==='learn'){next();return}
    if(wrong){ if(q.t==='mc'){L.sel=q.opts.findIndex(o=>!o.c)} else if(q.t==='vf'){L.sel=!q.a} else if(q.t==='ty'){L.sel='zzz'} else if(q.t==='fill'){L.sel=L.sel.map(()=>q.bank[q.bank.length-1].id)} else {check();return} check();return}
    if(q.t==='mc')L.sel=q.opts.findIndex(o=>o.c);
    else if(q.t==='vf')L.sel=q.a;
    else if(q.t==='ty')L.sel=q.a[0];
    else if(q.t==='fill')L.sel=q.ans.map(a=>q.bank.filter(x=>x.t===a)[0].id);
    else if(q.t==='bl')L.sel=q.a.map(t=>q.bank.filter(x=>x.t===t)[0].id);
    else if(q.t==='cl'){L.sel=[];q.ci.forEach(it=>L.sel[it.id]=it.c)}
    else if(q.t==='mp'){q.pairs.forEach((_,i)=>{mpTap('l',i);mpTap('r',i)});return}
    check()};
  window.play=function(g,k,wrongAt){startLesson({kind:'phase',key:g+'-'+k,qs:GAMES[g].phases[k]});var n=0,guard=0;
    while(L.kind==='phase'&&guard++<40){var q=curQ();var isQ=q.t!=='learn';ans(isQ&&n===wrongAt);if(isQ)n++;
      if(L.state==='fb'||(L.state==='ask'&&q.t==='learn')){ if(L.state==='fb')next();}
      if(!L||L.kind==='done')break}
    return L&&L.kind}});
// 1) fase perfeita -> convite
let r=await p.evaluate(()=>{play(0,0);return{kind:L.kind,sq:SQ.n,hasCard:!!document.querySelector('.xch'),hasBtn:!!document.querySelector('[data-act=xch]')}});
console.log('1 perfeita',JSON.stringify(r));
// aceitar
let g0=await p.evaluate(()=>S.gems);
await p.click('[data-act=xch]');await p.waitForTimeout(150);
console.log('2 extra',await p.evaluate(()=>JSON.stringify({kind:L.kind,n:L.queue.length,x:L.queue.every(q=>q.x)})));
r=await p.evaluate(()=>{ans(false);next();ans(false);next();ans(true);var heartsMid=S.hearts;next();return{kind:L.kind,hearts:S.hearts,w:S.xch[0],gems:S.gems,title:document.querySelector('.lbody h1').textContent}});
console.log('3 resultado (2 de 3)',JSON.stringify(r),'ganho cristais',r.gems-g0);
await p.evaluate(()=>closeLesson());
// 4) repetir: sem cristais de novo
g0=await p.evaluate(()=>S.gems);
r=await p.evaluate(()=>{play(0,0);return{card:!!document.querySelector('.xch')}});
await p.click('[data-act=xch]');
r=await p.evaluate(()=>{ans(false);next();ans(false);next();ans(false);next();return{gain:S.gems-0,title:document.querySelector('.lbody h1').textContent}});
console.log('4 repeticao',JSON.stringify(r),'cristais antes',g0,'depois',await p.evaluate(()=>S.gems));
await p.evaluate(()=>closeLesson());
// 5) um erro quebra a sequência: sem convite
r=await p.evaluate(()=>{play(0,0,2);return{kind:L.kind,sq:SQ.n,card:!!document.querySelector('.xch')}});
console.log('5 com erro',JSON.stringify(r));
await p.evaluate(()=>closeLesson());
// 6) revisão e chefe não contam
r=await p.evaluate(()=>{SQ={g:-1,n:0};var qs=GAMES[0].phases[0].filter(q=>q.t!=='learn');startLesson({kind:'review',key:'r',qs:qs});var guard=0;while(L.kind==='review'&&guard++<20){ans(false);if(L.state==='fb')next()}return{sq:SQ.n,sg:SQ.g}});
console.log('6 revisao nao conta',JSON.stringify(r));
await p.evaluate(()=>closeLesson());
// 7) extras só com conceito visto
r=await p.evaluate(()=>{S.know={};PK.markSeen(['rede.def']);var a=pickExtras(0).length;PK.markSeen(['lan','internet','meio.transmissao','rede.host']);return{so_rede_def:a,todos:pickExtras(0).length,extrasNaTrilha:PK.allQs().some(q=>q.x),futuro:pickExtras(5).length}});
console.log('7 elegibilidade',JSON.stringify(r));
// 8) extras nao existem no evento: kind event nao conta (sqHit ignora)
r=await p.evaluate(()=>{SQ={g:-1,n:0};L={kind:'event',key:'e1'};sqHit(true);sqHit(true);return SQ.n});
console.log('8 evento nao conta',r);
console.log('erros',errs);await b.close()})();
