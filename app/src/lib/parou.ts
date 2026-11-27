// Onde a pessoa parou em cada curso (usado na tela de entrada para quem volta)
import { CURSOS, done, pct, unidade } from './cursos'

export type Parou = { id: string; nome: string; area: string; pct: number; onde: string; ativo: boolean }

/** Primeira lição ou prova ainda não feita do curso, em texto: "Parada 2 · Casa do Pingo, lição 1" */
function proxima(S: any, id: string): string {
  const c = CURSOS.find(x => x.id === id)
  if (!c) return ''
  const feitas = new Set(done(S, id))
  const ps: any[] = c.json.mundos?.[0]?.paradas || []
  for (let g = 0; g < ps.length; g++) {
    for (let k = 0; k < 4; k++) {
      if (!feitas.has(g + '-' + k)) return `${unidade(id).n} ${g + 1} · ${ps[g].lugar || ps[g].titulo}, ${k < 3 ? 'lição ' + (k + 1) : 'prova final'}`
    }
  }
  return 'Curso concluído'
}

/** Cursos que a pessoa já começou, o ativo primeiro */
export function cursosComecados(S: any): Parou[] {
  const ativo = S.curso || 'redes'
  return CURSOS.filter(c => done(S, c.id).length > 0)
    .map(c => ({ id: c.id, nome: c.nome, area: c.area, pct: pct(S, c), onde: proxima(S, c.id), ativo: c.id === ativo }))
    .sort((a, b) => Number(b.ativo) - Number(a.ativo))
}
