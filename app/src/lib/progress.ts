// Regras de progresso do jogo (dia, missões, sequência, revisão e conquistas), iguais às do src/jogo.html
import { CURSOS } from './cursos'
import { parseCurso, type Q, type Game } from './curso'

export const ds=(d:Date)=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')
export const today=()=>ds(new Date())
export function dayNum(t:string){const a=t.split('-');return Math.round(Date.UTC(+a[0],+a[1]-1,+a[2])/864e5)}
const maxGap=(S:any)=>{const p=S.plan||7;return p>=7?0:(p>=5?1:2)}
export const streakNow=(S:any)=>(S.last&&dayNum(today())-dayNum(S.last)<=1+maxGap(S))?(S.streak||0):0
export function touchStreak(S:any){
  const t=today();if(S.last===t)return
  const gap=S.last?dayNum(t)-dayNum(S.last):99
  S.streak=gap<=1+maxGap(S)?(S.streak||0)+1:1;S.last=t
  S.hist=S.hist||{};S.hist[t]=1
  if(S.streak>(S.best||0))S.best=S.streak
  if(S.streak>=7&&!S.lupa)S.lupa=true
}
function weekStart(){const d=new Date();d.setDate(d.getDate()-(d.getDay()+6)%7);return ds(d)}
export function wkAdd(S:any,xp:number){const k=weekStart();if(!S.wk||S.wk.k!==k)S.wk={k,xp:0};S.wk.xp+=xp}

/* ---------- dia e missões ---------- */
export type Day={d:string;xp:number;phases:number;correct:number;bestRun:number;perfect:number;pairs:number;cases:number;clean:number;insp:number;claimed:boolean[];chest:boolean;call:boolean}
const blankDay=():Day=>({d:today(),xp:0,phases:0,correct:0,bestRun:0,perfect:0,pairs:0,cases:0,clean:0,insp:0,claimed:[false,false,false],chest:false,call:false})
/** Lê o dia sem gravar (para telas) */
export const dayOf=(S:any):Day=>S.day&&S.day.d===today()?S.day:blankDay()
/** Garante o dia de hoje dentro do save (para gravar) */
export function day(S:any):Day{if(!S.day||S.day.d!==today())S.day=blankDay();return S.day}

export type Mission={t:string;g:number;gem:number;p:(d:Day)=>number}
export const MISSIONS:Mission[]=[
  {t:'Complete 1 fase',g:1,gem:15,p:d=>d.phases},
  {t:'Acerte 5 perguntas seguidas',g:5,gem:15,p:d=>d.bestRun},
  {t:'Termine uma fase sem errar',g:1,gem:25,p:d=>d.perfect},
  {t:'Ganhe 30 de energia',g:30,gem:20,p:d=>d.xp},
  {t:'Resolva 1 pergunta de ligar pares',g:1,gem:15,p:d=>d.pairs},
  {t:'Acerte 10 perguntas',g:10,gem:15,p:d=>d.correct},
  {t:'Complete 2 fases',g:2,gem:20,p:d=>d.phases},
  {t:'Resolva 1 caso de investigação',g:1,gem:25,p:d=>d.cases||0},
  {t:'Resolva um caso sem errar a hipótese',g:1,gem:30,p:d=>d.clean||0},
  {t:'Verifique 4 aparelhos em casos',g:4,gem:20,p:d=>d.insp||0},
]
export function todays(){
  const d=today();let h=0;for(let i=0;i<d.length;i++)h=(h*31+d.charCodeAt(i))%1000003
  const n=MISSIONS.length,o=h%n;return [0,2,4].map(k=>MISSIONS[(o+k)%n])
}
export const GOAL=20
export const CHEST_GEMS=40
export const chestReady=(d:Day)=>!d.chest&&todays().every(m=>m.p(d)>=m.g)
export function claim(S:any,i:number){
  const d=day(S),m=todays()[i]
  if(m&&!d.claimed[i]&&m.p(d)>=m.g){d.claimed[i]=true;S.gems=(S.gems??50)+m.gem}
}
export function openChest(S:any){const d=day(S);if(chestReady(d)){d.chest=true;S.gems=(S.gems??50)+CHEST_GEMS}}

/* ---------- curso ativo e revisão ---------- */
export function cursoAtivo(S:any){return CURSOS.find(c=>c.id===(S.curso||'redes'))||CURSOS[0]}
const gamesCache=new Map<string,Game[]>()
export function gamesOf(id:string){
  let g=gamesCache.get(id)
  if(!g){g=parseCurso((CURSOS.find(c=>c.id===id)||CURSOS[0]).json);gamesCache.set(id,g)}
  return g
}
export function qIndex(id:string){
  const ix:Record<string,Q>={}
  gamesOf(id).forEach(g=>g.phases.forEach(p=>p.forEach(q=>{if(q.t!=='learn'&&q.q)ix[q.q]=q})))
  return ix
}
export function missKeys(S:any){
  const ix=qIndex(S.curso||'redes'),m=S.miss||{}
  return Object.keys(m).filter(k=>ix[k]).sort((a,b)=>m[b]-m[a])
}
export function addMiss(S:any,q:Q){if(!q.q)return;S.miss=S.miss||{};S.miss[q.q]=(S.miss[q.q]||0)+1}
export function fixMiss(S:any,q:Q){if(!q.q||!S.miss?.[q.q])return;S.miss[q.q]--;if(S.miss[q.q]<=0)delete S.miss[q.q]}

