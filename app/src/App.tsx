import { useEffect, useState } from 'react'
import { load, dayNum } from './lib/store'
import { Profile } from './Profile'
import { Trail } from './Trail'
import art from './legacy/art.json'
import './legacy/jogo.css'

const A:any=art
type Tab='path'|'missions'|'review'|'conq'|'profile'
const TABS:[Tab,string][]=[['path','Trilha'],['missions','Missões'],['review','Revisar'],['conq','Conquistas'],['profile','Perfil']]
const Svg=({h}:{h:string})=><span style={{display:'contents'}} dangerouslySetInnerHTML={{__html:h}}/>

function streakNow(S:any){
  if(!S.last)return 0
  const gap=dayNum(new Date().toISOString().slice(0,10))-dayNum(S.last)
  return gap<=1?(S.streak||0):0
}

export default function App(){
  const [v,setV]=useState(0)
  const [tab,setTab]=useState<Tab>('path')
  const S=load()
  useEffect(()=>{let t='light';try{t=localStorage.getItem('pingoquest-theme')==='dark'?'dark':'light'}catch{}
    document.documentElement.setAttribute('data-theme',t)},[])
  return <>
    <div id="top"><div className="wrap" id="topin">
      <div className="stat s-streak"><Svg h={A.IC.brilho}/><span>{streakNow(S)}</span></div>
      <div className="stat s-gems"><Svg h={A.IC.gem}/><span>{S.gems??50}</span></div>
      <div className="stat s-heart"><Svg h={A.IC.heart}/><span>{S.hearts??5}</span></div>
    </div></div>
    <main className="wrap" id="main">
      {tab==='path'&&<Trail key={v} S={S} refresh={()=>setV(x=>x+1)}/>}
      {tab==='profile'&&<Profile S={S}/>}
      {(tab==='missions'||tab==='review'||tab==='conq')&&<div className="screen"><div className="sect">{TABS.find(t=>t[0]===tab)![1]}</div>
        <p className="note">Esta tela ainda não foi migrada para o app novo. Use o jogo completo por enquanto.</p></div>}
    </main>
    <nav id="nav" aria-label="Navegação"><div className="wrap" id="navin">
      {TABS.map(([k,n])=><button key={k} className="nbtn" aria-current={tab===k?'page':undefined} onClick={()=>setTab(k)}><Svg h={A.NAV[k]}/>{n}</button>)}
    </div></nav>
  </>
}
