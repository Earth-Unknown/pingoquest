import { KEY } from './store'
/** Lê o save mais recente, aplica a mudança e grava (não apaga o que o jogo gravou). */
export function patchSave(fn:(S:any)=>void){
  let S:any={}
  try{S=JSON.parse(localStorage.getItem(KEY)||'{}')||{}}catch{}
  fn(S)
  try{localStorage.setItem(KEY,JSON.stringify(S))}catch{}
  return S
}
