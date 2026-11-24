import art from './legacy/art.json'
import { patchSave } from './lib/save'
import { dayOf, todays, GOAL, CHEST_GEMS, chestReady, claim, openChest } from './lib/progress'

const A:any=art
const Html=({h,cls}:{h:string;cls?:string})=><span className={cls} style={cls?undefined:{display:'contents'}} dangerouslySetInnerHTML={{__html:h}}/>

export function Missions({S,refresh}:{S:any;refresh:()=>void}){
  const d=dayOf(S),ms=todays(),xp=Math.min(d.xp,GOAL)
  const nd=ms.filter(m=>m.p(d)>=m.g).length,rdy=chestReady(d)
  const act=(fn:(s:any)=>void)=>{patchSave(fn);refresh()}
  return <div className="screen">
    <div className="sect">Missões</div>
    <p className="note" style={{margin:'0 0 14px'}}>Metas do dia para resolver com o Pingo. As metas rápidas dão chips extras.</p>
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
      <Html cls="cc-svg" h={A.chest}/>
      <div className="cc-t"><h3>Baú do Pingo</h3><p className="note">{d.chest?'Aberto hoje. Volte amanhã para outro!':rdy?'Você completou as 3 metas rápidas! Abra o baú.':`Complete as 3 metas rápidas para abrir o baú (${nd} de 3).`}</p>
        {rdy&&<button className="btn blue" onClick={()=>act(openChest)}>Abrir baú · +{CHEST_GEMS}</button>}</div>
    </div>
    <div className="card"><h3>Chamado do dia e Operação da semana</h3>
      <p className="note" style={{margin:0}}>Os chamados, a operação semanal e o duelo ainda rodam só no jogo completo.</p></div>
  </div>
}
