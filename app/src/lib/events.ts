// Eventos temporários (regras iguais às do src/jogo.html): 1 etapa por dia, peças, prêmio uma única vez (S.ledger)
import { today, dayNum, day, touchStreak, wkAdd, cqSync } from './progress'
import { bateBola, shuffle, type Q } from './curso'

export const addDays=(d:string,n:number)=>{const a=d.split('-'),t=new Date(Date.UTC(+a[0],+a[1]-1,+a[2]+n));return t.toISOString().slice(0,10)}
export const fmtD=(d:string)=>d.slice(8,10)+'/'+d.slice(5,7)

/** hoje, sem voltar no tempo: mudar o relógio para trás não reabre dias */
export function evToday(S:any){const d=today();return S.maxDay&&d<S.maxDay?S.maxDay:d}
export const eventosOf=(json:any):any[]=>(json.eventos||[]).filter((e:any)=>e.enabled)

export function evInfo(S:any,ev:any){
  const t=evToday(S),w={start:ev.start,end:ev.end},P=S.ev?.[ev.id]||{steps:{}},total=ev.steps.length,done=Object.keys(P.steps).length
  const doneToday=Object.keys(P.steps).some(k=>P.steps[k].day===t)
  const phase=t<w.start?'soon':(t>w.end?'ended':'open')
  const left=dayNum(w.end)-dayNum(t)+1,toStart=dayNum(w.start)-dayNum(t)
  const remaining=total-done,avail=left-(doneToday?1:0),viable=avail>=remaining,completed=done===total
  const next=ev.steps.find((st:any)=>!P.steps[st.id])||null
  const late=phase==='open'&&!completed&&done===0&&!viable
  const canStart=phase==='open'&&!completed&&!doneToday&&!!next&&!late
  return{t,w,P,total,done,doneToday,phase,left,toStart,viable,completed,next,late,canStart,pieces:P.pieces||0,fresh:P.fresh||0}
}
export const evVisible=(S:any,ev:any)=>{const i=evInfo(S,ev);return i.phase==='open'||(i.phase==='soon'&&i.toStart<=7)}
export const evList=(S:any,json:any)=>eventosOf(json).filter(e=>evVisible(S,e))

