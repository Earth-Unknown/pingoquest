// Duelo: perguntas sorteadas por semente (mesma semente = mesmas perguntas), contra a máquina ou um amigo por link
import type { Game } from './curso'
export const DU_N=7
export const DU_LV:[string,string,boolean][]=[['ini','Iniciante',true],['int','Intermediário',false],['ava','Avançado',false]]
export function rng(seed:number){let a=seed>>>0;return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function sshuf<T>(arr:T[],r:()=>number){arr=arr.slice();for(let i=arr.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[arr[i],arr[j]]=[arr[j],arr[i]]}return arr}
export type DQ={t:'mc'|'vf';q:string;opts:{t:string;c:boolean}[];e:string}
export function duelQs(g:Game,seed:number,n:number):DQ[]{
  const seen=new Set<string>(),pool:any[]=[]
  g.phases.forEach(ph=>ph.forEach(q=>{if((q.t==='mc'||q.t==='vf')&&!seen.has(q.q!)){seen.add(q.q!);pool.push(q)}}))
  const r=rng(seed),idx=sshuf(pool.map((_,i)=>i),r).slice(0,Math.min(n,pool.length))
  return idx.map(i=>{const q=pool[i]
    if(q.t==='vf')return{t:'vf' as const,q:q.q,opts:[{t:'Verdadeiro',c:q.a===true},{t:'Falso',c:q.a===false}],e:q.e||''}
    return{t:'mc' as const,q:q.q,opts:sshuf<{t:string;c:boolean}>(q.o.map((t:string,k:number)=>({t,c:k===q.a})),r),e:q.e||''}})
}
export const b64e=(o:any)=>btoa(unescape(encodeURIComponent(JSON.stringify(o)))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'')
export function b64d(t:string){try{t=t.replace(/-/g,'+').replace(/_/g,'/');while(t.length%4)t+='=';return JSON.parse(decodeURIComponent(escape(atob(t))))}catch{return null}}
export const duelScore=(a:number[],upto?:number)=>a.slice(0,upto==null?a.length:upto).reduce((n,x)=>n+(x?1:0),0)
/** Desafio recebido por link (#duelo=...) */
export function pendingDuel(){try{const m=location.hash.match(/duelo=([A-Za-z0-9_-]+)/);const d=m?b64d(m[1]):null;return d&&d.g!=null&&d.s&&d.r?d:null}catch{return null}}
export function botRun(seed:number,n:number){const r=rng(seed^0x9e3779b9);return Array.from({length:n},()=>r()<0.62?1:0)}
