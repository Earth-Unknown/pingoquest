// Tela de entrada: o Pingo está resolvendo um enigma e a pessoa pode ajudar (tocando). Quatro tipos, em rodízio:
// sequência, intruso, acender o caminho e o salto do cavalo. Nada de texto de curso, nada bloqueia o login.
// Sem ninguém ajudar, o Pingo pede ajuda e resolve sozinho. Só transform/opacity.
import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Pingo } from './Pingo'
import { reducedMotion, sfx } from './lib/sound'

const CIANO = '#18ddfb', OURO = '#ffd83d', ROSA = '#ff4fae'
const CORES = [CIANO, OURO, ROSA]
const FORMAS = ['circ', 'tri', 'quad', 'estr'] as const
type Forma = typeof FORMAS[number]
type Ficha = { f: Forma; c: string }

const sorteia = <T,>(a: readonly T[]): T => a[Math.floor(Math.random() * a.length)]
const embaralha = <T,>(a: T[]): T[] => { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]] } return b }
const igual = (a: Ficha, b: Ficha) => a.f === b.f && a.c === b.c
const fichaAleatoria = (): Ficha => ({ f: sorteia(FORMAS), c: sorteia(CORES) })

/** Desenho de uma ficha (forma + cor neon) */
function Forma({ f, c, s = 34 }: { f: Forma; c: string; s?: number }) {
  const corpo = f === 'circ' ? <circle cx="20" cy="20" r="14" />
    : f === 'tri' ? <path d="M20 5 36 33H4z" strokeLinejoin="round" />
    : f === 'quad' ? <rect x="6" y="6" width="28" height="28" rx="6" />
    : <path d="m20 4 4.7 10.2 11.1 1.2-8.3 7.5 2.4 11L20 28.2 10.1 33.9l2.4-11-8.3-7.5 11.1-1.2z" strokeLinejoin="round" />
  return <svg width={s} height={s} viewBox="0 0 40 40" aria-hidden="true" fill={c} fillOpacity=".9" stroke={c} strokeWidth="2">{corpo}</svg>
}

const botao = (extra?: object) => ({ position: 'relative', width: 44, height: 44, borderRadius: 14, display: 'grid', placeItems: 'center', cursor: 'pointer', font: 'inherit', color: 'inherit',
  border: '2px solid rgba(255,255,255,.28)', background: 'rgba(255,255,255,.08)', padding: 0, ...extra }) as const

type Props = { resolvido: boolean; dica: boolean; onTocar: () => void; onAcerto: () => void; onErro: () => void }

/** Anel pulsante nas opções: mostra que dá para tocar */
const Anel = ({ on }: { on: boolean }) => on ? <motion.i aria-hidden="true" style={{ position: 'absolute', inset: -3, borderRadius: 'inherit', border: `2px solid ${CIANO}`, pointerEvents: 'none', display: 'block' }}
  animate={{ opacity: [0.9, 0], scale: [1, 1.22] }} transition={{ duration: 1.2, repeat: Infinity, ease: 'easeOut' }} /> : null

/* ---------- 1) Qual vem depois? ---------- */
type Seq = { mostra: Ficha[]; resposta: Ficha; opcoes: Ficha[] }
function geraSeq(): Seq {
  const fichas: Ficha[] = []
  while (fichas.length < 3) { const f = fichaAleatoria(); if (!fichas.some(x => igual(x, f))) fichas.push(f) }
  const [a, b, c] = fichas
  const ciclo = Math.random() < 0.5
  const mostra = ciclo ? [a, b, c, a, b] : [a, b, a, b, a]
  const resposta = ciclo ? c : b
  const erradas = fichas.filter(x => !igual(x, resposta)).concat(fichaAleatoria()).filter((x, i, ar) => !igual(x, resposta) && ar.findIndex(y => igual(x, y)) === i).slice(0, 2)
  return { mostra, resposta, opcoes: embaralha([resposta, ...erradas]) }
}
function EnigmaSeq({ p, resolvido, dica, onTocar, onAcerto, onErro }: Props & { p: Seq }) {
  return <div style={{ display: 'grid', gap: 10, justifyItems: 'center' }}>
    <div style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
      {p.mostra.map((x, i) => <span key={i} style={{ width: 26, height: 26, display: 'grid', placeItems: 'center' }}><Forma {...x} s={24} /></span>)}
      <span style={{ width: 34, height: 34, borderRadius: 12, border: '2px dashed rgba(255,255,255,.5)', display: 'grid', placeItems: 'center', fontWeight: 900, fontSize: 18 }}>
        {resolvido ? <Forma {...p.resposta} s={24} /> : '?'}</span>
    </div>
    <div style={{ display: 'flex', gap: 8 }}>
      {p.opcoes.map((o, i) => <button key={i} type="button" aria-label="Opção" style={botao(resolvido && igual(o, p.resposta) ? { borderColor: OURO } : undefined)}
        onClick={() => { onTocar(); igual(o, p.resposta) ? onAcerto() : onErro() }}><Anel on={dica} /><Forma {...o} /></button>)}
    </div>
  </div>
}

