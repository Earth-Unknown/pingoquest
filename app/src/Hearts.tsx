import { useEffect, useState } from 'react'
import { motion } from './Fx'
import art from './legacy/art.json'
import { sfx, buzz } from './lib/sound'

const A:any=art
const RED='#ff4b6e'
export const HEART_ICON=`<span style="color:${RED};display:contents">${A.IC.heart}</span>`

/** Fileira de corações: os que você já tinha ficam cheios e os novos aparecem um a um, com som, pulinho e brilho (motion) */
export function HeartsRow({from,gain,total=5}:{from:number;gain:number;total?:number}){
  const [n,setN]=useState(from)
  useEffect(()=>{
    const ts:ReturnType<typeof setTimeout>[]=[]
    for(let k=0;k<gain;k++)ts.push(setTimeout(()=>{setN(from+k+1);sfx((['plim0','plim1','plim2'] as const)[Math.min(k,2)]);buzz(12)},750+k*480))
    ts.push(setTimeout(()=>sfx('ok'),750+gain*480))
    return()=>ts.forEach(clearTimeout)
  },[from,gain])
  return <div style={{margin:'6px 0 2px'}}>
    <div style={{display:'flex',justifyContent:'center',gap:8}} role="img" aria-label={`${from+gain} de ${total} vidas`}>
      {Array.from({length:total},(_,i)=>{
        const novo=i>=from&&i<from+gain,cheio=i<from
        return <span key={i} style={{position:'relative',width:44,height:44,display:'block'}}>
          <span style={{position:'absolute',inset:0,color:'#c9c3de',opacity:.55}} dangerouslySetInnerHTML={{__html:A.IC.heart}}/>
          {(cheio||novo)&&<motion.span style={{position:'absolute',inset:0,color:RED,display:'block',filter:novo?'drop-shadow(0 0 8px rgba(255,75,110,.7))':undefined}}
            initial={cheio?false:{scale:0,rotate:-25,opacity:0}} animate={{scale:1,rotate:0,opacity:1}}
            transition={cheio?undefined:{type:'spring',stiffness:340,damping:11,delay:.75+(i-from)*.48}}
            dangerouslySetInnerHTML={{__html:A.IC.heart}}/>}
          {novo&&<motion.b style={{position:'absolute',left:'50%',top:-6,fontSize:15,color:RED,fontWeight:900,translateX:'-50%'}}
            initial={{opacity:0,y:6}} animate={{opacity:[0,1,0],y:[6,-18,-30]}} transition={{duration:.9,delay:.75+(i-from)*.48}}>+1</motion.b>}
        </span>})}
    </div>
    <motion.p key={n} initial={{scale:1.3}} animate={{scale:1}} transition={{type:'spring',stiffness:400,damping:14}}
      style={{margin:'8px 0 0',fontWeight:900,color:RED,fontSize:16}}>{n} de {total} vidas</motion.p>
  </div>
}
