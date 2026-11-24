import { useEffect, useRef, useState } from 'react'
import art from './legacy/art.json'
import { Pingo } from './Pingo'
import { pickFault, finishCase, countInspect, spend, hasLupa } from './lib/cases'
import { shuffle } from './lib/curso'
import { today } from './lib/progress'
import { TM, setTM, tmInit, tmRun, tmCheck, tmTok, tmAbs, tmBase, tmDir, tmPrompt, tmCur } from './lib/term'

const A:any=art
const Html=({h,cls}:{h:string;cls?:string})=><span className={cls} style={cls?undefined:{display:'contents'}} dangerouslySetInnerHTML={{__html:h}}/>
const Stars=({n}:{n:number})=><span className="stars" role="img" aria-label={n+' de 3 estrelas'}>{[0,1,2].map(i=><span key={i} className={i<n?'on':''}>★</span>)}</span>

export type CaseProps={def:any;kind:'node'|'daily';keyId?:string;S:any;replay?:boolean;onClose:()=>void}
export function Case(p:CaseProps){
  return p.def.tipo==='terminal'?<Terminal {...p}/>:<Investigate {...p}/>
}

type Res={stars:number;xp:number;gems:number;what:string;fix:string;why:string;proof:{n:string;t:string}[];n:number}
function Result({S,p,res,again,term}:{S:any;p:CaseProps;res:Res;again?:()=>void;term?:boolean}){
  const [exp,setExp]=useState(false)
  return <div id="lesson"><div className="lw"><div className="lbody lscroll"><div className="center">
    <Pingo S={S} mood="cheer"/><h1>{term?'Chamado resolvido!':'Caso resolvido!'}</h1>
    <span className="stars anim" role="img" aria-label={res.stars+' de 3 estrelas'}>{[0,1,2].map(i=><span key={i} className={i<res.stars?'on':''} style={{animationDelay:(0.45+i*0.4)+'s'}}>★</span>)}</span>
    <div className="cfound"><small>{term?'O que você fez':'Causa encontrada'}</small><b>{res.what}</b></div>
    <div className="res2">
      <div className="rt" style={{'--rc':'#ffb800'} as any}><small>Energia</small><span><Html h={A.IC.bolt}/><b>{res.xp}</b></span></div>
      <div className="rt" style={{'--rc':'#18b9e8'} as any}><small>Chips</small><span><Html h={A.IC.gem}/><b>+{res.gems}</b></span></div>
      <div className="rt" style={{'--rc':'#3fbf5f'} as any}><small>{term?'Comandos':'Pistas'}</small><span><Html h={A.IC.search}/><b>{res.n}</b></span></div></div>
    <button className="btn ghost cexp" onClick={()=>setExp(true)}>Ver explicação</button>
  </div></div><div className="lfoot"><div className="stack" style={{margin:0}}>
    {again&&<button className="btn ghost" onClick={again}>Jogar outro cenário</button>}
    <button className="btn" onClick={p.onClose}>Continuar</button></div></div></div>
    {exp&&<div id="modal" onClick={()=>setExp(false)}><div className="sheet tall" role="dialog" aria-label="Explicação do caso" onClick={e=>e.stopPropagation()}>
      <h2 style={{margin:'0 0 8px'}}>Entenda o caso</h2>
      <p style={{margin:'0 0 8px'}}><b>{term?'Resumo':'Causa'}:</b> {res.what}.</p>
      {res.fix&&<p style={{margin:'0 0 8px'}}>{res.fix}</p>}{res.why&&<p className="note" style={{margin:'0 0 12px'}}>{res.why}</p>}
      {res.proof.length>0&&<div className="proof"><small>As pistas que provam isso</small>{res.proof.map((x,i)=><div key={i}><b>{x.n}:</b> {x.t}</div>)}</div>}
      <button className="btn prim" style={{marginTop:16}} onClick={()=>setExp(false)}>Fechar</button></div></div>}
  </div>
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
    setLast(id);setMsg('Anotei a pista no caderno. O que mais vale conferir?')
  }
  const pick=(id:string)=>{
    if(stage!=='guess'||wrongSet.includes(id))return
    if(id===fault.id){
      const r=finishCase({kind:p.kind,key:p.keyId,replay,wrong,id:def.id,insp:insp.length})
      setRes({...r,what:fault.cause,fix:fault.fix,why:fault.why,n:insp.length,proof:fault.need.map((n:string)=>({n:dev(n).name,t:fault.clues[n]}))})
      setStage('done');return
    }
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
  return <div id="lesson"><div className="lw"><div className="lhead"><button className="xbtn" onClick={p.onClose} aria-label="Sair do caso">✕</button>
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
  return <div id="modal" onClick={onClose}><div className="sheet tall" role="dialog" aria-label="Guia do chamado" onClick={e=>e.stopPropagation()}>
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
      T.out.push({k:'e',t:r.err});T.erros++;if(T.erros%4===0&&st.current.wrong<2)st.current.wrong++
      const lk:any=lost
      T.msg=lk?(lk.indexOf(T.cwd+'/')===0?'Não achei aqui. Ele está em «'+lk.slice(T.cwd.length+1)+'».':'Não achei aqui. Ele está em '+tmDir(lk).replace(T.home,'~')+'. Vá até lá com cd.')
        :(T.erros>=2?'Calma, errar faz parte. Digite help para ver os comandos ou toque em Dica.':'Esse comando não funcionou. Confira como ele se escreve.')
    }else{T.ran.push(ln);if(r.out)T.out.push({k:'o',t:r.out})}
    let all=true,prog=false
    const ci=tmCur()
    ;(T.def.passos||[]).forEach((s:any,i:number)=>{
      if(!T.done[i]){let ch=s.feito;if(!Array.isArray(ch))ch=[ch];if(ch.every(tmCheck)){T.done[i]=1;prog=true;T.msg=s.ok||'Boa! Passo concluído.'}}
      if(!T.done[i])all=false})
    if(!r.err&&!prog&&!all&&ci>=0)T.msg='Funcionou, mas ainda não cumpre o passo. Releia o passo e confira os nomes.'
    if(all){
      st.current.fim=true;T.msg=T.def.final||'Chamado resolvido!'
      setTimeout(()=>{
        const e=finishCase({kind:p.kind,key:p.keyId,replay:p.replay,wrong:st.current.wrong,id:def.id,insp:T.ran.length})
        setRes({...e,what:def.conclusao||def.title,fix:def.explicacao||'',why:def.porque||'',n:T.ran.length,proof:[]})
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
  return <div id="lesson"><div className="lw"><div className="lhead"><button className="xbtn" onClick={p.onClose} aria-label="Sair do chamado">✕</button>
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
