const {chromium}=require('playwright');const fs=require('fs');const assert=require('assert');
(async()=>{
 let h=fs.readFileSync(__dirname+'/../src/jogo.html','utf8');
 h='<!doctype html><meta charset=utf-8><meta name=viewport content="width=device-width,initial-scale=1"><style>[hidden]{display:none!important}</style><body>'+h;
 const b=await chromium.launch();const pg=await b.newPage({viewport:{width:400,height:800}});
 const errs=[];pg.on('pageerror',e=>errs.push(e.message));
 await pg.setContent(h);await pg.waitForTimeout(300);
 // estado inicial: só itens grátis
 let r=await pg.evaluate(()=>{AVT.sync();return {cfg:AVT.cfg(),inv:S.inv.items.slice()}});
 assert.strictEqual(r.cfg.cor,'azul');assert.deepStrictEqual(r.inv,[]);
 // item bloqueado não equipa
 r=await pg.evaluate(()=>{AVT.equip('cor','roxo');return AVT.cfg().cor});assert.strictEqual(r,'azul');
 // item grátis equipa e desequipa (slot opcional)
 r=await pg.evaluate(()=>{AVT.equip('cabeca','bone');var a=AVT.cfg().cabeca;AVT.equip('cabeca','bone');return [a,AVT.cfg().cabeca]});
 assert.deepStrictEqual(r,['bone','']);
 // sem gastar cristais
 assert.strictEqual(await pg.evaluate(()=>S.gems),50);
 // desbloqueio por progresso, sem duplicar
 r=await pg.evaluate(()=>{S.done={};for(var i=0;i<20;i++)S.done['x'+i]=1;S.bosses=1;AVT.sync();AVT.sync();var c=S.inv.items.filter(x=>x==='cor:grafite').length;AVT.equip('cor','grafite');return [c,AVT.cfg().cor]});
 assert.deepStrictEqual(r,[1,'grafite']);
 // Antena Wi-Fi do evento
 r=await pg.evaluate(()=>{AVT.equip('antena','antena-wifi');var a=AVT.cfg().antena;S.inv.items.push('antena-wifi');AVT.equip('antena','antena-wifi');return [a,AVT.cfg().antena]});
 assert.deepStrictEqual(r,['padrao','antena-wifi']);
 // UI no perfil
 await pg.evaluate(()=>{S.onb=true;save();var w=document.getElementById('welcome');if(w)w.hidden=true;tab='profile';render()});
 assert(await pg.locator('.avbig').count()===1);
 assert(await pg.locator('.avchip[data-slot="cabeca"]').count()>=1);
 await pg.locator('.avchip[data-slot="olhos"][data-id="verde"]').click();
 assert.strictEqual(await pg.evaluate(()=>AVT.cfg().olhos),'verde');
 // persistência
 assert.strictEqual(await pg.evaluate(()=>{return S.av.antena}),'antena-wifi');
 assert.deepStrictEqual(errs,[]);
 // conquistas
 r=await pg.evaluate(()=>{S.conq={};S.done={};S.bosses=0;CQ.sync();var a=Object.keys(S.conq).length;S.done={'0-0':1};CQ.sync();CQ.sync();return [a,Object.keys(S.conq)]});
 assert.strictEqual(r[0],0);assert.deepStrictEqual(r[1],['primeiro-ping']);
 assert.strictEqual(await pg.evaluate(()=>S.gems),50);
 console.log('avatar OK');await b.close();
})().catch(e=>{console.error(e);process.exit(1)});
