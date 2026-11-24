// Regras dos casos e chamados (iguais às do src/jogo.html)
import { patchSave } from './save'
import { day, dayOf, today, touchStreak, wkAdd, cqSync, attention } from './progress'

export const WGOAL=5
export function hashStr(t:string){let h=7;for(let i=0;i<t.length;i++)h=(h*31+t.charCodeAt(i))%1000003;return h}
export const casesOf=(json:any):any[]=>json.casos||[]
export const dailyCase=(json:any)=>{const c=casesOf(json);return c.length?c[hashStr(today())%c.length]:null}
export function pickFault(def:any,seed?:string,avoid?:string){
  const fs:any[]=def.faults
  if(seed)return fs[hashStr(seed+def.id)%fs.length]
  let pool=fs.filter(f=>f.id!==avoid);if(!pool.length)pool=fs
  return pool[Math.floor(Math.random()*pool.length)]
}

/** Semana atual (segunda a domingo) do save; zera quando muda a semana */
function weekKey(){const d=new Date();d.setDate(d.getDate()-(d.getDay()+6)%7);return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')}
export function wk(S:any){
  if(!S.week||S.week.k!==weekKey())S.week={k:weekKey(),n:0,claimed:false,days:[]}
  if(!S.week.days)S.week.days=[]
  return S.week
}
export const weekOf=(S:any)=>S.week&&S.week.k===weekKey()?S.week:{k:weekKey(),n:0,claimed:false,days:[]}
export function claimWeek(S:any){
  const w=wk(S)
  if(w.n>=WGOAL&&!w.claimed){w.claimed=true;S.gems=(S.gems??50)+60;S.badges=S.badges||[];S.badges.push(w.k)}
}

export type CaseEnd={kind:'node'|'daily';key?:string;replay?:boolean;wrong:number;id:string;insp:number}
/** Grava o resultado de um caso/chamado e devolve estrelas, energia e chips */
export function finishCase(c:CaseEnd){
  const stars=Math.max(1,3-c.wrong);let xp=3,gems=0
  patchSave(S=>{
    const dy=day(S),rec=S.casos?.[c.id]||((S.casos=S.casos||{})[c.id]={n:0,best:0})
    S.done=S.done||{}
    const firstNode=c.kind==='node'&&!c.replay&&!S.done[c.key!]
    if(c.kind==='daily'){xp=10;gems=20;dy.call=true;const w=wk(S);w.n++;const wd=(new Date().getDay()+6)%7;if(w.days.indexOf(wd)<0)w.days.push(wd)}
    else if(firstNode){xp=15;gems=10+(c.wrong===0?5:0);S.done[c.key!]=true}
    if(c.kind==='daily'||firstNode){dy.phases++;if(c.wrong===0)dy.perfect++}
    dy.cases=(dy.cases||0)+1;if(c.wrong===0)dy.clean=(dy.clean||0)+1
    dy.insp=(dy.insp||0) // aparelhos verificados são contados à medida que são tocados
    rec.n++;if(stars>rec.best)rec.best=stars
    dy.xp+=xp;S.xp=(S.xp||0)+xp;wkAdd(S,xp);S.gems=(S.gems??50)+gems
    touchStreak(S);cqSync(S)
  })
  return{stars,xp,gems}
}
export const countInspect=()=>patchSave(S=>{const d=day(S);d.insp=(d.insp||0)+1})
export const spend=(n:number)=>{let ok=false;patchSave(S=>{if((S.gems??50)>=n){S.gems=(S.gems??50)-n;ok=true}});return ok}
export const hasLupa=()=>{let l=false;patchSave(S=>{l=!!S.lupa});return l}

/** Quantos itens pedem atenção na aba Missões: metas para resgatar, baú, Chamado do dia e selo da semana */
export function attentionAll(S:any){
  const d=dayOf(S);let n=attention(S)
  if(!d.call)n++
  const w=weekOf(S);if(w.n>=WGOAL&&!w.claimed)n++
  return n
}