/* ---------- 2) Qual não combina? ---------- */
type Intruso = { fichas: Ficha[]; indice: number }
function geraIntruso(): Intruso {
  const base = fichaAleatoria()
  const outro: Ficha = Math.random() < 0.5
    ? { f: sorteia(FORMAS.filter(x => x !== base.f)), c: base.c }
    : { f: base.f, c: sorteia(CORES.filter(x => x !== base.c)) }
  const indice = Math.floor(Math.random() * 4)
  return { fichas: [0, 1, 2, 3].map(i => i === indice ? outro : base), indice }
}
function EnigmaIntruso({ p, resolvido, dica, onTocar, onAcerto, onErro }: Props & { p: Intruso }) {
  return <div style={{ display: 'flex', gap: 6 }}>
    {p.fichas.map((x, i) => <button key={i} type="button" aria-label="Figura" style={botao(resolvido && i === p.indice ? { borderColor: OURO } : undefined)}
      onClick={() => { onTocar(); i === p.indice ? onAcerto() : onErro() }}><Anel on={dica} /><Forma {...x} s={28} /></button>)}
  </div>
}

/* ---------- 3) Acender o caminho ---------- */
type Caminho = { apagadas: number[] }
function geraCaminho(): Caminho {
  const n = 2 + Math.floor(Math.random() * 2)
  return { apagadas: embaralha([0, 1, 2, 3, 4]).slice(0, n) }
}
function EnigmaCaminho({ p, resolvido, dica, onTocar, onAcerto }: Props & { p: Caminho }) {
  const [acesas, setAcesas] = useState<number[]>([])
  const tudo = (i: number) => !p.apagadas.includes(i) || acesas.includes(i) || resolvido
  const feito = useRef(false)
  useEffect(() => {
    if (!feito.current && !resolvido && p.apagadas.every(i => acesas.includes(i))) { feito.current = true; onAcerto() }
  }, [acesas, p, resolvido, onAcerto])
  return <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
    {[0, 1, 2, 3, 4].map(i => {
      const on = tudo(i)
      return <button key={i} type="button" aria-label={on ? 'Lâmpada acesa' : 'Lâmpada apagada'} disabled={on}
        onClick={() => { onTocar(); sfx('tap'); setAcesas(a => a.includes(i) ? a : [...a, i]) }}
        style={{ ...botao(), width: 36, height: 50, borderRadius: 18, borderColor: on ? OURO : 'rgba(255,255,255,.28)',
          background: on ? 'radial-gradient(circle,#fff6b8 0%,#ffd83d 55%,rgba(255,216,61,.25) 100%)' : 'rgba(255,255,255,.06)', opacity: 1 }}>
        <Anel on={dica && !on} /><span style={{ width: 14, height: 14, borderRadius: 7, background: on ? '#fff' : 'rgba(255,255,255,.3)' }} />
      </button>
    })}
  </div>
}

