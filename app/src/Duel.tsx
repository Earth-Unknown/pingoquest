import { useEffect, useRef, useState } from 'react'
import art from './legacy/art.json'
import { Pingo } from './Pingo'
import { sfx, buzz } from './lib/sound'
import { confetti, enter, motion } from './Fx'
import { patchSave } from './lib/save'
import { gamesOf, cursoAtivo } from './lib/progress'
import { DU_LV, DU_N, duelQs, duelScore, botRun, b64e, pendingDuel, type DQ } from './lib/duel'

const A:any=art
const Html=({h,cls}:{h:string;cls?:string})=><span className={cls} style={cls?undefined:{display:'contents'}} dangerouslySetInnerHTML={{__html:h}}/>
const WHEEL_MINI='<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10" fill="#ffd83d" stroke="#e59a00" stroke-width="1.6"/><path d="M12 2v20M2 12h20M5 5l14 14M19 5L5 19" stroke="#e59a00" stroke-width="1.2"/><circle cx="12" cy="12" r="2.4" fill="#fff" stroke="#e59a00" stroke-width="1.2"/></svg>'
const icon=(i:number)=>A.DU[i%A.DU.length],col=(i:number)=>A.DU_COL[i%A.DU_COL.length]

type Opp={name:string;r:number[];bot?:boolean}
type Game={g:number;s:number;lv:string;mode:'bot'|'amigo';qs:DQ[];opp:Opp|null}

/** Cartão do duelo (aba Missões) + o próprio duelo em tela cheia */
export function DuelCard({S,refresh,startPending}:{S:any;refresh:()=>void;startPending?:boolean}){
  const st=S.duel||{w:0,l:0,d:0}
  const [open,setOpen]=useState(!!startPending)
  return <div className="card duelc"><div className="duelh"><span className="duelic"><Html h={A.IC.bolt}/></span><div><h3 style={{margin:0}}>Duelo</h3><small>Desafie a máquina ou um amigo: quem acertar mais, ganha.</small></div></div>
    <button className="btn prim" style={{marginTop:10}} onClick={()=>setOpen(true)}>Jogar duelo</button>
    {(st.w+st.l+st.d)>0&&<p className="note" style={{margin:'8px 0 0'}}>Seu placar: {st.w} {st.w===1?'vitória':'vitórias'} · {st.d} {st.d===1?'empate':'empates'} · {st.l} {st.l===1?'derrota':'derrotas'}</p>}
    {open&&<Duel S={S} onClose={()=>{setOpen(false);refresh()}}/>}</div>
}

