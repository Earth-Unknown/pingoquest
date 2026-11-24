import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import art from './legacy/art.json'
import { Pingo } from './Pingo'
import { CURSOS } from './lib/cursos'
import { parseCurso, lessonQs } from './lib/curso'
import { Lesson } from './Lesson'
import { Case } from './Case'

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

export function Trail({S,refresh}:{S:any;refresh:()=>void}){
  const ativo=S.curso||'redes'
  const cur=CURSOS.find(c=>c.id===ativo)||CURSOS[0]
  const mundo=cur.json.mundos[0],par:any[]=mundo.paradas||[]
  const done=S.done||{}
  const isUn=(g:number,k:number)=>{const p=k>0?g+'-'+(k-1):(g>0?(g-1)+'-3':null);return !p||!!done[p]}
  const [open,setOpen]=useState<number|null>(null)
  const [play,setPlay]=useState<{g:number;k:number}|null>(null)
  const [kase,setKase]=useState<{g:number;id:string}|null>(null)
  const games=useMemo(()=>parseCurso(cur.json),[cur])
  const casoTitulo=(id:string)=>(cur.json.casos||[]).find((c:any)=>c.id===id)?.title||''
  const n=Object.keys(done).length,pct=par.length?Math.round(n/(par.length*4)*100):0
  let curFound=false
  const root=useRef<HTMLDivElement>(null)
  /* cabos ligando as etapas (mesma ideia do jogo) */
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
  return <div className="screen" ref={root}>
    <div className={'world w-'+ativo}>
      <div className="wstage"><Html h={ativo==='linux'?A.linuxScene:A.worldScene}/><div className="hping"><Pingo S={S} cls="wps"/></div></div>
      <span className={'cflag cf-'+ativo}><Html h={courseIcon(ativo)}/><b>{cur.nome}</b></span>
      <div className="winfo"><small>MUNDO {mundo.numero}</small><b>{mundo.nome}</b><span>{mundo.subtitulo}</span><div className="wprog"><i style={{width:pct+'%'}}/></div></div>
    </div>
    {par.map((p,gi)=><section key={gi} className={'unit u'+(gi%5)}>
      <div className="uhead"><span className="lm"><Html h={placeIcon(gi)}/></span>
        <div><div className="tag">Parada {gi+1}</div><h2>{p.lugar||p.titulo}</h2><div className="lsub">{p.titulo}</div></div></div>
      <div className="nodes">{[0,1,2,3].map(k=>{
        const key=gi+'-'+k,d=!!done[key],un=isUn(gi,k),isCur=un&&!d&&!curFound
        if(isCur)curFound=true
        const x=OFF[k],nm=k===3?(p.chamado?casoTitulo(p.chamado):''):(p.fases?.[k]?.nome||'')
        const label=k===3?(p.chamado?'Caso':'Prova final'):'Fase '+(k+1)
        const cls=(d?'done':(un?'cur':'lock'))+(k===3?' bossn':'')
        return <div className="nw" key={k} style={{'--x':x+'px'} as any}>
          {isCur&&<><div className="bubble">Começar</div><Pingo S={S} cls={'pingo '+(x>0?'r':'l')}/></>}
          <button className={'node '+cls} onClick={()=>setOpen(gi)} aria-label={p.titulo+', '+label+(un?'':' (bloqueada)')}>
            <Html h={nodeArt(ativo,gi,k)+(d?'<span class="bdg ok">'+A.IC.check+'</span>':(un?'':'<span class="bdg lk">'+A.IC.lock+'</span>'))}/></button>
          <div className={'nlabel '+(x>0?'R':'L')}><b>{label}</b>{nm&&<small>{nm}</small>}</div>
        </div>})}</div>
    </section>)}
    {open!==null&&<div id="modal" onClick={()=>setOpen(null)}><div className="sheet tall" role="dialog" onClick={e=>e.stopPropagation()}>
      <div className="shead"><span className="lm"><Html h={placeIcon(open)}/></span><div><div className="tag">Parada {open+1}</div><h2>{par[open].lugar||par[open].titulo}</h2><div className="lsub">{par[open].titulo}</div></div></div>
      <div className="srows">{[0,1,2,3].map(k=>{const key=open+'-'+k,d=!!done[key],un=isUn(open,k),p=par[open]
        const title=k===3?(p.chamado?'Caso · '+casoTitulo(p.chamado):'Prova final'):(p.fases?.[k]?.nome||'Fase '+(k+1))
        return <button key={k} disabled={!un} onClick={()=>{if(k===3&&p.chamado)setKase({g:open,id:p.chamado});else setPlay({g:open,k});setOpen(null)}} className={'srow'+(d?' done':(un?'':' lock'))+(k===3?' fin':'')}><span className="srt"><small>{k===3?(p.chamado?'Caso':'Prova final'):'Lição '+(k+1)}</small><b>{title}</b></span><em>{d?'Jogar de novo':(un?'Jogar':'Bloqueada')}</em></button>})}</div>
      <button className="btn prim" onClick={()=>setOpen(null)}>Fechar</button></div></div>}
    {kase&&<Case key={kase.id} S={S} def={(cur.json.casos||[]).find((c:any)=>c.id===kase.id)} kind="node" keyId={kase.g+'-3'} replay={!!done[kase.g+'-3']} onClose={()=>{setKase(null);refresh()}}/>}
    {play&&<Lesson key={play.g+'-'+play.k} S={S} qs={lessonQs(games[play.g],play.k)} kind={play.k===3?'boss':'phase'} keyId={play.g+'-'+play.k} onClose={()=>{setPlay(null);refresh()}}/>}
  </div>
}
