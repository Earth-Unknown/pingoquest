import { useState } from 'react'
import art from './legacy/art.json'
import { popIn } from './Fx'
import { Pingo } from './Pingo'
import { CURSOS, pct, done, totalFases } from './lib/cursos'
import { patchSave } from './lib/save'
import { soundOn, setSound, sfx } from './lib/sound'
import { KEY } from './lib/store'
import { avCfg } from './lib/pingo'
import { SLOTS, has, equip, icon } from './lib/avatar'
import { streakNow, trocarCurso, gamesOf } from './lib/progress'

const A:any=art
const Html=({h,cls}:{h:string;cls?:string})=><span className={cls} style={cls?undefined:{display:'contents'}} dangerouslySetInnerHTML={{__html:h}}/>
const courseIcon=(id:string)=>id==='linux'?A.IC_TERM:'<svg viewBox="0 0 40 40" aria-hidden="true"><rect x="5" y="21" width="30" height="13" rx="6" fill="#7b3ff2"/><circle cx="12" cy="27.5" r="2" fill="#fff"/><circle cx="19" cy="27.5" r="2" fill="#fff"/><path d="M13 21 10 9M27 21l3-12" stroke="#7b3ff2" stroke-width="3" stroke-linecap="round"/></svg>'
const themeNow=()=>{try{return localStorage.getItem('pingoquest-theme')==='dark'?'dark':'light'}catch{return 'light'}}

export function Profile({S,refresh}:{S:any;refresh:()=>void}){
  const ativo=S.curso||'redes'
  const cur=CURSOS.find(c=>c.id===ativo)||CURSOS[0]
  const [sum,setSum]=useState<string|null>(null)
  const [info,setInfo]=useState<string|null>(null)
  const [nick,setNick]=useState<string|null>(null)
  const [cap,setCap]=useState('Toque num item para vestir. Itens com cadeado mostram como ganhar.')
  const [sure,setSure]=useState(false)
  const [snd,setSnd]=useState(soundOn())
  const [theme,setTheme]=useState(themeNow())
  const total=S.total||0,acc=total?Math.round((S.ok||0)/total*100):0
  const provas=gamesOf(ativo).filter(g=>!g.caso).length
  const stats:[string,string|number][]=[
    ['energia',S.xp||0],['dias',streakNow(S)],['chips',S.gems??0],
    ['fases',done(S,cur.id).length+'/'+totalFases(cur.json)],['provas',(S.bosses||0)+'/'+provas],['acertos',acc+'%']]
  const cfg=avCfg(S)
  const act=(fn:(s:any)=>void)=>{patchSave(fn);refresh()}
  const toggleTheme=()=>{const t=theme==='dark'?'light':'dark';try{localStorage.setItem('pingoquest-theme',t)}catch{};document.documentElement.setAttribute('data-theme',t);setTheme(t)}
  const reset=()=>{if(!sure){setSure(true);return};try{localStorage.removeItem(KEY)}catch{};setSure(false);refresh()}
  let nOwn=0,nAll=0;SLOTS.forEach(sl=>sl.itens.forEach(it=>{nAll++;if(has(S,sl.id,it))nOwn++}))
  return <div className="screen">
    <div className="ph"><Pingo S={S}/><div><h1>{S.nick||'Meu perfil'}</h1><p>{cur.nome}</p>
      <button className="nickbtn" onClick={()=>setNick(S.nick||'')}>{S.nick?'Editar apelido':'Escolher apelido'}</button></div></div>
    <div className="mini">{stats.map(([k,v])=><div key={k}><b>{v}</b><span>{k}</span></div>)}</div>
    <div className="sect">Cursos</div>
    <div className="cscroll">{CURSOS.map(c=>{const on=c.id===ativo,p=pct(S,c)
      return <button key={c.id} className={'ccard'+(on?' on':'')} onClick={()=>setInfo(c.id)}>
        <Html cls="cqic" h={courseIcon(c.id)}/><b>{c.nome}</b><small>{on?'Estudando':p+'%'}</small>
        <span className="cqbar"><i style={{width:p+'%'}}/></span></button>})}</div>
    <button className="btn ghost sumbtn" onClick={()=>setSum(ativo)}><Html h={A.IC.map}/>Sumário: o que tem em {cur.nome}</button>

    <div className="sect">Meu robô</div>
    <div className="avbox"><Pingo S={S} cls="avbig"/></div>
    <p className="note" style={{margin:'0 0 6px',textAlign:'center'}}>Itens são só visuais: não mudam as perguntas nem dão vantagem.</p>
    {SLOTS.map(sl=><div className="avrow" key={sl.id}><b>{sl.nome}</b><div className="avgrid">{sl.itens.map(it=>{
      const own=has(S,sl.id,it),on=cfg[sl.id]===it.id
      return own
        ?<button key={it.id} className={'avchip avt'+(on?' on':'')} aria-pressed={on} aria-label={it.nome} title={it.nome} onClick={()=>{act(s=>equip(s,sl.id,it.id));setCap(it.nome)}}><Html h={icon(sl.id,it)}/></button>
        :<button key={it.id} className="avchip avt lock" aria-label={it.nome+' (bloqueado)'} onClick={()=>setCap(it.nome+' · '+(it.req||''))}><Html h={icon(sl.id,it)}/><i className="avlk" dangerouslySetInnerHTML={{__html:A.IC.lock}}/></button>})}</div></div>)}
    <div className="avcap" aria-live="polite">{cap}</div>
    <p className="note" style={{margin:'8px 0 0'}}>Inventário: {nOwn} de {nAll} itens.</p>

    <div className="sect">Ajustes</div>
    <button className="btn ghost" style={{marginBottom:10}} onClick={toggleTheme}>Tema: {theme==='dark'?'escuro (roxo)':'claro'}</button>
    <button className="btn ghost" style={{marginBottom:10}} onClick={()=>{const v=!snd;setSound(v);setSnd(v);if(v)sfx('ok')}}>Sons do Pingo: {snd?'ligados':'desligados'}</button>
    <button className="btn ghost" onClick={reset}>{sure?'Toque de novo para confirmar':'Zerar progresso'}</button>
    <p className="note" style={{marginTop:12}}>O progresso fica salvo neste navegador. Algo não funcionou direito? O <a href="jogo-antigo/" style={{color:'var(--primary-deep)',fontWeight:800}}>jogo antigo</a> continua disponível e usa o mesmo progresso.</p>

    {sum&&<Sumario S={S} id={sum} onClose={()=>setSum(null)}/>}
    {info&&<CursoInfo S={S} id={info} onClose={()=>setInfo(null)} onPick={id=>{act(s=>trocarCurso(s,id));setInfo(null);window.scrollTo(0,0)}} onSum={id=>{setInfo(null);setSum(id)}}/>}
    {nick!==null&&<div id="modal" onClick={()=>setNick(null)}><div className="sheet" ref={popIn} role="dialog" aria-label="Apelido" onClick={e=>e.stopPropagation()}>
      <h2>Seu apelido</h2><p className="note" style={{margin:'0 0 10px'}}>Até 14 letras. Aparece no seu perfil.</p>
      <input className="nickin" value={nick} maxLength={14} autoFocus onChange={e=>setNick(e.target.value)} style={{width:'100%',boxSizing:'border-box',font:'inherit',fontWeight:800,padding:'12px',borderRadius:12,border:'2px solid var(--line)',marginBottom:12}}/>
      <button className="btn prim" onClick={()=>{const v=nick.trim().slice(0,14);act(s=>{s.nick=v});setNick(null)}}>Salvar</button>
      <button className="btn ghost" style={{marginTop:8}} onClick={()=>setNick(null)}>Cancelar</button></div></div>}
  </div>
}

