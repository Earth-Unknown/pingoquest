import { useEffect, useRef, useState } from 'react'
import art from './legacy/art.json'
import { Pingo } from './Pingo'
import type { EvRes } from './lib/events'
import { sfx } from './lib/sound'
import { enter, popIn, StarsAnim } from './Fx'
import { pickFault, finishCase, countInspect, spend, hasLupa } from './lib/cases'
import { shuffle } from './lib/curso'
import { today } from './lib/progress'
import { TM, setTM, tmInit, tmRun, tmCheck, tmTok, tmAbs, tmBase, tmDir, tmPrompt, tmCur } from './lib/term'

const A:any=art
const Html=({h,cls}:{h:string;cls?:string})=><span className={cls} style={cls?undefined:{display:'contents'}} dangerouslySetInnerHTML={{__html:h}}/>
const Stars=({n}:{n:number})=><span className="stars" role="img" aria-label={n+' de 3 estrelas'}>{[0,1,2].map(i=><span key={i} className={i<n?'on':''}>★</span>)}</span>

export type CaseProps={def:any;kind:'node'|'daily'|'event';onEvent?:(stars:number)=>EvRes;keyId?:string;S:any;replay?:boolean;onClose:()=>void}
export function Case(p:CaseProps){
  return p.def.tipo==='terminal'?<Terminal {...p}/>:<Investigate {...p}/>
}

type Res={ev?:EvRes;stars:number;xp:number;gems:number;what:string;fix:string;why:string;proof:{n:string;t:string}[];n:number}
const cardCss=`.cr-cards{display:flex;gap:10px;overflow-x:auto;scroll-snap-type:x mandatory;width:100%;padding:2px 8% 6px;box-sizing:border-box;scroll-padding:0 8%;touch-action:pan-x pan-y;scrollbar-width:none}.cr-cards::-webkit-scrollbar{display:none}
.cr-card{flex:0 0 84%;scroll-snap-align:center;border-radius:16px;padding:10px 14px;text-align:left;font-size:15px;line-height:1.4;box-sizing:border-box;background:var(--locked,#f1ecff)}
.cr-card b{color:var(--primary)}.cr-pingo svg{width:clamp(64px,11vh,92px)!important;display:block}
.cr-pill{display:inline-flex;align-items:center;gap:4px;border-radius:99px;padding:3px 10px 3px 7px;font-weight:900;font-size:14px;background:var(--surface,#fff);box-shadow:0 1px 4px rgba(26,16,72,.18)}.cr-pill svg{width:16px;height:16px;display:block}`
/** Resultado do caso/chamado: o que você descobriu, as pistas que provam e a recompensa discreta (sem cartões nem moedas voando) */
function Result({S,p,res,again,term}:{S:any;p:CaseProps;res:Res;again?:()=>void;term?:boolean}){
  const cards:{k:string;t:string;x:string}[]=[
    ...(res.fix?[{k:'fix',t:term?'Como foi':'Como resolver',x:res.fix}]:[]),
    ...(res.why?[{k:'why',t:'Por quê',x:res.why}]:[]),
    ...res.proof.map((x,i)=>({k:'p'+i,t:'Pista · '+x.n,x:x.t}))]
  return <div id="lesson" ref={enter}><style>{cardCss}</style><div className="lw"><div className="lbody lscroll"><div className="center" style={{gap:10}}>
    <div className="cr-pingo"><Pingo S={S} mood="cheer"/></div>
    <h1 style={{margin:0,fontSize:26}}>{res.ev?res.ev.title:term?'Chamado resolvido!':'Caso resolvido!'}</h1>
    <StarsAnim n={res.stars}/>
    <div className="cfound"><small>{term?'O que você fez':'Causa encontrada'}</small><b>{res.what}</b></div>
    {cards.length>0&&<><div className="cr-cards" tabIndex={0} aria-label="Entenda o caso: deslize para ver tudo">{cards.map(c=><div className="cr-card" key={c.k}><b>{c.t}: </b>{c.x}</div>)}</div>
      {cards.length>1&&<small style={{color:'var(--muted)',fontWeight:700,marginTop:-4}}>Deslize para o lado para entender o caso →</small>}</>}
    <div style={{display:'flex',flexWrap:'wrap',justifyContent:'center',gap:8}} aria-label="Você ganhou">
      <span className="cr-pill" style={{color:'#ffb800'}}><Html h={A.IC.bolt}/>{res.xp}</span>
      {res.gems>0&&<span className="cr-pill" style={{color:'#ff4fae'}}><Html h={A.IC.gem}/>{res.gems}</span>}
      {res.ev?.got&&<span className="cr-pill" style={{color:'#3fbf5f'}}><Html h={A.IC.puzzle}/>+{res.ev.got.pieces}</span>}
    </div>
  </div></div><div className="lfoot"><div className="stack" style={{margin:0}}>
    {again&&<button className="btn ghost" onClick={again}>Jogar outro cenário</button>}
    <button className="btn" onClick={p.onClose}>Continuar</button></div></div></div></div>
}

