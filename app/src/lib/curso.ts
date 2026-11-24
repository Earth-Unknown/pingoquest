// Converte o JSON do curso em perguntas jogáveis (mesma regra do jogo: lerCurso)
export type Q={t:'learn'|'mc'|'vf'|'mp'|'cl';q?:string;e?:string;title?:string;text?:string;touch?:string[][];
  o?:string[];a?:any;pairs?:string[][];cats?:string[];items?:[string,number][];cid?:string}
export type Game={title:string;names:string[];phases:Q[][];caso?:string}

export function conv(it:any):Q|null{
  const t=it?.tipo
  if(t==='aprender')return{t:'learn',title:it.titulo,text:it.texto,touch:(it.termos||[]).map((x:any)=>[x.termo,x.definicao])}
  if(!it?.pergunta)return null
  const q:Q={t:'mc',q:it.pergunta,e:it.explicacao||''}
  if(t==='escolha'){q.t='mc';q.o=[it.certa,...(it.erradas||[])];q.a=0}
  else if(t==='verdadeiro_falso'){q.t='vf';q.a=it.resposta}
  else if(t==='ligar'){q.t='mp';q.pairs=(it.pares||[]).map((p:any)=>[p.esquerda,p.direita])}
  else if(t==='classificar'){q.t='cl';q.cats=it.categorias;q.items=(it.itens||[]).map((x:any)=>[x.texto,it.categorias.indexOf(x.categoria)])}
  else return null
  if(it.conceito)q.cid=it.conceito
  return q
}

export function parseCurso(j:any):Game[]{
  const out:Game[]=[]
  for(const p of j.mundos?.[0]?.paradas||[]){
    const g:Game={title:p.titulo,names:[],phases:[],caso:p.chamado}
    ;(p.fases||[]).forEach((f:any,fi:number)=>{
      g.names.push(f.nome||'Fase '+(fi+1))
      g.phases.push((f.itens||[]).map(conv).filter(Boolean) as Q[])
    })
    if(g.phases.length===2){ // mesma regra do jogo: lição 3 = revisão da parada
      const rv=g.phases.flat().filter(x=>x.t!=='learn'),n=Math.min(6,rv.length),pick:Q[]=[]
      for(let i=0;i<n;i++){const c=rv[Math.floor(i*rv.length/n)];if(!pick.includes(c))pick.push(c)}
      g.names.push('Revisão da parada');g.phases.push(pick)
    }
    out.push(g)
  }
  return out
}
export const shuffle=<T,>(a:T[]):T[]=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}

/** Perguntas de uma lição: fases 0-2 ou prova final (k=3: 6 perguntas sorteadas da parada) */
export function lessonQs(g:Game,k:number):Q[]{
  if(k<3)return g.phases[k]
  const all=g.phases.flat().filter((x,i,ar)=>x.t!=='learn'&&ar.indexOf(x)===i)
  return shuffle(all).slice(0,6)
}

/** Perguntas "bate-bola" do curso: usadas nas etapas dos eventos */
export const bateBola=(j:any):Q[]=>(j.bate_bola||[]).map(conv).filter(Boolean) as Q[]
