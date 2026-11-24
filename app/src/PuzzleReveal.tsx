import { useEffect, useRef, useState } from 'react'
import { animate } from 'motion/react'
import { motion } from './Fx'
import { confetti } from './Fx'
import { sfx, buzz, reducedMotion } from './lib/sound'

const wait=(ms:number)=>new Promise<void>(r=>setTimeout(r,ms))
const cropped=(art:string,i:number)=>{const x=(i%3)*30,y=Math.floor(i/3)*30
  return `<svg viewBox="${x} ${y} 30 30" preserveAspectRatio="none" aria-hidden="true">${art}</svg>`}

/** Quebra-cabeça: cada peça nova aparece girando no centro e voa até o lugar dela (motion) */
export function PuzzleReveal({art,equipName,prizeName,before,n,full,onDone}:{art:string;equipName:string;prizeName:string;before:number;n:number;full:boolean;onDone:()=>void}){
  const [placed,setPlaced]=useState(before)          // peças já encaixadas
  const [piece,setPiece]=useState<number|null>(null) // peça em voo (índice da célula)
  const [msg,setMsg]=useState('Veja ela entrando no quebra-cabeça')
  const [won,setWon]=useState(false)
  const board=useRef<HTMLDivElement>(null),flyer=useRef<HTMLDivElement>(null),cells=useRef<(HTMLDivElement|null)[]>([])
  const alive=useRef(true)

  useEffect(()=>{
    alive.current=true
    const run=async()=>{
      await wait(reducedMotion()?100:650)
      for(let k=0;k<n&&alive.current;k++){
        const idx=before+k
        if(!reducedMotion()){
          setPiece(idx);await wait(30)
          const el=flyer.current,cell=cells.current[idx],bd=board.current
          if(el&&cell&&bd){
            sfx('open')
            const cr=cell.getBoundingClientRect(),sz=el.offsetWidth
            const cx=window.innerWidth/2-sz/2,cy=window.innerHeight*.42-sz/2
            el.style.left=cx+'px';el.style.top=cy+'px'
            // 1) aparece girando no centro
            await animate(el,{opacity:[0,1,1],scale:[.1,1.15,1],rotateY:[0,360,720]},{duration:1.3,ease:[.3,.7,.3,1],times:[0,.45,1]})
            // 2) voa até a célula, encolhendo até o tamanho dela
            await animate(el,{x:cr.left+cr.width/2-(cx+sz/2),y:cr.top+cr.height/2-(cy+sz/2),scale:cr.width/sz},{duration:.65,ease:[.5,0,.2,1]})
            if(!alive.current)return
          }
          setPiece(null)
        }
        setPlaced(idx+1);sfx((['plim0','plim1','plim2'] as const)[Math.min(k,2)]);buzz(14)
        await wait(reducedMotion()?60:500)
      }
      if(!alive.current)return
      if(full){setWon(true);setMsg(equipName+' montado! '+prizeName+' guardada no inventário.');sfx('open');confetti(70,50,40)}
      else setMsg('Faltam '+(9-(before+n))+' peças.')
    }
    void run()
    return()=>{alive.current=false}
  },[])  // eslint-disable-line react-hooks/exhaustive-deps

  return <div className="pzx"><div className="pzh"><h1>{n===1?'Você ganhou 1 peça!':`Você ganhou ${n} peças!`}</h1><p aria-live="polite">{msg}</p></div>
    <motion.div ref={board} className={'pzboard'+(won?' done':'')} animate={won?{scale:[1,1.06,1]}:{}} transition={{duration:.8}}>
      {Array.from({length:9},(_,i)=><div key={i} className="pzcell" ref={el=>{cells.current[i]=el}}>
        <span style={{display:'contents'}} dangerouslySetInnerHTML={{__html:cropped(art,i)}}/>
        {i>=placed&&<motion.div className="pzq" initial={{opacity:1}} exit={{opacity:0}}>?</motion.div>}
        {i<placed&&i>=before&&<motion.div style={{position:'absolute',inset:0,pointerEvents:'none',border:'3px solid #ffc43d'}} initial={{scale:1.5,opacity:0}} animate={{scale:1,opacity:1}} transition={{type:'spring',stiffness:300,damping:14}}/>}
      </div>)}
    </motion.div>
    <div className="pzprog"><b>{placed}</b> de 9 peças</div>
    {piece!==null&&<div ref={flyer} className="pzpiece" style={{width:Math.round(Math.min(150,Math.min(window.innerWidth*.76,320)*.5)),height:Math.round(Math.min(150,Math.min(window.innerWidth*.76,320)*.5)),opacity:0,perspective:600}}
      dangerouslySetInnerHTML={{__html:cropped(art,piece)}}/>}
    <div className="pzfoot"><button className="btn" onClick={onDone}>{full?'Continuar':'Ver o evento'}</button></div></div>
}