/* ---------- casos de investigação (Redes) ---------- */
function Investigate(p:CaseProps){
  const {def,S}=p
  const [round,setRound]=useState(0)
  const [replay,setReplay]=useState(!!p.replay)
  const avoid=useRef<string|undefined>(undefined)
  const first=!(S.casos?.[def.id]?.n>0)&&!replay
  const [fault,setFault]=useState(()=>pickFault(def,p.kind==='daily'?today():undefined))
  const opts=useRef(shuffle<any>(def.faults.map((f:any)=>({id:f.id,t:f.cause}))))
  const [insp,setInsp]=useState<string[]>([])
  const [wrongSet,setWrongSet]=useState<string[]>([])
  const [stage,setStage]=useState<'inv'|'guess'|'done'>('inv')
  const [last,setLast]=useState<string|null>(null)
  const [lupa,setLupa]=useState(false)
  const [msg,setMsg]=useState(def.intro+(first?' Toque nos aparelhos para investigar.':''))
  const [res,setRes]=useState<Res|null>(null)
  const wrong=wrongSet.length
  const dev=(id:string)=>def.devices.find((v:any)=>v.id===id)
  const nextNeed=()=>fault.need.find((id:string)=>!insp.includes(id))||null
  const hintId=(first||wrong>=2||lupa)?nextNeed():null
  const canLupa=!first&&!lupa&&!!nextNeed()&&hasLupa()
  const look=(id:string)=>{
    if(stage!=='inv')return
    if(!insp.includes(id)){setInsp([...insp,id]);countInspect()}
    setLast(id);sfx('ping');setMsg('Anotei a pista no caderno. O que mais vale conferir?')
  }
  const pick=(id:string)=>{
    if(stage!=='guess'||wrongSet.includes(id))return
    if(id===fault.id){
      const ev=p.kind==='event'?p.onEvent!(Math.max(1,3-wrong)):undefined
      const r=ev?{stars:Math.max(1,3-wrong),xp:ev.xp,gems:ev.got?.gems||0}:finishCase({kind:p.kind as 'node'|'daily',key:p.keyId,replay,wrong,id:def.id,insp:insp.length})
      setRes({ev,...r,what:fault.cause,fix:fault.fix,why:fault.why,n:insp.length,proof:fault.need.map((n:string)=>({n:dev(n).name,t:fault.clues[n]}))})
      setStage('done');sfx('ok');return
    }
    sfx('bad')
    setWrongSet([...wrongSet,id])
    const nd=nextNeed()
    setMsg('Hmm, não parece ser essa a causa.'+(nd?' Que tal verificar o '+dev(nd).name+' antes?':' Releia as pistas com calma.'))
  }
  const again=()=>{
    avoid.current=fault.id
    setReplay(true);setFault(pickFault(def,undefined,fault.id));setInsp([]);setWrongSet([]);setStage('inv');setLast(null);setLupa(false);setRes(null)
    opts.current=shuffle<any>(def.faults.map((f:any)=>({id:f.id,t:f.cause})));setMsg(def.intro);setRound(r=>r+1)
  }
  if(stage==='done'&&res)return <Result key={round} S={S} p={p} res={res} again={p.kind==='node'?again:undefined}/>
  return <div id="lesson" ref={enter}><div className="lw"><div className="lhead"><button className="xbtn" onClick={p.onClose} aria-label="Sair do caso">✕</button>
    <div className="ctitle"><small>{p.kind==='daily'?'Chamado do dia':'Caso'}</small><b>{def.title}</b></div><Stars n={Math.max(1,3-wrong)}/></div>
    <div className="lbody">
      <div className="say"><span className="sp"><Pingo S={S} cls="pingo-s"/></span><div className="bub"><p>{msg}</p></div></div>
      {stage==='inv'?<>
        <div className="tlabel">Aparelhos</div>
        <div className="devs">{def.devices.map((v:any)=>{const seen=insp.includes(v.id)
          return <button key={v.id} className={'dev'+(seen?' seen':'')+(hintId===v.id?' hint':'')} onClick={()=>look(v.id)}>
            <Html h={A.DV[v.ic]||''}/><b>{v.name}</b><small>{seen?'Verificado':'Toque para verificar'}</small></button>})}</div>
        {canLupa&&<button className="btn ghost lupabtn" onClick={()=>{setLupa(true);const nd=nextNeed();if(nd)setMsg('Olhe primeiro o '+dev(nd).name+'. A Lupa do Pingo achou uma pista!')}}><Html h={A.IC.search}/>Usar a Lupa do Pingo</button>}
      </>:<>
        <div className="tlabel">Qual é a causa?</div>
        <div className="opts">{opts.current.map((o:any)=>{const w=wrongSet.includes(o.id)
          return <button key={o.id} className={'opt'+(w?' wrong':'')} disabled={w} onClick={()=>pick(o.id)}>{o.t}</button>})}</div>
      </>}
      {insp.length>0&&<><div className="tlabel" style={{marginTop:22}}>Caderno de pistas</div>
        <div className="notes">{insp.slice().reverse().map(id=><div key={id} className={'note2'+(id===last?' new':'')}><b>{dev(id).name}</b><p>{fault.clues[id]||'Parece normal.'}</p></div>)}</div></>}
    </div>
    <div className="lfoot">{stage==='inv'
      ?<button className="btn prim" disabled={!insp.length} onClick={()=>{setStage('guess');setMsg('Qual você acha que é a causa?')}}>{insp.length?'Tenho uma hipótese':'Verifique um aparelho primeiro'}</button>
      :<button className="btn ghost" onClick={()=>setStage('inv')}>Voltar a investigar</button>}</div></div></div>
}

