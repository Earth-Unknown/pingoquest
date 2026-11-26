// Arte da invenção "Estação Pingo": um mini roteador de campo montado em 4 módulos (SVG plano, leve).
// Área de desenho 120x100 (viewBox). Cada módulo é desenhado em coordenadas locais (centro 0,0, até ±15)
// e posicionado no corpo; a MESMA arte serve para a peça solta e para o módulo encaixado.
import type { CSSProperties } from 'react'
import type { InvencaoDef, Encaixe } from './contrato'

const W = 120
const H = 100

/** Proporção largura/altura da área da invenção */
export const PROPORCAO = W / H

/** Centro de cada módulo no viewBox (antena, portas, luz, conexão) */
const POS: [number, number][] = [[60, 21], [36, 54], [84, 54], [60, 85]]

/** Centro de cada encaixe, em % da área (um por módulo): derivado da mesma geometria do SVG */
export const ENCAIXES: Encaixe[] = POS.map(([x, y]) => ({ x: +(x / W * 100).toFixed(2), y: +(y / H * 100).toFixed(2) }))

const NOITE = '#2a1668'
const ROXO = '#7b3ff2'
const ROXO_ESC = '#5a22c4'
const LILAS = '#c9a8ff'
const CIANO = '#18ddfb'
const OURO = '#ffd83d'
const VERDE = '#5be37d'
const ROSA = '#ff5fae'

/** Arte de um módulo, centrada em (0,0). `fantasma` desenha só a silhueta, discreta. */
function Arte({ id, fantasma }: { id: string; fantasma?: boolean }) {
  const f = (cor: string) => (fantasma ? 'var(--line-deep)' : cor)
  switch (id) {
    case 'antena':
      return <>
        <path d="M-8.500 14.500v-3.500q0-3 3-3h11q3 0 3 3v3.500z" fill={f(ROXO_ESC)} />
        <rect x="-1.600" y="-3" width="3.200" height="12" rx="1.600" fill={f(ROXO)} />
        <circle cx="0" cy="-6.500" r="5.200" fill={f(OURO)} />
        {!fantasma && <ellipse cx="-1.600" cy="-8.300" rx="1.500" ry="1.100" fill="#fff" opacity=".7" />}
        <path d="M-9.500 -12q-3 5.500 0 11M9.500 -12q3 5.500 0 11M-13 -14.500q-5 8 0 16M13 -14.500q5 8 0 16"
          fill="none" stroke={f(CIANO)} strokeWidth="2.200" strokeLinecap="round" />
      </>
    case 'portas':
      return <>
        <rect x="-15" y="-10" width="30" height="20" rx="5" fill={f(NOITE)} />
        {[-10.500, -3.500, 3.500].map((x) => <g key={x}>
          <rect x={x} y="-3.500" width="7" height="9.500" rx="1.800" fill={f(LILAS)} />
          {!fantasma && <rect x={x + 1.700} y="-1.500" width="3.600" height="5" rx="1" fill={NOITE} />}
        </g>)}
        {[-7, 0, 7].map((x, i) => <circle key={x} cx={x} cy="-6.600" r="1.100" fill={f(i === 1 ? OURO : VERDE)} />)}
      </>
    case 'luz':
      return <>
        {!fantasma && <circle r="14.500" fill={VERDE} opacity=".22" />}
        <circle r="11.500" fill={f(NOITE)} />
        <circle r="8" fill={f(VERDE)} />
        {!fantasma && <ellipse cx="-2.800" cy="-3.400" rx="2.800" ry="1.800" fill="#fff" opacity=".75" transform="rotate(-30 -2.800 -3.400)" />}
      </>
    default: // conexao
      return <>
        <rect x="-5.500" y="-15" width="3" height="6" rx="1.200" fill={f(OURO)} />
        <rect x="2.500" y="-15" width="3" height="6" rx="1.200" fill={f(OURO)} />
        <rect x="-9" y="-10" width="18" height="14" rx="5" fill={f(ROXO)} />
        {!fantasma && <rect x="-5.500" y="-7" width="11" height="2.600" rx="1.300" fill="#fff" opacity=".35" />}
        <path d="M-3.500 3.500v3q0 3 3.500 3t3.500 3.500v1.500" fill="none" stroke={f(ROXO_ESC)} strokeWidth="3.600" strokeLinecap="round" transform="translate(0 0)" />
      </>
  }
}

