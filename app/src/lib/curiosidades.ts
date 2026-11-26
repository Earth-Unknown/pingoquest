// Curiosidades do Pingo: 3 por parada (campo "curiosidades" do curso). Libera por progresso e conta só as novas primeiro.
import { CURSOS } from './cursos'
import { load } from './store'
import { patchSave } from './save'

export type Curio = { key: string; g: number; i: number; texto: string; lugar: string; novo: boolean }

const paradasDe = (curso: string): any[] => (CURSOS.find(c => c.id === curso) || CURSOS[0]).json.mundos?.[0]?.paradas || []

/** Parada em que o aluno está: a primeira com alguma lição/prova ainda não feita (ou a última, se terminou tudo) */
export function paradaAtual(S: any, curso: string): number {
  const ps = paradasDe(curso), feitas = S.done || {}
  for (let g = 0; g < ps.length; g++) for (let k = 0; k < 4; k++) if (!feitas[g + '-' + k]) return g
  return Math.max(0, ps.length - 1)
}

/** Todas as curiosidades já liberadas (paradas até a atual), na ordem da trilha */
export function liberadas(S: any, curso: string): Curio[] {
  const ps = paradasDe(curso), vistas: string[] = S.curio || [], ate = paradaAtual(S, curso)
  return ps.slice(0, ate + 1).flatMap((p, g) => ((p.curiosidades || []) as string[]).map((texto, i) => {
    const key = curso + ':' + g + ':' + i
    return { key, g, i, texto, lugar: p.lugar as string, novo: !vistas.includes(key) }
  }))
}

/** Escolhe a curiosidade da vez: novas primeiro (as da parada atual antes das antigas); acabou, repete uma já vista */
export function sortear(S: any, curso: string): Curio | null {
  const todas = liberadas(S, curso)
  if (!todas.length) return null
  const novas = todas.filter(c => c.novo)
  if (novas.length) { const ate = paradaAtual(S, curso); return novas.find(c => c.g === ate) || novas[0] }
  return todas[Math.floor(Math.random() * todas.length)]
}

export function marcarVista(key: string) {
  if (!(load().curio || []).includes(key)) patchSave(s => { s.curio = s.curio || []; if (!s.curio.includes(key)) s.curio.push(key) })
}

export function totais(curso: string) { return paradasDe(curso).reduce((n, p) => n + ((p.curiosidades || []) as string[]).length, 0) }
