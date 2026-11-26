// "Coletar energia": energia e chips voam dos cartões do resultado até o contador do topo e os números sobem contando (motion)
import { animate } from 'motion/react'
import art from '../legacy/art.json'
import { load } from './store'
import { sfx, buzz, reducedMotion } from './sound'

const A:any=art
const pill=(cls:string,icon:string,from:number,label:string)=>{
  const d=document.createElement('div');d.className='cp '+cls
  d.innerHTML=icon+'<b>'+from+'</b><small>'+label+'</small>';return d
}
/** Resolve quando a animação termina (ou na hora, se não há o que coletar ou o aparelho pede menos movimento) */
export function collect(xp:number,gm:number,hearts=0):Promise<void>{
  const root=[...document.querySelectorAll<HTMLElement>('#lesson')].pop()
  if(!root||!xp||reducedMotion())return Promise.resolve()
  const S=load(),e0=(S.xp||0)-xp,g0=(S.gems??50)-gm
  const tiles=[...root.querySelectorAll<HTMLElement>('.res2 .rt')]
  const lab=(t:HTMLElement)=>t.querySelector('small')?.textContent||''
  const eT=tiles.find(t=>/energia/i.test(lab(t))),gT=tiles.find(t=>/chips/i.test(lab(t))),hT=tiles.find(t=>/vidas/i.test(lab(t)))
  const bar=document.createElement('div');bar.className='cpills'
  const h1=S.hearts??5,hasH=hearts>0&&!!hT
  const ph=hasH?pill('h','<span style="color:#ff4b6e;display:contents">'+A.IC.heart+'</span>',h1-hearts,'vidas'):null
  const pe=pill('e',A.IC.bolt,e0,'energia'),pg=gm>0?pill('g','<span style="color:#ff4fae;display:contents">'+A.IC.gem+'</span>',g0,'chips'):null
  if(ph)bar.appendChild(ph);bar.appendChild(pe);if(pg)bar.appendChild(pg);root.appendChild(bar)
  root.querySelectorAll<HTMLButtonElement>('.lfoot .btn').forEach(b=>{b.disabled=true})
  return new Promise<void>(resolve=>{
    let landed=0,total=0,over=false
    const finish=()=>{if(over)return;over=true;sfx('plim2');setTimeout(()=>{bar.remove();resolve()},500)}
    const jobs=[
      eT&&{tile:eT,ic:A.IC.bolt,pill:pe,b:pe.querySelector('b')!,from:e0,add:xp},
      gT&&pg&&gm>0&&{tile:gT,ic:'<span style="color:#ff4fae;display:contents">'+A.IC.gem+'</span>',pill:pg,b:pg.querySelector('b')!,from:g0,add:gm},
      hT&&ph&&{tile:hT,ic:'<span style="color:#ff4b6e;display:contents">'+A.IC.heart+'</span>',pill:ph,b:ph.querySelector('b')!,from:h1-hearts,add:hearts},
    ].filter(Boolean) as {tile:HTMLElement;ic:string;pill:HTMLElement;b:Element;from:number;add:number}[]
    setTimeout(()=>{
      if(!jobs.length){finish();return}
      jobs.forEach(j=>{
        const r=j.tile.getBoundingClientRect(),q=j.pill.getBoundingClientRect()
        const n=Math.min(9,Math.max(5,j.add)),sx=r.left+r.width/2,sy=r.top+r.height/2,dx=q.left+22-sx,dy=q.top+q.height/2-sy
        animate(j.tile,{scale:[1,.9,1]},{duration:.3})
        total+=n
        for(let i=0;i<n;i++){
          const el=document.createElement('div');el.className='cpart';el.innerHTML=j.ic;el.style.left=sx+'px';el.style.top=sy+'px';el.style.opacity='0'
          document.body.appendChild(el)
          const wob=(i%2?1:-1)*(20+i*5)
          animate(el,{x:[0,dx*.35+wob,dx],y:[0,dy*.2-40,dy],scale:[.5,1.25,.55],opacity:[0,1,1]},{duration:.75,delay:i*.085,ease:[.4,0,.2,1],times:[0,.3,1]}).then(()=>{
            el.remove();landed++
            j.b.textContent=String(i===n-1?j.from+j.add:Math.round(j.from+j.add*(i+1)/n))
            animate(j.pill,{scale:[1,1.14,1]},{duration:.25});sfx('tick');buzz(8)
            if(landed>=total)setTimeout(finish,350)
          })
        }
      })
    },420)
    setTimeout(finish,4200)
  })
}
