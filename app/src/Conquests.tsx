import art from './legacy/art.json'
import { Pingo } from './Pingo'
import { CONQ, cursoAtivo, gamesOf } from './lib/progress'

const A:any=art
const Html=({h,cls}:{h:string;cls?:string})=><span className={cls} style={cls?undefined:{display:'contents'}} dangerouslySetInnerHTML={{__html:h}}/>
const stroke=(inner:string)=>'<svg viewBox="0 0 100 100" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round" stroke-linejoin="round">'+inner+'</svg>'
const SKILL_NOME:Record<string,string>={wifi:'Wi-Fi',office:'Queda de internet',dns:'DNS e sites',lenta:'Lentidão',print:'Rede do escritório'}
const stars=(n:number)=>'★'.repeat(n)+'☆'.repeat(3-n)

/** S.conq já vem sincronizado pelo App (cqSync) */
export function Conquests({S}:{S:any}){
  const cur=cursoAtivo(S),games=gamesOf(cur.id),done=S.done||{},conq=S.conq||{}
  const got=CONQ.filter(c=>conq[c.id]).length
  const casos:any[]=cur.json.casos||[]
  return <div className="screen">
    <div className="ph"><Pingo S={S} mood="cheer"/><div><h1>Conquistas</h1><p>Seu caminho em {cur.nome}</p></div></div>
    <div className="sect">Conquistas <small style={{fontWeight:800,color:'var(--muted)',fontSize:14}}>{got} de {CONQ.length}</small></div>
    <div className="cqgrid">{CONQ.map(c=>{const on=!!conq[c.id]
      return <div key={c.id} className={'cqtile'+(on?' on':'')} role="img" aria-label={c.nome+(on?', conquistada':', bloqueada: '+c.meta)}>
        <span className="cqico" style={{background:`linear-gradient(135deg,${c.cor[0]},${c.cor[1]})`}} dangerouslySetInnerHTML={{__html:stroke(A.CQ_ART[c.art])}}/><b>{c.nome}</b><small>{c.meta}</small></div>})}</div>
    {casos.length>0&&<><div className="sect">Habilidades</div>
      <div className="skgrid">{casos.map(cs=>{const r=S.casos?.[cs.id],a=A.SKILL_ART[cs.id]||['#18b9e8','#7b3ff2','<path d="M24 30l18 20-18 20M50 72h28"/>'],ok=!!r?.n,nome=SKILL_NOME[cs.id]||cs.skill||cs.title
        return <div key={cs.id} className={'sktile'+(ok?'':' off')} role="img" aria-label={nome+(ok?', '+r.best+' de 3 estrelas':', ainda não conquistada')}>
          <span className="skico" style={{background:`linear-gradient(135deg,${a[0]},${a[1]})`}} dangerouslySetInnerHTML={{__html:stroke(a[2])}}/>
          <b>{nome}</b><small>{ok?stars(r.best||0)+' · '+r.n+'x':'Ainda não'}</small></div>})}</div>
      {(S.badges||[]).length>0&&<div className="prog"><div className="row"><span>Selos de Técnico da Semana</span><span>{S.badges.length}</span></div></div>}</>}
    <div className="sect">Progresso por etapa</div>
    <div className="pgrid">{games.map((g,gi)=>{
      const m=[0,1,2,3].filter(k=>done[gi+'-'+k]).length,col=A.DU_COL[gi%A.DU_COL.length],C=2*Math.PI*26,off=C*(1-m/4)
      return <div key={gi} className={'pst'+(m===4?' full':'')+(m===0?' zero':'')} style={{'--ti':col} as any}>
        <div className="pring"><svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="26" fill="none" stroke="color-mix(in srgb,var(--ti) 18%,transparent)" strokeWidth="6"/>
          <circle cx="32" cy="32" r="26" fill="none" stroke="var(--ti)" strokeWidth="6" strokeLinecap="round" strokeDasharray={C.toFixed(1)} strokeDashoffset={off.toFixed(1)} transform="rotate(-90 32 32)"/></svg>
          <Html cls="pico" h={A.DU[gi%A.DU.length]}/>{m===4&&<i className="pok" dangerouslySetInnerHTML={{__html:A.IC.check}}/>}</div>
        <b>{g.title}</b><small>{m}/4</small></div>})}</div>
  </div>
}
