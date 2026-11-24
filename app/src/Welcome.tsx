import { useState } from 'react'
import art from './legacy/art.json'
import { Pingo } from './Pingo'
import { sfx } from './lib/sound'
import { confetti } from './Fx'
import { CURSOS, done, totalFases } from './lib/cursos'
import { patchSave } from './lib/save'
import { streakNow, trocarCurso, cursoAtivo } from './lib/progress'
import { shuffle } from './lib/curso'

const A:any=art
const Html=({h,cls}:{h:string;cls?:string})=><span className={cls} style={cls?undefined:{display:'contents'}} dangerouslySetInnerHTML={{__html:h}}/>
const INTRO:Record<string,string>={
  redes:'Aqui você aprende Redes de Computadores resolvendo casos de verdade, do zero ao avançado, um passo de cada vez.',
  linux:'Aqui você aprende o terminal do Linux: primeiro conversando com o Pingo, depois digitando comandos de verdade nos chamados.'}
const NIV_DEF=[
  {q:'O que o roteador faz?',o:['Liga a sua rede à internet','Guarda os seus arquivos','Imprime documentos'],e:'O roteador é a porta da sua rede para a internet.'},
  {q:'Para que serve o DNS?',o:['Traduz o nome do site em número IP','Aumenta a velocidade do Wi-Fi','Protege o celular de vírus'],e:'O DNS traduz nomes de sites em endereços IP.'},
  {q:'Em qual camada do modelo OSI trabalham os endereços IP?',o:['Rede','Física','Aplicação'],e:'Os endereços IP vivem na camada de Rede, a terceira do modelo OSI.'}]
const courseIcon=(id:string)=>id==='linux'?A.IC_TERM:'<svg viewBox="0 0 40 40" aria-hidden="true"><rect x="5" y="21" width="30" height="13" rx="6" fill="#7b3ff2"/><circle cx="12" cy="27.5" r="2" fill="#fff"/><circle cx="19" cy="27.5" r="2" fill="#fff"/><path d="M13 21 10 9M27 21l3-12" stroke="#7b3ff2" stroke-width="3" stroke-linecap="round"/></svg>'

