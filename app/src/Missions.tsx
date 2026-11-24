import art from './legacy/art.json'
import { useState } from 'react'
import { patchSave } from './lib/save'
import { Case } from './Case'
import { sfx } from './lib/sound'
import { confetti, motion } from './Fx'
import { DuelCard } from './Duel'
import { Slide } from './Slide'
import { pendingDuel } from './lib/duel'
import { cursoAtivo } from './lib/progress'
import { dailyCase, weekOf, claimWeek, WGOAL } from './lib/cases'
import { dayOf, todays, GOAL, CHEST_GEMS, chestReady, claim, openChest } from './lib/progress'

const A:any=art
const Html=({h,cls}:{h:string;cls?:string})=><span className={cls} style={cls?undefined:{display:'contents'}} dangerouslySetInnerHTML={{__html:h}}/>

export function Missions({S,refresh}:{S:any;refresh:()=>void}){
  const d=dayOf(S),ms=todays(),xp=Math.min(d.xp,GOAL)
  const nd=ms.filter(m=>m.p(d)>=m.g).length,rdy=chestReady(d)
  const [call,setCall]=useState(false)
  const cur=cursoAtivo(S),def=dailyCase(cur.json),w=weekOf(S),wn=Math.min(w.n,WGOAL)
  const L7=['S','T','Q','Q','S','S','D'],td=(new Date().getDay()+6)%7
  const act=(fn:(s:any)=>void)=>{patchSave(fn);refresh()}
  return <div className="screen">
    <DuelCard S={S} refresh={refresh} startPending={!!pendingDuel()}/>
    <div className="sect" style={{marginTop:20}}>Missões</div>
    <p className="note" style={{margin:'0 0 14px'}}>Chamados e operações para resolver com o Pingo. As metas rápidas dão chips extras.</p>
    {def&&<div className="card call"><span className="ctag">Chamado do dia</span><h3 style={{marginBottom:6}}>{def.title}</h3>
      <p className="note" style={{margin:'0 0 14px'}}>{def.intro}</p>
      {d.call?<button className="btn" disabled>Chamado atendido hoje</button>:<Slide label="Arraste para atender · +20" onDone={()=>setCall(true)}/>}</div>}
    <div className="card"><h3>Operação da semana</h3>
      <p className="note" style={{margin:'0 0 12px'}}>Operação Escritório Conectado: atenda {WGOAL} chamados do dia em qualquer dia da semana. Cada chamado traz um problema de rede diferente para investigar.</p>
      <div className="wdays" aria-label="Dias com chamado atendido">{L7.map((l,i)=><span key={i} className={'wd'+(w.days.includes(i)?' on':'')+(i===td?' now':'')}><i>{w.days.includes(i)&&<Html h={A.IC.check}/>}</i>{l}</span>)}</div>
      <div className="bar gold" role="progressbar" aria-valuenow={wn} aria-valuemax={WGOAL}><i style={{width:wn/WGOAL*100+'%'}}/><span>{wn} / {WGOAL} chamados</span></div>
      {w.claimed?<p className="note" style={{margin:'12px 0 0'}}>Selo de Técnico da Semana conquistado.</p>
      :wn>=WGOAL&&<div style={{marginTop:14}}><Slide label="Arraste para pegar o selo · +60" onDone={()=>{sfx('win');confetti();act(claimWeek)}}/></div>}</div>
    <div className="card"><h3>Meta diária</h3>
      <div className="bar gold" role="progressbar" aria-valuenow={xp} aria-valuemax={GOAL}><i style={{width:xp/GOAL*100+'%'}}/><span>{xp} / {GOAL} energia</span></div></div>
    <div className="card"><h3>Metas rápidas</h3>
      {ms.map((m,i)=>{const pr=Math.min(m.p(d),m.g),dn=pr>=m.g
        return <div className="mrow" key={i}><div className="mtxt"><b>{m.t}</b><div className="bar sm"><i style={{width:pr/m.g*100+'%'}}/></div><small>{pr} / {m.g}</small></div>
          {d.claimed[i]?<span className="mpill got" aria-label="Resgatado"><Html h={A.IC.check}/></span>
          :dn?<button className="mbtn" onClick={()=>act(s=>claim(s,i))}>Resgatar +{m.gem}</button>
          :<span className="mpill">+{m.gem}<Html cls="gi" h={A.IC.gem}/></span>}</div>})}
    </div>
    <div className={'card chestcard'+(rdy?' ready':'')+(d.chest?' opened':'')}>
      <motion.span className="cc-svg" style={{display:'block'}} animate={rdy?{rotate:[0,-4,4,-3,3,0],y:[0,-4,0]}:{}} transition={{duration:1.1,repeat:Infinity,repeatDelay:1.4}} dangerouslySetInnerHTML={{__html:A.chest}}/>
      <div className="cc-t"><h3>Baú do Pingo</h3><p className="note">{d.chest?'Aberto hoje. Volte amanhã para outro!':rdy?'Você completou as 3 metas rápidas! Abra o baú.':`Complete as 3 metas rápidas para abrir o baú (${nd} de 3).`}</p>
        {rdy&&<button className="btn blue" onClick={()=>{sfx('open');confetti(60,50,60);act(openChest)}}>Abrir baú · +{CHEST_GEMS}</button>}</div>
    </div>
    {call&&def&&<Case S={S} def={def} kind="daily" onClose={()=>{setCall(false);refresh()}}/>}
  </div>
}
