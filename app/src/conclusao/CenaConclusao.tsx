// Cena "Pingo descobriu!": o Pingo encaixa uma peça na Estação. 100% visual: nada é gravado aqui.
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { Pingo } from '../Pingo'
import { enter } from '../Fx'
import { sfx } from '../lib/sound'
import art from '../legacy/art.json'
import { Invencao, PecaSolta, ENCAIXES, PROPORCAO } from './Invencao'
import type { ConclusaoProps } from './contrato'

/* Fases: 0 observa · 1 peça surge · 2 peça voa · 3 encaixa (módulo acende) · 4 título · 5 recompensas (final) */
const FINAL = 5
const LINHA_NOVA: [number, number][] = [[500, 1], [1000, 2], [1550, 3], [1850, 4], [2100, 5]]
const LINHA_REP: [number, number][] = [[400, 3], [750, 4], [950, 5]]

const css = `.cc-pingo svg{width:clamp(72px,13vh,104px)!important;display:block}
.cc-ic{display:inline-flex;width:20px;height:20px}.cc-ic svg{width:100%;height:100%;display:block}`

export function CenaConclusao(p: ConclusaoProps) {
  const reduzido = !!useReducedMotion()
  const [fase, setFase] = useState(reduzido ? FINAL : 0)
  const [pulou, setPulou] = useState(false)
  const [dim, setDim] = useState({ w: 300, h: 250 })
  const palco = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const el = palco.current
    if (el) setDim({ w: el.offsetWidth, h: el.offsetHeight })
  }, [])

  useEffect(() => {
    if (reduzido) return
    const ids = (p.repeticao ? LINHA_REP : LINHA_NOVA).map(([t, f]) => window.setTimeout(() => {
      setFase(f)
      if (f === 3 && !p.repeticao) sfx('plim1')
    }, t))
    return () => ids.forEach(clearTimeout)
  }, [reduzido, p.repeticao])

  const pular = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button') || fase >= FINAL) return
    setPulou(true); setFase(FINAL)
  }

  const seco = pulou ? { duration: 0 } : null
  const suave = (delay = 0, dur = 0.35) => seco ?? (reduzido ? { duration: 0.25 } : { duration: dur, delay, ease: 'easeOut' as const })

  const alvo = ENCAIXES[p.indice] ?? { x: 50, y: 50 }
  const tam = Math.max(52, Math.round(dim.w * 0.22))
  // origem da peça: ao lado do Pingo (acima da invenção), em px relativos ao encaixe
  const dx0 = dim.w * 0.5 + dim.w * 0.3 - (alvo.x / 100) * dim.w
  const dy0 = -dim.h * 0.28 - (alvo.y / 100) * dim.h
  const modulo = p.invencao.modulos[p.indice]?.nome ?? ''
  const humor = p.repeticao ? 'wink' : fase >= 3 ? 'cheer' : fase >= 1 ? 'wink' : 'think'
  const pulinho = (fase === 1 || (fase === 3 && !p.repeticao)) && !pulou
  const mostraPeca = !p.repeticao && fase >= 1 && fase <= 2 && !pulou && !reduzido
  const acesos = p.repeticao || fase >= 3 ? p.indice + 1 : p.indice
  const vazio = !p.repeticao && fase < 3 ? p.indice : undefined

  return <div id="lesson" ref={enter} onClick={pular}><style>{css}</style><div className="lw">
    <div className="lbody lscroll"><div className="center" aria-live="polite">
      <motion.div className="cc-pingo" animate={pulinho ? { y: [0, -10, 0], rotate: [0, -4, 0] } : { y: 0, rotate: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}><Pingo S={p.S} mood={humor} /></motion.div>

      <div ref={palco} style={{ position: 'relative', width: 'max(200px, min(100%, 300px, calc((100dvh - 440px) * ' + PROPORCAO + ')))', aspectRatio: String(PROPORCAO) }}>
        <Invencao invencao={p.invencao} acesos={acesos} vazio={vazio} />

        {fase >= 3 && !pulou && !reduzido && <motion.i aria-hidden initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: [0, 0.55, 0], scale: [0.5, 1.5, 1.8] }} transition={{ duration: p.repeticao ? 0.5 : 0.8, ease: 'easeOut' }}
          style={{ position: 'absolute', left: alvo.x + '%', top: alvo.y + '%', width: tam * 1.4, height: tam * 1.4, marginLeft: -tam * 0.7, marginTop: -tam * 0.7,
            borderRadius: '50%', pointerEvents: 'none', background: 'radial-gradient(circle,rgba(24,221,251,.55) 0%,rgba(139,92,246,.25) 45%,transparent 70%)' }} />}

        {mostraPeca && <motion.div aria-hidden
          initial={{ opacity: 0, scale: 0.7, x: dx0, y: dy0 }}
          animate={fase === 1
            ? { opacity: 1, scale: 1, x: dx0, y: dy0, rotate: 0 }
            : { opacity: 1, scale: [1, 1, 1.1, 0.94, 1], rotate: [0, -8, 0],
                x: [dx0, dx0 * 0.5, 0], y: [dy0, dy0 * 0.5 - 36, 0] }}
          transition={fase === 1 ? { duration: 0.35, ease: 'easeOut' }
            : { duration: 0.55, ease: 'easeInOut', times: [0, 0.5, 1] }}
          style={{ position: 'absolute', left: alvo.x + '%', top: alvo.y + '%', width: tam, height: tam, marginLeft: -tam / 2, marginTop: -tam / 2, pointerEvents: 'none' }}>
          <PecaSolta invencao={p.invencao} indice={p.indice} tamanho={tam} />
        </motion.div>}
      </div>

      <motion.div animate={fase >= 4 ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }} transition={suave()}
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
        <h1 style={{ margin: 0 }}>{p.titulo}</h1>
        {p.subtitulo && <p>{p.subtitulo}</p>}
        {!p.repeticao && modulo && <small style={{ color: 'var(--muted)', fontWeight: 800 }}>{modulo} encaixada</small>}
      </motion.div>

      <motion.div animate={fase >= FINAL ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }} transition={suave(0, 0.3)}
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', gap: '4px 18px', fontWeight: 900, fontSize: 18 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#ffb800' }}>
            <span className="cc-ic" dangerouslySetInnerHTML={{ __html: (art as any).IC.bolt }} />+{p.xp} energia</span>
          {p.chips > 0 && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#ff4fae' }}>
            <span className="cc-ic" dangerouslySetInnerHTML={{ __html: (art as any).IC.gem }} />+{p.chips} chips</span>}
        </div>
        {p.acertos != null && <small style={{ color: 'var(--muted)', fontWeight: 700 }}>Precisão {Math.round(p.acertos)}%</small>}
      </motion.div>
    </div></div>
    <div className="lfoot"><button className="btn" onClick={p.onContinuar}>Continuar</button></div>
  </div></div>
}
