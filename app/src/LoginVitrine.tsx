// Vitrine da tela de entrada: o que o Pingo ensina (um curso por vez) e, para quem volta, onde parou em cada curso.
import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from './Fx'
import art from './legacy/art.json'
import { CURSOS } from './lib/cursos'
import { cursosComecados } from './lib/parou'
import { streakNow } from './lib/progress'
import { reducedMotion } from './lib/sound'

const A: any = art
const iconeCurso = (id: string) => id === 'linux'
  ? A.IC_TERM
  : '<svg viewBox="0 0 40 40" aria-hidden="true"><rect x="5" y="21" width="30" height="13" rx="6" fill="#7b3ff2"/><circle cx="12" cy="27.5" r="2" fill="#fff"/><circle cx="19" cy="27.5" r="2" fill="#fff"/><path d="M13 21 10 9M27 21l3-12" stroke="#7b3ff2" stroke-width="3" stroke-linecap="round"/></svg>'

const caixa = { display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 16, border: '2px solid rgba(255,255,255,.18)', background: 'rgba(255,255,255,.07)', textAlign: 'left', width: '100%', boxSizing: 'border-box', color: 'inherit', font: 'inherit' } as const
const Ic = ({ id }: { id: string }) => <span style={{ width: 40, height: 40, flex: 'none', display: 'inline-flex', background: 'rgba(255,255,255,.9)', borderRadius: 12, padding: 5, boxSizing: 'border-box' }} dangerouslySetInnerHTML={{ __html: iconeCurso(id) }} />

/** Um curso por vez, troca sozinho; com "reduzir movimento" mostra todos juntos. Não cresce quando entram mais cursos. */
export function Vitrine() {
  const [i, setI] = useState(0)
  const parado = reducedMotion()
  useEffect(() => {
    if (parado || CURSOS.length < 2) return
    const t = setInterval(() => setI(x => (x + 1) % CURSOS.length), 3400)
    return () => clearInterval(t)
  }, [i, parado])
  const card = (c: typeof CURSOS[number]) => (
    <div style={caixa}><Ic id={c.id} />
      <span><small style={{ display: 'block', fontSize: 11, fontWeight: 800, letterSpacing: 0.8, textTransform: 'uppercase', opacity: 0.7 }}>{c.area}</small>
        <b style={{ display: 'block', fontSize: 17 }}>{c.nome}</b>
        <span style={{ fontSize: 13, fontWeight: 700, opacity: 0.85 }}>{c.apresentacao}</span></span></div>
  )
  if (parado) return <div style={{ display: 'grid', gap: 8, width: '100%', maxWidth: 340 }}>{CURSOS.map(c => <div key={c.id}>{card(c)}</div>)}</div>
  const c = CURSOS[i]
  return (
    <div style={{ width: '100%', maxWidth: 340 }} role="group" aria-label="O que você pode aprender">
      <div style={{ minHeight: 98 }}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={c.id} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.3 }}
            drag="x" dragConstraints={{ left: 0, right: 0 }} dragElastic={0.3}
            onDragEnd={(_, info) => { if (Math.abs(info.offset.x) > 40) setI(x => (x + (info.offset.x < 0 ? 1 : CURSOS.length - 1)) % CURSOS.length) }}>
            {card(c)}
          </motion.div>
        </AnimatePresence>
      </div>
      {CURSOS.length > 1 && <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 8 }}>
        {CURSOS.map((x, k) => <button key={x.id} type="button" aria-label={'Ver ' + x.nome} aria-current={k === i} onClick={() => setI(k)}
          style={{ width: k === i ? 22 : 8, height: 8, borderRadius: 4, border: 0, padding: 0, cursor: 'pointer', background: k === i ? '#ffd83d' : 'rgba(255,255,255,.35)', transition: 'width .2s' }} />)}
      </div>}
    </div>
  )
}

/** Para quem volta: cursos já começados, com a parada onde parou. Tocar abre aquele curso. */
export function OndeParou({ S, onAbrir }: { S: any; onAbrir: (cursoId: string) => void }) {
  const lista = cursosComecados(S)
  const dias = streakNow(S), cur = (S.curio || []).length
  const boas = [dias > 0 ? dias + (dias === 1 ? ' dia' : ' dias') + ' de brilho' : '', cur > 0 ? cur + (cur === 1 ? ' curiosidade guardada' : ' curiosidades guardadas') : ''].filter(Boolean)
  return (
    <div style={{ width: '100%', maxWidth: 340 }}>
      <p style={{ margin: '0 0 8px', textAlign: 'center', fontSize: 12, fontWeight: 800, letterSpacing: 0.8, textTransform: 'uppercase', opacity: 0.75 }}>Onde você parou</p>
      <div style={{ display: 'grid', gap: 8 }}>
        {lista.map((c, k) => (
          <motion.button type="button" key={c.id} onClick={() => onAbrir(c.id)} style={{ ...caixa, cursor: 'pointer' }}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: reducedMotion() ? 0 : 0.35 + k * 0.12, duration: 0.3 }}>
            <Ic id={c.id} />
            <span style={{ flex: 1, minWidth: 0 }}>
              <b style={{ display: 'block', fontSize: 16 }}>{c.nome}</b>
              <span style={{ display: 'block', fontSize: 12.5, fontWeight: 700, opacity: 0.85 }}>{c.onde}</span>
              <span aria-hidden="true" style={{ display: 'block', height: 6, borderRadius: 3, background: 'rgba(255,255,255,.18)', marginTop: 6 }}>
                <i style={{ display: 'block', height: '100%', width: Math.max(4, c.pct) + '%', borderRadius: 3, background: '#ffd83d' }} /></span>
            </span>
            <small style={{ fontWeight: 800 }} aria-label={c.pct + ' por cento'}>{c.pct}%</small>
          </motion.button>
        ))}
      </div>
      {boas.length > 0 && <p style={{ margin: '10px 0 0', textAlign: 'center', fontSize: 13, fontWeight: 800, opacity: 0.9 }}>{boas.join(' · ')}</p>}
    </div>
  )
}