export function Duel({S,onClose}:{S:any;onClose:()=>void}){
  const games=gamesOf(cursoAtivo(S).id)
  const pend=useRef(pendingDuel()).current
  const [view,setView]=useState<'intro'|'setup'|'play'|'end'>(pend?'intro':'setup')
  const [mode,setMode]=useState<'bot'|'amigo'>('bot')
  const [theme,setTheme]=useState<number|'roleta'>('roleta')
  const [lv,setLv]=useState('ini')
  const [wheel,setWheel]=useState(false)
  const [G,setG]=useState<Game|null>(null)
  const [i,setI]=useState(0)
  const [me,setMe]=useState<number[]>([])
  const [sel,setSel]=useState<number|null>(null)
  const [msg,setMsg]=useState('')

  const begin=(g:number,seed:number,lvl:string,md:'bot'|'amigo',opp:Opp|null)=>{
    if(!games[g])return
    if(pend)history.replaceState(null,'',location.href.split('#')[0])
    const qs=duelQs(games[g],seed,DU_N)
    setG({g,s:seed,lv:lvl,mode:md,qs,opp:md==='bot'?{name:'Byte',r:botRun(seed,qs.length),bot:true}:opp})
    setI(0);setMe([]);setSel(null);setMsg('');setWheel(false);setView('play')
  }
  const start=()=>{if(theme==='roleta'){setWheel(true);return}begin(theme,(Math.random()*4294967295)>>>0,lv,mode,null)}
  const pick=(k:number)=>{if(sel!==null||!G)return;const ok=G.qs[i].opts[k].c;setSel(k);setMe([...me,ok?1:0]);sfx(ok?'ok':'bad');buzz(ok?12:30)}
  const next=()=>{if(!G)return;if(i+1>=G.qs.length){finish();return}setI(i+1);setSel(null)}
  const finish=()=>{
    if(G?.opp?.r){const a=duelScore(me),b=duelScore(G.opp.r),res=a>b?'w':(a<b?'l':'d');patchSave(s=>{s.duel=s.duel||{w:0,l:0,d:0};s.duel[res]++})}
    setView('end')
    if(G?.opp?.r&&duelScore(me)>duelScore(G.opp.r)){sfx('win');confetti()}else sfx('next')
  }
  const link=()=>G?location.href.split('#')[0]+'#duelo='+b64e({g:G.g,s:G.s,n:G.qs.length,l:G.lv,f:S.nick||'Um amigo',r:me}):''
  const share=()=>{
    const url=link()
    if(navigator.share){navigator.share({title:'Pingo Quest',text:'Te desafio num duelo no Pingo Quest!',url}).catch(()=>{});return}
    copy()
  }
  const copy=()=>{try{navigator.clipboard.writeText(link()).then(()=>setMsg('Link copiado! Cole no WhatsApp.'),()=>setMsg('Selecione e copie o link acima.'))}catch{setMsg('Selecione e copie o link acima.')}}
  const close=()=>{if(pend)history.replaceState(null,'',location.href.split('#')[0]);onClose()}
  const shell=(title:string,body:React.ReactNode,extra?:React.ReactNode)=><div id="lesson" ref={enter}><div className="duel"><div className="dutop"><button className="dux" onClick={close} aria-label="Fechar">×</button><b>{title}</b><span/></div><div className="dubody">{body}</div>{extra}</div></div>

  if(view==='intro'&&pend){const g=games[pend.g]
    if(!g)return shell('Desafio',<><p className="note">Esse desafio é de outro curso. Troque de curso no Perfil e abra o link de novo.</p><button className="btn ghost" onClick={close}>Fechar</button></>)
    return shell('Desafio',<><div className="dures"><Pingo S={S} mood="cheer"/><h1>{pend.f||'Um amigo'} te desafiou!</h1>
      <p className="note">Tema: <b>{g.title}</b> · {pend.n} perguntas · nível {pend.l==='ini'?'iniciante':pend.l}. Quem acertar mais, ganha.</p></div>
      <button className="btn prim" onClick={()=>begin(pend.g,pend.s,pend.l,'amigo',{name:pend.f||'Amigo',r:pend.r})}>Aceitar desafio</button>
      <button className="btn ghost" style={{marginTop:10}} onClick={close}>Agora não</button></>)}

  if(view==='setup')return shell('Novo duelo',<>
    <div className="dsec">Contra quem?</div><div className="dchips">
      <button className={'dchip'+(mode==='bot'?' on':'')} onClick={()=>setMode('bot')}><b>Máquina</b><small>Joga agora</small></button>
      <button className={'dchip'+(mode==='amigo'?' on':'')} onClick={()=>setMode('amigo')}><b>Amigo</b><small>Você joga e manda o link</small></button></div>
    <div className="dsec">Sobre o quê?</div>
    <button className={'dth rol'+(theme==='roleta'?' on':'')} onClick={()=>{setTheme('roleta');setWheel(true)}}><Html cls="dthi" h={WHEEL_MINI}/><span><b>Roleta do Pingo</b><small>O Pingo sorteia o tema</small></span></button>
    <div className="dthemes">{games.map((g,n)=><button key={n} className={'dth'+(theme===n?' on':'')} onClick={()=>setTheme(n)} style={{'--ti':col(n)} as any}><Html cls="dthi" h={icon(n)}/><b>{g.title}</b></button>)}</div>
    <div className="dsec">Nível</div><div className="dchips">{DU_LV.map(l=><button key={l[0]} className={'dchip'+(lv===l[0]?' on':'')+(l[2]?'':' lock')} disabled={!l[2]} onClick={()=>setLv(l[0])}><b>{l[1]}</b><small>{l[2]?'Disponível':'Em breve'}</small></button>)}</div>
    <button className="btn prim" style={{marginTop:18}} onClick={start}>{theme==='roleta'?'Abrir a roleta':'Começar duelo'}</button></>,
    wheel?<Wheel n={games.length} titles={games.map(g=>g.title)} onClose={()=>setWheel(false)} onPick={g=>begin(g,(Math.random()*4294967295)>>>0,lv,mode,null)}/>:null)

  if(!G)return null
  if(view==='play'){
    const q=G.qs[i],n=G.qs.length,ans=sel!==null,bot=!!G.opp?.bot
    const mine=duelScore(me),his=bot?duelScore(G.opp!.r,me.length):null
    return shell(G.mode==='bot'?'Duelo contra Byte':'Duelo',<>
      <div className="duhud"><div className="dus me"><small>Você</small><motion.b key={mine} initial={{scale:1.6}} animate={{scale:1}} transition={{type:'spring',stiffness:400,damping:14}} style={{display:'inline-block'}}>{mine}</motion.b></div><div className="dumid">Pergunta {i+1} de {n}</div>
        <div className="dus"><small>{bot?'Byte':(G.opp?.name||'Amigo')}</small><b>{bot?his:'?'}</b></div></div>
      <div className="dubar"><i style={{width:i/n*100+'%'}}/></div><h2 className="duq">{q.q}</h2>
      <div className="duopts">{q.opts.map((o,k)=><button key={k} disabled={ans} onClick={()=>pick(k)} className={'duopt'+(ans?(o.c?' ok':sel===k?' bad':' dim'):'')}>{o.t}</button>)}</div>
      {ans&&<><div className={'dufb '+(q.opts[sel!].c?'ok':'bad')}><b>{q.opts[sel!].c?'Acertou!':'Errou.'}</b> {q.e}</div>
        {bot&&<p className="note" style={{textAlign:'center'}}>Byte {G.opp!.r[i]?'acertou':'errou'} essa.</p>}
        <button className="btn prim" onClick={next}>{i+1>=n?'Ver resultado':'Próxima'}</button></>}</>)
  }
  // fim
  const a=duelScore(me),n=G.qs.length,o=G.opp
  const dots=(x:number[])=>x.map((v,k)=><i key={k} className={'dd '+(v?'ok':'bad')}/>)
  const rematch=()=>{setView('setup');setMode(G.mode);setTheme(G.g);setLv(G.lv)}
  if(o?.r){
    const b=duelScore(o.r),res=a>b?'w':(a<b?'l':'d')
    return shell('Resultado',<><div className="dures"><Pingo S={S} mood={res==='w'?'cheer':res==='l'?'sad':'happy'}/>
      <h1>{res==='w'?'Você venceu!':res==='l'?o.name+' venceu':'Empate!'}</h1>
      <div className="duvs"><div className="dus me"><small>Você</small><b>{a}</b></div><span>×</span><div className="dus"><small>{o.name}</small><b>{b}</b></div></div>
      <div className="dudots"><span>Você</span>{dots(me)}</div><div className="dudots"><span>{o.name}</span>{dots(o.r)}</div></div>
      <button className="btn prim" onClick={rematch}>Revanche</button>
      {o.bot?<button className="btn ghost" style={{marginTop:10}} onClick={share}>Desafiar um amigo com estas perguntas</button>
      :<button className="btn ghost" style={{marginTop:10}} onClick={()=>{setView('setup');setMode('bot')}}>Novo duelo</button>}
      <button className="btn ghost" style={{marginTop:10}} onClick={close}>Sair</button>{msg&&<div className="frmsg">{msg}</div>}</>)
  }
  return shell('Resultado',<><div className="dures"><Pingo S={S} mood="cheer"/><h1>Você acertou {a} de {n}</h1>
    <p className="note">Agora mande o link para seu amigo jogar as mesmas perguntas. Quando ele terminar, o app mostra quem venceu.</p><div className="dudots"><span>Você</span>{dots(me)}</div></div>
    <div className="frlink">{link()}</div><button className="btn prim" onClick={share}>Mandar desafio</button>
    <button className="btn ghost" style={{marginTop:10}} onClick={copy}>Copiar link</button>
    <button className="btn ghost" style={{marginTop:10}} onClick={close}>Sair</button>{msg&&<div className="frmsg">{msg}</div>}</>)
}

