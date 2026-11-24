// Chamados de Linux: o terminal virtual resolve cada chamado com comandos reais.
const {chromium}=require('playwright');
const SOL={
 lx_acesso:['whoami','hostname','pwd'],
 lx_comandos:['ls -a','ls -l','cat .recado'],
 lx_pastas:['cd /var/log','cd','cd docs'],
 lx_arquivos:['mkdir projetos','touch projetos/ideias.txt','cp relatorio.txt projetos/','mv rascunho.txt final.txt','rm lixo.txt'],
 lx_logs:['tail /var/log/app.log','grep ERRO /var/log/app.log','grep ERRO /var/log/app.log | wc -l'],
 lx_esteira:['grep pendente vendas.txt > pendentes.txt','echo fim do relatorio >> pendentes.txt','wc -l pendentes.txt'],
 lx_portaria:['ls -l','./backup.sh','chmod +x backup.sh','./backup.sh','chmod -w nota.txt'],
 lx_admin:['whoami','mkdir /etc/pingo.d','sudo mkdir /etc/pingo.d','sudo cp pingo.conf /etc/pingo.d/'],
 lx_maquinas:['ps','kill 2201','sudo apt update','apt install htop','sudo apt install htop'],
 lx_loja:['sudo apt update','apt search tree','apt install tree','sudo apt install tree','sudo apt remove cowsay'],
 lx_script:['echo "#!/bin/bash" > ola.sh','echo "echo Ola Pingo" >> ola.sh','chmod +x ola.sh','./ola.sh'],
 lx_agenda:['echo "0 3 * * * /home/aluno/backup.sh" > agenda.txt','echo "0 8 * * 1 /home/aluno/backup.sh" >> agenda.txt','crontab agenda.txt','crontab -l'],
 lx_busca:['find /var -name "*.log"','find . -name notas.txt','find /var -name "*.log" | wc -l','df -h'],
 lx_remoto:['ping servidor.local','ssh-keygen','ssh admin@servidor.local','scp relatorio.txt admin@servidor.local:/tmp/'],
 lx_torre:['ip a','ping gateway.local','curl http://servidor.local/status']
};
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:800}});
const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+__dirname+'/../index.html');
await p.evaluate(()=>{localStorage.clear()});await p.reload();
await p.evaluate(()=>{S.onb=true;S.curso='linux';save()});await p.reload();
await p.evaluate(()=>{var w=document.getElementById('welcome');if(w)w.hidden=true});
const res={};
for(const id of Object.keys(SOL)){
  const r=await p.evaluate(async([id,cmds])=>{
    startCase({id:id,kind:'daily',seed:'x'});
    for(const c of cmds){document.getElementById('tin').value=c;tmSubmit()}
    await new Promise(r=>setTimeout(r,1500));
    return{stage:C&&C.stage,passos:Object.keys(TM.done).length,total:TM.def.passos.length}
  },[id,SOL[id]]);
  res[id]=r;
  await p.evaluate(()=>{closeCase()});
}
// erros: comando inexistente e permissão
const e=await p.evaluate(()=>{startCase({id:'lx_admin',kind:'daily',seed:'x'});var o=[];['xyz','mkdir /etc/a','rm /etc','cat nada'].forEach(function(c){var r=tmRun(c);o.push(!!r.err)});closeCase();return o});
const ok=Object.values(res).every(r=>r.stage==='done'&&r.passos===r.total)&&e.every(Boolean)&&!errs.length;
console.log('terminal',ok?'OK':'FALHOU',JSON.stringify(res),JSON.stringify(e),errs);
await b.close();process.exit(ok?0:1)})();
