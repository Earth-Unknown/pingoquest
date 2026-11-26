// Modo dono (React): pré-visualiza as cenas de conclusão sem precisar jogar as lições. Não grava progresso.
import { useState } from 'react'
import { CenaConclusao } from './conclusao/CenaConclusao'
import { ESTACAO_PINGO } from './conclusao/contrato'
import { gamesOf } from './lib/progress'
import { CURSOS } from './lib/cursos'
import { SLOTS, icon as avIcon } from './lib/avatar'
import { resumoDe } from './Trail'
import { isDono, entrarDono, sairDono } from './lib/dono'

export function ModoDono({ S, aberto, onFechar }: { S: any; aberto: boolean; onFechar: () => void }) {
  const [on, setOn] = useState(isDono())
  const [erro, setErro] = useState('')
  const [parada, setParada] = useState(0)
  const [k, setK] = useState(0)
  const [rep, setRep] = useState(false)
  const [novo, setNovo] = useState(true)
  const [ver, setVer] = useState(false)
  const [rodada, setRodada] = useState(0)
  const id = S.curso || 'redes'
  const cur = CURSOS.find(c => c.id === id) || CURSOS[0]
  const par: any[] = cur.json.mundos?.[0]?.paradas || []
  const games = gamesOf(id)

  if (!on) {
    if (!aberto) return null
    return <><div className="sect" style={{ marginTop: 14 }}>Modo dono</div>
      <input id="admcode" type="password" autoComplete="off" placeholder="Código" aria-label="Código do modo dono"
        style={{ width: '100%', padding: 12, borderRadius: 12, border: '2px solid var(--line-deep)', font: 'inherit', marginBottom: 8, boxSizing: 'border-box' }} />
      <button className="btn ghost" style={{ marginBottom: 10 }} onClick={async () => {
        const v = (document.getElementById('admcode') as HTMLInputElement)?.value || ''
        if (await entrarDono(v)) { setOn(true); setErro('') } else setErro('Código incorreto.')
      }}>Entrar</button>
      {erro && <p className="note" role="alert">{erro}</p>}
      <button className="btn ghost" onClick={onFechar}>Cancelar</button></>
  }

  const item = SLOTS.find(s => s.id === 'cabeca')?.itens.find(i => i.id === 'laco')
  const props = () => {
    const r = resumoDe(par, games, parada, k)
    const learn = (games[parada]?.phases[k] || []).filter(q => q.t === 'learn').flatMap(q => (q.touch || []) as [string, string][])
    const boss = k === 3
    return {
      S, invencao: ESTACAO_PINGO, indice: k, repeticao: rep,
      titulo: rep ? 'Estação conferida!' : r.sabe ? (boss ? 'Agora você domina!' : 'Agora você sabe!') : 'Mais uma descoberta!',
      subtitulo: rep ? 'Você já tinha essa peça. Bom reforço!' : undefined,
      xp: boss ? 25 : 10, chips: rep ? 0 : boss ? 30 : 15, acertos: 100,
      sabe: r.sabe, pratica: r.pratica, proxima: r.proxima, aprendi: learn,
      novos: !rep && novo && item ? [{ slot: 'cabeca', id: 'laco', nome: item.nome, icone: avIcon('cabeca', item) }] : undefined,
      fim: boss && !rep && r.fim ? { ...r.fim, vidasCheias: novo } : undefined,
      onContinuar: () => setVer(false),
    }
  }

  if (ver) return <CenaConclusao key={rodada} {...props()} />

  const sel = { width: '100%', padding: 10, borderRadius: 12, border: '2px solid var(--line-deep)', font: 'inherit', marginBottom: 8, background: 'var(--surface)', color: 'var(--ink)' } as const
  return <><div className="sect" style={{ marginTop: 14 }}>Modo dono</div>
    <p className="note" style={{ margin: '0 0 8px' }}>Veja as cenas de conclusão sem jogar. Nada é gravado no seu progresso.</p>
    <select aria-label="Parada" style={sel} value={parada} onChange={e => setParada(+e.target.value)}>
      {par.map((p, i) => <option key={i} value={i}>Parada {i + 1}: {p.lugar}</option>)}</select>
    <select aria-label="Lição" style={sel} value={k} onChange={e => setK(+e.target.value)}>
      {[0, 1, 2, 3].map(i => <option key={i} value={i}>{i < 3 ? 'Lição ' + (i + 1) : 'Prova final (mostra o fim de parada)'}</option>)}</select>
    <label style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6, fontWeight: 700 }}><input type="checkbox" checked={rep} onChange={e => setRep(e.target.checked)} />Já tinha feito (repetição)</label>
    <label style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 10, fontWeight: 700 }}><input type="checkbox" checked={novo} onChange={e => setNovo(e.target.checked)} />Simular item novo e vidas cheias</label>
    <button className="btn" style={{ marginBottom: 10 }} onClick={() => { setRodada(r => r + 1); setVer(true) }}>Ver a cena</button>
    <button className="btn ghost" style={{ marginBottom: 10 }} onClick={() => { sairDono(); setOn(false); onFechar() }}>Sair do modo dono</button></>
}