type Step='picker'|'welcome'|'ask'|'result'|'plan'
/** Primeira abertura: escolher curso, boas-vindas, nivelamento e plano de estudo. Mostrado ao abrir o app. */
export function Welcome({S,onClose,refresh}:{S:any;onClose:()=>void;refresh:()=>void}){
  const cur=cursoAtivo(S)
  const [step,setStep]=useState<Step>(!S.picked&&!S.onb?'picker':'welcome')
  const niv:{q:string;o:string[];e:string}[]=cur.json.nivelamento?.length
    ?cur.json.nivelamento.map((n:any)=>({q:n.pergunta,o:[n.certa,...(n.erradas||[])],e:n.explicacao||''})):NIV_DEF
  const [qi,setQi]=useState(0),[score,setScore]=useState(0),[sel,setSel]=useState<number|null>(null)
  const [opts,setOpts]=useState<{t:string;c:boolean;skip?:boolean}[]>([])
  const [plan,setPlan]=useState(0)
  const need=!S.onbC?.[cur.id],first=!S.onb,st=streakNow(S)
  const ask=(i:number)=>{setQi(i);setSel(null);setOpts([...shuffle(niv[i].o.map((t,k)=>({t,c:k===0}))),{t:'Ainda não sei',c:false,skip:true}]);setStep('ask')}
  const finish=(p:number)=>{
    patchSave(s=>{s.onbC=s.onbC||{};s.onbC[cur.id]=true;if(!s.onb)s.gems=(s.gems??50)+20;s.onb=true;s.plan=p||s.plan})
    sfx('win');confetti();onClose();refresh();window.scrollTo(0,0)
  }
  const card=(cls:string,body:React.ReactNode)=><div id="welcome"><div className={'wcard '+cls} role="dialog" aria-modal="true">{body}</div></div>

  if(step==='picker')return card('cpick',<><Pingo S={S} mood="wave" cls="pingo-w"/><h2>O que você quer aprender?</h2>
    <p>Escolha um curso. Você pode trocar quando quiser, no Perfil.</p>
    <div className="cplist">{CURSOS.map(c=>{const par=c.json.mundos?.[0]?.paradas||[]
      return <button key={c.id} className="cpc" onClick={()=>{patchSave(s=>{s.picked=true;trocarCurso(s,c.id)});refresh();setStep('welcome')}}>
        <Html cls="cqic big" h={courseIcon(c.id)}/><span className="cpt"><b>{c.nome}</b><small>{c.sub}</small><em>{par.length} paradas · {(c.json.casos||[]).length} chamados</em></span></button>})}</div></>)

  if(step==='welcome'){
    const title=need?(first?'Oi! Eu sou o Pingo':'Novo curso: '+cur.nome):'Que bom te ver de novo!'
    const text=need?(first?'Bem-vindo ao Pingo Quest! ':'')+(INTRO[cur.id]||''):`Você concluiu ${done(S,cur.id).length} de ${totalFases(cur.json)} fases em ${cur.nome}${st>0?` e está com ${st} ${st===1?'dia':'dias'} de brilho`:''}. Bora continuar?`
    return card('',<><Pingo S={S} mood="wave" cls="pingo-w"/><h2>{title}</h2><p>{text}</p>
      <div className="wpills"><span className="wpill"><Html h={A.IC.search}/>{cur.id==='linux'?'Chamados no terminal':'Resolva casos'}</span>
        <span className="wpill"><span style={{color:'#ff8a1f',display:'contents'}}><Html h={A.IC.brilho}/></span>Brilho diário</span>
        <span className="wpill"><span style={{color:'var(--bad)',display:'contents'}}><Html h={A.IC.heart}/></span>5 vidas</span></div>
      <button className="btn" autoFocus onClick={()=>need?ask(0):onClose()}>{need?'Vamos começar':'Continuar'}</button>
      {!need&&<button className="btn ghost" style={{marginTop:8}} onClick={()=>setStep('picker')}>Escolher outro curso</button>}</>)
  }
  if(step==='ask'){
    const n=niv[qi],ans=sel!==null
    return card('nopop',<><div className="wstep">Nivelamento · {qi+1} de {niv.length}</div><Pingo S={S} cls="pingo-w"/>
      <div className="wq">{n.q}</div>
      <div className="wopts">{opts.map((o,k)=><button key={k} disabled={ans} className={'opt'+(ans?(o.c?' right':sel===k?' wrong':''):'')}
        onClick={()=>{setSel(k);if(o.c)setScore(x=>x+1)}}>{o.t}</button>)}</div>
      {ans?<><div className={'wfb '+(opts[sel!].c?'ok':'no')}>{opts[sel!].c?'Boa! ':opts[sel!].skip?'Sem problema. ':'Quase. '}{n.e}</div><div style={{height:12}}/>
        <button className="btn" onClick={()=>qi+1<niv.length?ask(qi+1):setStep('result')}>Continuar</button></>
      :<p style={{fontSize:14,marginTop:10}}>Sem vidas e sem pressão. É só para eu saber de onde começar.</p>}</>)
  }
  if(step==='result'){
    const msg=score>=3?'Uau, você já manja! Como ainda não temos o nível intermediário, vamos começar do início: dá para passar rápido e revisar.'
      :score===2?'Você já sabe bastante! A trilha inicial vai ser tranquila e dá para revisar rapidinho.'
      :score===1?'Você já ouviu falar de algumas coisas. Vamos começar pelo início: eu explico cada termo antes de perguntar.'
      :'Sem problema nenhum! Vamos do zero, um passo de cada vez. Eu explico cada termo antes de perguntar.'
    return card('nopop',<><div className="wstep">Seu ponto de partida</div><Pingo S={S} mood="cheer" cls="pingo-w"/>
      <h2>{score} de {niv.length} certas</h2><p>{msg}</p><div style={{height:18}}/>
      <button className="btn" onClick={()=>{patchSave(s=>{s.level=score>=2?'alguma':'zero'});if(S.plan)finish(0);else setStep('plan')}}>Começar do início</button></>)
  }
  return card('nopop',<><div className="wstep">Seu plano de estudo</div><Pingo S={S} cls="pingo-w"/><h2>Quantos dias por semana?</h2>
    <p>Dias de descanso não quebram nada. Você escolhe o ritmo que cabe na sua vida.</p>
    <div className="planrow">{([[3,'Leve','3 dias por semana, no seu ritmo'],[5,'Constante','5 dias por semana'],[7,'Intenso','Todos os dias da semana']] as [number,string,string][]).map(x=>
      <button key={x[0]} className={'plan'+(plan===x[0]?' on':'')} onClick={()=>setPlan(x[0])}><b>{x[0]}</b><span>{x[1]}<small>{x[2]}</small></span></button>)}</div>
    <button className="btn" disabled={!plan} onClick={()=>finish(plan)}>Vou me dedicar · +20 chips</button></>)
}