function Wheel({n,titles,onClose,onPick}:{n:number;titles:string[];onClose:()=>void;onPick:(g:number)=>void}){
  const gRef=useRef<SVGGElement>(null),busy=useRef(false),alive=useRef(true),last=useRef(-1)
  const [res,setRes]=useState<number|null>(null),[spun,setSpun]=useState(false)
  useEffect(()=>{alive.current=true;return()=>{alive.current=false}},[])
  const seg=360/n,R=140,C=150
  const spin=()=>{
    if(busy.current)return;busy.current=true;setSpun(true)
    const fin=Math.floor(Math.random()*n),jit=(Math.random()-0.5)*seg*0.6
    const total=360*5+(360-(fin*seg+seg/2+jit)),dur=5200;let t0:number|null=null
    const frame=(ts:number)=>{
      if(!alive.current)return
      if(t0===null)t0=ts
      const x=Math.min(1,(ts-t0)/dur),th=total*(1-Math.pow(1-x,4))
      gRef.current?.setAttribute('transform','rotate('+th.toFixed(2)+' 150 150)')
      const idx=Math.floor((((360-(th%360))%360))/seg);if(idx!==last.current){last.current=idx;sfx('tick');buzz(6)}
      if(x<1)requestAnimationFrame(frame)
      else{setRes(fin);sfx('win');confetti();setTimeout(()=>{if(alive.current)onPick(fin)},1800)}
    }
    requestAnimationFrame(frame)
  }
  return <div className="rolbk"><div className="rolbox" role="dialog" aria-label="Roleta do Pingo">
    <button className="dux rolx" onClick={()=>{if(!busy.current)onClose()}} aria-label="Fechar">×</button><h2>Roleta do Pingo</h2>
    <div className={'rolwrap'+(spun?' spun':'')} onClick={spin} role="button" aria-label="Girar a roleta" tabIndex={0} onKeyDown={e=>{if(e.key==='Enter')spin()}}><div className="rolptr"/>
      <svg viewBox="0 0 300 300" className="rolsvg" aria-hidden="true"><g ref={gRef}>{Array.from({length:n},(_,k)=>{
        const a0=(k*seg-90)*Math.PI/180,a1=((k+1)*seg-90)*Math.PI/180
        const x0=C+R*Math.cos(a0),y0=C+R*Math.sin(a0),x1=C+R*Math.cos(a1),y1=C+R*Math.sin(a1)
        return <g key={k}><path d={`M${C} ${C}L${x0.toFixed(1)} ${y0.toFixed(1)}A${R} ${R} 0 0 1 ${x1.toFixed(1)} ${y1.toFixed(1)}Z`} fill={col(k)} stroke="#fff" strokeWidth="3"/>
          <g transform={`rotate(${(k+0.5)*seg} ${C} ${C})`} style={{color:'#fff'}} dangerouslySetInnerHTML={{__html:icon(k).replace('<svg',`<svg x="${C-15}" y="${C-R+14}" width="30" height="30"`)}}/></g>})}</g>
        <g className="rolhub"><circle cx="150" cy="150" r="22" fill="#fff" stroke="#ffd83d" strokeWidth="6"/><circle cx="150" cy="150" r="7" fill="#7b3ff2"/></g></svg></div>
    <div className={'rolres'+(res!==null?' pop':'')}>{res!==null?<><Html cls="dthi" h={icon(res)}/><b>{titles[res]}</b></>:' '}</div></div></div>
}
