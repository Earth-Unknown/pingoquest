// Modo Estudo: o que revisar, praticar por capítulo, glossário dos termos já vistos e as curiosidades do Pingo.
import { useMemo, useState } from 'react'
import { Pingo } from './Pingo'
import { Lesson } from './Lesson'
import { Album } from './Album'
import { missKeys, qIndex, gamesOf } from './lib/progress'
import { shuffle, type Q } from './lib/curso'

type Jogo = { kind: 'review' | 'estudo'; qs: Q[] }

export function Estudo({ S, refresh }: { S: any; refresh: () => void }) {
  const curso = S.curso || 'redes'
  const games = gamesOf(curso)
  const feitas: Record<string, boolean> = S.done || {}
  const [play, setPlay] = useState<Jogo | null>(null)
  const [busca, setBusca] = useState('')
  const [todos, setTodos] = useState(false)

  const keys = missKeys(S), n = keys.length
  const capitulos = games.map((g, gi) => ({ gi, titulo: g.title, ks: [0, 1, 2].filter(k => feitas[gi + '-' + k]) })).filter(x => x.ks.length > 0)
  const perguntasDe = (gi: number, ks: number[]) => shuffle(ks.flatMap(k => games[gi].phases[k] || []).filter(q => q.t !== 'learn')).slice(0, 6)
  const termos = useMemo(() => {
    const m = new Map<string, string>()
    capitulos.forEach(c => c.ks.forEach(k => (games[c.gi].phases[k] || []).filter(q => q.t === 'learn').forEach(q => (q.touch || []).forEach(([t, d]) => { if (!m.has(t)) m.set(t, d) }))))
    return [...m.entries()].sort((a, b) => a[0].localeCompare(b[0], 'pt-BR'))
  }, [capitulos.map(c => c.gi + ':' + c.ks.join('')).join('|'), curso]) // eslint-disable-line react-hooks/exhaustive-deps
  const filtrados = termos.filter(([t, d]) => !busca.trim() || (t + ' ' + d).toLowerCase().includes(busca.trim().toLowerCase()))
  const mostra = todos || busca.trim() ? filtrados : filtrados.slice(0, 8)

  const revisar = () => { const ix = qIndex(curso); setPlay({ kind: 'review', qs: keys.slice(0, 6).map(k => ix[k]) }) }
  const praticarTudo = () => {
    const pool = capitulos.flatMap(c => c.ks.flatMap(k => games[c.gi].phases[k] || [])).filter(q => q.t !== 'learn')
    if (pool.length) setPlay({ kind: 'estudo', qs: shuffle(pool).slice(0, 6) })
  }

  return <div className="screen">
    <div className="ph"><Pingo S={S} /><div><h1>Modo Estudo</h1><p>Revise, pratique e consulte o que já aprendeu.</p></div></div>

    <div className="sect">Para revisar</div>
    {n > 0 ? <>
      <p className="note" style={{ margin: '0 0 8px' }}>{n} {n === 1 ? 'pergunta' : 'perguntas'} que você errou esperando uma segunda chance. Na revisão você não perde vidas.</p>
      <button className="btn prim" onClick={revisar}>Revisar agora (+8 energia)</button>
    </> : <>
      <p className="note" style={{ margin: '0 0 8px' }}>{capitulos.length ? 'Nada pendente: você acertou tudo que já viu. Que tal praticar do mesmo jeito?' : 'Conclua uma lição na Trilha e o que você precisar reforçar aparece aqui.'}</p>
      {capitulos.length > 0 && <button className="btn ghost" onClick={praticarTudo}>Praticar tudo que já vi</button>}
    </>}

    <div className="sect">Praticar por capítulo</div>
    {capitulos.length === 0 ? <p className="note" style={{ margin: 0 }}>Os capítulos que você já começou aparecem aqui, cada um com um treino de 6 perguntas.</p>
      : <div style={{ display: 'grid', gap: 8 }}>{capitulos.map(c => <div key={c.gi} style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--locked,#f1ecff)', borderRadius: 16, padding: '10px 12px' }}>
        <span style={{ flex: 1, minWidth: 0 }}><small style={{ display: 'block', color: 'var(--muted)', fontWeight: 800 }}>Capítulo {c.gi + 1} · {c.ks.length} de 3 lições</small><b>{c.titulo}</b></span>
        <button type="button" className="btn ghost" style={{ width: 'auto', padding: '6px 16px', minHeight: 0 }} onClick={() => setPlay({ kind: 'estudo', qs: perguntasDe(c.gi, c.ks) })}>Praticar</button></div>)}</div>}

    <div className="sect">Glossário</div>
    {termos.length === 0 ? <p className="note" style={{ margin: 0 }}>Os termos das lições que você concluir ficam guardados aqui, em ordem alfabética.</p> : <>
      <input type="search" value={busca} onChange={e => setBusca(e.target.value)} placeholder="Buscar um termo" aria-label="Buscar no glossário"
        style={{ width: '100%', padding: 12, borderRadius: 12, border: '2px solid var(--line-deep)', font: 'inherit', marginBottom: 8, boxSizing: 'border-box', background: 'var(--surface)', color: 'var(--ink)' }} />
      <div style={{ display: 'grid', gap: 6 }}>{mostra.map(([t, d]) => <div key={t} style={{ background: 'var(--locked,#f1ecff)', borderRadius: 14, padding: '8px 12px' }}><b style={{ color: 'var(--primary)' }}>{t}</b><br />{d}</div>)}
        {mostra.length === 0 && <p className="note" style={{ margin: 0 }}>Nenhum termo encontrado.</p>}</div>
      {!busca.trim() && filtrados.length > 8 && <button className="btn ghost" style={{ marginTop: 8 }} onClick={() => setTodos(!todos)}>{todos ? 'Mostrar menos' : `Ver todos os ${filtrados.length} termos`}</button>}
    </>}

    <Album S={S} />

    {play && <Lesson S={S} qs={play.qs} kind={play.kind} keyId={play.kind === 'review' ? 'r' : 'e'} onClose={() => { setPlay(null); refresh() }} />}
  </div>
}
