import { useEffect, useState } from 'react'
import { load } from './lib/store'
import { patchSave } from './lib/save'
import { streakNow, attention, missKeys, cqSync, gamesOf } from './lib/progress'
import { sync as avSync } from './lib/avatar'
import { pendingDuel } from './lib/duel'
import { Welcome } from './Welcome'
import { Streak } from './Streak'
import { Profile } from './Profile'
import { Trail } from './Trail'
import { Missions } from './Missions'
import { Review } from './Review'
import { Conquests } from './Conquests'
import art from './legacy/art.json'
import './legacy/jogo.css'

const A:any=art
type Tab='path'|'missions'|'review'|'conq'|'profile'
const TABS:[Tab,string][]=[['path','Trilha'],['missions','Missões'],['review','Revisar'],['conq','Conquistas'],['profile','Perfil']]
const Svg=({h}:{h:string})=><span style={{display:'contents'}} dangerouslySetInnerHTML={{__html:h}}/>

export default function App(){
  const [v,setV]=useState(0)
  const [tab,setTab]=useState<Tab>(()=>pendingDuel()?'missions':'path')
  const [evOpen,setEvOpen]=useState<string|null>(null) // fica aqui para sobreviver ao refresh da tela
  const [welcome,setWelcome]=useState(()=>!pendingDuel())
  const [streak,setStreak]=useState(false)
  const refresh=()=>setV(x=>x+1)
  let S=load()
  if(S.onb&&!S.onbC?._m)S=patchSave(s=>{s.onbC=s.onbC||{};s.onbC[s.curso||'redes']=true;s.onbC._m=1})
  const provas=gamesOf(S.curso||'redes').filter(g=>!g.caso).length
  const probe=JSON.parse(JSON.stringify(S))
  const a=cqSync(probe),b=avSync(probe,provas)
  if(a||b)S=patchSave(s=>{cqSync(s);avSync(s,provas)}) // grava conquistas e itens novos
  useEffect(()=>{let t='light';try{t=localStorage.getItem('pingoquest-theme')==='dark'?'dark':'light'}catch{}
    document.documentElement.setAttribute('data-theme',t)},[])
  const dots:Partial<Record<Tab,number>>={missions:attention(S),review:missKeys(S).length}
  return <>
    <div id="top"><div className="wrap" id="topin">
      <button className="stat s-streak" onClick={()=>setStreak(true)} title="Ver meu brilho" aria-label="Ver meu brilho"><Svg h={A.IC.brilho}/><span>{streakNow(S)}</span></button>
      <div className="stat s-gems"><Svg h={A.IC.gem}/><span>{S.gems??50}</span></div>
      <div className="stat s-heart"><Svg h={A.IC.heart}/><span>{S.hearts??5}</span></div>
    </div></div>
    <main className="wrap" id="main" key={v}>
      {tab==='path'&&<Trail S={S} refresh={refresh} evOpen={evOpen} setEvOpen={setEvOpen}/>}
      {tab==='missions'&&<Missions S={S} refresh={refresh}/>}
      {tab==='review'&&<Review S={S} refresh={refresh}/>}
      {tab==='conq'&&<Conquests S={S}/>}
      {tab==='profile'&&<Profile S={S} refresh={refresh}/>}
    </main>
    {streak&&<Streak S={S} onClose={()=>setStreak(false)} refresh={refresh}/>}
    {welcome&&<Welcome S={S} onClose={()=>setWelcome(false)} refresh={refresh}/>}
    <nav id="nav" aria-label="Navegação"><div className="wrap" id="navin">
      {TABS.map(([k,n])=><button key={k} className="nbtn" aria-current={tab===k?'page':undefined} onClick={()=>{setTab(k);window.scrollTo(0,0)}}>
        <Svg h={A.NAV[k]}/>{n}{!!dots[k]&&<span className="dot">{dots[k]}</span>}</button>)}
    </div></nav>
  </>
}
