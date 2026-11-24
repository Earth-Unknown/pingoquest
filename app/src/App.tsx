import { useState } from 'react'
import { load } from './lib/store'
import { Profile } from './Profile'
import { Trail } from './Trail'
import './legacy/jogo.css'
export default function App(){
  const S=load()
  const [tab,setTab]=useState<'trilha'|'perfil'>('trilha')
  return <main className="app">
    {tab==='trilha'?<Trail S={S}/>:<Profile S={S}/>}
    <nav className="tabs" style={{position:'fixed',left:0,right:0,bottom:0,display:'flex',gap:8,padding:'8px 12px calc(8px + env(safe-area-inset-bottom,0px))',background:'var(--surface,#fff)',borderTop:'2px solid #e5e0f5'}}>
      {(['trilha','perfil'] as const).map(t=><button key={t} className={'btn '+(tab===t?'prim':'ghost')} style={{flex:1}} onClick={()=>setTab(t)}>{t==='trilha'?'Trilha':'Perfil'}</button>)}
    </nav>
    <div style={{height:80}}/>
  </main>
}
