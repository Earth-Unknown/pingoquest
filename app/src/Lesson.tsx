import { useMemo, useRef, useState } from 'react'
import { Pingo } from './Pingo'
import { shuffle, type Q } from './lib/curso'
import { patchSave } from './lib/save'
import { day, touchStreak, wkAdd, addMiss, fixMiss, cqSync } from './lib/progress'
import type { EvRes } from './lib/events'
import { sfx, buzz } from './lib/sound'
import { collect } from './lib/collect'
import { confetti, enter, riseIn, ResultTiles } from './Fx'

type Item=Q&{src:Q;opts?:{t:string;c:boolean}[];left?:{id:number;t:string}[];right?:{id:number;t:string}[];ci?:{id:number;t:string;c:number}[]}
const prep=(q:Q):Item=>{
  const c:Item={...q,src:q}
  if(q.t==='mc')c.opts=shuffle(q.o!.map((t,i)=>({t,c:i===q.a})))
  if(q.t==='mp'){c.left=q.pairs!.map((p,i)=>({id:i,t:p[0]}));c.right=shuffle(q.pairs!.map((p,i)=>({id:i,t:p[1]})))}
  if(q.t==='cl')c.ci=shuffle(q.items!.map((x,i)=>({id:i,t:x[0],c:x[1]})))
  return c
}

