// Resultado leve (revisão e treino de vida): o Pingo, o que foi reforçado em cartões deslizáveis e a recompensa discreta.
// Sem cartões de energia, sem confete e sem moedas voando.
import type { ReactNode } from 'react'
import art from '../legacy/art.json'
import { Pingo } from '../Pingo'
import { enter } from '../Fx'

const A: any = art
const css = `.rl-cards{display:flex;gap:10px;overflow-x:auto;scroll-snap-type:x mandatory;width:100%;padding:2px 8% 6px;box-sizing:border-box;scroll-padding:0 8%;touch-action:pan-x pan-y;scrollbar-width:none}.rl-cards::-webkit-scrollbar{display:none}
.rl-card{flex:0 0 84%;scroll-snap-align:center;border-radius:16px;padding:10px 14px;text-align:left;font-size:15px;line-height:1.4;box-sizing:border-box;background:var(--locked,#f1ecff)}
.rl-card b{display:block;color:var(--primary);margin-bottom:2px}.rl-pingo svg{width:clamp(64px,11vh,92px)!important;display:block}
.rl-pill{display:inline-flex;align-items:center;gap:4px;border-radius:99px;padding:3px 10px 3px 7px;font-weight:900;font-size:14px;background:var(--surface,#fff);box-shadow:0 1px 4px rgba(26,16,72,.18)}.rl-pill svg{width:16px;height:16px;display:block}`

export type CartaoRevisao = { t: string; x: string }

/** Fileira de cartões deslizáveis (usada também no duelo) */
export function Cartoes({ cartoes, rotulo }: { cartoes: CartaoRevisao[]; rotulo?: string }) {
  if (!cartoes.length) return null
  return <><style>{css}</style>
    <p style={{ margin: '4px 0 0', fontSize: 12, fontWeight: 800, letterSpacing: 0.8, textTransform: 'uppercase', color: 'var(--muted)' }}>{rotulo || 'O que você reforçou'}</p>
    <div className="rl-cards" tabIndex={0} aria-label={(rotulo || 'O que você reforçou') + ': deslize para ver tudo'}>{cartoes.map((c, i) => <div className="rl-card" key={i}><b>{c.t}</b>{c.x}</div>)}</div>
    {cartoes.length > 1 && <small style={{ color: 'var(--muted)', fontWeight: 700 }}>Deslize para o lado para ver tudo →</small>}
  </>
}
export function ResultadoLeve({ S, mood = 'cheer', titulo, subtitulo, cor, extra, xp, chips = 0, pecas = 0, rotulo, cartoes, botao = 'Continuar', secundario, onContinuar }: {
  S: any; mood?: string; titulo: string; subtitulo?: string; cor?: string; extra?: ReactNode; xp: number; chips?: number; pecas?: number
  rotulo?: string; cartoes: CartaoRevisao[]; botao?: string; secundario?: { texto: string; onClick: () => void }; onContinuar: () => void
}) {
  return <div id="lesson" ref={enter}><style>{css}</style><div className="lw"><div className="lbody lscroll"><div className="center" style={{ gap: 10 }}>
    <div className="rl-pingo"><Pingo S={S} mood={mood} /></div>
    <h1 style={{ margin: 0, fontSize: 26, color: cor }}>{titulo}</h1>
    {subtitulo && <p style={{ margin: 0 }}>{subtitulo}</p>}
    {extra}
    <Cartoes cartoes={cartoes} rotulo={rotulo} />
    {(xp > 0 || chips > 0 || pecas > 0) && <div style={{ display: 'flex', gap: 8 }} aria-label="Você ganhou">
      {xp > 0 && <span className="rl-pill" style={{ color: '#ffb800' }} dangerouslySetInnerHTML={{ __html: A.IC.bolt + xp }} />}
      {chips > 0 && <span className="rl-pill" style={{ color: '#ff4fae' }} dangerouslySetInnerHTML={{ __html: A.IC.gem + chips }} />}
      {pecas > 0 && <span className="rl-pill" style={{ color: '#3fbf5f' }} dangerouslySetInnerHTML={{ __html: A.IC.puzzle + '+' + pecas }} />}
    </div>}
  </div></div><div className="lfoot"><div className="stack" style={{ margin: 0 }}>{secundario && <button className="btn ghost" onClick={secundario.onClick}>{secundario.texto}</button>}<button className="btn" onClick={onContinuar}>{botao}</button></div></div></div></div>
}
