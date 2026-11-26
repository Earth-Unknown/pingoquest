// Cena em loop da tela de entrada: o Pingo monta a Estação peça por peça (a mesma ideia da conclusão de lição).
// Fica sobre um palco claro para o robô roxo não se perder no fundo roxo. Só transform/opacity.
import { useEffect, useState, type CSSProperties } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Pingo } from './Pingo'
import { Invencao, PecaSolta, ENCAIXES } from './conclusao/Invencao'
import { ESTACAO_PINGO } from './conclusao/contrato'
import { reducedMotion } from './lib/sound'

const TICK = 950 // ms por passo
const PERIODO = 12 // 0..7 montagem (peça aparece / voa), 8..10 pronta e comemorando, 11 apaga e recomeça

/** Palette clara só para o palco (o fundo da tela é escuro) */
const CLARO = { '--primary': '#7b3ff2', '--locked': '#ece6fb', '--line-deep': '#cfc4ee', '--cyan': '#18ddfb', '--surface': '#ffffff', '--ink': '#1f1642', '--muted': '#6c6492' } as CSSProperties

export function PingoResolvendo({ S }: { S: any }) {
  const parado = reducedMotion()
  const [t, setT] = useState(parado ? 9 : 0)
  useEffect(() => {
    if (parado) return
    const id = setInterval(() => setT(x => (x + 1) % PERIODO), TICK)
    return () => clearInterval(id)
  }, [parado])

  const k = Math.min(3, Math.floor(t / 2))          // peça da vez
  const montando = t < 8
  const voando = montando && t % 2 === 1
  const acesos = montando ? Math.floor(t / 2) : 4
  const humor = !montando ? 'cheer' : voando ? 'cheer' : t % 4 === 0 ? 'think' : 'wink'
  const alvo = ENCAIXES[k]
  // a peça sai da mão do Pingo (à esquerda da estação) e vai até o encaixe
  const dx0 = -190 + (alvo.x - 50) * 0.0, dy0 = -26

  return (
    <div aria-hidden="true" className="lg-cena" style={{ ...CLARO, position: 'relative', width: 'min(100%, 300px)', height: 168, borderRadius: 28, overflow: 'hidden',
      background: 'radial-gradient(circle at 30% 35%, #ffffff 0%, #efe8ff 55%, #dccdff 100%)', boxShadow: '0 10px 30px rgba(0,0,0,.35), inset 0 -4px 0 rgba(123,63,242,.15)' }}>
      <style>{`.lg-cena .pg svg{width:96px;height:auto;display:block}`}</style>
      <motion.div className="pg" style={{ position: 'absolute', left: 14, bottom: 14 }}
        animate={parado ? undefined : { y: [0, -4, 0] }} transition={{ duration: 1.9, repeat: Infinity, ease: 'easeInOut' }}>
        <Pingo S={S} mood={humor} cls="lg-pingo-cena" />
      </motion.div>

      <div style={{ position: 'absolute', right: 12, bottom: 10, width: 156, aspectRatio: '6 / 5' }}>
        <motion.div key={t === PERIODO - 1 ? 'fim' : 'ciclo'} style={{ position: 'absolute', inset: 0 }}
          animate={{ opacity: t === PERIODO - 1 ? 0 : 1 }} transition={{ duration: 0.3 }}>
          <Invencao invencao={ESTACAO_PINGO} acesos={acesos} vazio={montando && acesos < 4 ? k : undefined} />
        </motion.div>
        <AnimatePresence>
          {montando && !parado && (
            <motion.div key={'p' + k + (voando ? 'v' : 'a')} style={{ position: 'absolute', left: alvo.x + '%', top: alvo.y + '%', width: 40, height: 40, marginLeft: -20, marginTop: -20 }}
              initial={voando ? { opacity: 1, x: dx0 * 0.45, y: dy0, scale: 1 } : { opacity: 0, x: dx0, y: dy0 + 8, scale: 0.6 }}
              animate={voando ? { opacity: 1, x: 0, y: 0, scale: [1, 1.12, 1] } : { opacity: 1, x: dx0 * 0.45, y: dy0, scale: 1 }}
              exit={{ opacity: 0 }} transition={{ duration: voando ? 0.7 : 0.4, ease: 'easeInOut' }}>
              <PecaSolta invencao={ESTACAO_PINGO} indice={k} tamanho={40} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