/* ---------- 4) O salto do cavalo ---------- */
type Cavalo = { cavalo: [number, number]; opcoes: [number, number][]; certa: [number, number] }
const SALTOS: [number, number][] = [[1, 2], [2, 1], [-1, 2], [-2, 1], [1, -2], [2, -1], [-1, -2], [-2, -1]]
const dentro = (r: number, c: number) => r >= 0 && r < 5 && c >= 0 && c < 5
function geraCavalo(): Cavalo {
  const cavalo: [number, number] = [1 + Math.floor(Math.random() * 3), 1 + Math.floor(Math.random() * 3)]
  const legais = SALTOS.map(([dr, dc]) => [cavalo[0] + dr, cavalo[1] + dc] as [number, number]).filter(([r, c]) => dentro(r, c))
  const certa = sorteia(legais)
  const ehLegal = (r: number, c: number) => legais.some(([a, b]) => a === r && b === c)
  const erradas: [number, number][] = []
  const todas: [number, number][] = []
  for (let r = 0; r < 5; r++) for (let c = 0; c < 5; c++) if (!(r === cavalo[0] && c === cavalo[1]) && !ehLegal(r, c)) todas.push([r, c])
  // erradas "tentadoras": casas vizinhas (movimento de torre/bispo), não de cavalo
  const vizinhas = todas.filter(([r, c]) => Math.abs(r - cavalo[0]) <= 1 && Math.abs(c - cavalo[1]) <= 1)
  for (const x of embaralha(vizinhas).slice(0, 2)) erradas.push(x)
  while (erradas.length < 2) { const x = sorteia(todas); if (!erradas.some(y => y[0] === x[0] && y[1] === x[1])) erradas.push(x) }
  return { cavalo, certa, opcoes: embaralha([certa, ...erradas]) }
}
function EnigmaCavalo({ p, resolvido, onTocar, onAcerto, onErro }: Props & { p: Cavalo }) {
  const [pulou, setPulou] = useState(false)
  const lado = 30
  const destino = pulou || resolvido ? p.certa : p.cavalo
  const ehOpcao = (r: number, c: number) => p.opcoes.some(([a, b]) => a === r && b === c)
  return <div style={{ position: 'relative', width: lado * 5, height: lado * 5, borderRadius: 12, overflow: 'hidden', border: '2px solid rgba(255,255,255,.28)' }} role="group" aria-label="Tabuleiro: onde o cavalo pula?">
    {[...Array(25)].map((_, k) => {
      const r = Math.floor(k / 5), c = k % 5, op = !pulou && !resolvido && ehOpcao(r, c)
      return <button key={k} type="button" aria-label={op ? 'Casa possível' : 'Casa'} disabled={!op}
        onClick={() => { onTocar(); if (r === p.certa[0] && c === p.certa[1]) { setPulou(true); onAcerto() } else onErro() }}
        style={{ position: 'absolute', left: c * lado, top: r * lado, width: lado, height: lado, padding: 0, border: 0, cursor: op ? 'pointer' : 'default',
          background: (r + c) % 2 ? 'rgba(255,255,255,.14)' : 'rgba(255,255,255,.05)', color: 'inherit' }}>
        {op && <motion.i style={{ position: 'absolute', inset: 5, borderRadius: '50%', border: `2px solid ${CIANO}`, display: 'block' }} animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.4, repeat: Infinity }} />}
      </button>
    })}
    <motion.span aria-hidden="true" initial={false} animate={{ left: destino[1] * lado, top: destino[0] * lado, y: pulou || resolvido ? [0, -10, 0] : 0 }}
      transition={{ duration: 0.45, ease: 'easeInOut' }}
      style={{ position: 'absolute', width: lado, height: lado, display: 'grid', placeItems: 'center', fontSize: 24, color: OURO, pointerEvents: 'none', textShadow: '0 0 8px rgba(255,216,61,.7)' }}>{'♞︎'}</motion.span>
  </div>
}


