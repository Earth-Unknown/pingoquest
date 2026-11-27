import { useEffect, useRef, useState } from 'react'
import art from './legacy/art.json'
import { popIn } from './Fx'
import { Pingo } from './Pingo'
import { CURSOS, pct, done, totalFases } from './lib/cursos'
import { patchSave } from './lib/save'
import { FriendsCard, FriendsSheet } from './Friends'
import { inviteFromHash } from './lib/friends'
import { soundOn, setSound, sfx } from './lib/sound'
import { KEY, load } from './lib/store'
import { avCfg } from './lib/pingo'
import { SLOTS, has, equip, icon } from './lib/avatar'
import { streakNow, trocarCurso, gamesOf } from './lib/progress'
import { useAuth } from './lib/use-auth'
import { SaveProgressCard } from './SaveProgress'
import { logOut } from './lib/auth'
import { toast } from './Fx'
import { ModoDono } from './ModoDono'
import { liberadas, totais } from './lib/curiosidades'
import { Invencao } from './conclusao/Invencao'
import { ESTACAO_PINGO } from './conclusao/contrato'
import { matiz } from './conclusao/FimParada'

const A:any=art
const Html=({h,cls}:{h:string;cls?:string})=><span className={cls} style={cls?undefined:{display:'contents'}} dangerouslySetInnerHTML={{__html:h}}/>
const courseIcon=(id:string)=>id==='linux'?A.IC_TERM:'<svg viewBox="0 0 40 40" aria-hidden="true"><rect x="5" y="21" width="30" height="13" rx="6" fill="#7b3ff2"/><circle cx="12" cy="27.5" r="2" fill="#fff"/><circle cx="19" cy="27.5" r="2" fill="#fff"/><path d="M13 21 10 9M27 21l3-12" stroke="#7b3ff2" stroke-width="3" stroke-linecap="round"/></svg>'
const themeNow=()=>{try{return localStorage.getItem('pingoquest-theme')==='dark'?'dark':'light'}catch{return 'light'}}

