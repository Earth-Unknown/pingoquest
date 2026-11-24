import { useEffect, useState } from 'react'
import { motion, AnimatePresence, animate, useMotionValue, useTransform, MotionConfig } from 'motion/react'
import { reducedMotion } from './lib/sound'

/* ---------- confete (motion): qualquer tela chama confetti() ---------- */
const COLORS=['#6c4bf4','#1cb0f6','#ffc800','#58cc02','#ff4b4b','#ff8a1f']
type Burst={id:number;n:number;x:number;y:number}
let bursts:((b:Burst)=>void)|null=null,seq=0
export function confetti(n=34,x=50,y=34){if(reducedMotion())return;bursts?.({id:++seq,n,x,y})}

type P={dx:number;up:number;dn:number;r:number;c:string;d:number;w:number;h:number}
const mk=(n:number):P[]=>Array.from({length:n},(_,i)=>({
  dx:Math.round((Math.random()-.5)*340),up:60+Math.round(Math.random()*160),dn:140+Math.round(Math.random()*320),
  r:Math.round((Math.random()-.5)*900),c:COLORS[i%COLORS.length],d:Math.random()*.12,w:6+Math.round(Math.random()*5),h:9+Math.round(Math.random()*7)}))

export function FxLayer(){
  const [list,setList]=useState<(Burst&{ps:P[]})[]>([])
  useEffect(()=>{
    bursts=b=>{setList(l=>[...l,{...b,ps:mk(b.n)}]);setTimeout(()=>setList(l=>l.filter(x=>x.id!==b.id)),2000)}
    return()=>{bursts=null}
  },[])
  return <div aria-hidden="true" style={{position:'fixed',inset:0,pointerEvents:'none',zIndex:200,overflow:'hidden'}}>
    {list.map(b=>b.ps.map((p,i)=>
      <motion.i key={b.id+'-'+i} style={{position:'absolute',left:b.x+'%',top:b.y+'%',width:p.w,height:p.h,background:p.c,borderRadius:2,display:'block'}}
        initial={{x:0,y:0,rotate:0,opacity:1}}
        animate={{x:[0,p.dx*.6,p.dx],y:[0,-p.up,p.dn],rotate:p.r,opacity:[1,1,0]}}
        transition={{duration:1.7,delay:p.d,ease:'easeOut',times:[0,.35,1]}}/>))}
  </div>
}

/* ---------- número que sobe contando (resultados) ---------- */
export function CountUp({to,prefix='',delay=0}:{to:number;prefix?:string;delay?:number}){
  const v=useMotionValue(0),txt=useTransform(v,x=>prefix+Math.round(x))
  useEffect(()=>{
    if(reducedMotion()){v.set(to);return}
    const c=animate(v,to,{duration:.8,delay,ease:'easeOut'});return()=>c.stop()
  },[to,delay,v])
  return <motion.b>{txt}</motion.b>
}

/* ---------- entradas padrão ---------- */
const spring={type:'spring',stiffness:420,damping:34} as const
/** tela cheia que sobe de baixo (lições, casos, duelo) */
export const Overlay=({children,...rest}:{children:React.ReactNode}&React.ComponentProps<typeof motion.div>)=>
  <motion.div initial={{y:'8%',opacity:0}} animate={{y:0,opacity:1}} exit={{y:'8%',opacity:0}} transition={spring} {...rest}>{children}</motion.div>
/** cartão que aparece com mola (boas-vindas, folhas) */
export const Pop=({children,...rest}:{children:React.ReactNode}&React.ComponentProps<typeof motion.div>)=>
  <motion.div initial={{scale:.92,y:14,opacity:0}} animate={{scale:1,y:0,opacity:1}} transition={spring} {...rest}>{children}</motion.div>
/** lista que entra um item de cada vez */
export const stagger=(i:number)=>({initial:{opacity:0,y:12},animate:{opacity:1,y:0},transition:{delay:.05*i,duration:.28}})

export {AnimatePresence,motion,MotionConfig}

/* ---------- entradas por ref (animam o próprio elemento; não quebram position:fixed) ---------- */
const gentle={type:'spring',stiffness:420,damping:34} as const
/** tela cheia: sobe e aparece */
export const enter=(el:HTMLElement|null)=>{if(el&&!reducedMotion())animate(el,{opacity:[0,1],y:[28,0]},gentle)}
/** cartões e folhas: crescem com mola */
export const popIn=(el:HTMLElement|null)=>{if(el&&!reducedMotion())animate(el,{opacity:[0,1],scale:[.92,1],y:[16,0]},gentle)}
/** barra de feedback: sobe do rodapé */
export const riseIn=(el:HTMLElement|null)=>{if(el&&!reducedMotion())animate(el,{opacity:[0,1],y:[24,0]},{duration:.25,ease:'easeOut'})}

/* ---------- cartões de resultado: entram em sequência e os números sobem contando ---------- */
export type Tile={c:string;l:string;to:number;prefix?:string;icon?:string}
export function ResultTiles({tiles}:{tiles:Tile[]}){
  return <div className="res2">{tiles.map((t,i)=>
    <motion.div key={t.l} className="rt" style={{'--rc':t.c} as any}
      initial={{opacity:0,y:22,scale:.9}} animate={{opacity:1,y:0,scale:1}} transition={{type:'spring',stiffness:380,damping:26,delay:.25+i*.18}}>
      <small>{t.l}</small><span>{t.icon&&<span style={{display:'contents'}} dangerouslySetInnerHTML={{__html:t.icon}}/>}<CountUp to={t.to} prefix={t.prefix} delay={.4+i*.18}/></span></motion.div>)}</div>
}
/** estrelas que aparecem uma a uma */
export function StarsAnim({n}:{n:number}){
  return <span className="stars" role="img" aria-label={n+' de 3 estrelas'}>{[0,1,2].map(i=>
    <motion.span key={i} className={i<n?'on':''} initial={{scale:0,rotate:-40,opacity:0}} animate={{scale:1,rotate:0,opacity:1}}
      transition={{type:'spring',stiffness:300,damping:12,delay:.3+i*.28}}>★</motion.span>)}</span>
}