const CSS = `
.inv-pulso{animation:inv-pulso 1.6s ease-in-out infinite}
@keyframes inv-pulso{0%,100%{opacity:.35}50%{opacity:1}}
@media (prefers-reduced-motion:reduce){.inv-pulso{animation:none;opacity:.9}}
`

/** A invenção inteira. Módulos com índice < acesos estão encaixados e acesos; `vazio` pisca o encaixe esperando a peça. */
export function Invencao({ invencao, acesos, vazio }: { invencao: InvencaoDef; acesos: number; vazio?: number }) {
  const total = invencao.modulos.length
  const n = Math.max(0, Math.min(total, acesos))
  const estilo: CSSProperties = { display: 'block', width: '100%', height: 'auto', aspectRatio: String(PROPORCAO), overflow: 'visible' }
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`${invencao.nome}: ${n} de ${total} módulos`} style={estilo}>
      <style>{CSS}</style>
      {/* sombra no chão e pés */}
      <ellipse cx="60" cy="97" rx="40" ry="2.200" fill="var(--ink)" opacity=".06" />
      <rect x="22" y="70" width="14" height="6" rx="3" fill={NOITE} />
      <rect x="84" y="70" width="14" height="6" rx="3" fill={NOITE} />
      {/* corpo */}
      <rect x="10" y="36" width="100" height="36" rx="13" fill="var(--primary)" />
      <rect x="10" y="36" width="100" height="36" rx="13" fill="none" stroke={ROXO_ESC} strokeWidth="1.500" opacity=".5" />
      <rect x="15" y="40.500" width="90" height="27" rx="9.500" fill="var(--locked)" />
      {/* carinha do Pingo, no meio do painel */}
      <ellipse cx="55.500" cy="50" rx="2" ry="2.800" fill="var(--face)" />
      <ellipse cx="64.500" cy="50" rx="2" ry="2.800" fill="var(--face)" />
      <circle cx="52" cy="55.500" r="1.800" fill={ROSA} opacity=".8" />
      <circle cx="68" cy="55.500" r="1.800" fill={ROSA} opacity=".8" />
      <path d="M57.500 55q2.500 3 5 0" fill="none" stroke="var(--face)" strokeWidth="1.400" strokeLinecap="round" />
      {/* encaixes (recortes no painel) */}
      {[1, 2].map((i) => <rect key={i} x={POS[i][0] - 17} y={POS[i][1] - 12.500} width="34" height="25" rx="8" fill="var(--line-deep)" opacity=".55" />)}
      {/* módulos */}
      {invencao.modulos.map((m, i) => {
        const [x, y] = POS[i]
        const aceso = i < n
        const eVazio = !aceso && i === vazio
        return (
          <g key={m.id} data-modulo={m.id} transform={`translate(${x} ${y})`}>
            {eVazio && <rect className="inv-pulso" x="-16.500" y="-16.500" width="33" height="33" rx="9" fill="none" stroke="var(--cyan)" strokeWidth="2" strokeDasharray="4.500 3.500" strokeLinecap="round" />}
            {!aceso && !eVazio && <g opacity=".5"><Arte id={m.id} fantasma /></g>}
            {aceso && <Arte id={m.id} />}
          </g>
        )
      })}
    </svg>
  )
}

/** Um módulo sozinho (a peça que o Pingo encontra), do tamanho em px dado */
export function PecaSolta({ invencao, indice, tamanho = 64 }: { invencao: InvencaoDef; indice: number; tamanho?: number }) {
  const m = invencao.modulos[indice]
  return (
    <svg viewBox="-18 -18 36 36" width={tamanho} height={tamanho} role="img" aria-label={m.nome} style={{ display: 'block', overflow: 'visible' }}>
      <Arte id={m.id} />
    </svg>
  )
}