/** conhecimento por assunto (usado para priorizar o que está frágil nos eventos) */
const know=(s:any,q:Q,good:boolean)=>{if(!q.cid)return;s.know=s.know||{};const k=s.know[q.cid]||(s.know[q.cid]={ok:0,bad:0,seen:0,last:''});if(good)k.ok++;else k.bad++}
export type Result={xp:number;gems:number;acc:number;perfect:boolean}
export function Lesson({S,qs,kind,keyId,onClose,onEvent,onRetry}:{S:any;qs:Q[];kind:'phase'|'boss'|'review'|'event';keyId:string;onClose:()=>void;onEvent?:(correct:number,total:number)=>EvRes;onRetry?:()=>void}){
  const [queue,setQueue]=useState<Item[]>(()=>qs.map(prep))
  const [i,setI]=useState(0)
  const [hearts,setHearts]=useState<number>(S.hearts??5)
  const [state,setState]=useState<'ask'|'fb'>('ask')
  const [ok,setOk]=useState(false)
  const [sel,setSel]=useState<any>(null)
  const [mp,setMp]=useState<{sel:{side:string;id:number}|null;done:number[];flash:{l:number;r:number}|null;err:number}>({sel:null,done:[],flash:null,err:0})
  const [touch,setTouch]=useState<number|null>(null)
  const [right,setRight]=useState(0),[miss,setMiss]=useState(0)
  const [res,setRes]=useState<(Result&{ev?:EvRes})|null>(null)
  const [noHearts,setNoHearts]=useState(false)
  const base=useMemo(()=>qs.length,[qs])
  const qb=useMemo(()=>qs.filter(x=>x.t!=='learn').length,[qs])
  const q=queue[i]
  const run=useRef(0)
  const free=kind==='review'||kind==='event'

  const reset=(it:Item)=>{setState('ask');setOk(false);setTouch(null);setMp({sel:null,done:[],flash:null,err:0})
    setSel(it.t==='cl'?it.ci!.map(()=>null):null)}
  const wrong=(it:Item,requeue:boolean)=>{
    setMiss(m=>m+1);run.current=0
    if(!free)setHearts(Math.max(0,hearts-1))
    patchSave(s=>{addMiss(s,it.src);know(s,it.src,false);if(!free)s.hearts=Math.max(0,(s.hearts??5)-1)})
    if(requeue&&kind!=='event')setQueue(qu=>[...qu,prep(it.src)])
  }
  /** acerto: sequência e metas do dia; na revisão, a pergunta sai da lista */
  const hit=(it:Item,pairs=false)=>{setRight(r=>r+1);run.current++
    patchSave(s=>{const d=day(s);d.correct++;if(run.current>d.bestRun)d.bestRun=run.current;if(pairs)d.pairs++;if(kind==='review')fixMiss(s,it.src);know(s,it.src,true)})}
  const stat=(good:boolean)=>patchSave(s=>{s.total=(s.total||0)+1;if(good)s.ok=(s.ok||0)+1})

  const check=()=>{
    let good=false
    if(q.t==='mc')good=q.opts![sel].c
    if(q.t==='vf')good=sel===q.a
    if(q.t==='cl')good=q.ci!.every(it=>sel[it.id]===it.c)
    setOk(good);setState('fb');stat(good)
    if(good){hit(q);sfx(run.current>=3?'combo':'ok')}else{wrong(q,true);sfx('bad');buzz(30)}
  }
  const mpTap=(side:string,id:number)=>{
    if(state!=='ask'||mp.flash)return
    if(!mp.sel||mp.sel.side===side){setMp({...mp,sel:{side,id}});return}
    const l=side==='l'?id:mp.sel.id,r=side==='r'?id:mp.sel.id
    if(l===r){
      const done=[...mp.done,l]
      if(done.length===q.pairs!.length){const good=mp.err===0;setMp({...mp,done,sel:null});setOk(good);setState('fb');stat(good);if(good){hit(q,true);sfx('ok')}else{setMiss(m=>m+1);sfx('bad')}}
      else setMp({...mp,done,sel:null})
      return
    }
    sfx('bad');buzz(20)
    if(mp.err===0){wrong(q,false)}
    setMp({...mp,err:mp.err+1,flash:{l,r},sel:null})
    setTimeout(()=>setMp(m=>({...m,flash:null})),650)
  }
  const next=()=>{
    if(!free&&hearts<=0){setNoHearts(true);return}
    const n=i+1
    if(n>=queue.length){finish();return}
    setI(n);reset(queue[n])
  }
  const lnext=()=>{setRight(r=>r+1);const n=i+1;if(n>=queue.length){finish();return}setI(n);reset(queue[n])}
  const finish=()=>{
    if(kind==='event'&&onEvent){
      const r=onEvent(qb-miss,qb);sfx(r.pass?'win':'ok');if(r.pass)confetti()
      setRes({xp:r.xp,gems:r.got?.gems||0,acc:qb?Math.round(qb/(qb+miss)*100):100,perfect:r.pass,ev:r});return
    }
    let first=false,xp=10,gems=0
    const perfect=miss===0&&!free
    sfx('win');confetti()
    patchSave(s=>{
      const d=day(s)
      if(free)xp=8
      else{
        s.done=s.done||{};first=!s.done[keyId]
        if(kind==='boss'){gems=first?25:0;xp=25;if(first)s.bosses=(s.bosses||0)+1}else gems=first?10:0
        if(miss===0&&first)gems+=5
        d.phases++;if(miss===0){d.perfect++;s.perfectN=(s.perfectN||0)+1}
        s.done[keyId]=true
      }
      d.xp+=xp;s.xp=(s.xp||0)+xp;s.gems=(s.gems??50)+gems
      wkAdd(s,xp);touchStreak(s);cqSync(s)
    })
    setRes({xp,gems,acc:qb?Math.round(qb/(qb+miss)*100):100,perfect})
  }

  const pct=Math.round(Math.min(right,base)/base*100)
  const head=<div className="lhead"><button className="xbtn" onClick={onClose} aria-label="Sair da fase">✕</button>
    <div className="pbar" role="progressbar" aria-valuenow={pct}><i style={{width:pct+'%'}}/></div>
    <div className="stat s-heart"><span>{free?'Treino':'❤ '+hearts}</span></div></div>

  if(noHearts)return <div id="lesson" ref={enter}><div className="lw"><div className="lbody"><div className="center"><Pingo S={S} mood="sad"/><h1>Acabaram as vidas</h1><p>Volte ao jogo completo para recuperar vidas treinando.</p></div></div><div className="lfoot"><button className="btn" onClick={onClose}>Voltar</button></div></div></div>
  if(res?.ev)return <div id="lesson" ref={enter}><div className="lw"><div className="lbody lscroll"><div className="center">
    <Pingo S={S} mood={res.ev.pass?'cheer':'happy'}/><h1>{res.ev.title}</h1><p>{res.ev.sub}</p>
    <ResultTiles tiles={[{c:'#ffb800',l:'Energia',to:res.xp},...(res.gems>0?[{c:'#18b9e8',l:'Chips',to:res.gems,prefix:'+'}]:[]),res.ev.got?{c:'#3fbf5f',l:'Peças',to:res.ev.got.pieces,prefix:'+'}:{c:'#18b9e8',l:'Acertos',to:res.ev.correct}]}/>
  </div></div><div className="lfoot">{!res.ev.pass&&onRetry&&<button className="btn xbtn" onClick={onRetry}>Tentar de novo</button>}<button className="btn" onClick={()=>void collect(res.xp,res.gems).then(onClose)}>{res.xp>0?'Coletar energia':'Continuar'}</button></div></div></div>
  if(res)return <div id="lesson" ref={enter}><div className="lw"><div className="lbody lscroll"><div className="center">
    <Pingo S={S} mood="cheer"/><h1>{free?'Revisão concluída!':res.perfect?'Lição perfeita!':kind==='boss'?'Prova final concluída!':'Fase concluída!'}</h1>
    <p>{free?'Bom treino!':res.perfect?'Esse momento é seu!':'Errar também ensina.'}</p>
    <ResultTiles tiles={[{c:'#ffb800',l:'Energia',to:res.xp},{c:'#18b9e8',l:'Precisão',to:res.acc},...(res.gems>0?[{c:'#ff4fae',l:'Chips',to:res.gems,prefix:'+'}]:[])]}/>
  </div></div><div className="lfoot"><button className="btn" onClick={()=>void collect(res.xp,res.gems).then(onClose)}>{res.xp>0?'Coletar energia':'Continuar'}</button></div></div></div>

  const asked=state==='ask'
  const ready=q.t==='cl'?sel?.every((x:any)=>x!==null):sel!==null
  const correctText=()=>q.t==='mc'?q.opts!.find(o=>o.c)!.t:q.t==='vf'?(q.a?'Verdade':'Mito'):q.items!.map(x=>x[0]+' → '+q.cats![x[1]]).join(' · ')
  return <div id="lesson" ref={enter}><div className="lw">{head}<div className="lbody">
    {q.t==='learn'&&<>
      <div className="eyebrow">Aprenda</div>
      <div className="say"><span className="sp"><Pingo S={S} cls="pingo-s"/></span><div className="bub"><b>{q.title}</b><p>{q.text}</p></div></div>
      {q.touch&&q.touch.length>0&&<><div className="tlabel">Toque para explorar</div>
        <div className="tchips">{q.touch.map((x,n)=><button key={n} className={'tchip'+(touch===n?' on':'')} onClick={()=>setTouch(n)}>{x[0]}</button>)}</div>
        <div className="tout">{touch===null?<span className="note">Escolha um item acima.</span>:q.touch[touch][1]}</div></>}
    </>}
    {q.t==='mc'&&<><div className="eyebrow">Escolha a resposta</div><div className="q">{q.q}</div>
      <div className="opts">{q.opts!.map((o,n)=><button key={n} disabled={!asked} onClick={()=>setSel(n)}
        className={'opt'+(asked&&sel===n?' sel':'')+(!asked?(o.c?' right':(sel===n?' wrong':'')):'')}>{o.t}</button>)}</div></>}
    {q.t==='vf'&&<><div className="eyebrow">Verdade ou mito?</div><div className="q">{q.q}</div>
      <div className="vf">{([['Mito',false],['Verdade',true]] as [string,boolean][]).map(([l,v])=><button key={l} disabled={!asked} onClick={()=>setSel(v)}
        className={'opt'+(asked&&sel===v?' sel':'')+(!asked?(q.a===v?' right':(sel===v?' wrong':'')):'')}>{l}</button>)}</div></>}
    {q.t==='cl'&&<><div className="eyebrow">Classifique</div><div className="q">{q.q}</div>
      <div className="clist">{q.ci!.map(it=><div key={it.id} className={'clr'+(!asked?(sel[it.id]===it.c?' right':' wrong'):'')}><b>{it.t}</b>
        <div className="seg">{q.cats!.map((ct,c)=><button key={c} disabled={!asked} className={sel[it.id]===c?'on':''} onClick={()=>{const s=[...sel];s[it.id]=c;setSel(s)}}>{ct}</button>)}</div></div>)}</div></>}
    {q.t==='mp'&&<><div className="eyebrow">Combine os pares</div><div className="q">{q.q}</div>
      {asked?<div className="pairs">{([['l',q.left],['r',q.right]] as [string,any[]][]).map(([side,list])=><div className="pcol" key={side}>
        {list.map(it=>{const dn=mp.done.includes(it.id)
          const c='opt pi'+(dn?' gone':(mp.flash&&(mp.flash as any)[side]===it.id?' wrong':(mp.sel&&mp.sel.side===side&&mp.sel.id===it.id?' sel':'')))
          return <button key={it.id} className={c} disabled={dn} onClick={()=>mpTap(side,it.id)}>{it.t}</button>})}</div>)}</div>
      :<div className="prows">{q.left!.map(it=><div className="prow" key={it.id}><b>{it.t}</b><span>{q.pairs![it.id][1]}</span></div>)}</div>}</>}
  </div><div className="lfoot">
    {q.t==='learn'?<button className="btn" onClick={lnext}>Entendi</button>
    :asked&&q.t==='mp'?<button className="btn" disabled>Combine os pares</button>
    :asked?<button className="btn" disabled={!ready} onClick={check}>Verificar</button>
    :<><div className={'fb '+(ok?'ok':'bad')} ref={riseIn}><span className="fbp"><Pingo S={S} mood={ok?'cheer':'sad'} cls="pingo-fb"/></span>
        <h3>{ok?'Isso aí!':(q.t==='mp'?'Completou com erros':'Quase!')}</h3>
        {!ok&&q.t!=='mp'&&<p>Resposta certa: <span className="ans">{correctText()}</span></p>}<p>{q.e}</p></div>
      <button className={'btn'+(ok?'':' bad')} onClick={next}>Continuar</button></>}
  </div></div></div>
}
