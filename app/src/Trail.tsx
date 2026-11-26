import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import art from './legacy/art.json'
import { popIn } from './Fx'
import { Pingo } from './Pingo'
import { CURSOS } from './lib/cursos'
import { parseCurso, lessonQs } from './lib/curso'
import { Lesson } from './Lesson'
import { Case } from './Case'
import { Walker, type Walk } from './Walker'
import { EventPage, EventFab } from './Events'

const A:any=art
const OFF=[-54,42,-34,54]
const Html=({h,cls}:{h:string;cls?:string})=><span className={cls} style={cls?undefined:{display:'contents'}} dangerouslySetInnerHTML={{__html:h}}/>
const placeIcon=(i:number)=>'<svg viewBox="0 0 40 40" aria-hidden="true">'+(A.PLACE_IC[i]||A.PLACE_IC[0])+'</svg>'
const courseIcon=(id:string)=>id==='linux'?A.IC_TERM:'<svg viewBox="0 0 40 40" aria-hidden="true"><rect x="5" y="21" width="30" height="13" rx="6" fill="#7b3ff2"/><circle cx="12" cy="27.5" r="2" fill="#fff"/><circle cx="19" cy="27.5" r="2" fill="#fff"/><path d="M13 21 10 9M27 21l3-12" stroke="#7b3ff2" stroke-width="3" stroke-linecap="round"/></svg>'

function nodeArt(curso:string,gi:number,k:number){
  const pool:string[]=A.DVPOOL[curso]||A.DVPOOL.redes
  const nm=k===3?(curso==='linux'?'ticket':'dome'):pool[(gi*3+k)%pool.length]
  return '<svg class="dv" viewBox="0 0 46 46" aria-hidden="true">'+A.DVI[nm]+'</svg>'
}

/** última etapa "atual" vista (curso:parada-fase): se mudou depois de uma lição, o Pingo caminha até a nova */
let lastCur:string|null=null
/** Texto de conclusão da lição: o que se aprendeu, a aplicação real e o que vem a seguir (vem do conteúdo do curso) */
export function resumoDe(par:any[],games:any[],g:number,k:number){
  const p=par[g]||{},f=k<3?p.fases?.[k]:null,src=f?.sabe?f:p
  const nomes=games[g]?.names||[]
  const proxima=k<3?nomes[k+1]:(games[g+1]?.title||'')
  const n=par[g+1]
  const fim=k===3?{idx:g,lugar:p.lugar||'',titulo:p.titulo||'',vidasCheias:false,
    prox:n?{idx:g+1,lugar:n.lugar||'',titulo:n.titulo||'',gancho:p.gancho as string|undefined,topicos:(n.fases||[]).map((f:any)=>f.nome).filter(Boolean).slice(0,3)}:undefined}:undefined
  return {sabe:src?.sabe as string|undefined,pratica:src?.pratica as string|undefined,proxima:proxima||undefined,fim}
}