function CursoInfo({S,id,onClose,onPick,onSum}:{S:any;id:string;onClose:()=>void;onPick:(id:string)=>void;onSum:(id:string)=>void}){
  const c=CURSOS.find(x=>x.id===id)!,on=id===(S.curso||'redes')
  const par:any[]=c.json.mundos?.[0]?.paradas||[],casos:any[]=c.json.casos||[]
  const term=casos.some(k=>k.tipo==='terminal')
  const perg=par.reduce((n,q)=>n+(q.fases||[]).reduce((m:number,f:any)=>m+(f.itens||[]).filter((x:any)=>x.tipo!=='aprender').length,0),0)
  return <div id="modal" onClick={onClose}><div className="sheet tall cinfo" ref={popIn} role="dialog" aria-label="Sobre o curso" onClick={e=>e.stopPropagation()}>
    <div className="cihero"><Html cls="cqic big" h={courseIcon(id)}/><div><h2>{c.nome}</h2><p>{c.sub}</p></div></div>
    <div className="cistats"><div><b>{par.length}</b><span>paradas</span></div><div><b>{casos.length}</b><span>chamados</span></div><div><b>{perg}</b><span>perguntas</span></div></div>
    <div className="tlabel">O que você vai aprender</div>
    <div className="cichips">{par.map((q,i)=><span key={i}><i>{i+1}</i>{q.titulo}</span>)}</div>
    <div className="say"><span className="sp"><Pingo S={S} cls="pingo-s"/></span><div className="bub"><p>{term?'Aqui você aprende perguntando e depois digita comandos de verdade nos chamados!':'Aqui você aprende perguntando e depois resolve chamados investigando a rede!'}</p></div></div>
    <button className="btn ghost" style={{marginBottom:8}} onClick={()=>onSum(id)}>Ver o conteúdo completo</button>
    {on?<button className="btn" disabled>Estudando agora</button>:<button className="btn prim" onClick={()=>onPick(id)}>Estudar este curso</button>}
    <button className="btn ghost" style={{marginTop:10}} onClick={onClose}>Fechar</button></div></div>
}

function Sumario({S,id,onClose}:{S:any;id:string;onClose:()=>void}){
  const c=CURSOS.find(x=>x.id===id)!,on=id===(S.curso||'redes')
  const [open,setOpen]=useState<number|null>(null)
  const d=on?S.done||{}:S.cursos?.[id]?.done||{}
  const par:any[]=c.json.mundos?.[0]?.paradas||[]
  return <div id="modal" onClick={onClose}><div className="sheet tall sumario" ref={popIn} role="dialog" aria-label="Sumário do curso" onClick={e=>e.stopPropagation()}>
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
