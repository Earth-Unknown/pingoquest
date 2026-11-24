import { useState } from 'react'
import art from './legacy/art.json'
import { Lesson } from './Lesson'
import { Case } from './Case'
import { enter } from './Fx'
import { patchSave } from './lib/save'
import { evInfo, evList, evPool, evPick, evUse, evChamado, evSettle, fmtD, addDays, type EvRes } from './lib/events'
import type { Q } from './lib/curso'

const A:any=art
const Html=({h,cls}:{h:string;cls?:string})=><span className={cls} style={cls?undefined:{display:'contents'}} dangerouslySetInnerHTML={{__html:h}}/>
const evArt=(json:any,ev:any)=>json.artes?.[ev.equipment]||''
const thumb=(json:any,ev:any)=>'<svg viewBox="0 0 90 90" aria-hidden="true">'+evArt(json,ev)+'</svg>'
function puzzle(json:any,ev:any,pieces:number,fresh:number){
  let tiles=''
  for(let i=0;i<9;i++){
    const x=(i%3)*30,y=Math.floor(i/3)*30
    if(i>=pieces)tiles+=`<g class="tile"><rect x="${x}" y="${y}" width="30" height="30" fill="#1a8ac4" stroke="#fff" stroke-width="1.2"/><text x="${x+15}" y="${y+21}" text-anchor="middle" font-size="16" font-weight="900" fill="#fff" font-family="inherit">?</text></g>`
    else if(fresh&&i>=pieces-fresh)tiles+=`<rect class="nw" x="${x}" y="${y}" width="30" height="30" fill="none" stroke="#ffc43d" stroke-width="2"/>`
    else tiles+=`<rect x="${x}" y="${y}" width="30" height="30" fill="none" stroke="#fff" stroke-width=".6" opacity=".7"/>`
  }
  return `<svg class="evpz" viewBox="0 0 90 90" role="img" aria-label="${pieces} de 9 peças reveladas">${evArt(json,ev)}${tiles}</svg>`
}

/** Cartões dos eventos abertos, no topo da trilha */
export function EventBanners({S,json,onOpen}:{S:any;json:any;onOpen:(id:string)=>void}){
  return <>{evList(S,json).map(ev=>{
    const i=evInfo(S,ev);let line:string
    if(i.phase==='soon')line=i.toStart===1?'Começa amanhã':'Começa em '+i.toStart+' dias'
    else if(i.completed)line='Concluído · acessório conquistado'
    else if(i.late)line='Não dá mais para concluir. Espere o próximo.'
    else line=(i.left<=1?'Termina hoje':'Termina em '+i.left+' dias')+' · '+i.pieces+'/9 peças'
    return <button key={ev.id} className="evcard" onClick={()=>onOpen(ev.id)}>
      <Html cls="evart" h={thumb(json,ev)}/><span className="evtx"><small>{ev.tag}</small><b>{ev.name}</b><i>{line}</i>
      <span className="evbar"><u style={{width:Math.round(i.pieces/9*100)+'%'}}/></span></span><span className="evgo" aria-hidden="true">›</span></button>})}</>
}

