import { useEffect, useRef } from 'react'
import { animate } from 'motion/react'
import { Pingo } from './Pingo'
import { reducedMotion } from './lib/sound'

export type Walk={from:HTMLElement;to:HTMLElement;size:number;ty:number}
/** Posição do cabo (curva de Bézier entre as duas etapas), igual à do desenho dos cabos */
const bez=(A:{x:number;y:number},B:{x:number;y:number},t:number)=>{
  const m=(A.y+B.y)/2,u=1-t
  return{x:u*u*u*A.x+3*u*u*t*A.x+3*u*t*t*B.x+t*t*t*B.x,y:u*u*u*A.y+3*u*u*t*m+3*u*t*t*m+t*t*t*B.y}
}
/** Pingo caminha pelo cabo da etapa concluída até a próxima, deixando um rastro; a câmera acompanha (motion) */
export function Walker({S,walk,root,onEnd}:{S:any;walk:Walk;root:HTMLElement;onEnd:()=>void}){
  const el=useRef<HTMLDivElement>(null),inn=useRef<HTMLDivElement>(null)
  useEffect(()=>{
    const box=el.current,sway=inn.current;if(!box||!sway||reducedMotion()){onEnd();return}
    const rr=root.getBoundingClientRect(),W=walk.size,top0=rr.top+window.scrollY // topo absoluto da trilha, fixo durante a caminhada
    const ctr=(e:HTMLElement)=>{const b=e.getBoundingClientRect();return{x:b.left-rr.left+b.width/2,y:b.top-rr.top+b.height/2}}
    const A=ctr(walk.from),B=ctr(walk.to),dist=Math.hypot(B.x-A.x,B.y-A.y),dur=Math.max(1.5,Math.min(2.8,dist*6/1000))
    const N=48,pts=Array.from({length:N+1},(_,i)=>{const t=i/N,e=t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;return bez(A,B,e)})
    const place=(p:{x:number;y:number},bob:number)=>`translate(${p.x-W/2}px,${p.y-W*.8-bob}px)`
    box.style.transform=place(pts[0],0)
    window.scrollTo(0,Math.max(0,pts[0].y+top0-innerHeight*.45))
    let lastTrail=0
    const ctl=animate(0,1,{duration:dur,ease:'linear',onUpdate:v=>{
      const i=Math.min(N,Math.round(v*N)),p=pts[i],ph=v*dur/.17,bob=Math.abs(Math.sin(ph*Math.PI))*7
      box.style.transform=place(p,bob)
      sway.style.transform=`rotate(${Math.sin(ph*Math.PI)*7}deg)`
      // câmera suave atrás do Pingo
      const want=p.y+top0-innerHeight*.48
      window.scrollTo(0,window.scrollY+(want-window.scrollY)*.08)
      // rastro luminoso
      if(performance.now()-lastTrail>110){lastTrail=performance.now()
        const d=document.createElement('i');d.className='wtr';d.style.left=(p.x-4)+'px';d.style.top=(p.y-3)+'px';root.appendChild(d)
        animate(d,{opacity:[.9,0],scale:[1,.3]},{duration:.85}).then(()=>d.remove())}
    }})
    ctl.then(()=>{
      animate(box,{opacity:[1,0]},{duration:.25}).then(onEnd)   // some e o Pingo parado reaparece no destino
    })
    return()=>{ctl.stop();root.querySelectorAll('.wtr').forEach(e=>e.remove())}
  },[]) // eslint-disable-line react-hooks/exhaustive-deps
  return <div ref={el} className="walker" style={{width:walk.size}} aria-hidden="true"><div ref={inn} className="wkin"><Pingo S={S} mood="walk" cls="wks"/></div></div>
}