/* ---------- chamados de terminal (Linux) ---------- */
function Guia({def,first,onClose,S}:{def:any;first:boolean;onClose:()=>void;S:any}){
  return <div id="modal" onClick={onClose}><div className="sheet tall" ref={popIn} role="dialog" aria-label="Guia do chamado" onClick={e=>e.stopPropagation()}>
    <div className="cqhead"><Pingo S={S} cls="cqping"/><div className="cqbub">{first?'Antes de começar, veja os comandos deste chamado!':'Guia rápido dos comandos'}</div></div>
    <p className="gintro">{def.intro||''}</p>
    <div className="gsteps"><span><i>1</i>Leia o passo</span><span><i>2</i>Digite o comando</span><span><i>3</i>Toque em Enviar</span></div>
    <div className="tlabel">Comandos deste chamado</div>
    <div className="gtiles">{(def.guia||[]).map((g:any,i:number)=><div className={'gt g'+(i%4)} key={i}><code>{g.cmd}</code><span>{g.serve}</span></div>)}</div>
    <p className="note" style={{margin:'10px 0 0'}}>Dicas custam chips; a 1ª dica de cada chamado é grátis.</p>
    <button className="btn prim" style={{marginTop:14}} onClick={onClose}>{first?'Entendi, vamos lá!':'Fechar'}</button></div></div>
}