export function EventPage({S,json,id,onClose,refresh}:{S:any;json:any;id:string;onClose:()=>void;refresh:()=>void}){
  const ev=(json.eventos||[]).find((e:any)=>e.id===id)
  const [qs,setQs]=useState<Q[]|null>(null)
  const [chamado,setChamado]=useState<any>(null)
  if(!ev)return null
  const i=evInfo(S,ev),isCh=!!ev.steps[0]?.chamado,pool=isCh?[]:evPool(S,json)
  const nextCh=i.next?.chamado?evChamado(S,json,i.next):null
  const lacking=i.canStart&&!isCh&&pool.length<ev.qPerStep
  const fs=Math.max(1,Math.ceil((ev.qPerStep-pool.length)/3))
  const closePlay=()=>{setQs(null);setChamado(null);refresh()}

  const startQuiz=()=>{
    let picked:Q[]|null=null
    patchSave(s=>{const p=evPick(s,json,ev);if(Array.isArray(p)){picked=p;evUse(s,ev,p)}})
    if(picked)setQs(picked);else refresh()
  }
  const startStep=()=>{
    if(!i.next)return
    if(i.next.chamado){
      const def=(json.casos||[]).find((c:any)=>c.id===i.next.chamado);if(def&&nextCh?.ok)setChamado({def,st:i.next})
    }else startQuiz()
  }
  const quizEnd=(correct:number,total:number):EvRes=>{
    const st=i.next;let r!:EvRes;const pass=correct>=ev.passMin
    patchSave(s=>{r=evSettle(s,ev,st,pass,pass?`Você acertou ${correct} de ${total}!`:`Você acertou ${correct} de ${total}. Precisa de ${ev.passMin}.`,correct)})
    return r
  }
  const caseEnd=(stars:number):EvRes=>{
    let r!:EvRes;patchSave(s=>{r=evSettle(s,ev,chamado.st,true,'Chamado resolvido!',stars)});return r
  }

  return <div id="evpage" ref={enter}><div className="evw">
    <div className="evtop"><button className="evback" onClick={()=>{onClose();refresh()}} aria-label="Voltar">‹</button><span className="evchip">{ev.tag}</span></div>
    <div className="evhero"><h1>{ev.name}</h1><p>{ev.blurb}</p>
      <span className="evtimer">{i.phase==='soon'?'Abre em '+fmtD(i.w.start):(i.left<=1?'Termina hoje':'Termina em '+i.left+' dias · '+fmtD(i.w.end))}</span></div>
    <div className="evbox"><div className="evpzrow"><Html h={puzzle(json,ev,i.pieces,i.fresh)}/>
      <div className="evpzt"><b>Projeto: {ev.equipName}</b><small>{i.pieces} de 9 peças coletadas</small><div className="evprog"><u style={{width:Math.round(i.pieces/9*100)+'%'}}/></div></div></div>
      <div className={'evprize'+(i.completed?' got':'')}>{i.completed
        ?<><Html h={A.IC.check}/> {ev.equipName} montado! {ev.prize.name} guardada no seu inventário.</>
        :<>Ao completar: <b>{ev.prize.name}</b>, um acessório para o seu robô.</>}</div></div>
    {lacking&&<><div className="evmsg" style={{marginTop:14}}><b>Falta pouco para começar!</b><br/>Conclua mais {fs} {fs===1?'fase':'fases'} na trilha. O evento só pergunta assuntos que você já estudou ({pool.length} de {ev.qPerStep} perguntas liberadas).</div>
      <button className="btn" onClick={()=>{onClose();refresh()}}>Ir para a trilha</button></>}
    <div className="evsteps">{ev.steps.map((st:any,k:number)=>{
      const d=i.P.steps[st.id],cls=d?'done':(i.next?.id===st.id&&i.canStart?'now':'');let stat=''
      if(d)stat='Concluída em '+fmtD(d.day)+(st.chamado?` · ${d.c} ${d.c===1?'estrela':'estrelas'}`:` · ${d.c} de ${ev.qPerStep} acertos`)
      else if(i.phase==='soon')stat='Abre em '+fmtD(i.w.start)
      else if(i.next?.id===st.id)stat=i.doneToday?'Volte em outro dia para esta etapa.':(i.late?'Não há mais dias suficientes.':'')
      else stat='Depois'
      return <div key={st.id} className={'evstep '+cls}><div className="num">{d?<Html h={A.IC.check}/>:k+1}</div>
        <div className="sx"><b>{st.title}</b><p>{st.desc}</p><div className="evrw"><span>+{st.pieces} peças</span><span>+{st.gems} chips</span></div>{stat&&<div className="evstat">{stat}</div>}</div></div>})}</div>
    {i.canStart?(nextCh&&!nextCh.ok
      ?<div className="evmsg"><b>Falta destravar o chamado</b><br/>Avance na trilha até a parada «{nextCh.nome}» para liberar esta etapa.</div>
      :(!i.next.chamado&&pool.length<ev.qPerStep)?null
      :<button className="btn" onClick={startStep}>{i.next.chamado?'Começar chamado ':'Começar etapa '}{i.done+1}</button>)
    :i.late?<div className="evmsg">Não dá mais tempo de concluir as {i.total} etapas, uma por dia. Espere o próximo evento para participar.</div>
    :i.doneToday&&!i.completed?<div className="evmsg">Etapa de hoje concluída! A próxima fica disponível em outro dia.</div>:null}
    <div className="evbox"><h3>Calendário</h3><div className="evcal">{(()=>{
      const dd:Record<string,number>={};Object.keys(i.P.steps).forEach(k=>{dd[i.P.steps[k].day]=1})
      const out=[];for(let d=i.w.start,n=0;d<=i.w.end&&n<40;d=addDays(d,1),n++)
        out.push(<span key={d} className={(dd[d]?'ok':'')+(d===i.t?' today':'')} title={fmtD(d)}>{dd[d]&&<Html h={A.IC.check}/>}{d.slice(8,10)}</span>)
      return out})()}</div></div>
    <div className="evbox"><h3>Como funciona</h3><ul className="evrules"><li>Uma etapa nova por dia. Os dias não precisam ser seguidos.</li>
      {isCh?<li>Cada etapa é um chamado no terminal, de um assunto que você já destravou na trilha. Resolva o chamado para ganhar as peças.</li>
      :<li>Cada etapa tem {ev.qPerStep} perguntas, só de assuntos que você já estudou. Acerte pelo menos {ev.passMin} para concluir. Se errar mais, você revê as explicações e tenta de novo no mesmo dia.</li>}
      <li>Peças e chips de cada etapa são entregues uma vez só.</li>
      <li>Se o evento acabar antes de você concluir, chips e itens já ganhos ficam com você, mas a coleção não pode ser retomada.</li>
      <li>O evento não libera conteúdo novo e não conta para o desafio de 5 acertos da trilha.</li></ul></div>
    {qs&&<Lesson key={'q'+i.done+qs.length+(qs[0]?.q||'')} S={S} qs={qs} kind="event" keyId={'ev:'+id+':'+i.next?.id} onClose={closePlay} onEvent={quizEnd}
      onRetry={()=>{setQs(null);setTimeout(startQuiz,0)}}/>}
    {chamado&&<Case S={S} def={chamado.def} kind="event" onEvent={caseEnd} onClose={closePlay}/>}
  </div></div>
}

/** Botão flutuante do evento, na trilha */
export function EventFab({S,json,onOpen}:{S:any;json:any;onOpen:(id:string)=>void}){
  const ev=evList(S,json)[0];if(!ev)return null
  const i=evInfo(S,ev),calm=i.completed||i.doneToday||i.late
  const dot=i.canStart?<span className="evdot">!</span>:(i.completed||i.doneToday)?<span className="evdot ok"><Html h={A.IC.check}/></span>:null
  const lab=i.phase==='soon'?'Em breve':(i.completed?'Concluído':(i.left<=1?'Último dia':i.left+' dias'))
  return <button id="evfab" className={calm?'calm':''} onClick={()=>onOpen(ev.id)} aria-label={'Evento '+ev.name+(i.canStart?', etapa disponível':'')}>
    <span className="eva"><svg className="ev-art" viewBox="0 0 90 90" aria-hidden="true" dangerouslySetInnerHTML={{__html:evArt(json,ev)}}/>{dot}</span><span className="evlab">{lab}</span></button>
}