/* ---------- 5) Sequência numérica ---------- */
type Num = { mostra: number[]; resposta: number; opcoes: number[] }
function geraNum(): Num {
  const tipo = sorteia(['soma', 'dobro', 'desce'] as const)
  let mostra: number[] = [], resposta = 0, passo = 2
  if (tipo === 'soma') { const a = 1 + Math.floor(Math.random() * 8); passo = 2 + Math.floor(Math.random() * 4); mostra = [0, 1, 2, 3].map(i => a + i * passo); resposta = a + 4 * passo }
  else if (tipo === 'dobro') { const a = sorteia([1, 2, 3]); mostra = [a, a * 2, a * 4, a * 8]; resposta = a * 16; passo = a * 4 }
  else { passo = 2 + Math.floor(Math.random() * 3); const a = 22 + Math.floor(Math.random() * 8); mostra = [0, 1, 2, 3].map(i => a - i * passo); resposta = a - 4 * passo }
  const erradas = [...new Set([resposta + passo, resposta - passo, resposta + 1, resposta - 1].filter(x => x > 0 && x !== resposta))]
  return { mostra, resposta, opcoes: embaralha([resposta, ...embaralha(erradas).slice(0, 2)]) }
}
function EnigmaNum({ p, resolvido, dica, onTocar, onAcerto, onErro }: Props & { p: Num }) {
  return <div style={{ display: 'grid', gap: 10, justifyItems: 'center' }}>
    <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
      {p.mostra.map((x, i) => <span key={i} style={{ minWidth: 30, height: 34, display: 'grid', placeItems: 'center', fontWeight: 900, fontSize: 18, color: OURO }}>{x}</span>)}
      <span style={{ minWidth: 36, height: 34, borderRadius: 12, border: '2px dashed rgba(255,255,255,.5)', display: 'grid', placeItems: 'center', fontWeight: 900, fontSize: 17 }}>{resolvido ? p.resposta : '?'}</span>
    </div>
    <div style={{ display: 'flex', gap: 8 }}>
      {p.opcoes.map(o => <button key={o} type="button" aria-label={'Número ' + o} style={{ ...botao(resolvido && o === p.resposta ? { borderColor: OURO } : undefined), fontWeight: 900, fontSize: 18 }}
        onClick={() => { onTocar(); o === p.resposta ? onAcerto() : onErro() }}><Anel on={dica} />{o}</button>)}
    </div>
  </div>
}

/* ---------- 6) Quebra-cabeça: qual peça completa o círculo? ---------- */
type Canto = 'tl' | 'tr' | 'bl' | 'br'
const CANTOS: Canto[] = ['tl', 'tr', 'bl', 'br']
const QUARTO: Record<Canto, string> = {
  tl: 'M40 40 L40 4 A36 36 0 0 0 4 40 Z', tr: 'M0 40 L0 4 A36 36 0 0 1 36 40 Z',
  bl: 'M40 0 L4 0 A36 36 0 0 0 40 36 Z', br: 'M0 0 L36 0 A36 36 0 0 1 0 36 Z',
}
type Quebra = { faltando: Canto; opcoes: Canto[] }
const geraQuebra = (): Quebra => { const faltando = sorteia(CANTOS); return { faltando, opcoes: embaralha(CANTOS.filter(c => c !== faltando)).slice(0, 2).concat(faltando).sort(() => Math.random() - 0.5) } }
const Quarto = ({ c, s = 40 }: { c: Canto; s?: number }) => <svg width={s} height={s} viewBox="0 0 40 40" aria-hidden="true"><path d={QUARTO[c]} fill={CIANO} fillOpacity=".9" /></svg>
function EnigmaQuebra({ p, resolvido, dica, onTocar, onAcerto, onErro }: Props & { p: Quebra }) {
  const lado = 38
  const pos: Record<Canto, [number, number]> = { tl: [0, 0], tr: [1, 0], bl: [0, 1], br: [1, 1] }
  return <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
    <div style={{ position: 'relative', width: lado * 2, height: lado * 2 }} role="img" aria-label="Círculo com uma peça faltando">
      {CANTOS.map(c => c === p.faltando
        ? <span key={c} style={{ position: 'absolute', left: pos[c][0] * lado, top: pos[c][1] * lado, width: lado, height: lado, borderRadius: 8, border: '2px dashed rgba(255,255,255,.55)', boxSizing: 'border-box', display: 'grid', placeItems: 'center' }}>{resolvido ? <Quarto c={c} s={lado - 4} /> : '?'}</span>
        : <span key={c} style={{ position: 'absolute', left: pos[c][0] * lado, top: pos[c][1] * lado, width: lado, height: lado }}><Quarto c={c} s={lado} /></span>)}
    </div>
    <div style={{ display: 'grid', gap: 6 }}>
      {p.opcoes.map(o => <button key={o} type="button" aria-label="Peça" style={botao(resolvido && o === p.faltando ? { borderColor: OURO } : undefined)}
        onClick={() => { onTocar(); o === p.faltando ? onAcerto() : onErro() }}><Anel on={dica} /><Quarto c={o} s={34} /></button>)}
    </div>
  </div>
}

