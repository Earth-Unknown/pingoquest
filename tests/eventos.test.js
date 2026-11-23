// Fase 3: base de eventos (datas, uma etapa por dia, seleção de perguntas, recompensa única, isolamento da trilha)
const {chromium}=require('playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:800}});
const errs=[];p.on('pageerror',e=>errs.push(e.message));
fs.writeFileSync('/tmp/pq-test5.html','<style>[hidden]{display:none!important}</style>'+fs.readFileSync(__dirname+'/../src/jogo.html','utf8'));
await p.goto('file:///tmp/pq-test5.html');
const T=(n,v)=>console.log(n,JSON.stringify(v));
// 1) sem evento ligado: nada aparece
await p.evaluate(()=>{localStorage.clear();S.onb=true;S.plan=5;save();closeWelcome();EVENTS[0].enabled=false;DEVEV=false;render()});
T('1 sem evento: botao',await p.evaluate(()=>({fab:!document.querySelector('#evfab').hidden,lista:PK.evList().length})));
// 2) ligar evento de teste: cartao aparece, pagina abre
await p.evaluate(()=>{S.know={};DEVEV=true;render()});
T('2 evento ligado',await p.evaluate(()=>({fab:!document.querySelector('#evfab').hidden,label:document.querySelector('#evfab .evlab').textContent})));
await p.click('#evfab',{force:true});await p.waitForTimeout(200);
T('2b pagina',await p.evaluate(()=>({aberta:!$('#evpage').hidden,titulo:document.querySelector('#evpage h1').textContent,etapas:document.querySelectorAll('.evstep').length,tiles:document.querySelectorAll('.evpz .tile').length,btn:!!document.querySelector('[data-act=evstep]'),msg:(document.querySelector('.evmsg')||{}).textContent})));
// 3) pouco conteudo visto: etapa bloqueada com explicacao
T('3 poucas perguntas',await p.evaluate(()=>PK.evPick(PK.EVENTS[0])));
// 4) conteudo visto suficiente
await p.evaluate(()=>{['rede.def','rede.host','lan','internet','meio.transmissao','rede.alcance','cliente.servidor','banda.latencia'].forEach(c=>PK.markSeen([c]));evRender()});
const pick=await p.evaluate(()=>{var qs=PK.evPick(PK.EVENTS[0]);var cid={};qs.forEach(q=>cid[q.cid]=(cid[q.cid]||0)+1);return{n:qs.length,maxPorConceito:Math.max(...Object.values(cid)),todosElegiveis:qs.every(q=>PK.CUR&&eligible(q.cid)),semExtras:qs.every(q=>!q.x),tipos:[...new Set(qs.map(q=>q.t))].length}});
T('4 selecao',pick);
// helper para responder
await p.evaluate(()=>{window.ansQ=function(wrong){var q=curQ();
 if(q.t==='learn'){next();return}
 if(q.t==='mc')L.sel=q.opts.findIndex(o=>wrong?!o.c:o.c);else if(q.t==='vf')L.sel=wrong?!q.a:q.a;else if(q.t==='ty')L.sel=wrong?'zzz':q.a[0];
 else if(q.t==='fill')L.sel=q.ans.map(a=>q.bank.filter(x=>x.t===a)[0].id);
 else if(q.t==='bl')L.sel=q.a.map(t=>q.bank.filter(x=>x.t===t)[0].id);
 else if(q.t==='cl'){L.sel=[];q.ci.forEach(it=>L.sel[it.id]=wrong?(it.c?0:1):it.c)}
 else if(q.t==='mp'){q.pairs.forEach((_,i)=>{mpTap('l',i);mpTap('r',i)});return}
 check()};
 window.playStep=function(wrongN){var n=0,g=0;while(L&&L.kind==='event'&&g++<40){var q=curQ();ansQ(n<wrongN);n++;if(L.state==='fb')next()}return L&&L.kind}});
await p.evaluate(()=>{window.backEv=function(){endDone();if(document.querySelector('[data-act=pzdone]'))fireAct('pzdone');if(document.querySelector('.brx')){fireAct('brilho');fireAct('lclose')}}});
// 5) etapa 1 no dia 1, com perguntas certas
await p.evaluate(()=>{window.__today=PK.evToday()});
const day1=await p.evaluate(()=>window.__today);
const g0=await p.evaluate(()=>S.gems);
await p.click('[data-act=evstep]');await p.waitForTimeout(150);
T('5 lição evento',await p.evaluate(()=>({kind:L.kind,n:L.qb,hearts:S.hearts})));
let r=await p.evaluate(()=>{playStep(0);return{kind:L.kind,h1:document.querySelector('#lesson h1').textContent,pieces:S.ev['rede-conectada'].pieces,gems:S.gems}});
T('5b resultado',r);T('5c ganho cristais',r.gems-g0);
// 6) volta para a pagina do evento; segunda etapa no mesmo dia bloqueada
await p.evaluate(()=>backEv());await p.waitForTimeout(200);
T('6 mesmo dia',await p.evaluate(()=>({pagina:!$('#evpage').hidden,btn:!!document.querySelector('[data-act=evstep]'),msg:(document.querySelector('.evmsg')||{}).textContent,tilesRev:document.querySelectorAll('.evpz .tile').length})));
// 7) idempotencia: tentar forcar etapa 2 no mesmo dia nao paga
await p.evaluate(()=>PK.evStart('rede-conectada','s2'));
T('7 forcar mesmo dia',await p.evaluate(()=>({lessonAberta:!$('#lesson').hidden,pieces:S.ev['rede-conectada'].pieces})));
// 8) dia 4: etapa 2 (dias nao consecutivos)
await p.evaluate(d=>{window.__today=(function(a){var x=a.split('-');return new Date(Date.UTC(+x[0],+x[1]-1,+x[2]+3)).toISOString().slice(0,10)})(d);evRender()},day1);
await p.click('[data-act=evstep]');
r=await p.evaluate(()=>{playStep(0);return{h1:document.querySelector('#lesson h1').textContent,pieces:S.ev['rede-conectada'].pieces}});T('8 dia 4',r);
await p.evaluate(()=>backEv());
// 9) relogio para tras nao reabre dia
await p.evaluate(d=>{window.__today=d},day1);
T('9 relogio para tras',await p.evaluate(()=>({hoje:evToday(),maxDia:S.maxDay,podeIniciar:PK.evInfo(PK.EVENTS[0]).canStart})));
// 10) dia 8: etapa 3 completa
await p.evaluate(d=>{window.__today=(function(a){var x=a.split('-');return new Date(Date.UTC(+x[0],+x[1]-1,+x[2]+7)).toISOString().slice(0,10)})(d);evRender()},day1);
await p.click('[data-act=evstep]');
r=await p.evaluate(()=>{playStep(0);return{h1:document.querySelector('#lesson h1').textContent,pieces:S.ev['rede-conectada'].pieces,inv:S.inv.items,status:S.ev['rede-conectada'].status,gems:S.gems,ledger:Object.keys(S.ledger).length}});
T('10 completo',r);
await p.evaluate(()=>backEv());
T('10b pagina concluida',await p.evaluate(()=>({txt:document.querySelector('.evprize').textContent.trim().slice(0,60),btn:!!document.querySelector('[data-act=evstep]')})));
// 11) nao paga de novo
const gm=await p.evaluate(()=>S.gems);await p.evaluate(()=>{PK.evStart('rede-conectada','s3')});
T('11 sem pagamento duplo',await p.evaluate(g=>({gems:S.gems===g,inv:S.inv.items.length,lesson:!$('#lesson').hidden}),gm));
await p.click('[data-act=evclose]');
// 12) falha: menos de 4 acertos nao conclui e permite tentar de novo
await p.evaluate(()=>{S.ev={};S.ledger={};S.inv={items:[],coll:{}};save();window.__today=null;S.maxDay='';evRender()});
await p.evaluate(()=>{window.__today=null;S.maxDay=''});
await p.evaluate(()=>{evOpen('rede-conectada')});
await p.click('[data-act=evstep]');
r=await p.evaluate(()=>{playStep(6);return{h1:document.querySelector('#lesson h1').textContent,feitas:Object.keys((S.ev['rede-conectada']||{}).steps||{}).length,retry:!!document.querySelector('#lesson [data-act=evstep]'),hearts:S.hearts}});
T('12 falha',r);
// 13) o evento nao aciona desafio de 5 acertos
T('13 isolamento',await p.evaluate(()=>{SQ={g:-1,n:0};L={kind:'event',key:'x'};sqHit(true);sqHit(true);sqHit(true);sqHit(true);sqHit(true);return{n:SQ.n,xch:xchReady()}}));
// 14) chegou tarde: sem etapas viaveis
await p.evaluate(()=>{S.ev={};S.devStart='2026-11-01';window.__today='2026-11-10';S.maxDay='2026-11-10';save()});
T('14 tarde demais',await p.evaluate(()=>{var i=PK.evInfo(PK.EVENTS[0]);return{left:i.left,late:i.late,canStart:i.canStart}}));
// 14b) evento real (enabled) dentro da janela: botao visivel; fora da janela: some
await p.evaluate(()=>{DEVEV=false;EVENTS[0].enabled=true;window.__today='2026-11-25';S.maxDay='2026-11-25';render()});
T('14b evento real aberto',await p.evaluate(()=>({fab:!document.querySelector('#evfab').hidden,dot:(document.querySelector('#evfab .evdot')||{}).textContent})));
await p.evaluate(()=>{window.__today='2026-12-05';S.maxDay='2026-12-05';render()});
T('14c apos o fim',await p.evaluate(()=>({fab:!document.querySelector('#evfab').hidden})));
await p.evaluate(()=>{EVENTS[0].enabled=false;DEVEV=true;S.devStart='2026-11-01';window.__today='2026-11-20';S.maxDay='2026-11-20'});
// 15) encerrado: sai da lista
await p.evaluate(()=>{window.__today='2026-11-20';S.maxDay='2026-11-20'});
T('15 encerrado',await p.evaluate(()=>({lista:PK.evList().length})));
console.log('erros',errs);await b.close()})();
