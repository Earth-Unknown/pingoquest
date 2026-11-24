// Cada curso tem as suas perguntas de nivelamento (o Linux não pode cair nas de Redes).
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
const out={};
for(const c of ['redes','linux']){
  await p.goto('file://'+__dirname+'/../index.html');
  await p.evaluate(c=>{localStorage.clear();S.curso=c;save()},c);await p.reload();
  out[c]=await p.evaluate(()=>({n:NIV.length,q:NIV[0].q,json:!!(DATA.NIV&&DATA.NIV.length)}));
}
const ok=out.linux.json&&out.redes.json&&out.linux.n===3&&out.redes.n===3&&/terminal/i.test(out.linux.q)&&!/terminal/i.test(out.redes.q)&&!errs.length;
console.log('nivelamento',ok?'OK':'FALHOU',JSON.stringify(out),errs);await b.close();process.exit(ok?0:1)})();