export function Profile({S,refresh,invite}:{S:any;refresh:()=>void;invite?:string|null}){
  const ativo=S.curso||'redes'
  const cur=CURSOS.find(c=>c.id===ativo)||CURSOS[0]
  const [sum,setSum]=useState<string|null>(null)
  const [info,setInfo]=useState<string|null>(null)
  const [friends,setFriends]=useState(!!invite)
  const [roboAberto,setRoboAberto]=useState(false)
  const [aba,setAba]=useState<'roupa'|'oficina'>('roupa')
  const [cap,setCap]=useState('Toque num item para vestir. Itens com cadeado mostram como ganhar.')
  const [sure,setSure]=useState(false)
  const {status,isAnonymous}=useAuth()
  const [leaving,setLeaving]=useState(false)
  const cancelRef=useRef<HTMLButtonElement>(null)
  useEffect(()=>{if(leaving)cancelRef.current?.focus()},[leaving])
  const [snd,setSnd]=useState(soundOn())
  const [taps,setTaps]=useState(0)
  const [pedeCodigo,setPedeCodigo]=useState(false)
  const [theme,setTheme]=useState(themeNow())
  const total=S.total||0,acc=total?Math.round((S.ok||0)/total*100):0
  const provas=gamesOf(ativo).filter(g=>!g.caso).length
  const stats:[string,string|number][]=[
    ['energia',S.xp||0],['dias',streakNow(S)],['chips',S.gems??0],
    ['fases',done(S,cur.id).length+'/'+totalFases(cur.json)],['provas',(S.bosses||0)+'/'+provas],['acertos',acc+'%']]
  const Sx=roboAberto?load():S // dentro do pop-up o robô muda na hora, sem fechar
  const cfgx=avCfg(Sx),[,setTick]=useState(0)
  const fecharRobo=()=>{setRoboAberto(false);refresh()}
  const act=(fn:(s:any)=>void)=>{patchSave(fn);refresh()}
  const toggleTheme=()=>{const t=theme==='dark'?'light':'dark';try{localStorage.setItem('pingoquest-theme',t)}catch{};document.documentElement.setAttribute('data-theme',t);setTheme(t)}
  const reset=()=>{if(!sure){setSure(true);return};try{localStorage.removeItem(KEY)}catch{};setSure(false);refresh()}
  const leave=async()=>{
    if(isAnonymous&&!leaving){setLeaving(true);return}
    setLeaving(false)
    try{await logOut()}catch(e){console.error('sign out failed',e);toast('Não consegui sair agora. Tente de novo.')}
  }
  let nOwn=0,nAll=0;SLOTS.forEach(sl=>sl.itens.forEach(it=>{nAll++;if(has(Sx,sl.id,it))nOwn++}))
  return <div className="screen">
    <div className="ph"><button type="button" className="robotap" onClick={()=>setRoboAberto(true)} aria-label="Personalizar o Pingo: roupinhas, adereços e Oficina" style={{background:'none',border:0,padding:0,cursor:'pointer',position:'relative',display:'block',flex:'none'}}><Pingo S={S}/>
      <span style={{position:'absolute',left:'50%',bottom:-6,transform:'translateX(-50%)',background:'var(--primary)',color:'#fff',fontSize:11,fontWeight:900,borderRadius:99,padding:'3px 9px',whiteSpace:'nowrap',boxShadow:'0 2px 0 rgba(0,0,0,.18)'}}>Personalizar o Pingo</span></button><div><h1 onClick={()=>{const n=taps+1;setTaps(n);if(n>=7){setPedeCodigo(true);setTaps(0)}}}>{S.nick||'Meu perfil'}</h1><p>{cur.nome}</p>
      <button className="nickbtn" onClick={()=>setFriends(true)}>{S.nick?'Editar apelido':'Escolher apelido'}</button></div></div>
    <SaveProgressCard S={S}/>
    <div className="mini">{stats.map(([k,v])=><div key={k}><b>{v}</b><span>{k}</span></div>)}</div>
    <div className="sect">Cursos</div>
    <div className="cscroll">{CURSOS.map(c=>{const on=c.id===ativo,p=pct(S,c)
      return <button key={c.id} className={'ccard'+(on?' on':'')} onClick={()=>setInfo(c.id)}>
        <Html cls="cqic" h={courseIcon(c.id)}/><b>{c.nome}</b><small>{on?'Estudando':p+'%'}</small>
        <span className="cqbar"><i style={{width:p+'%'}}/></span></button>})}</div>
    <button className="btn ghost sumbtn" onClick={()=>setSum(ativo)}><Html h={A.IC.map}/>Sumário: o que tem em {cur.nome}</button>

    <FriendsCard S={S} onOpen={()=>setFriends(true)}/>

    <Album S={S}/>

    <ModoDono S={S} aberto={pedeCodigo} onFechar={()=>setPedeCodigo(false)}/>

    <div className="sect">Ajustes</div>
    <button className="btn ghost" style={{marginBottom:10}} onClick={toggleTheme}>Tema: {theme==='dark'?'escuro (roxo)':'claro'}</button>
    <button className="btn ghost" style={{marginBottom:10}} onClick={()=>{const v=!snd;setSound(v);setSnd(v);if(v)sfx('ok')}}>Sons do Pingo: {snd?'ligados':'desligados'}</button>
    <button className="btn ghost" onClick={reset}>{sure?'Toque de novo para confirmar':'Zerar progresso'}</button>
    {status==='in'&&!(leaving&&isAnonymous)&&<button className="btn ghost" style={{marginTop:10}} onClick={leave}>{isAnonymous?'Sair do convidado':'Sair da conta'}</button>}
    {leaving&&isAnonymous&&<div role="alert" style={{marginTop:10}}><p className="note" style={{margin:'0 0 10px'}}>Sair desliga a sua conta de convidado. O progresso continua guardado neste aparelho, mas, sem salvar com o Google, você não consegue recuperá-lo em outro aparelho.</p>
      <button className="btn ghost" ref={cancelRef} style={{marginBottom:10}} onClick={()=>setLeaving(false)}>Cancelar</button>
      <button className="btn ghost" onClick={leave}>Sair mesmo assim</button></div>}
    <p className="note" style={{marginTop:12}}>O progresso fica salvo neste navegador. Algo não funcionou direito? O <a href="jogo-antigo/" style={{color:'var(--primary-deep)',fontWeight:800}}>jogo antigo</a> continua disponível e usa o mesmo progresso.</p>

    {roboAberto&&<div id="modal" onClick={fecharRobo}><div className="sheet tall" ref={popIn} role="dialog" aria-label="Meu robô" onClick={e=>e.stopPropagation()}>
      <div style={{display:'flex',gap:8,marginBottom:10}} role="tablist">
        <button type="button" role="tab" aria-selected={aba==='roupa'} className={'btn '+(aba==='roupa'?'prim':'ghost')} style={{flex:1}} onClick={()=>setAba('roupa')}>Roupinhas</button>
        <button type="button" role="tab" aria-selected={aba==='oficina'} className={'btn '+(aba==='oficina'?'prim':'ghost')} style={{flex:1}} onClick={()=>setAba('oficina')}>Oficina</button></div>
      {aba==='roupa'?<>
    <div className="avbox"><Pingo S={Sx} cls="avbig"/></div>
    <p className="note" style={{margin:'0 0 6px',textAlign:'center'}}>Itens são só visuais: não mudam as perguntas nem dão vantagem.</p>
    {SLOTS.map(sl=><div className="avrow" key={sl.id}><b>{sl.nome}</b><div className="avgrid">{sl.itens.map(it=>{
      const own=has(Sx,sl.id,it),on=cfgx[sl.id]===it.id
      return own
        ?<button key={it.id} className={'avchip avt'+(on?' on':'')} aria-pressed={on} aria-label={it.nome} title={it.nome} onClick={()=>{patchSave(s=>equip(s,sl.id,it.id));setTick(t=>t+1);setCap(it.nome)}}><Html h={icon(sl.id,it)}/></button>
        :<button key={it.id} className="avchip avt lock" aria-label={it.nome+' (bloqueado)'} onClick={()=>setCap(it.nome+' · '+(it.req||''))}><Html h={icon(sl.id,it)}/><i className="avlk" dangerouslySetInnerHTML={{__html:A.IC.lock}}/></button>})}</div></div>)}
    <div className="avcap" aria-live="polite">{cap}</div>
    <p className="note" style={{margin:'8px 0 0'}}>Inventário: {nOwn} de {nAll} itens.</p>
      </>:<Oficina S={Sx}/>}
      <button className="btn prim" style={{marginTop:16}} onClick={fecharRobo}>Pronto</button></div></div>}
    {sum&&<Sumario S={S} id={sum} onClose={()=>setSum(null)}/>}
    {info&&<CursoInfo S={S} id={info} onClose={()=>setInfo(null)} onPick={id=>{act(s=>trocarCurso(s,id));setInfo(null);window.scrollTo(0,0)}} onSum={id=>{setInfo(null);setSum(id)}}/>}
    {friends&&<FriendsSheet inviteCode={invite||inviteFromHash()} onClose={()=>{setFriends(false);refresh()}}/>}
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

/** Prateleira de invenções: uma Estação Pingo por parada concluída (cada uma com sua cor) */
function Oficina({S}:{S:any}){
  const guard:string[]=S.ofi||[]
  const itens=guard.flatMap(k=>{const [cid,g]=k.split(':'),c=CURSOS.find(x=>x.id===cid),pa=c?.json.mundos?.[0]?.paradas?.[+g]
    return pa?[{k,idx:+g,lugar:pa.lugar as string,curso:c!.nome}]:[]})
  const total=CURSOS.reduce((n,c)=>n+(c.json.mundos?.[0]?.paradas?.length||0),0)
  return <>
    <div className="sect">Oficina do Pingo</div>
    {itens.length===0
      ?<p className="note" style={{margin:0}}>Feche uma parada com a prova final e a Estação Pingo dessa parada fica guardada aqui.</p>
      :<div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:10}}>{itens.map(i=><div key={i.k} style={{background:'var(--locked,#f1ecff)',borderRadius:16,padding:'10px 8px',textAlign:'center'}}>
        <div style={{width:'80%',margin:'0 auto',filter:`hue-rotate(${matiz(i.idx)}deg)`}}><Invencao invencao={ESTACAO_PINGO} acesos={ESTACAO_PINGO.modulos.length}/></div>
        <b style={{fontSize:14}}>{i.lugar}</b><br/><small style={{color:'var(--muted)',fontWeight:700}}>{i.curso}</small></div>)}</div>}
    <p className="note" style={{margin:'8px 0 0'}}>Invenções guardadas: {itens.length} de {total}.</p>
  </>
}

