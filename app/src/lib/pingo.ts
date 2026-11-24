// @ts-nocheck  (porte direto do jogo: saída SVG idêntica)
import AV from '../legacy/avatar.json'
const { AVD, AV_COR, AV_OLHOS, AV_DEF, AV_SLOTS } = AV as any
export type Cfg = Record<string, string>
export { AV_DEF, AV_SLOTS }

function star(cx:number,cy:number,r:number){const p=[];for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,rr=i%2?r*.45:r;p.push((cx+rr*Math.cos(a)).toFixed(1)+','+(cy+rr*Math.sin(a)).toFixed(1))}return p.join(' ')}
const M:any={'@S1@':star(46.5,48.5,11),'@S2@':star(73.5,48.5,11),'@S3@':star(52,91,6),'@S4@':star(60,89,6)}
Object.keys(AVD).forEach(sl=>Object.keys(AVD[sl]).forEach(id=>{const o=AVD[sl][id];if(o.s.indexOf('@S')>=0)Object.keys(M).forEach(k=>{o.s=o.s.split(k).join(M[k])})}))

/** Configuração equipada: só vale se o item é grátis ou está no inventário. */
export function avCfg(S:any):Cfg{
  const c:Cfg=Object.assign({},AV_DEF,S.av||{})
  const own:string[]=(S.inv&&S.inv.items)||[]
  AV_SLOTS.forEach((sl:any)=>{
    const it=sl.itens.find((i:any)=>i.id===c[sl.id])
    const ok=it&&(it.free||(it.ev?own.indexOf(it.id)>=0:own.indexOf(sl.id+':'+it.id)>=0))
    if(!ok)c[sl.id]=AV_DEF[sl.id]
  })
  return c
}
 export function pingo(mood:string,cls:string|undefined,av:boolean|undefined,cfgIn:Cfg){
   /* Pingo v3 (referência "Robô Kawaii Roxo"): capacete lilás grande, viseira escura, orelhas roxas com luz ciano,
      bochechas brilhantes, boca aberta rosa, peito com 3 luzinhas, antena curva com bolinha amarela. Sem mochila fixa. */
   var eyes,mouth,brow='',topx='',
   cheeks='<ellipse cx="38.500" cy="61" rx="3.700" ry="3" fill="#ff5fae"/><ellipse cx="81.500" cy="61" rx="3.700" ry="3" fill="#ff5fae"/><ellipse cx="37.300" cy="59.900" rx="1.200" ry=".8" fill="#fff" opacity=".7"/><ellipse cx="80.300" cy="59.900" rx="1.200" ry=".8" fill="#fff" opacity=".7"/>',
   D='<g class="m-smile"><path d="M53.500 57.300h13q0 8.500-6.500 8.500t-6.500-8.500z" fill="#ff5fae"/><ellipse cx="60" cy="63.600" rx="3.600" ry="2.100" fill="#ff9fd0"/></g><ellipse class="m-wow" cx="60" cy="63" rx="5.200" ry="6" fill="#ff5fae"/><ellipse class="m-wow" cx="60" cy="66" rx="3" ry="2.200" fill="#ff9fd0"/>';
   var oval=function(cx,cy,rx,ry){return '<ellipse class="m-oval" cx="'+cx+'" cy="'+cy+'" rx="'+rx+'" ry="'+ry+'"/><circle cx="'+(cx-1.800)+'" cy="'+(cy-ry*.45)+'" r="1.700" fill="#fff"/>'};
   if(mood==='sad'){
     eyes=oval(46.500,48.500,3.700,5)+oval(73.500,48.500,3.700,5);
     brow='<path class="m-eye" d="M39.500 41.500l12-3.500M80.500 41.500l-12-3.500"/>';
     mouth='<path d="M56 67.500q4-5 8 0" fill="none" stroke="#ff5fae" stroke-width="3.200" stroke-linecap="round"/>';
     cheeks='';
   }else if(mood==='cheer'){
     eyes='<path class="m-eye" d="M40.500 52q6.500-12 13 0M66.500 52q6.500-12 13 0"/>';
     mouth=D;
   }else if(mood==='think'){
     eyes=oval(48.500,46,3.800,5.400)+oval(75.500,46,3.800,5.400);
     brow='<path class="m-eye" style="animation:none" d="M41 38q6-4 12-1M68 37q6-3 12 1"/>';
     mouth='<path d="M55 66q5-3 10 0" fill="none" stroke="#ff5fae" stroke-width="3.200" stroke-linecap="round"/>';
     topx='<g class="m-bub"><circle cx="20" cy="16" r="9" fill="#fff" stroke="#c88bff" stroke-width="2"/><text x="20" y="21" text-anchor="middle" font-size="13" font-weight="900" fill="#7b3ff2" font-family="system-ui,sans-serif">?</text><circle cx="29" cy="27" r="2.200" fill="#fff" stroke="#c88bff" stroke-width="1.400"/></g>';
   }else if(mood==='sleep'){
     eyes='<path class="m-eye" style="animation:none" d="M40.500 49q6.500 7 13 0M66.500 49q6.500 7 13 0"/>';
     mouth='<ellipse cx="60" cy="65" rx="3" ry="2.400" fill="#ff5fae"/>';
     topx='<g class="m-zz"><text x="88" y="24" font-size="14" font-weight="900" fill="#18ddfb" font-family="system-ui,sans-serif">z</text><text x="97" y="14" font-size="10" font-weight="900" fill="#18ddfb" font-family="system-ui,sans-serif">z</text></g>';
   }else if(mood==='love'){
     var ht=function(cx,cy){return '<path d="M'+cx+' '+(cy+6)+'C'+(cx-9)+' '+(cy-1)+' '+(cx-4)+' '+(cy-8)+' '+cx+' '+(cy-3)+'C'+(cx+4)+' '+(cy-8)+' '+(cx+9)+' '+(cy-1)+' '+cx+' '+(cy+6)+'z" fill="#ff4fae" class="m-heart"/>'};
     eyes=ht(46.500,49)+ht(73.500,49);mouth=D;
   }else if(mood==='wink'){
     eyes=oval(46.500,48,3.800,5.400)+'<path class="m-eye" d="M67 51q6.500-12 13 0"/>';
     mouth=D;
   }else{
     eyes=oval(46.500,48,3.800,5.400)+'<g class="r">'+oval(73.500,48,3.800,5.400)+'</g>';
     mouth=D;
   }
   var cfg:Cfg|null=av===false?null:cfgIn,st='',back='',ant,hat='',vis='',suit='',topAnt=false;
   ant=AVD.antena.padrao.s;
   if(cfg){
     var c=AV_COR[cfg.cor]||AV_COR.padrao,e=AV_OLHOS[cfg.olhos]||AV_OLHOS.ciano;
     st=' style="--primary:'+c[0]+';--primary-deep:'+c[1]+';--cyan:'+e+'"';
     var pk=function(sl,id){var x=AVD[sl]&&AVD[sl][id];return x?x.s:''};
     ant=pk('antena',cfg.antena)||ant;back=pk('costas',cfg.costas);hat=pk('cabeca',cfg.cabeca);vis=pk('visor',cfg.visor);suit=pk('roupa',cfg.roupa);
     topAnt=cfg.cabeca==='capacete'||cfg.cabeca==='coroa'||cfg.cabeca==='cartola';
   }
   var ear=function(x,ix){return '<rect class="m-ear" x="'+x+'" y="41.300" width="10.300" height="23.700" rx="5.200"/><rect x="'+ix+'" y="46.700" width="5.400" height="13.400" rx="2.700" fill="var(--cyan)"/><rect x="'+(ix+1.200)+'" y="48" width="1.200" height="4" rx=".6" fill="#fff" opacity=".6"/>'};
   return '<svg viewBox="0 0 120 120" class="'+(cls||'')+'"'+st+' data-m="'+mood+'" role="img" aria-label="Pingo, '+(av===false?'o roteador mascote':'seu robô')+'">'+back+
    (topAnt?'':ant)+
    /* pernas, corpo */
    '<g class="lgL"><rect class="m-low" x="41.500" y="101" width="19.600" height="11.500" rx="5.700"/><rect x="45.500" y="107.400" width="12" height="2.800" rx="1.400" fill="var(--cyan)"/></g><g class="lgR"><rect class="m-low" x="62" y="101" width="19.600" height="11.500" rx="5.700"/><rect x="67.500" y="107.400" width="12" height="2.800" rx="1.400" fill="var(--cyan)"/></g>'+
    '<rect class="m-low" x="41.600" y="82.500" width="36.400" height="22" rx="11"/><rect class="m-body" x="41.600" y="80.500" width="36.400" height="22.500" rx="11"/>'+
    '<rect x="51" y="85.500" width="18" height="10" rx="5" fill="#2a1668"/><circle cx="55.500" cy="90.500" r="2.100" fill="#18ddfb"/><circle cx="60" cy="90.500" r="2.100" fill="#ffd83d"/><circle cx="64.300" cy="90.500" r="2.100" fill="#ff4fae"/>'+
    suit+
    /* orelhas, capacete, viseira */
    ear(13.900,16.600)+ear(95.800,98.200)+
    '<rect class="m-low" x="24" y="21.300" width="72" height="63" rx="26"/><rect class="m-helm" x="24" y="18.700" width="72" height="62.700" rx="26"/>'+
    '<path d="M32 29q5-7 16-8.500" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".6"/><circle cx="53.800" cy="23.500" r="1.200" fill="#fff" opacity=".8"/>'+
    '<rect class="m-face" x="31.400" y="32" width="57.200" height="38.800" rx="16"/><rect x="31.400" y="32" width="57.200" height="38.800" rx="16" fill="none" stroke="var(--primary)" stroke-width="1.200" opacity=".6"/>'+
    '<path d="M38 37q5-3.500 12-3.500" fill="none" stroke="#fff" stroke-width="2.200" stroke-linecap="round" opacity=".22"/>'+
    eyes+brow+cheeks+mouth+vis+
    '<g class="m-arm l"><line class="m-limb" x1="42" y1="86" x2="34" y2="93.500"/><circle class="m-hand" cx="36" cy="95.500" r="2.300"/><rect class="m-hand" x="25.500" y="91.500" width="10.500" height="11" rx="5"/><rect x="27.300" y="93.200" width="2.400" height="3.600" rx="1.200" fill="#fff" opacity=".5"/></g>'+
    '<g class="m-arm r"><line class="m-limb" x1="78" y1="86" x2="86" y2="93.500"/><circle class="m-hand" cx="84" cy="95.500" r="2.300"/><rect class="m-hand" x="84" y="91.500" width="10.500" height="11" rx="5"/><rect x="90.300" y="93.200" width="2.400" height="3.600" rx="1.200" fill="#fff" opacity=".5"/></g>'+hat+topx+
    (topAnt?ant:'')+'</svg>';
 }
 