/* ---- conhecimento: um assunto conta como "visto" quando a fase dele foi concluída ---- */
function conceitos(json:any){
  const cur:Record<string,{pre:string[]}>={},fase:Record<string,string[]>={}
  ;(json.mundos?.[0]?.paradas||[]).forEach((p:any,gi:number)=>(p.fases||[]).forEach((f:any,fi:number)=>{
    fase[gi+'-'+fi]=(f.conceitos||[]).map((k:any)=>{cur[k.id]={pre:k.antes||[]};return k.id})}))
  Object.keys(cur).forEach(id=>{cur[id].pre=cur[id].pre.filter(x=>!!cur[x])})
  return{cur,fase}
}
export function seenSet(S:any,json:any){
  const {cur,fase}=conceitos(json),seen=new Set<string>()
  Object.keys(S.know||{}).forEach(c=>{if(S.know[c]?.seen)seen.add(c)})
  Object.keys(S.done||{}).forEach(k=>(fase[k]||[]).forEach(c=>seen.add(c)))
  return{cur,seen}
}
export function evPool(S:any,json:any){
  const {cur,seen}=seenSet(S,json)
  return bateBola(json).filter(q=>{const d=q.cid?cur[q.cid]:null;return !!d&&seen.has(q.cid!)&&d.pre.every(p=>seen.has(p))})
}
export function masteryOf(S:any,c:string){
  const k=S.know?.[c];if(!k||!k.seen)return 'novo';const n=(k.ok||0)+(k.bad||0);if(n<3)return 'aprendendo'
  const a=k.ok/n;if(a>=.85&&k.ok>=6)return 'dominado';return a<.65?'fragil':'aprendendo'
}
/** Sorteia as perguntas da etapa: só assuntos vistos, mais atenção ao que está frágil, variando assunto e formato */
export function evPick(S:any,json:any,ev:any):Q[]|{need:number;have:number}{
  const used:string[]=S.ev?.[ev.id]?.used||[],n=ev.qPerStep
  let pool=evPool(S,json)
  const fresh=pool.filter(q=>!used.includes(q.q!));if(fresh.length>=n)pool=fresh
  if(pool.length<n)return{need:n,have:pool.length}
  const W:Record<string,number>={fragil:3,aprendendo:2,novo:2,dominado:1}
  const sc=pool.map(q=>({q,s:(W[masteryOf(S,q.cid!)]||1)+Math.random()*2})).sort((a,b)=>b.s-a.s).map(x=>x.q)
  const out:Q[]=[],cnt:Record<string,number>={},ty:Record<string,number>={}
  ;[[1,1],[2,2],[2,9],[9,9]].forEach(lim=>sc.forEach(q=>{
    if(out.length>=n||out.includes(q))return
    if((cnt[q.cid!]||0)<lim[0]&&(ty[q.t]||0)<lim[1]){out.push(q);cnt[q.cid!]=(cnt[q.cid!]||0)+1;ty[q.t]=(ty[q.t]||0)+1}}))
  return shuffle(out)
}
/** Etapa com chamado: só libera quando a parada daquele chamado foi destravada na trilha */
export function evChamado(S:any,json:any,st:any){
  const par:any[]=json.mundos?.[0]?.paradas||[],gi=par.findIndex(p=>p.chamado===st.chamado)
  if(gi<0)return{ok:false,nome:'',gi}
  return{ok:!!S.done?.[gi+'-2'],nome:par[gi].lugar||par[gi].titulo,gi}
}
/** Marca as perguntas usadas (para não repetir logo em seguida) */
export function evUse(S:any,ev:any,qs:Q[]){
  S.ev=S.ev||{};const P=S.ev[ev.id]||(S.ev[ev.id]={steps:{},used:[],pieces:0})
  P.used=(P.used||[]).concat(qs.map(q=>q.q!)).slice(-80)
}

export type EvRes={pass:boolean;xp:number;got:{pieces:number;gems:number}|null;full:boolean;title:string;sub:string;correct:number}
/** Resolve uma etapa (dentro do patchSave): peças, chips, prêmio final e energia — nunca paga duas vezes */
export function evSettle(S:any,ev:any,st:any,pass:boolean,sub:string,correct:number):EvRes{
  S.ev=S.ev||{};S.ledger=S.ledger||{};S.inv=S.inv||{items:[],coll:{}};S.inv.items=S.inv.items||[];S.inv.coll=S.inv.coll||{}
  const P=S.ev[ev.id]||(S.ev[ev.id]={steps:{},used:[],pieces:0}),info=evInfo(S,ev)
  let got:EvRes['got']=null,full=false
  if(pass&&info.canStart&&!P.steps[st.id]){
    P.steps[st.id]={day:info.t,c:correct}
    const k='ev:'+ev.id+':'+st.id
    if(!S.ledger[k]){S.ledger[k]=1;P.pieces=(P.pieces||0)+st.pieces;P.fresh=st.pieces;S.gems=(S.gems??50)+st.gems;got={pieces:st.pieces,gems:st.gems}}
    if(Object.keys(P.steps).length===ev.steps.length){
      P.status='completed';const kp='ev:'+ev.id+':prize'
      if(!S.ledger[kp]){S.ledger[kp]=1;S.inv.items.push(ev.prize.id);S.inv.coll[ev.equipment]=1;S.gems=(S.gems??50)+(ev.prize.gems||0);full=true}
    }
  }
  const xp=(pass&&got)?15:5,dy=day(S);dy.xp+=xp;S.xp=(S.xp||0)+xp;wkAdd(S,xp);touchStreak(S);cqSync(S)
  S.maxDay=info.t
  return{pass,xp,got,full,correct,sub,title:full?ev.equipName+' montado!':(pass?'Etapa concluída!':'Quase lá!')}
}