function Terminal(p:CaseProps){
  const {def,S}=p
  const guided=!(S.casos?.[def.id]?.n>0)&&!p.replay
  const [,force]=useState(0),rf=()=>force(x=>x+1)
  const [ready,setReady]=useState(false)
  const [guia,setGuia]=useState<null|boolean>(guided?true:null)
  const [res,setRes]=useState<Res|null>(null)
  const [line,setLine]=useState('')
  const st=useRef({wrong:0,fim:false,guided})
  const outRef=useRef<HTMLDivElement>(null),inRef=useRef<HTMLInputElement>(null)
  useEffect(()=>{const t=tmInit(def);setTM(t);setReady(true);rf();return()=>setTM(null)},[def])
  useEffect(()=>{if(outRef.current)outRef.current.scrollTop=outRef.current.scrollHeight})
  if(!ready||!TM)return null
  const T=TM
  const cost=(i:number)=>{const l=T.hl[i]||0,r=T.def.passos[i].resposta;if(l<1)return st.current.guided?0:5;if(l<2&&r)return 15;return -1}
  const submit=()=>{
    if(st.current.fim)return
    const ln=line.trim();setLine('')
    T.out.push({k:'p',t:tmPrompt()+ln})
    if(!ln){rf();return}
    T.hist.push(ln);T.hi=T.hist.length
    const r=tmRun(ln)
    let lost:string|null=null
    if(r.err&&/inexistente/.test(r.err)){tmTok(ln).forEach((x:any)=>{if(lost||typeof x!=='string'||x.charAt(0)==='-')return;const ab=tmAbs(x);if(T.fs[ab])return;const bn=tmBase(ab);Object.keys(T.fs).forEach(k=>{if(!lost&&tmBase(k)===bn&&k!==ab&&k.indexOf('/'+bn)>0)lost=k})})}
    if(r.err){
      sfx('bad');T.out.push({k:'e',t:r.err});T.erros++;if(T.erros%4===0&&st.current.wrong<2)st.current.wrong++
      const lk:any=lost
      T.msg=lk?(lk.indexOf(T.cwd+'/')===0?'Não achei aqui. Ele está em «'+lk.slice(T.cwd.length+1)+'».':'Não achei aqui. Ele está em '+tmDir(lk).replace(T.home,'~')+'. Vá até lá com cd.')
        :(T.erros>=2?'Calma, errar faz parte. Digite help para ver os comandos ou toque em Dica.':'Esse comando não funcionou. Confira como ele se escreve.')
    }else{sfx('ping');T.ran.push(ln);if(r.out)T.out.push({k:'o',t:r.out})}
    let all=true,prog=false
    const ci=tmCur()
    ;(T.def.passos||[]).forEach((s:any,i:number)=>{
      if(!T.done[i]){let ch=s.feito;if(!Array.isArray(ch))ch=[ch];if(ch.every(tmCheck)){T.done[i]=1;prog=true;T.msg=s.ok||'Boa! Passo concluído.';sfx('plim1')}}
      if(!T.done[i])all=false})
    if(!r.err&&!prog&&!all&&ci>=0)T.msg='Funcionou, mas ainda não cumpre o passo. Releia o passo e confira os nomes.'
    if(all){
      st.current.fim=true;T.msg=T.def.final||'Chamado resolvido!'
      setTimeout(()=>{
        const stars=Math.max(1,3-st.current.wrong)
        const ev=p.kind==='event'?p.onEvent!(stars):undefined
        const e=ev?{stars,xp:ev.xp,gems:ev.got?.gems||0}:finishCase({kind:p.kind as 'node'|'daily',key:p.keyId,replay:p.replay,wrong:st.current.wrong,id:def.id,insp:T.ran.length})
        sfx('ok')
        setRes({ev,...e,what:def.conclusao||def.title,fix:def.explicacao||'',why:def.porque||'',n:T.ran.length,proof:[]})
      },1100)
    }
    rf()
  }
  const hint=()=>{
    const i=tmCur();if(i<0)return;const c=cost(i);if(c<0)return
    if(c&&!spend(c)){T.msg='Você precisa de '+c+' chips para esta dica. Ganhe mais resolvendo lições!';rf();return}
    T.hl[i]=(T.hl[i]||0)+1;T.msg=T.hl[i]===1?'Dica no passo!':'Comando no passo. Toque em Usar.';rf()
  }
  const key=(k:string)=>{setLine(l=>l+k);inRef.current?.focus()}
  const hist=(d:number)=>{if(!T.hist.length)return;T.hi=Math.max(0,Math.min(T.hist.length,T.hi+d));setLine(T.hist[T.hi]||'')}
  if(res)return <Result S={S} p={p} res={res} term/>
  const i=tmCur(),steps=def.passos||[],c=i<0?-1:cost(i)
  const pre=T.cwd==='/'?'/':T.cwd+'/',items:{n:string;d:boolean}[]=[]
  Object.keys(T.fs).forEach(k=>{if(k!==T.cwd&&k.indexOf(pre)===0&&k.slice(pre.length).indexOf('/')<0){const b=k.slice(pre.length);if(b.charAt(0)!=='.')items.push({n:b,d:T.fs[k].d})}})
  items.sort((a,b)=>(+b.d-+a.d)||(a.n<b.n?-1:1))
  const path=T.cwd===T.home?'~ (sua pasta)':T.cwd
  const go=(cmd:string)=>{T.out.push({k:'p',t:tmPrompt()+cmd});T.hist.push(cmd);T.hi=T.hist.length;setLine(cmd);setTimeout(()=>inRef.current?.focus(),0)}
  return <div id="lesson" ref={enter}><div className="lw"><div className="lhead"><button className="xbtn" onClick={p.onClose} aria-label="Sair do chamado">✕</button>
    <div className="ctitle"><small>{p.kind==='daily'?'Chamado do dia':'Chamado'}</small><b>{def.title}</b></div><Stars n={Math.max(1,3-st.current.wrong)}/></div>
    <div className="lbody tmz">
      <div className="tdots">{steps.map((_:any,n:number)=><i key={n} className={T.done[n]?'ok':(n===i?'now':'')}/>)}</div>
      <div className="say"><span className="sp"><Pingo S={S} cls="pingo-s"/></span><div className="bub"><p>{T.msg}</p></div></div>
      {i<0?<div className="tcur ok"><b>Todos os passos concluídos!</b></div>
      :<div className="tcur"><div className="trowt"><i className="tn">{i+1}/{steps.length}</i><b>{steps[i].texto}</b></div>
        {(T.hl[i]||0)>=1&&<div className="thint"><Html h={A.IC.search}/>{steps[i].dica||'Tente o comando help.'}</div>}
        {(T.hl[i]||0)>=2&&<div className="thint cmd"><code>{steps[i].resposta}</code><button onClick={()=>{setLine(steps[i].resposta);inRef.current?.focus()}}>Usar</button></div>}</div>}
      <div className="tfl"><small><Html h={A.IC.map}/>Você está em <b>{path}</b></small><div>
        {T.cwd!==T.home&&<button className="tfi back" onClick={()=>go('cd ~')}>↩ voltar ~</button>}
        {items.length?items.map(f=><button key={f.n} className={'tfi'+(f.d?' d':'')} onClick={()=>{setLine(l=>(l?l+' ':'')+f.n);inRef.current?.focus()}}>{f.d?'📁 ':''}{f.n}</button>):<span className="note">Pasta vazia</span>}</div></div>
      <div className="term"><div className="tmx" ref={outRef}>{T.out.map((l:any,n:number)=><div key={n} className={'tml '+l.k}>{l.t}</div>)}</div>
        <label className="tprompt"><span>{tmPrompt()}</span>
          <input ref={inRef} type="text" value={line} disabled={st.current.fim} autoComplete="off" autoCapitalize="off" autoCorrect="off" spellCheck={false} enterKeyHint="send"
            onChange={e=>setLine(e.target.value)}
            onKeyDown={e=>{if(e.key==='Enter'){e.preventDefault();submit()}else if(e.key==='ArrowUp'){e.preventDefault();hist(-1)}else if(e.key==='ArrowDown'){e.preventDefault();hist(1)}}}/></label>
        <div className="tkeys">{['|','>','>>','~','/','-','..'].map(k=><button key={k} onClick={()=>key(k)}>{k}</button>)}
          <button onClick={()=>hist(-1)} aria-label="Comando anterior">↑</button></div></div>
    </div>
    <div className="lfoot"><div className="trow"><button className="btn ghost" onClick={()=>setGuia(false)}>Guia</button>
      {c<0?<button className="btn ghost" disabled>Sem dicas</button>
      :<button className="btn ghost" onClick={hint}>Dica{c?<> · <Html h={A.IC.gem}/>{c}</>:' grátis'}</button>}
      <button className="btn prim" onClick={submit}>Enviar</button></div></div></div>
    {guia!==null&&<Guia def={def} first={guia} S={S} onClose={()=>{setGuia(null);inRef.current?.focus()}}/>}
  </div>
}
