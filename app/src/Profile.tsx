import { useState } from 'react'
import { Pingo } from './Pingo'
import { CURSOS, pct, done, totalFases } from './lib/cursos'

export function Profile({S}:{S:any}){
  const ativo=S.curso||'redes'
  const cur=CURSOS.find(c=>c.id===ativo)||CURSOS[0]
  const [sum,setSum]=useState<string|null>(null)
  const total=S.total||0,acc=total?Math.round((S.ok||0)/total*100):0
  const stats:[string,string|number][]=[
    ['energia',S.xp||0],['dias',S.streak||0],['chips',S.gems??0],
    ['fases',done(S,cur.id).length+'/'+totalFases(cur.json)],['provas',S.bosses||0],['acertos',acc+'%']]
  return <div className="screen">
    <div className="ph"><Pingo S={S}/><div><h1>{S.nick||'Meu perfil'}</h1><p>{cur.nome}</p></div></div>
    <div className="mini">{stats.map(([k,v])=><div key={k}><b>{v}</b><span>{k}</span></div>)}</div>
    <div className="sect">Cursos</div>
    <div className="cscroll">{CURSOS.map(c=>{const on=c.id===ativo,p=pct(S,c)
      return <button key={c.id} className={'ccard'+(on?' on':'')} onClick={()=>setSum(c.id)}>
        <b>{c.nome}</b><small>{on?'Estudando':p+'%'}</small>
        <span className="cqbar"><i style={{width:p+'%'}}/></span></button>})}</div>
    <button className="btn ghost sumbtn" onClick={()=>setSum(ativo)}>Sumário: o que tem em {cur.nome}</button>
    {sum&&<Sumario S={S} id={sum} onClose={()=>setSum(null)}/>}
  </div>
}

function Sumario({S,id,onClose}:{S:any;id:string;onClose:()=>void}){
  const c=CURSOS.find(x=>x.id===id)!,on=id===(S.curso||'redes')
  const [open,setOpen]=useState<number|null>(null)
  const d=on?S.done||{}:S.cursos?.[id]?.done||{}
  const par:any[]=c.json.mundos?.[0]?.paradas||[]
  return <div id="modal" onClick={onClose}><div className="sheet tall sumario" role="dialog" aria-label="Sumário do curso" onClick={e=>e.stopPropagation()}>
    <h2>Sumário</h2><p className="note" style={{margin:'0 0 10px'}}>{c.nome} · toque numa parada para ver o que ela ensina</p>
    {par.map((q,i)=>{const dn=[0,1,2,3].filter(k=>d[i+'-'+k]).length
      const caso=(c.json.casos||[]).find((k:any)=>k.id===q.chamado)
      return <div className="sumr" key={i}>
        <button className="sumh" aria-expanded={open===i} onClick={()=>setOpen(open===i?null:i)}>
          <i>{i+1}</i><span><b>{q.titulo}</b><small>{q.lugar||''}</small></span>
          {dn>0&&<em className={dn===4?'ok':''}>{dn===4?'feito':dn+'/4'}</em>}</button>
        {open===i&&<div className="sumb" style={{display:'block'}}>
          {(q.fases||[]).map((f:any,j:number)=><div className="sumf" key={j}><b>{f.nome}</b><small>{(f.conceitos||[]).map((x:any)=>x.nome).join(', ')}</small></div>)}
          {caso&&<div className="sumf ch"><b>Chamado: {caso.title||caso.id}</b><small>{caso.tipo==='terminal'?'Digite comandos de verdade no terminal':'Resolva o caso investigando'}</small></div>}
        </div>}</div>})}
    <button className="btn" onClick={onClose}>Fechar</button>
  </div></div>
}
