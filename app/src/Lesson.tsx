import { useMemo, useRef, useState } from 'react'
import { Pingo } from './Pingo'
import { shuffle, type Q } from './lib/curso'
import { patchSave } from './lib/save'
import { load } from './lib/store'
import { day, touchStreak, wkAdd, addMiss, fixMiss, cqSync, gamesOf } from './lib/progress'
import type { EvRes } from './lib/events'
import { sfx, buzz } from './lib/sound'
import { collect } from './lib/collect'
import { confetti, enter, riseIn, ResultTiles, motion } from './Fx'
import { HeartsRow, HEART_ICON } from './Hearts'
import { CenaConclusao } from './conclusao/CenaConclusao'
import { ESTACAO_PINGO } from './conclusao/contrato'
import { sync as avSync, SLOTS, icon as avIcon } from './lib/avatar'

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
export type Novo={slot:string;id:string;nome:string;icone:string}
export type Result={xp:number;gems:number;first?:boolean;novos?:Novo[];cheias?:boolean;acc:number;perfect:boolean;hearts?:{from:number;gain:number}}
/** Vidas que o treino devolve (o limite é 5) */
const PRACTICE_HEARTS=3
export function Lesson({S,qs,kind,keyId,resumo,onClose,onEvent,onRetry}:{S:any;resumo?:{sabe?:string;pratica?:string;proxima?:string;recap?:[string,string][];fim?:import('./conclusao/contrato').FimParada};qs:Q[];kind:'phase'|'boss'|'review'|'event'|'practice';keyId:string;onClose:()=>void;onEvent?:(correct:number,total:number)=>EvRes;onRetry?:()=>void}){
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
  // sem vidas ao abrir uma fase: mostra logo a tela de recuperar vida (treinar ou recarregar), como no jogo
  const [noHearts,setNoHearts]=useState(()=>kind!=='review'&&kind!=='event'&&kind!=='practice'&&(load().hearts??S.hearts??5)<=0)
  const [practiceQs,setPracticeQs]=useState<Q[]|null>(null)
  const base=useMemo(()=>qs.length,[qs])
  const qb=useMemo(()=>qs.filter(x=>x.t!=='learn').length,[qs])
  const q=queue[i]
  const run=useRef(0)
  const free=kind==='review'||kind==='event'||kind==='practice'

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
    let first=false,xp=10,gems=0,hFrom=0,hGain=0,cheias=false,novos:Novo[]=[]
    const perfect=miss===0&&!free
    if(kind!=='phase'&&kind!=='boss'){sfx('win');confetti()}
    patchSave(s=>{
      const d=day(s)
      if(free){xp=kind==='practice'?5:8;if(kind==='practice'){hFrom=s.hearts??5;hGain=Math.max(0,Math.min(PRACTICE_HEARTS,5-hFrom));s.hearts=hFrom+hGain}}
      else{
        s.done=s.done||{};first=!s.done[keyId]
        if(kind==='boss'){gems=first?25:0;xp=25;if(first)s.bosses=(s.bosses||0)+1}else gems=first?10:0
        if(miss===0&&first)gems+=5
        d.phases++;if(miss===0){d.perfect++;s.perfectN=(s.perfectN||0)+1}
        s.done[keyId]=true
        if(kind==='boss'&&first){ // fecha a parada: vidas cheias e a invenção vai para a Oficina do Pingo
          if((s.hearts??5)<5){s.hearts=5;cheias=true}
          s.ofi=s.ofi||[];const oid=(s.curso||'redes')+':'+keyId.split('-')[0];if(!s.ofi.includes(oid))s.ofi.push(oid)
        }
      }
      d.xp+=xp;s.xp=(s.xp||0)+xp;s.gems=(s.gems??50)+gems
      wkAdd(s,xp);touchStreak(s);cqSync(s)
      if(!free){ // itens do robô que esta lição liberou (as metas já existiam; agora o aluno vê o prêmio na hora)
        const antes=(s.inv?.items||[]).slice()
        avSync(s,gamesOf(s.curso||'redes').filter(g=>!g.caso).length)
        novos=(s.inv?.items||[]).filter((k:string)=>!antes.includes(k)).flatMap((k:string)=>{
          const [slot,id]=k.split(':'),it=SLOTS.find(x=>x.id===slot)?.itens.find(i=>i.id===id)
          return it?[{slot,id,nome:it.nome,icone:avIcon(slot,it)}]:[]})
      }
    })
    setRes({xp,gems,first,novos,cheias,acc:qb?Math.round(qb/(qb+miss)*100):100,perfect,hearts:kind==='practice'?{from:hFrom,gain:hGain}:undefined})
  }

  const pct=Math.round(Math.min(right,base)/base*100)
  const head=<div className="lhead"><button className="xbtn" onClick={onClose} aria-label="Sair da fase">✕</button>
    <div className="pbar" role="progressbar" aria-valuenow={pct}><i style={{width:pct+'%'}}/></div>
    <div className="stat s-heart"><span>{free?'Treino':'❤ '+hearts}</span></div></div>

  if(noHearts&&practiceQs)return <Lesson key="treino" S={S} qs={practiceQs} kind="practice" keyId="p"
    onClose={()=>{setPracticeQs(null);const h=load().hearts??5;setHearts(h);if(h>0)setNoHearts(false)}}/>
  if(noHearts){
    const gems=load().gems??S.gems??50,can=gems>=60
    const treinar=()=>{
      const todas:Q[]=gamesOf(S.curso||'redes').flatMap(g=>g.phases.flat()).filter(x=>x.t!=='learn')
      setPracticeQs(shuffle(todas).slice(0,3))
    }
    const recarregar=()=>{
      let ok=false;patchSave(s=>{if((s.gems??50)>=60){s.gems=(s.gems??50)-60;s.hearts=5;ok=true}})
      if(ok){sfx('coin');setHearts(5);setNoHearts(false)}
    }
    return <div id="lesson" ref={enter}><div className="lw"><div className="lhead"><button className="xbtn" onClick={onClose} aria-label="Sair">✕</button>
      <div className="pbar"><i style={{width:0}}/></div><div className="stat s-heart"><span>❤ 0</span></div></div>
      <div className="lbody"><div className="center"><Pingo S={S} mood="sleep"/><h1 style={{color:'var(--bad)'}}>Sem vidas!</h1>
        <p>Errar faz parte de aprender. Treine um pouco para ganhar uma vida ou recarregue com chips.</p>
        <div className="stack">
          <button className="btn" onClick={treinar}>Treinar e ganhar vida</button>
          <button className="btn blue" disabled={!can} onClick={recarregar}>Recarregar por 60 chips</button>
          <p className="note">Você tem {gems} chips. No treino você não perde vidas: responda 3 perguntas e ganhe 3 vidas.</p>
          <button className="btn ghost" onClick={onClose}>Voltar para a trilha</button></div></div></div></div></div>
  }
  if(res?.ev)return <div id="lesson" ref={enter}><div className="lw"><div className="lbody lscroll"><div className="center">
    <Pingo S={S} mood={res.ev.pass?'cheer':'happy'}/><h1>{res.ev.title}</h1><p>{res.ev.sub}</p>
    <ResultTiles tiles={[{c:'#ffb800',l:'Energia',to:res.xp},...(res.gems>0?[{c:'#18b9e8',l:'Chips',to:res.gems,prefix:'+'}]:[]),res.ev.got?{c:'#3fbf5f',l:'Peças',to:res.ev.got.pieces,prefix:'+'}:{c:'#18b9e8',l:'Acertos',to:res.ev.correct}]}/>
  </div></div><div className="lfoot">{!res.ev.pass&&onRetry&&<button className="btn xbtn" onClick={onRetry}>Tentar de novo</button>}<button className="btn" onClick={()=>void collect(res.xp,res.gems).then(onClose)}>{res.xp>0?'Coletar energia':'Continuar'}</button></div></div></div>
  if(res?.hearts)return <div id="lesson" ref={enter}><div className="lw"><div className="lbody lscroll"><div className="center">
    <motion.div animate={{y:[0,-16,0,-10,0],rotate:[0,-4,4,-2,0]}} transition={{duration:1.1,delay:.5,repeat:2,repeatDelay:.6}}><Pingo S={S} mood="love"/></motion.div>
    <motion.h1 initial={{scale:.6,opacity:0}} animate={{scale:1,opacity:1}} transition={{type:'spring',stiffness:300,damping:14,delay:.2}} style={{color:'#ff4b6e'}}>{res.hearts.gain>1?'Vidas recuperadas!':'Vida recuperada!'}</motion.h1>
    <p>+{res.hearts.gain} {res.hearts.gain===1?'vida':'vidas'}. Você está de volta ao jogo!</p>
    <HeartsRow from={res.hearts.from} gain={res.hearts.gain}/>
    <ResultTiles tiles={[{c:'#ff4b6e',l:'Vidas',to:res.hearts.gain,prefix:'+',icon:HEART_ICON},{c:'#ffb800',l:'Energia',to:res.xp},{c:'#18b9e8',l:'Precisão',to:res.acc}]}/>
  </div></div><div className="lfoot"><button className="btn" onClick={()=>void collect(res.xp,res.gems,res.hearts?.gain).then(onClose)}>Voltar ao jogo</button></div></div></div>
  if(res&&(kind==='phase'||kind==='boss')&&!res.ev)return <CenaConclusao S={S} invencao={ESTACAO_PINGO} indice={Math.min(3,Math.max(0,parseInt(keyId.split('-')[1])||0))} repeticao={!res.first}
    titulo={!res.first?'Estação conferida!':resumo?.sabe?(kind==='boss'?'Agora você domina!':'Agora você sabe!'):kind==='boss'?'Estação Pingo completa!':'Mais uma descoberta!'} subtitulo={res.first?undefined:'Você já tinha essa peça. Bom reforço!'}
    xp={res.xp} chips={res.gems} acertos={res.acc} sabe={resumo?.sabe} pratica={resumo?.pratica} proxima={resumo?.proxima} novos={res.novos} fim={kind==='boss'&&res.first&&resumo?.fim?{...resumo.fim,vidasCheias:!!res.cheias}:undefined} aprendi={kind==='boss'?[...(resumo?.recap||[]),...gamesOf(S.curso||'redes')[parseInt(keyId)||0]?.phases.flat().filter(q=>q.t==='learn').flatMap(q=>(q.touch||[]) as [string,string][])||[]]:qs.filter(q=>q.t==='learn').flatMap(q=>(q.touch||[]) as [string,string][])} onContinuar={onClose}/>
  if(res)return <div id="lesson" ref={enter}><div className="lw"><div className="lbody lscroll"><div className="center">
    <Pingo S={S} mood="cheer"/><h1>{kind==='practice'?'Vida recuperada!':free?'Revisão concluída!':res.perfect?'Lição perfeita!':kind==='boss'?'Prova final concluída!':'Fase concluída!'}</h1>
    <p>{kind==='practice'?'+1 vida. Bom treino!':free?'Bom treino!':res.perfect?'Esse momento é seu!':'Errar também ensina.'}</p>
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