/* ---------- conquistas (só reconhecimento, sem prêmio; salvas em S.conq) ---------- */
export type Conq={id:string;nome:string;meta:string;art:string;cor:[string,string];ok:(S:any)=>boolean}
const doneCount=(S:any)=>Object.keys(S.done||{}).length
const games=(S:any)=>gamesOf(S.curso||'redes')
const pfTotal=(S:any)=>games(S).filter(g=>!g.caso).length
const caseIds=(S:any):string[]=>(cursoAtivo(S).json.casos||[]).map((c:any)=>c.id)
const casosFeitos=(S:any)=>caseIds(S).filter(i=>S.casos?.[i]?.n).length
export const CONQ:Conq[]=[
  {id:'primeiro-ping',nome:'Primeiro ping',meta:'Conclua 1 fase',art:'ping',cor:['#19b5e8','#1d7fe0'],ok:S=>doneCount(S)>=1},
  {id:'rota-aberta',nome:'Rota aberta',meta:'Conclua 10 fases',art:'rota',cor:['#2fbf6b','#1f8f4f'],ok:S=>doneCount(S)>=10},
  {id:'primeira-prova',nome:'Primeira prova',meta:'Conclua 1 prova final',art:'estrela',cor:['#ffb700','#e08a00'],ok:S=>(S.bosses||0)>=1},
  {id:'todas-provas',nome:'Todas as provas',meta:'Conclua todas as provas finais',art:'trofeu',cor:['#ffb700','#d4530a'],ok:S=>(S.bosses||0)>=pfTotal(S)},
  {id:'sem-perder-pacote',nome:'Sem perder pacote',meta:'Termine uma fase sem errar',art:'pacote',cor:['#ff8a1f','#d4530a'],ok:S=>(S.perfectN||0)>=1},
  {id:'rede-estavel',nome:'Rede estável',meta:'3 dias seguidos',art:'agenda',cor:['#8a5cf0','#5b3fd0'],ok:S=>(S.best||0)>=3||streakNow(S)>=3},
  {id:'rede-blindada',nome:'Rede blindada',meta:'7 dias seguidos',art:'escudo',cor:['#1d7fe0','#145fb0'],ok:S=>(S.best||0)>=7||streakNow(S)>=7},
  {id:'tecnico-campo',nome:'Técnico de campo',meta:'Resolva 5 casos do dia',art:'chave',cor:['#e0457b','#a82a5a'],ok:S=>casosFeitos(S)>=5},
  {id:'mestre-diagnostico',nome:'Mestre do diagnóstico',meta:'3 estrelas nas 5 habilidades',art:'lupa',cor:['#2fbf6b','#146b3a'],ok:S=>{const ids=caseIds(S);return ids.length>0&&ids.every(i=>(S.casos?.[i]?.best||0)>=3)}},
  {id:'operacao-concluida',nome:'Operação concluída',meta:'Termine um evento',art:'antena',cor:['#19b5e8','#8a5cf0'],ok:S=>!!S.ledger?.['ev:rede-conectada:prize']},
  {id:'trilha-completa',nome:'Trilha completa',meta:'Conclua todas as fases',art:'bandeira',cor:['#ffb700','#2fbf6b'],ok:S=>doneCount(S)>=games(S).length*4},
]
/** Marca em S.conq as conquistas novas; devolve true se mudou algo */
export function cqSync(S:any){
  S.conq=S.conq||{};let ch=false
  CONQ.forEach(c=>{if(!S.conq[c.id]&&c.ok(S)){S.conq[c.id]=1;ch=true}})
  return ch
}
/** Quantos itens pedem atenção na aba Missões (metas para resgatar + baú) */
export function attention(S:any){
  const d=dayOf(S);let n=0
  todays().forEach((m,i)=>{if(!d.claimed[i]&&m.p(d)>=m.g)n++})
  if(chestReady(d))n++
  return n
}

/* ---------- troca de curso: cada curso guarda o próprio progresso; energia, chips e avatar são de todos ---------- */
const COURSE_KEYS=['done','know','xch','casos','bosses','xseen']
const courseDef=():any=>({done:{},know:{},xch:{},casos:{},bosses:0})
export function trocarCurso(S:any,id:string){
  const atual=S.curso||'redes';if(id===atual||!CURSOS.some(c=>c.id===id))return
  S.cursos=S.cursos||{}
  const cur:any={};COURSE_KEYS.forEach(k=>{cur[k]=S[k]});S.cursos[atual]=cur
  const nx=S.cursos[id]||courseDef()
  COURSE_KEYS.forEach(k=>{S[k]=nx[k]!==undefined?nx[k]:courseDef()[k]})
  S.curso=id
}