/** Tudo que o Pingo já contou fica guardado aqui, para reler quando quiser */
function Album({S}:{S:any}){
  const id=S.curso||'redes',lib=liberadas(S,id),vistas=lib.filter(c=>!c.novo),total=totais(id)
  if(!total)return null
  const grupos=vistas.reduce((m:Record<string,typeof vistas>,c)=>{(m[c.lugar]=m[c.lugar]||[]).push(c);return m},{})
  return <>
    <div className="sect">Álbum de curiosidades</div>
    <p className="note" style={{margin:'0 0 8px'}}>Curiosidades guardadas: {vistas.length} de {total}. Toque no Pingo para ouvir mais.</p>
    {vistas.length===0
      ?<p className="note" style={{margin:0}}>Toque no Pingo, em qualquer tela, e ele conta uma curiosidade da sua parada.</p>
      :Object.entries(grupos).map(([lugar,cs])=><div key={lugar} style={{background:'var(--locked,#f1ecff)',borderRadius:16,padding:'10px 14px',marginBottom:8}}>
        <b style={{fontSize:14,color:'var(--primary)'}}>{lugar}</b>
        {cs.map(c=><p key={c.key} style={{margin:'6px 0 0',fontSize:15,lineHeight:1.4}}>{c.texto}</p>)}</div>)}
  </>
}
