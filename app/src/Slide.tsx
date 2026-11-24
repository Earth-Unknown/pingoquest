import { useRef, useState } from 'react'
import { motion, animate, useMotionValue, useTransform } from 'motion/react'
import { sfx, buzz } from './lib/sound'

const ARW='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h13M13 6l6 6-6 6"/></svg>'

/** "Arraste para confirmar" (igual ao do jogo): passou de 70% do caminho, confirma; senão volta. Enter ou toque duplo também confirmam. */
export function Slide({label,onDone}:{label:string;onDone:()=>void}){
  const box=useRef<HTMLDivElement>(null),knob=useRef<HTMLSpanElement>(null)
  const x=useMotionValue(0)
  const [max,setMax]=useState(1)
  const [done,setDone]=useState(false),[nudge,setNudge]=useState(0)
  const txtOpacity=useTransform(x,v=>1-v/Math.max(1,max))
  const measure=()=>{const b=box.current,k=knob.current;const m=b&&k?Math.max(1,b.clientWidth-k.offsetWidth-8):1;setMax(m);return m}
  const confirm=(m=max)=>{
    if(done)return;setDone(true)
    animate(x,m,{duration:.12});sfx('confirm');buzz([12,30,20]);setTimeout(onDone,150)
  }
  const lastTap=useRef(0)
  return <div ref={box} className={'slide'+(done?' done':'')} tabIndex={0} role="button" aria-label={label}
    onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();confirm(measure())}}}>
    <motion.span className="sl-txt" style={{opacity:txtOpacity}}>{label}</motion.span>
    <motion.span ref={knob} className="sl-knob" style={{x}} drag={done?false:'x'} dragConstraints={{left:0,right:max}} dragElastic={0} dragMomentum={false}
      animate={nudge?{x:[0,16,0]}:undefined} key={nudge}
      onPointerDown={()=>{measure();const n=Date.now();if(n-lastTap.current<350){lastTap.current=0;confirm(measure())}else lastTap.current=n}}
      onDragEnd={()=>{
        if(x.get()>=max*.7)confirm()
        else{animate(x,0,{duration:.22})}
      }}
      onTap={()=>{if(Math.abs(x.get())<6){setNudge(n=>n+1);sfx('tap')}}}
      dangerouslySetInnerHTML={{__html:ARW}}/>
  </div>
}
