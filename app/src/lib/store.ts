export const KEY='pingoquest-v3'
export type Save=Record<string,any>
export function load():Save{
  try{const s=JSON.parse(localStorage.getItem(KEY)||'null');if(s&&typeof s==='object')return s}catch{}
  return {}
}
export const num=(v:any)=>typeof v==='number'?v:0
export function dayNum(d:string){return Math.floor(new Date(d+'T00:00:00').getTime()/864e5)}
