// Amigos e Presentes (prévia: amigos de mentira até termos contas online). Regras iguais às do src/jogo.html.
// GiftAPI é a única parte a trocar pelo Supabase (ver docs/supabase-presentes.md).
import { SLOTS } from './avatar'
import { streakNow, ds } from './progress'

export function hash32(t:string){let h=2166136261;for(let i=0;i<t.length;i++){h^=t.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0}
export const FR_BASE=[{n:'Pedro',r:30,b:60},{n:'Giovanna',r:25,b:2},{n:'Vitor',r:19,b:5},{n:'Heloísa',r:16,b:6},{n:'Clara',r:9,b:1}]
const weekKey=()=>{const d=new Date();d.setDate(d.getDate()-(d.getDay()+6)%7);return ds(d)}
export const wkNow=(S:any)=>S.wk&&S.wk.k===weekKey()?S.wk.xp:0
const frXp=(f:{n:string;r:number})=>{const dow=((new Date().getDay()+6)%7)+1,r=(hash32(f.n+weekKey())%41)/100;return Math.round(f.r*dow*(0.8+r))}
export type Row={n:string;xp:number;b:number;me:boolean}
export function rankList(S:any):Row[]{
  const list:Row[]=(S.fr||[]).map((f:any)=>({n:f.n,xp:frXp(f),b:f.b,me:false}))
  list.push({n:S.nick||'Você',xp:wkNow(S),b:streakNow(S),me:true})
  return list.sort((a,b)=>b.xp-a.xp)
}
export function myCode(S:any){
  if(!S.code){const a='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';let c='';for(let i=0;i<6;i++)c+=a[Math.floor(Math.random()*a.length)];S.code=c}
  return S.code as string
}
export function addFriend(S:any,nm:string){
  nm=nm.trim().slice(0,14);if(!nm)return false
  S.fr=S.fr||[]
  if(!S.fr.some((f:any)=>f.n.toLowerCase()===nm.toLowerCase()))S.fr.push({n:nm,r:10+hash32(nm)%20,b:1+hash32(nm+'b')%9})
  return true
}
export const demoFriends=(S:any)=>{S.fr=FR_BASE.map(f=>({n:f.n,r:f.r,b:f.b}));if(!giftsS(S).inbox.length)GiftAPI.mockIncoming(S,'Giovanna')}
export const clearFriends=(S:any)=>{S.fr=[]}

/* ---------- presentes ---------- */
export const GIFT_OPTS:Record<string,number[]>={energia:[10,25,50],chips:[10,20,50]}
export const GIFT_MSGS=['Boa sorte!','Você consegue!','Presente pra você!']
export function giftsS(S:any){S.gifts=S.gifts||{sent:[],inbox:[]};S.gifts.sent=S.gifts.sent||[];S.gifts.inbox=S.gifts.inbox||[];return S.gifts as {sent:any[];inbox:any[]}}
export const pendGifts=(S:any)=>giftsS(S).inbox.filter(x=>!x.opened).length
/** Só itens de evento podem ser dados (os de progresso voltam sozinhos e seriam duplicados) */
export function giftItems(S:any){
  const out:{slot:string;id:string;nome:string}[]=[],own:string[]=S.inv?.items||[]
  SLOTS.forEach(sl=>sl.itens.forEach(it=>{if(it.ev&&own.includes(it.id))out.push({slot:sl.id,id:it.id,nome:it.nome})}))
  return out
}
export function giftItemName(id:string){let n=id;SLOTS.forEach(sl=>sl.itens.forEach(it=>{if(it.id===id)n=it.nome}));return n}
const giftId=()=>'g'+Date.now().toString(36)+Math.random().toString(36).slice(2,6)
export const giftDesc=(g:any)=>g.type==='item'?giftItemName(g.item):(g.amount+(g.type==='chips'?' chips':' de energia'))
export type GiftIn={type:string;amount:number;item:string;msg:string}
export const GiftAPI={
  /** Energia e chips saem do saldo de quem dá; o item sai do inventário */
  send(S:any,to:string,g:GiftIn):{ok:true;gift:any}|{ok:false;err:string}{
    const G=giftsS(S),amt=+g.amount||0;S.inv=S.inv||{items:[],coll:{}}
    if(g.type==='energia'){if(!GIFT_OPTS.energia.includes(amt)||(S.xp||0)<amt)return{ok:false,err:'Energia insuficiente.'};S.xp-=amt}
    else if(g.type==='chips'){if(!GIFT_OPTS.chips.includes(amt)||(S.gems??50)<amt)return{ok:false,err:'Chips insuficientes.'};S.gems=(S.gems??50)-amt}
    else if(g.type==='item'){const ix=(S.inv.items||[]).indexOf(g.item);if(ix<0||!giftItems(S).some(x=>x.id===g.item))return{ok:false,err:'Esse item não pode ser dado.'};S.inv.items.splice(ix,1)}
    else return{ok:false,err:'Presente inválido.'}
    const gift={id:giftId(),to,from:S.nick||'Você',type:g.type,amount:amt,item:g.item||'',msg:g.msg||'',at:Date.now()}
    G.sent.push(gift);return{ok:true,gift}
  },
  claim(S:any,id:string):{ok:true;gift:any;extra:number}|{ok:false}{
    const G=giftsS(S),g=G.inbox.find(x=>x.id===id);if(!g||g.opened)return{ok:false}
    S.inv=S.inv||{items:[],coll:{}};let extra=0
    if(g.type==='energia')S.xp=(S.xp||0)+g.amount
    else if(g.type==='chips')S.gems=(S.gems??50)+g.amount
    else if(g.type==='item'){if((S.inv.items||[]).includes(g.item)){S.gems=(S.gems??50)+20;extra=20}else S.inv.items.push(g.item)}
    g.opened=true;return{ok:true,gift:g,extra}
  },
  /** só para a prévia: simula um presente chegando de um amigo de mentira */
  mockIncoming(S:any,from:string){giftsS(S).inbox.push({id:giftId(),from,type:'chips',amount:20,item:'',msg:'Boa sorte!',at:Date.now()})},
}
/** Código de convite vindo do link (#convite=XXXXXX) */
export const inviteFromHash=()=>{try{const m=location.hash.match(/convite=([A-Z0-9]{4,8})/);return m?m[1]:null}catch{return null}}