export function Trail({S,refresh,evOpen,setEvOpen}:{S:any;refresh:()=>void;evOpen:string|null;setEvOpen:(id:string|null)=>void}){
  const ativo=S.curso||'redes'
  const cur=CURSOS.find(c=>c.id===ativo)||CURSOS[0]
  const mundo=cur.json.mundos[0],par:any[]=mundo.paradas||[]
  const done=S.done||{}
  const isUn=(g:number,k:number)=>{const p=k>0?g+'-'+(k-1):(g>0?(g-1)+'-3':null);return !p||!!done[p]}
  const [openNode,setOpenNode]=useState<string|null>(null) // balão da etapa tocada (igual ao jogo)
  const [play,setPlay]=useState<{g:number;k:number}|null>(null)
  const [tips,setTips]=useState<number|null>(null)
  // tocar em qualquer outro lugar fecha o balão (o balão e os nós param a propagação)
  useEffect(()=>{if(!openNode)return;const f=()=>setOpenNode(null);document.addEventListener('click',f);return()=>document.removeEventListener('click',f)},[openNode])
  const [kase,setKase]=useState<{g:number;id:string}|null>(null)
  const games=useMemo(()=>parseCurso(cur.json),[cur])
  const casoTitulo=(id:string)=>(cur.json.casos||[]).find((c:any)=>c.id===id)?.title||''
  const n=Object.keys(done).length,pct=par.length?Math.round(n/(par.length*4)*100):0
  let curFound=false,curKey:string|null=null
  const [walk,setWalk]=useState<Walk|null>(null)
  const arriving=(k:string)=>!!walk&&walk.to.dataset.k===k // o Pingo parado fica escondido enquanto o outro caminha até lá
  const root=useRef<HTMLDivElement>(null)
  /* cabos ligando as etapas (mesma ideia do jogo) */
  useLayoutEffect(()=>{
    const prev=lastCur;lastCur=curKey
    if(!prev||!curKey||prev===curKey||!root.current)return
    const a=root.current.querySelector<HTMLElement>(`.node[data-k="${prev}"]`),b=root.current.querySelector<HTMLElement>(`.node[data-k="${curKey}"]`)
    const pg=b?.parentElement?.querySelector<HTMLElement>('.pingo')
    if(a&&b&&pg){const r=pg.getBoundingClientRect();setWalk({from:a,to:b,size:r.width,ty:r.top})}
  },[]) // eslint-disable-line react-hooks/exhaustive-deps
  useLayoutEffect(()=>{
    const draw=()=>{
      const NS='http://www.w3.org/2000/svg'
      root.current?.querySelectorAll<HTMLElement>('.nodes').forEach(box=>{
        box.querySelector('svg.cab')?.remove()
        const r=box.getBoundingClientRect(),pts:number[][]=[],st:boolean[]=[]
        box.querySelectorAll<HTMLElement>('.node').forEach(n=>{const b=n.getBoundingClientRect();pts.push([b.left-r.left+b.width/2,b.top-r.top+b.height/2]);st.push(n.classList.contains('done'))})
        if(pts.length<2)return
        let lit='',dim=''
        for(let i=1;i<pts.length;i++){const a=pts[i-1],b=pts[i],m=(a[1]+b[1])/2,seg=`M${a[0]} ${a[1]} C${a[0]} ${m} ${b[0]} ${m} ${b[0]} ${b[1]}`
          if(st[i-1])lit+=`<path d="${seg}" fill="none" stroke="#18ddfb" stroke-width="8" stroke-linecap="round"/>`
          else dim+=`<path d="${seg}" fill="none" stroke="#b9a6ee" stroke-width="6" stroke-linecap="round" stroke-dasharray="1 14"/>`}
        const sv=document.createElementNS(NS,'svg');sv.setAttribute('class','cab');sv.setAttribute('width',String(r.width));sv.setAttribute('height',String(r.height));sv.setAttribute('aria-hidden','true')
        sv.innerHTML='<defs><filter id="cglow" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>'+dim+'<g filter="url(#cglow)">'+lit+'</g>'
        box.insertBefore(sv,box.firstChild)
      })
    }
    draw();const t=setTimeout(draw,950) // depois da animação de entrada dos nós
    window.addEventListener('resize',draw)
    return()=>{clearTimeout(t);window.removeEventListener('resize',draw)}
  })
  return <div className="screen" ref={root} style={{position:'relative'}}>
    <div className={'world w-'+ativo}>
      <div className="wstage"><Html h={ativo==='linux'?A.linuxScene:A.worldScene}/><div className="hping"><Pingo S={S} cls="wps"/></div></div>
      <span className={'cflag cf-'+ativo}><Html h={courseIcon(ativo)}/><b>{cur.nome}</b></span>
      <div className="winfo"><small>MUNDO {mundo.numero}</small><b>{mundo.nome}</b><span>{mundo.subtitulo}</span><div className="wprog"><i style={{width:pct+'%'}}/></div></div>
    </div>
    {par.map((p,gi)=><section key={gi} className={'unit u'+(gi%5)}>
      <div className="uhead"><span className="lm"><Html h={placeIcon(gi)}/></span>
        <div><div className="tag">Parada {gi+1}</div><h2>{p.lugar||p.titulo}</h2><div className="lsub">{p.titulo}</div></div>
        {(p.dicas||[]).length>0&&<button className="tipbtn" onClick={()=>setTips(gi)}>Dicas</button>}</div>
      <div className="nodes">{[0,1,2,3].map(k=>{
        const key=gi+'-'+k,d=!!done[key],un=isUn(gi,k),isCur=un&&!d&&!curFound
        if(isCur){curFound=true;curKey=ativo+':'+key}
        const x=OFF[k],nm=k===3?(p.chamado?casoTitulo(p.chamado):''):(p.fases?.[k]?.nome||'')
        const label=k===3?(p.chamado?'Caso':'Prova final'):'Lição '+(k+1)
        const cls=(d?'done':(un?'cur':'lock'))+(k===3?' bossn':'')
        return <React.Fragment key={k}><div className="nw" style={{'--x':x+'px'} as any}>
          {isCur&&<><div className="bubble" style={arriving(ativo+':'+key)?{visibility:'hidden'}:undefined}>Começar</div><span style={{display:'contents',visibility:arriving(ativo+':'+key)?'hidden':'visible'}}><Pingo S={S} cls={'pingo '+(x>0?'r':'l')}/></span></>}
          <button data-k={ativo+':'+key} className={'node '+cls} onClick={e=>{e.stopPropagation();setOpenNode(openNode===key?null:key)}} aria-label={p.titulo+', '+label+(un?'':' (bloqueada)')}>
            <Html h={nodeArt(ativo,gi,k)+(d?'<span class="bdg ok">'+A.IC.check+'</span>':(un?'':'<span class="bdg lk">'+A.IC.lock+'</span>'))}/></button>
          <div className={'nlabel '+(x>0?'R':'L')}><b>{label}</b>{nm&&<small>{nm}</small>}</div>
        </div>
        {openNode===key&&<NodePop key={'p'+key} x={x} un={un} done={d} g={p} k={k} caso={k===3&&p.chamado?casoTitulo(p.chamado):''} nome={p.fases?.[k]?.nome}
          onGo={()=>{setOpenNode(null);if(k===3&&p.chamado)setKase({g:gi,id:p.chamado});else setPlay({g:gi,k})}}/>}
        </React.Fragment>})}</div>
    </section>)}
    <section className="nextsec"><span className="nschip">A seguir</span>
      <h2><svg viewBox="0 0 24 24" fill="currentColor"><path d="M17 9V7a5 5 0 0 0-10 0v2H5v12h14V9zm-8-2a3 3 0 0 1 6 0v2H9z"/></svg>{ativo==='linux'?'Em breve':'Mundo 2'}</h2>
      <div className="nspingo"><Pingo S={S} mood="wink" cls="pingo-s"/></div>
      <p>{ativo==='linux'?'Mais paradas de Linux chegam em breve. Termine todas as de agora para ficar pronto.':'Cidade IP: o próximo mundo chega em breve. Termine a Vila Roteador para ficar pronto.'}</p>
      <button className="btn ghost" disabled>Em breve</button></section>
    {tips!==null&&<div id="modal" onClick={()=>setTips(null)}><div className="sheet" ref={popIn} role="dialog" aria-label="Dicas" onClick={e=>e.stopPropagation()}>
      <h2>Dicas: {par[tips].titulo}</h2><ul>{(par[tips].dicas||[]).map((d:string,i:number)=><li key={i}>{d}</li>)}</ul>
      <button className="btn prim" onClick={()=>setTips(null)}>Entendi</button></div></div>}
    {walk&&root.current&&<Walker S={S} walk={walk} root={root.current} onEnd={()=>setWalk(null)}/>}
    <EventFab S={S} json={cur.json} onOpen={setEvOpen}/>
    {evOpen&&<EventPage S={S} json={cur.json} id={evOpen} onClose={()=>setEvOpen(null)} refresh={refresh}/>}
    {kase&&<Case key={kase.id} S={S} def={(cur.json.casos||[]).find((c:any)=>c.id===kase.id)} kind="node" keyId={kase.g+'-3'} replay={!!done[kase.g+'-3']} onClose={()=>{setKase(null);refresh()}}/>}
    {play&&<Lesson key={play.g+'-'+play.k} S={S} qs={lessonQs(games[play.g],play.k)} kind={play.k===3?'boss':'phase'} keyId={play.g+'-'+play.k} resumo={resumoDe(par,games,play.g,play.k)} onClose={()=>{setPlay(null);refresh()}}/>}
  </div>
}