/* ---------- 7) Ordem dos objetos ---------- */
type Ordem = { tamanhos: number[]; cres: boolean }
const geraOrdem = (): Ordem => ({ tamanhos: embaralha([12, 20, 30]), cres: Math.random() < 0.6 })
function EnigmaOrdem({ p, resolvido, dica, onTocar, onAcerto, onErro }: Props & { p: Ordem }) {
  const certa = [...p.tamanhos].sort((a, b) => p.cres ? a - b : b - a)
  const [tocados, setTocados] = useState<number[]>([])
  const cor = (t: number) => t === 12 ? ROSA : t === 20 ? OURO : CIANO
  return <div style={{ display: 'grid', gap: 8, justifyItems: 'center' }}>
    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
      {p.tamanhos.map(t => {
        const ordem = resolvido ? certa.indexOf(t) + 1 : tocados.indexOf(t) + 1
        return <button key={t} type="button" aria-label={'Objeto ' + (t === 12 ? 'pequeno' : t === 20 ? 'médio' : 'grande')} disabled={tocados.includes(t) || resolvido}
          style={{ ...botao(), width: 52, height: 52, opacity: 1, borderColor: ordem ? OURO : 'rgba(255,255,255,.28)' }}
          onClick={() => {
            onTocar()
            if (t !== certa[tocados.length]) { onErro(); setTocados([]); return }
            const prox = [...tocados, t]; setTocados(prox); sfx('tap')
            if (prox.length === certa.length) onAcerto()
          }}>
          <Anel on={dica} />
          <span style={{ width: t, height: t, borderRadius: '50%', background: cor(t), display: 'block' }} />
          {ordem > 0 && <b style={{ position: 'absolute', top: -7, right: -5, width: 20, height: 20, borderRadius: 10, background: OURO, color: '#1f1642', fontSize: 12, display: 'grid', placeItems: 'center' }}>{ordem}</b>}
        </button>
      })}
    </div>
  </div>
}

/* ---------- cena ---------- */
type Tipo = 'seq' | 'num' | 'intruso' | 'quebra' | 'ordem' | 'caminho' | 'cavalo'
const ORDEM: Tipo[] = ['intruso', 'num', 'seq', 'quebra', 'ordem', 'caminho', 'cavalo']
const PERGUNTA = (t: Tipo, o?: any): string => ({ seq: 'Qual vem depois?', num: 'Qual número vem depois?', intruso: 'Qual não combina?', quebra: 'Qual peça completa o círculo?',
  ordem: o?.cres ? 'Do menor pro maior!' : 'Do maior pro menor!', caminho: 'Acende o caminho pra mim!', cavalo: 'Pra onde o cavalo pula?' } as Record<Tipo, string>)[t]
const FESTA = ['Boa! Você me ajudou!', 'Isso! Pensamos juntos!', 'Eba! Descobrimos!']
const novo = (t: Tipo) => t === 'seq' ? geraSeq() : t === 'num' ? geraNum() : t === 'intruso' ? geraIntruso() : t === 'quebra' ? geraQuebra() : t === 'ordem' ? geraOrdem() : t === 'caminho' ? geraCaminho() : geraCavalo()

const TEMPO_PEDE = 4500, TEMPO_RESOLVE = 18000, TEMPO_FESTA = 1700

