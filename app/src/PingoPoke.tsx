import { useEffect, useRef, useState } from 'react'
import { animate } from 'motion/react'
import { motion, AnimatePresence, confetti } from './Fx'
import { sfx, buzz, reducedMotion } from './lib/sound'
import { shuffle } from './lib/curso'

const PQ=['Ping! Estou aqui.','O roteador é a porta da sua casa.','Cabo é estável. Wi-Fi é prático.','Bip bip! Isso fez cócegas.','Já viu se o cabo está bem encaixado?','Reiniciar resolve mais do que parece.','Meu ping hoje: 4 ms. E o seu?','Errar também ensina. Bora de novo!','Primeiro investigue, depois conserte.','DNS é a lista de contatos da internet.','Um passo de cada vez, técnico!']
const PQ_LINUX=['ls mostra o que tem na pasta.','Dica: Tab completa o nome para você.','pwd diz onde você está.','sudo é poder demais: use com cuidado.','Tudo no Linux é arquivo. Até o teclado!','man comando explica qualquer comando.','Errou o comando? Seta para cima repete.','Um passo de cada vez, técnico!']
const curso=()=>{try{return JSON.parse(localStorage.getItem('pingoquest-v3')||'{}').curso==='linux'?'linux':'redes'}catch{return 'redes'}}

type Bub={id:number;text:string;x:number;y:number;below:boolean}
type Ring={id:number;x:number;y:number}
/** Toque no Pingo: ele pula, solta um sonar e fala uma frase; a cada 7 toques, modo turbo com confete (motion) */
export function PingoPoke(){
  const [bub,setBub]=useState<Bub|null>(null),[rings,setRings]=useState<Ring[]>([])
  const n=useRef(0),order=useRef<string[]>([]),timer=useRef<ReturnType<typeof setTimeout>>(undefined),seq=useRef(0)
  useEffect(()=>{
    const say=(text:string,r:DOMRect)=>{
      clearTimeout(timer.current)
      const below=r.top<70
      setBub({id:++seq.current,text,x:Math.max(130,Math.min(innerWidth-130,r.left+r.width/2)),y:below?r.bottom+8:r.top-8,below})
      timer.current=setTimeout(()=>setBub(null),2400)
    }
    const f=(e:MouseEvent)=>{
      const t=e.target as Element|null,svg=t?.closest?.('svg[aria-label^="Pingo"]') as SVGElement|null
      if(!svg){setBub(null);return}
      n.current++;sfx('boop');buzz(10)
      const r=svg.getBoundingClientRect()
      if(!reducedMotion()){
        const st=svg.style;st.transformOrigin='50% 90%'
        animate(svg,{scaleX:[1,1.14,.94,1.06,1],scaleY:[1,.82,1.1,.94,1],y:[0,0,-16,0,0],rotate:[0,0,-6,4,0]},{duration:.6,times:[0,.2,.45,.7,1]})
        const id=++seq.current;setRings(l=>[...l,{id,x:r.left+r.width/2,y:r.top+r.height*.1}]);setTimeout(()=>setRings(l=>l.filter(x=>x.id!==id)),900)
      }
      if(n.current%7===0){sfx('win');confetti(26,Math.round((r.left+r.width/2)/innerWidth*100),Math.round(r.top/innerHeight*100));say('Modo turbo ativado!',r);return}
      const pool=curso()==='linux'?[...PQ_LINUX,...PQ.slice(8)]:PQ
      if(!order.current.length)order.current=shuffle(pool)
      say(order.current.pop()!,r)
    }
    document.addEventListener('click',f)
    return()=>{document.removeEventListener('click',f);clearTimeout(timer.current)}
  },[])
  return <div aria-hidden="false" style={{position:'fixed',inset:0,pointerEvents:'none',zIndex:120}}>
    {rings.map(r=><motion.i key={r.id} style={{position:'absolute',left:r.x-24,top:r.y-24,width:48,height:48,borderRadius:'50%',border:'3px solid #18ddfb',display:'block'}}
      initial={{scale:.3,opacity:.9}} animate={{scale:2.6,opacity:0}} transition={{duration:.8,ease:'easeOut'}}/>)}
    <AnimatePresence>{bub&&<motion.div key={bub.id} role="status"
      style={{position:'absolute',left:bub.x,top:bub.y,translateX:'-50%',translateY:bub.below?'0%':'-100%',maxWidth:'min(260px,calc(100vw - 24px))',background:'var(--surface)',color:'var(--fg,var(--ink))',border:'2px solid var(--primary)',borderRadius:16,padding:'9px 13px',fontWeight:800,fontSize:15,lineHeight:1.25,textAlign:'center',boxShadow:'0 6px 0 rgba(0,0,0,.12)'}}
      initial={{opacity:0,scale:.7,y:bub.below?-6:6}} animate={{opacity:1,scale:1,y:0}} exit={{opacity:0,scale:.9}} transition={{type:'spring',stiffness:420,damping:22}}>{bub.text}</motion.div>}</AnimatePresence>
  </div>
}