/** Balão da etapa (igual ao do jogo): título, descrição, chips da primeira vez e botão de começar */
function NodePop({x,un,done,g,k,caso,nome,onGo}:{x:number;un:boolean;done:boolean;g:any;k:number;caso:string;nome?:string;onGo:()=>void}){
  const stop=(e:React.MouseEvent)=>e.stopPropagation()
  let title:string,desc:string,xp:number,gm:number
  if(k===3&&g.chamado){title='Caso · '+caso;desc='Um problema de verdade: investigue as pistas, levante uma hipótese e resolva.';xp=15;gm=10}
  else if(k<3){title='Lição '+(k+1)+' · '+(nome||'');desc='Uma explicação curta e perguntas simples. Sem pressa.';xp=10;gm=10}
  else{title='Prova final';desc='Prova final: 6 perguntas misturadas da etapa toda. Capriche!';xp=25;gm=25}
  if(!un)return <div className="pop lockedp" style={{'--ax':x+'px'} as any} onClick={stop}><h3>{title}</h3><p>Conclua a etapa anterior para desbloquear.</p></div>
  return <div className="pop" style={{'--ax':x+'px'} as any} onClick={stop} ref={popIn}><h3>{title}</h3><p>{desc}</p>
    {!done&&<small>Primeira vez: +{gm} chips</small>}
    <button className="popbtn" onClick={onGo}>{done?'Jogar de novo':'Começar'} +{xp} energia</button></div>
}