export function PingoEnigma({ S }: { S: any }) {
  const parado = reducedMotion()
  const [n, setN] = useState(0)
  const tipo = ORDEM[n % ORDEM.length]
  const [puzzle, setPuzzle] = useState<any>(() => novo(ORDEM[0]))
  const [estado, setEstado] = useState<'jogo' | 'ok'>('jogo')
  const [auto, setAuto] = useState(false)
  const [fala, setFala] = useState(() => PERGUNTA(ORDEM[0], undefined))
  const [tocou, setTocou] = useState(false)
  const [ajudou, setAjudou] = useState(0)
  const [balanca, setBalanca] = useState(0)

  const acertou = useCallback((porConta: boolean) => {
    setEstado(e => e === 'ok' ? e : 'ok')
    setAuto(porConta); setFala(sorteia(FESTA))
    if (!porConta) { sfx('plim1'); setAjudou(x => x + 1) }
  }, [])
  const errou = useCallback(() => { sfx('boop'); setFala('Hmm, tenta de novo!'); setBalanca(x => x + 1) }, [])

  // pede ajuda, depois resolve sozinho (quem pediu menos movimento não vê a resolução automática)
  useEffect(() => {
    if (estado !== 'jogo') return
    const a = setTimeout(() => setFala('Me ajuda? Toque na resposta!'), TEMPO_PEDE)
    const b = parado ? undefined : setTimeout(() => acertou(true), TEMPO_RESOLVE)
    return () => { clearTimeout(a); if (b) clearTimeout(b) }
  }, [estado, n, parado, acertou, balanca])

  // depois da festa, vem o próximo enigma
  useEffect(() => {
    if (estado !== 'ok') return
    const t = setTimeout(() => {
      const prox = n + 1
      const t2 = ORDEM[prox % ORDEM.length], pz = novo(t2)
      setN(prox); setPuzzle(pz); setEstado('jogo'); setAuto(false); setTocou(false); setFala(PERGUNTA(t2, pz))
    }, TEMPO_FESTA)
    return () => clearTimeout(t)
  }, [estado, n])

  const humor = estado === 'ok' ? 'cheer' : fala.startsWith('Me ajuda') ? 'wink' : 'think'
  const props: Props = { resolvido: estado === 'ok' && auto, dica: estado === 'jogo' && !tocou && ajudou < 2, onTocar: () => setTocou(true), onAcerto: () => acertou(false), onErro: errou }

  return (
    <div style={{ display: 'grid', justifyItems: 'center', gap: 6, width: '100%' }}>
    <motion.p style={{ margin: 0, fontSize: 12, fontWeight: 900, letterSpacing: 1, textTransform: 'uppercase', color: OURO }}
      animate={parado ? undefined : { opacity: [1, 0.55, 1] }} transition={{ duration: 1.6, repeat: Infinity }}>Ajude o Pingo a investigar!</motion.p>
    <div className="lg-enigma" style={{ position: 'relative', width: 'min(100%, 330px)', display: 'grid', gridTemplateColumns: '88px 1fr', alignItems: 'center', gap: 8, padding: '10px 10px 12px', borderRadius: 28,
      border: '2px solid rgba(24,221,251,.3)', background: 'rgba(255,255,255,.05)' }}>
      <style>{`.lg-enigma .pg svg{width:84px;height:auto;display:block;position:relative}`}</style>
      <div style={{ position: 'relative', display: 'grid', placeItems: 'center' }}>
        {/* brilho neon atrás do Pingo para ele aparecer sobre o roxo */}
        <motion.span aria-hidden="true" style={{ position: 'absolute', width: 118, height: 118, borderRadius: '50%', background: 'radial-gradient(circle,rgba(24,221,251,.55) 0%,rgba(255,79,174,.25) 48%,transparent 72%)' }}
          animate={parado ? undefined : { opacity: [0.65, 1, 0.65], scale: [0.95, 1.05, 0.95] }} transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }} />
        <motion.div className="pg" key={balanca} animate={estado === 'ok' ? { y: [0, -12, 0] } : balanca ? { rotate: [0, -8, 8, -5, 0] } : { y: [0, -3, 0] }}
          transition={estado === 'ok' || balanca ? { duration: 0.5 } : { duration: 2, repeat: parado ? 0 : Infinity, ease: 'easeInOut' }}>
          <Pingo S={S} mood={humor} cls="lg-pingo-enigma" />
        </motion.div>
      </div>

      <div style={{ display: 'grid', justifyItems: 'center', gap: 8, minHeight: 150, alignContent: 'center' }}>
        <div aria-live="polite" style={{ background: '#fff', color: '#1f1642', borderRadius: 14, padding: '4px 10px', fontSize: 13, fontWeight: 800, textAlign: 'center' }}>{fala}</div>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={n} initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -18 }} transition={{ duration: 0.25 }}>
            {tipo === 'seq' && <EnigmaSeq p={puzzle} {...props} />}
            {tipo === 'num' && <EnigmaNum p={puzzle} {...props} />}
            {tipo === 'quebra' && <EnigmaQuebra p={puzzle} {...props} />}
            {tipo === 'ordem' && <EnigmaOrdem p={puzzle} {...props} />}
            {tipo === 'intruso' && <EnigmaIntruso p={puzzle} {...props} />}
            {tipo === 'caminho' && <EnigmaCaminho p={puzzle} {...props} />}
            {tipo === 'cavalo' && <EnigmaCavalo p={puzzle} {...props} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
    </div>
  )
}
