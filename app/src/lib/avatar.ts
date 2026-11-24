// Itens do avatar: quais já foram conquistados, equipar e ícones (regras iguais às do src/jogo.html)
import AV from '../legacy/avatar.json'
import { AV_SLOTS, AV_DEF } from './pingo'

const { AVD, AV_COR, AV_OLHOS } = AV as any
export type Item={id:string;nome:string;free?:number;ev?:number;req?:string}
export type Slot={id:string;nome:string;obrig?:number;itens:Item[]}
export const SLOTS:Slot[]=AV_SLOTS

const doneCount=(S:any)=>Object.keys(S.done||{}).length
/** Condição de cada item, lida do texto da meta ("Conclua 5 fases", "Conclua 2 provas finais", "...todas as provas finais") */
function cond(S:any,it:Item,provasTotal:number){
  const r=it.req||''
  if(/todas as provas/i.test(r))return (S.bosses||0)>=provasTotal
  let m=r.match(/(\d+)\s*provas?/i);if(m)return (S.bosses||0)>=+m[1]
  m=r.match(/(\d+)\s*fases?/i);if(m)return doneCount(S)>=+m[1]
  return false
}
const key=(slot:string,id:string)=>slot+':'+id
export function has(S:any,slot:string,it:Item){
  if(it.free)return true
  const own:string[]=S.inv?.items||[]
  return it.ev?own.includes(it.id):own.includes(key(slot,it.id))
}
/** Concede os itens cujas metas já foram cumpridas; devolve true se mudou algo */
export function sync(S:any,provasTotal:number){
  S.inv=S.inv||{items:[],coll:{}};S.inv.items=S.inv.items||[];let ch=false
  SLOTS.forEach(sl=>sl.itens.forEach(it=>{
    if(!it.free&&!it.ev&&cond(S,it,provasTotal)&&!S.inv.items.includes(key(sl.id,it.id))){S.inv.items.push(key(sl.id,it.id));ch=true}}))
  return ch
}
export function equip(S:any,slot:string,id:string){
  const sl=SLOTS.find(x=>x.id===slot),it=sl?.itens.find(i=>i.id===id)
  if(!sl||!it||!has(S,slot,it))return
  S.av=Object.assign({},AV_DEF,S.av||{})
  S.av[slot]=(S.av[slot]===id&&!sl.obrig)?'':id
}
const svg=(vb:string,inner:string)=>'<svg viewBox="'+vb+'" style="--primary:#7b3ff2;--primary-deep:#5a22c4;--cyan:#19e0ff;--gold:#ffd83d" aria-hidden="true">'+inner+'</svg>'
export function icon(slot:string,it:Item){
  if(slot==='cor'){const c=AV_COR[it.id]||AV_COR.padrao
    return '<svg viewBox="0 0 40 40" aria-hidden="true"><rect x="7" y="9" width="26" height="24" rx="9" fill="'+c[1]+'"/><rect x="7" y="6" width="26" height="24" rx="9" fill="'+c[0]+'"/><rect x="11" y="11" width="18" height="12" rx="6" fill="#2a1668"/><circle cx="16" cy="17" r="2" fill="#19e0ff"/><circle cx="24" cy="17" r="2" fill="#19e0ff"/><path d="M12 9q3-2 7-2" stroke="#fff" stroke-width="1.8" stroke-linecap="round" fill="none" opacity=".5"/></svg>'}
  if(slot==='olhos'){const e=AV_OLHOS[it.id]||'#19e0ff'
    return '<svg viewBox="0 0 40 40" aria-hidden="true"><rect x="5" y="9" width="30" height="22" rx="10" fill="#2a1668"/><ellipse cx="14" cy="20" rx="4" ry="5.5" fill="'+e+'"/><ellipse cx="26" cy="20" rx="4" ry="5.5" fill="'+e+'"/><circle cx="12.6" cy="17.8" r="1.4" fill="#fff"/><circle cx="24.6" cy="17.8" r="1.4" fill="#fff"/></svg>'}
  const d=AVD[slot]?.[it.id];return d?svg(d.vb,d.s):''
}
