import redes from '@content/redes.json'
import linux from '@content/linux.json'
export type Curso={id:string;nome:string;sub:string;json:any}
export const CURSOS:Curso[]=[
  {id:'redes',nome:'Redes de Computadores',sub:'Do básico à rede da sua casa',json:redes},
  {id:'linux',nome:'Terminal Linux',sub:'Comandos, arquivos e permissões',json:linux},
]
export const totalFases=(j:any)=>(j.mundos?.[0]?.paradas||[]).length*4
/** Progresso do curso: o curso ativo usa S.done; os outros ficam em S.cursos[id].done */
export function done(S:any,id:string){
  const ativo=S.curso||'redes'
  const d=id===ativo?S.done:(S.cursos?.[id]?.done)
  return Object.keys(d||{})
}
export function pct(S:any,c:Curso){const t=totalFases(c.json);return t?Math.round(done(S,c.id).length/t*100):0}
