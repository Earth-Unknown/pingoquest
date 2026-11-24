import { useState } from 'react'
import { Pingo } from './Pingo'
import { Lesson } from './Lesson'
import { missKeys, qIndex } from './lib/progress'

export function Review({S,refresh}:{S:any;refresh:()=>void}){
  const [play,setPlay]=useState(false)
  const keys=missKeys(S),n=keys.length
  const start=()=>{if(n)setPlay(true)}
  return <div className="screen">
    <div className="ph"><Pingo S={S}/><div><h1>Revisar erros</h1>
      <p>{n?n+(n===1?' pergunta para revisar':' perguntas para revisar'):'Nada para revisar por enquanto'}</p></div></div>
    {!n?<p className="note">Quando você errar uma pergunta, ela aparece aqui para você treinar de novo. Ao acertar na revisão, ela sai da lista.</p>
    :<>
      <button className="btn prim" style={{margin:'14px 0 6px'}} onClick={start}>Revisar agora (+8 energia)</button>
      <p className="note" style={{margin:'4px 0 0'}}>Na revisão você não perde vidas.</p>
      <div className="sect" style={{marginTop:20}}>Mais erradas</div>
      {keys.slice(0,6).map(k=><div className="prog" key={k}><div className="row"><span>{k}</span><span>{S.miss[k]}x</span></div></div>)}
    </>}
    {play&&<Lesson S={S} qs={(()=>{const ix=qIndex(S.curso||'redes');return keys.slice(0,6).map(k=>ix[k])})()} kind="review" keyId="r"
      onClose={()=>{setPlay(false);refresh()}}/>}
  </div>
}
