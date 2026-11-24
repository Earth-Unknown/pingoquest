import art from './legacy/art.json'
import { Pingo } from './Pingo'
import { patchSave } from './lib/save'
import { streakNow, today, ds } from './lib/progress'

const A:any=art
const Html=({h,cls}:{h:string;cls?:string})=><span className={cls} style={cls?undefined:{display:'contents'}} dangerouslySetInnerHTML={{__html:h}}/>
const MESES=['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro']
const L7=['S','T','Q','Q','S','S','D']

/** Tela do brilho: dias seguidos, semana, calendário do mês, Lupa do Pingo e plano de estudo */
export function Streak({S,onClose,refresh}:{S:any;onClose:()=>void;refresh:()=>void}){
  const st=streakNow(S),plan=S.plan||5,hist=S.hist||{},td=today()
  const d0=new Date();d0.setDate(d0.getDate()-(d0.getDay()+6)%7)
  const wd=Array.from({length:7},(_,i)=>{const d=new Date(d0);d.setDate(d0.getDate()+i);return ds(d)})
  const cnt=wd.filter(x=>hist[x]).length,gp=Math.min(cnt,plan),gap=plan>=7?0:(plan>=5?1:2)
  const now=new Date(),y=now.getFullYear(),m=now.getMonth(),off=(new Date(y,m,1).getDay()+6)%7,nd=new Date(y,m+1,0).getDate()
  return <div id="modal" onClick={onClose}><div className="sheet tall" role="dialog" aria-label="Meu brilho" onClick={e=>e.stopPropagation()}>
    <div className="stk"><span className="stkp"><Pingo S={S} mood={st>0?'cheer':'happy'} cls="pingo-s"/></span>
      <div><div className="big"><span style={{color:'#ff8a1f',display:'contents'}}><Html h={A.IC.brilho}/></span>{st}</div>
        <small>{st===1?'dia seguido':'dias seguidos'}{S.best>st?' · recorde '+S.best:''}</small></div></div>
    <div className="wdays" style={{marginTop:14}}>{wd.map((x,i)=><span key={x} className={'wd'+(hist[x]?' on':'')+(x===td?' now':'')}><i>{hist[x]&&<Html h={A.IC.check}/>}</i>{L7[i]}</span>)}</div>
    <div className="prog"><div className="row"><span>Meta da semana</span><span>{gp} de {plan} dias</span></div><div className="bar gold"><i style={{width:gp/plan*100+'%'}}/></div></div>
    <p className="note" style={{margin:'10px 0 0'}}>{gap===0?'No plano de 7 dias, todo dia conta.':`Seu plano permite até ${gap} ${gap===1?'dia':'dias'} de folga seguido${gap===1?'':'s'} sem perder o brilho.`}</p>
    <div className="sect" style={{marginTop:18}}>{MESES[m]} de {y}</div>
    <div className="cal">{L7.map((x,i)=><b key={'h'+i} className="ch">{x}</b>)}{Array.from({length:off},(_,i)=><span key={'o'+i}/>)}
      {Array.from({length:nd},(_,i)=>{const d=i+1,k=y+'-'+String(m+1).padStart(2,'0')+'-'+String(d).padStart(2,'0')
        return <span key={d} className={'cd'+(hist[k]?' on':'')+(k===td?' now':'')}>{d}</span>})}</div>
    <div className={'lupa'+(S.lupa?' on':'')}><span className="li"><Html h={A.IC.search}/></span><div>
      <b>{S.lupa?'Lupa do Pingo desbloqueada':'Lupa do Pingo'}</b>
      <small>{S.lupa?'Nos casos, ela aponta qual aparelho verificar primeiro.':`Chegue a 7 dias seguidos para desbloquear. Faltam ${Math.max(0,7-st)}.`}</small></div></div>
    <div className="sect" style={{marginTop:18}}>Meu plano</div>
    <div className="plans">{[3,5,7].map(n=><button key={n} className={'pl'+(plan===n?' on':'')} onClick={()=>{patchSave(s=>{s.plan=n});refresh()}}><b>{n}</b><small>dias por semana</small></button>)}</div>
    <button className="btn prim" style={{marginTop:18}} onClick={onClose}>Fechar</button></div></div>
}
