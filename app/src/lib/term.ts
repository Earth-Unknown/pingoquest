// Terminal simulado dos chamados de Linux. Extraído de src/jogo.html (linhas 'terminal dos chamados'); sem dependências do DOM.
// @ts-nocheck
/* eslint-disable */
/* ---------- terminal dos chamados de Linux ---------- */
export let TM:any=null;
export function setTM(t:any){TM=t}
export function tmNorm(p,cwd,home){
  if(p==='~'||p.indexOf('~/')===0)p=home+p.slice(1);
  if(p.charAt(0)!=='/')p=cwd+'/'+p;
  var o=[];p.split('/').forEach(function(s){if(!s||s==='.')return;if(s==='..')o.pop();else o.push(s)});
  return '/'+o.join('/');
}
export function tmDir(p){var i=p.lastIndexOf('/');return i<=0?'/':p.slice(0,i)}
export function tmBase(p){return p.slice(p.lastIndexOf('/')+1)}
export function tmTok(s){
  var r=[],cur='',q=null,has=false,i,c;
  function flush(){if(cur||has)r.push(cur);cur='';has=false}
  for(i=0;i<s.length;i++){c=s.charAt(i);
    if(q){if(c===q)q=null;else cur+=c}
    else if(c==='"'||c==="'"){q=c;has=true}
    else if(c===' '||c==='\t'){flush()}
    else if(c==='|'){flush();r.push({op:'|'})}
    else if(c==='>'){flush();if(s.charAt(i+1)==='>'){r.push({op:'>>'});i++}else r.push({op:'>'})}
    else cur+=c}
  flush();return r;
}
export function tmInit(def){
  var sc=def.cenario||{},u=sc.usuario||'aluno',T={user:u,host:sc.maquina||'servidor',home:'/home/'+u,fs:{},cwd:'',hist:[],out:[],ran:[],erros:0,killed:{},inst:(function(){var o={};(def.instalados||[]).forEach(function(x){o[x]=1});return o})(),rem:{},exec:{},done:{},hl:{},def:def,hi:-1};
  function mk(p,dir,t){
    var par=tmDir(p);if(par!==p&&!T.fs[par])mk(par,true);
    if(T.fs[p])return T.fs[p];
    var mine=p.indexOf(T.home)===0||p.indexOf('/tmp')===0;
    return T.fs[p]={d:!!dir,t:t||'',m:dir?'rwxr-xr-x':'rw-r--r--',o:mine?u:'root'};
  }
  T.mk=mk;mk('/',true);mk('/home',true);mk(T.home,true);mk('/tmp',true);
  Object.keys(def.fs||{}).forEach(function(p){var v=def.fs[p];if(p.slice(-1)==='/')mk(p.replace(/\/+$/,''),true);else mk(p,false,v)});
  Object.keys(def.perm||{}).forEach(function(p){if(T.fs[p])T.fs[p].m=def.perm[p]});
  T.cwd=tmNorm(sc.inicio||'~','/',T.home);
  T.msg='Siga o passo e digite no terminal.';
  return T;
}
export function tmPrompt(){return TM.user+'@'+TM.host+':'+(TM.cwd===TM.home?'~':TM.cwd.indexOf(TM.home+'/')===0?'~'+TM.cwd.slice(TM.home.length):TM.cwd)+'$ '}
export function tmCan(n,bit,sudo){if(sudo)return true;if(n.o!==TM.user)return n.m.charAt(6+bit)!=='-';return n.m.charAt(bit)!=='-'}
export function tmOpt(args){var f={},r=[];args.forEach(function(a){if(a.length>1&&a.charAt(0)==='-'&&!/^-\d+$/.test(a)){a.slice(1).split('').forEach(function(c){f[c]=1})}else r.push(a)});return{f:f,r:r}}
export function tmAbs(p){return tmNorm(p,TM.cwd,TM.home)}
export function tmErr(m){return{err:m}}
export function tmList(a,ctx){return a}
export function tmCmd(name,args,inp,ctx){
  var T=TM,fs=T.fs,o=tmOpt(args),f=o.f,r=o.r,sd=ctx.sudo,i,n,p;
  function need(){return r.length?null:tmErr(name+': falta um operando')}
  function wr(path){ /* pode criar/alterar em path? */
    var n=fs[path];if(n)return tmCan(n,1,sd);
    var par=fs[tmDir(path)];return !!par&&(sd||par.o===T.user)}
  switch(name){
  case 'pwd':return{out:T.cwd};
  case 'whoami':return{out:sd?'root':T.user};
  case 'hostname':return{out:T.host};
  case 'uname':return{out:'Linux'};
  case 'id':return{out:'uid=1000('+T.user+') gid=1000('+T.user+') grupos=1000('+T.user+'),27(sudo)'};
  case 'clear':T.out=[];return{out:''};
  case 'history':return{out:T.hist.map(function(h,i){return(i+1)+'  '+h}).join('\n')};
  case 'echo':return{out:r.join(' ')};
  case 'help':case 'ajuda':return{out:'Comandos: pwd ls cd mkdir touch cp mv rm cat head tail grep wc sort uniq echo chmod whoami id hostname ps kill ip ping curl apt find df ssh scp crontab sudo clear history\nUse | para ligar comandos e > ou >> para gravar em arquivo.'};
  case 'ls':{
    var ts=r.length?r:['.'],out=[];
    for(i=0;i<ts.length;i++){p=tmAbs(ts[i]);n=fs[p];
      if(!n)return tmErr("ls: não foi possível acessar '"+ts[i]+"': Arquivo ou diretório inexistente");
      var names=[];
      if(n.d){var pre=p==='/'?'/':p+'/';Object.keys(fs).forEach(function(k){if(k!==p&&k.indexOf(pre)===0&&k.slice(pre.length).indexOf('/')<0){var b=k.slice(pre.length);if(f.a||b.charAt(0)!=='.')names.push(b)}});names.sort();
        if(f.a)names=['.','..'].concat(names)}
      else names=[tmBase(p)];
      if(ts.length>1)out.push(ts[i]+':');
      if(f.l){names.forEach(function(b){var q=n.d?(b==='.'||b==='..'?p:(p==='/'?'':p)+'/'+b):p,m=fs[q]||n;out.push((m.d?'d':'-')+m.m+' 1 '+m.o+' '+m.o+' '+String(m.d?4096:(m.t||'').length).padStart(5)+' '+b)})}
      else if(ctx.pipe||ctx.redir)out.push(names.join('\n'));
      else out.push(names.join('  '));
    }
    return{out:out.join('\n')};}
  case 'cd':{
    p=r.length?tmAbs(r[0]):T.home;n=fs[p];
    if(!n)return tmErr('bash: cd: '+r[0]+': Arquivo ou diretório inexistente');
    if(!n.d)return tmErr('bash: cd: '+r[0]+': Não é um diretório');
    T.cwd=p;return{out:''};}
  case 'mkdir':{
    if(need())return need();
    for(i=0;i<r.length;i++){p=tmAbs(r[i]);
      if(fs[p]){if(f.p)continue;return tmErr("mkdir: não foi possível criar o diretório '"+r[i]+"': Arquivo existe")}
      if(!fs[tmDir(p)]&&!f.p)return tmErr("mkdir: não foi possível criar o diretório '"+r[i]+"': Arquivo ou diretório inexistente");
      if(!f.p&&!wr(p))return tmErr("mkdir: não foi possível criar o diretório '"+r[i]+"': Permissão negada");
      T.mk(p,true);if(sd&&p.indexOf(T.home)!==0&&p.indexOf('/tmp')!==0)fs[p].o='root'}
    return{out:''};}
  case 'touch':{
    if(need())return need();
    for(i=0;i<r.length;i++){p=tmAbs(r[i]);
      if(fs[p])continue;
      if(!fs[tmDir(p)])return tmErr("touch: não foi possível tocar '"+r[i]+"': Arquivo ou diretório inexistente");
      if(!wr(p))return tmErr("touch: não foi possível tocar '"+r[i]+"': Permissão negada");
      T.mk(p,false,'')}
    return{out:''};}
  case 'cat':{
    if(!r.length)return{out:inp||''};
    var res=[];
    for(i=0;i<r.length;i++){p=tmAbs(r[i]);n=fs[p];
      if(!n)return tmErr('cat: '+r[i]+': Arquivo ou diretório inexistente');
      if(n.d)return tmErr('cat: '+r[i]+': É um diretório');
      if(!tmCan(n,0,sd))return tmErr('cat: '+r[i]+': Permissão negada');
      res.push(n.t)}
    return{out:res.join('\n')};}
  case 'head':case 'tail':{
    var cnt=10,tx=inp,ar=args.slice(),j;
    for(j=0;j<ar.length;j++){if(ar[j]==='-n'&&ar[j+1]){cnt=+ar[j+1];ar.splice(j,2);break}if(/^-\d+$/.test(ar[j])){cnt=-ar[j];ar.splice(j,1);break}}
    ar=ar.filter(function(a){return a.charAt(0)!=='-'});
    if(ar.length){p=tmAbs(ar[0]);n=fs[p];if(!n)return tmErr(name+": não foi possível abrir '"+ar[0]+"': Arquivo ou diretório inexistente");if(n.d)return tmErr(name+': '+ar[0]+': É um diretório');if(!tmCan(n,0,sd))return tmErr(name+": não foi possível abrir '"+ar[0]+"': Permissão negada");tx=n.t}
    var ln=(tx||'').split('\n');return{out:(name==='head'?ln.slice(0,cnt):ln.slice(-cnt)).join('\n')};}
  case 'grep':{
    if(!r.length)return tmErr('grep: falta o padrão de busca');
    var pat=r[0],tx2=inp,re;
    try{re=new RegExp(pat,f.i?'i':'')}catch(e){re=new RegExp(pat.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),f.i?'i':'')}
    if(r.length>1){var fl=[];for(i=1;i<r.length;i++){p=tmAbs(r[i]);n=fs[p];if(!n)return tmErr('grep: '+r[i]+': Arquivo ou diretório inexistente');if(n.d)return tmErr('grep: '+r[i]+': É um diretório');if(!tmCan(n,0,sd))return tmErr('grep: '+r[i]+': Permissão negada');fl.push(n.t)}tx2=fl.join('\n')}
    if(tx2==null)return{out:''};
    var m=tx2.split('\n').filter(function(l){return !!re.test(l)!==!!f.v});
    return{out:f.c?String(m.length):m.join('\n')};}
  case 'wc':{
    var t3=inp;if(r.length){p=tmAbs(r[0]);n=fs[p];if(!n)return tmErr('wc: '+r[0]+': Arquivo ou diretório inexistente');if(n.d)return tmErr('wc: '+r[0]+': É um diretório');if(!tmCan(n,0,sd))return tmErr('wc: '+r[0]+': Permissão negada');t3=n.t}
    t3=t3||'';var lines=t3?t3.replace(/\n$/,'').split('\n').length:0,words=t3.split(/\s+/).filter(Boolean).length;
    var sx=r.length?' '+r[0]:'';
    return{out:f.l?lines+sx:f.w?words+sx:f.c?t3.length+sx:lines+' '+words+' '+t3.length+sx};}
  case 'sort':return{out:(inp||'').split('\n').sort().join('\n')};
  case 'uniq':return{out:(inp||'').split('\n').filter(function(l,i,a){return i===0||l!==a[i-1]}).join('\n')};
  case 'cp':case 'mv':{
    if(r.length<2)return tmErr(name+': falta o operando de destino');
    var dst=tmAbs(r[r.length-1]),srcs=r.slice(0,-1),dn=fs[dst];
    for(i=0;i<srcs.length;i++){var sp=tmAbs(srcs[i]),sn=fs[sp];
      if(!sn)return tmErr(name+": não foi possível obter estado de '"+srcs[i]+"': Arquivo ou diretório inexistente");
      if(sn.d&&name==='cp'&&!f.r)return tmErr("cp: -r não especificado; omitindo o diretório '"+srcs[i]+"'");
      var tg=(dn&&dn.d)?(dst==='/'?'':dst)+'/'+tmBase(sp):dst;
      if(srcs.length>1&&!(dn&&dn.d))return tmErr(name+": o alvo '"+r[r.length-1]+"' não é um diretório");
      if(!fs[tmDir(tg)])return tmErr(name+": não foi possível criar '"+r[r.length-1]+"': Arquivo ou diretório inexistente");
      if(!wr(tg)||(name==='mv'&&!sd&&sn.o!==T.user))return tmErr(name+": não foi possível mover/copiar para '"+r[r.length-1]+"': Permissão negada");
      if(name==='cp'&&!tmCan(sn,0,sd))return tmErr("cp: não foi possível abrir '"+srcs[i]+"' para leitura: Permissão negada");
      var keys=Object.keys(fs).filter(function(k){return k===sp||k.indexOf(sp+'/')===0}),add={};
      keys.forEach(function(k){var c={d:fs[k].d,t:fs[k].t,m:fs[k].m,o:fs[k].o};if(tg.indexOf(T.home)===0||tg.indexOf('/tmp')===0)c.o=T.user;add[tg+k.slice(sp.length)]=c});
      if(name==='mv')keys.forEach(function(k){delete fs[k]});
      Object.keys(add).forEach(function(k){fs[k]=add[k]})}
    return{out:''};}
  case 'rm':{
    if(need())return need();
    for(i=0;i<r.length;i++){p=tmAbs(r[i]);n=fs[p];
      if(!n){if(f.f)continue;return tmErr("rm: não foi possível remover '"+r[i]+"': Arquivo ou diretório inexistente")}
      if(p==='/'||p===T.home)return tmErr("rm: não é permitido remover '"+r[i]+"'");
      if(n.d&&!f.r)return tmErr("rm: não foi possível remover '"+r[i]+"': É um diretório");
      var par=fs[tmDir(p)];
      if(!sd&&par.o!==T.user)return tmErr("rm: não foi possível remover '"+r[i]+"': Permissão negada");
      Object.keys(fs).forEach(function(k){if(k===p||k.indexOf(p+'/')===0)delete fs[k]})}
    return{out:''};}
  case 'chmod':{
    r=args.filter(function(x){return x.charAt(0)!=='-'||/^-[rwx]+$/.test(x)});
    if(r.length<2)return tmErr('chmod: falta operando');
    var md=r[0];
    for(i=1;i<r.length;i++){p=tmAbs(r[i]);n=fs[p];
      if(!n)return tmErr("chmod: não foi possível acessar '"+r[i]+"': Arquivo ou diretório inexistente");
      if(!sd&&n.o!==T.user)return tmErr("chmod: alterando as permissões de '"+r[i]+"': Operação não permitida");
      var cur=n.m.split(''),mm;
      if(/^[0-7]{3}$/.test(md)){var s='';md.split('').forEach(function(d){d=+d;s+=(d&4?'r':'-')+(d&2?'w':'-')+(d&1?'x':'-')});cur=s.split('')}
      else if((mm=/^([ugoa]*)([+-])([rwx]+)$/.exec(md))){
        var who=mm[1]||'a',ix=[];if(who.indexOf('a')>-1)who='ugo';
        who.split('').forEach(function(w){ix.push({u:0,g:3,o:6}[w])});
        ix.forEach(function(b){mm[3].split('').forEach(function(l){var k=b+'rwx'.indexOf(l);cur[k]=mm[2]==='+'?l:'-'})})}
      else return tmErr("chmod: modo inválido: '"+md+"'");
      n.m=cur.join('')}
    return{out:''};}
  case 'ps':{var pr=(T.def.processos||[]).filter(function(x){return !T.killed[x.pid]});
    return{out:'  PID NOME'+pr.map(function(x){return '\n'+String(x.pid).padStart(5)+' '+x.nome}).join('')};}
  case 'top':{var pr2=(T.def.processos||[]).filter(function(x){return !T.killed[x.pid]});
    return{out:'  PID NOME            CPU\n'+pr2.map(function(x){return String(x.pid).padStart(5)+' '+(x.nome+'               ').slice(0,15)+' '+(x.cpu||'1%')}).join('\n')};}
  case 'kill':{
    if(!r.length)return tmErr('kill: uso: kill PID');
    var pid=+r[0],pp=(T.def.processos||[]).filter(function(x){return x.pid===pid&&!T.killed[x.pid]})[0];
    if(!pp)return tmErr('bash: kill: ('+r[0]+') - Nenhum processo encontrado');
    if(pp.dono&&pp.dono!==T.user&&!sd)return tmErr('bash: kill: ('+r[0]+') - Operação não permitida');
    T.killed[pid]=1;return{out:''};}
  case 'ip':{var rd=T.def.rede||{};
    return{out:'1: lo: <LOOPBACK,UP>\n    inet 127.0.0.1/8\n2: eth0: <BROADCAST,UP>\n    inet '+(rd.ip||'192.168.0.15')+'/24'};}
  case 'ping':{
    if(!r.length)return tmErr('ping: destino ausente');
    var rd2=T.def.rede||{},h=r[0],ok=h==='localhost'||h==='127.0.0.1'||(rd2.hosts&&rd2.hosts[h]);
    if(!ok)return tmErr('ping: '+h+': Nome ou serviço desconhecido');
    var ms=(rd2.hosts&&rd2.hosts[h]!==true&&rd2.hosts[h])||'0.4';
    return{out:'PING '+h+'\n64 bytes de '+h+': tempo='+ms+' ms\n64 bytes de '+h+': tempo='+ms+' ms\n--- 2 pacotes enviados, 2 recebidos, 0% de perda'};}
  case 'curl':{
    if(!r.length)return tmErr('curl: tente informar um endereço');
    var rd3=T.def.rede||{},cv=rd3.curl||{},u=r[0];
    if(cv[u]!=null)return{out:cv[u]};
    var host=u.replace(/^https?:\/\//,'').split('/')[0];
    if(rd3.hosts&&rd3.hosts[host])return tmErr('curl: (22) A página retornou erro 404');
    return tmErr('curl: (6) Não foi possível resolver o host: '+host);}
  case 'find':{
    var fa=args.slice(),fp=[],fn=null,ft=null,j=0;
    while(j<fa.length){if(fa[j]==='-name'){fn=fa[j+1];j+=2}else if(fa[j]==='-type'){ft=fa[j+1];j+=2}else{fp.push(fa[j]);j++}}
    if(!fp.length)fp=['.'];
    var rx=fn?new RegExp('^'+fn.replace(/[.+^${}()|[\]\\]/g,'\\$&').replace(/\*/g,'.*').replace(/\?/g,'.')+'$'):null,fo=[];
    for(j=0;j<fp.length;j++){
      var base=tmAbs(fp[j]),bn=fs[base];if(!bn)return tmErr('find: «'+fp[j]+'»: Arquivo ou diretório inexistente');
      Object.keys(fs).sort().forEach(function(k){
        if(k!==base&&k.indexOf(base==='/'?'/':base+'/')!==0)return;
        var nd=fs[k],nm=k.split('/').pop();
        if(ft==='f'&&nd.d)return;if(ft==='d'&&!nd.d)return;
        if(rx&&!rx.test(nm))return;
        var shown=fp[j].charAt(0)==='/'?k:(k===base?fp[j]:(fp[j]==='.'?'.':fp[j].replace(/\/+$/,''))+k.slice(base.length));
        fo.push(shown);
      });
    }
    return{out:fo.join('\n')};}
  case 'df':return{out:T.def.disco||'Sist. Arq.  Tam.  Usado  Disp.  Uso%  Montado em\n/dev/sda1    20G   12G    7,4G   62%   /\ntmpfs        2,0G  0      2,0G   0%    /tmp'};
  case 'date':return{out:'ter nov 24 09:30:00 -03 2026'};
  case 'ssh-keygen':T.keygen=1;return{out:'Par de chaves criado em ~/.ssh:\n  id_ed25519      (chave privada: nunca compartilhe)\n  id_ed25519.pub  (chave pública: pode enviar ao servidor)'};
  case 'ssh':case 'scp':{
    var sa=r,hs=T.def.ssh||{},tg=null,j2;
    for(j2=0;j2<sa.length;j2++)if(sa[j2].indexOf('@')>0)tg=sa[j2];
    if(!tg)return tmErr(name+': informe usuario@servidor');
    var up=tg.split(':')[0].split('@'),us=up[0],hh=up[1];
    if(!hs[hh])return tmErr(name+': não foi possível resolver o nome '+hh);
    if(hs[hh].indexOf(us)<0)return tmErr(us+'@'+hh+': Permissão negada (publickey).');
    if(name==='scp'){
      var sf=sa.filter(function(x){return x.indexOf('@')<0})[0];
      if(!sf||!fs[tmAbs(sf)])return tmErr('scp: '+(sf||'arquivo')+': Arquivo ou diretório inexistente');
      T.scp=(T.scp||{});T.scp[hh]=1;return{out:sf+'    100%   1 KB   enviado para '+hh};}
    T.ssh=(T.ssh||{});T.ssh[hh]=1;return{out:'Conectado a '+hh+' como '+us+'. (sessão de treino: você continua no seu terminal)'};}
  case 'crontab':{
    if(f.l){return T.cron?{out:T.cron}:tmErr('crontab: nenhuma agenda para '+T.user)}
    if(!r.length)return tmErr('crontab: informe o arquivo com as regras');
    var cn=fs[tmAbs(r[0])];if(!cn||cn.d)return tmErr('crontab: '+r[0]+': Arquivo ou diretório inexistente');
    T.cron=cn.t;return{out:'Agenda instalada.'};}
  case 'apt':{
    var ar=r.filter(function(x){return x.charAt(0)!=='-'}),sub=ar[0],pk=(T.def.pacotes||[]),ds=T.def.pacdesc||{};
    if(sub==='search'){
      if(!ar[1])return tmErr('apt: informe o que procurar');
      var q=ar[1].toLowerCase(),hit=pk.filter(function(x){return x.toLowerCase().indexOf(q)>-1||(ds[x]||'').toLowerCase().indexOf(q)>-1});
      return{out:hit.length?hit.map(function(x){return x+' - '+(ds[x]||'pacote')+(T.inst[x]?' [instalado]':'')}).join('\n'):'Nada encontrado para «'+ar[1]+'».'};}
    if(['update','upgrade','install','remove'].indexOf(sub)<0)return tmErr('apt: use update, search, install ou remove');
    if(!sd)return tmErr('E: Não foi possível abrir o bloqueio. Você é root? (dica: sudo)');
    if(sub==='update'){T.updated=1;return{out:'Lista de pacotes atualizada.'}}
    if(sub==='upgrade')return{out:'Todos os programas já estão atualizados.'};
    if(!ar[1])return tmErr('apt: informe o pacote');
    var bad=ar.slice(1).filter(function(x){return pk.length&&pk.indexOf(x)<0})[0];
    if(bad)return tmErr('E: Impossível encontrar o pacote '+bad);
    if(sub==='remove'){var nr=ar.slice(1).filter(function(x){return !T.inst[x]})[0];
      if(nr)return tmErr('E: O pacote '+nr+' não está instalado');
      ar.slice(1).forEach(function(x){delete T.inst[x];T.rem[x]=1});return{out:'Removendo '+ar.slice(1).join(' ')+'... pronto.'};}
    ar.slice(1).forEach(function(x){T.inst[x]=1});return{out:'Instalando '+ar.slice(1).join(' ')+'... pronto.'};}
  default:
    if(name.indexOf('./')===0||name.charAt(0)==='/'){
      p=tmAbs(name);n=fs[p];
      if(!n)return tmErr('bash: '+name+': Arquivo ou diretório inexistente');
      if(n.d)return tmErr('bash: '+name+': É um diretório');
      if(!tmCan(n,2,sd))return tmErr('bash: '+name+': Permissão negada');
      T.exec[p]=1;return{out:(T.def.exec&&T.def.exec[p])||'Script executado.'};}
    return tmErr('bash: '+name+': comando não encontrado');
  }
}
export function tmRun(line):any{
  var T=TM,toks=tmTok(line),segs=[[]],i;
  toks.forEach(function(t){if(t.op==='|')segs.push([]);else segs[segs.length-1].push(t)});
  var input=null,res={out:''},ok=true,out='';
  for(i=0;i<segs.length;i++){
    var seg=segs[i],args=[],redir=null;
    for(var j=0;j<seg.length;j++){var t=seg[j];
      if(typeof t==='object'){if(!seg[j+1]||typeof seg[j+1]==='object'){return{err:'bash: erro de sintaxe perto de «'+t.op+'»'}}redir={op:t.op,to:seg[j+1]};j++}
      else args.push(t)}
    if(!args.length){if(redir)return{err:'bash: erro de sintaxe'};return{out:''}}
    var sd=false;
    if(args[0]==='sudo'){sd=true;args.shift();if(!args.length)return{err:'sudo: uso: sudo comando'}}
    var ctx={sudo:sd,pipe:i<segs.length-1,redir:!!redir};
    res=tmCmd(args[0],args.slice(1),input,ctx);
    if(res.err)return res;
    out=res.out||'';
    if(redir){
      var p=tmAbs(redir.to),fn=T.fs[p];
      if(fn&&fn.d)return{err:'bash: '+redir.to+': É um diretório'};
      var pr=T.fs[tmDir(p)];
      if(!pr)return{err:'bash: '+redir.to+': Arquivo ou diretório inexistente'};
      if(fn?!tmCan(fn,1,false):pr.o!==T.user)return{err:'bash: '+redir.to+': Permissão negada'};
      if(!fn){T.mk(p,false,'');fn=T.fs[p]}
      fn.t=redir.op==='>>'?(fn.t?fn.t+'\n':'')+out:out;out='';
    }
    input=out;
  }
  return{out:out};
}
export function tmCheck(c){
  var T=TM,fs=T.fs,k;
  for(k in c){var v=c[k];
    if(k==='cmd'){if(!T.ran.some(function(x){return new RegExp(v,'i').test(x)}))return false}
    else if(k==='existe'){if(!fs[v])return false}
    else if(k==='naoexiste'){if(fs[v])return false}
    else if(k==='conteudo'){if(!fs[v[0]]||fs[v[0]].t.indexOf(v[1])<0)return false}
    else if(k==='perm'){if(!fs[v[0]]||fs[v[0]].m.slice(0,3).indexOf(v[1])<0)return false}
    else if(k==='semperm'){if(!fs[v[0]]||fs[v[0]].m.slice(0,3).indexOf(v[1])>-1)return false}
    else if(k==='cwd'){if(T.cwd!==v)return false}
    else if(k==='saida'){if(!T.out.some(function(x){return x.k==='o'&&new RegExp(v,'i').test(x.t)}))return false}
    else if(k==='matou'){if(!T.killed[v])return false}
    else if(k==='instalou'){if(!T.inst[v])return false}
    else if(k==='removeu'){if(!T.rem[v])return false}
    else if(k==='ssh'){if(!(T.ssh&&T.ssh[v]))return false}
    else if(k==='scp'){if(!(T.scp&&T.scp[v]))return false}
    else if(k==='exec'){if(!T.exec[v])return false}
  }
  return true;
}
export function tmCur(){var st=TM.def.passos||[],i;for(i=0;i<st.length;i++)if(!TM.done[i])return i;return -1}
