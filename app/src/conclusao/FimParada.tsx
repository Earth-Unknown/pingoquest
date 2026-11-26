// Fim de parada: o que o aluno ganhou (item do robô, invenção na Oficina, vidas) e uma prévia da próxima parada.
import { useState } from 'react'
import { motion } from 'motion/react'
import art from '../legacy/art.json'
import { Pingo } from '../Pingo'
import { enter } from '../Fx'
import { HEART_ICON } from '../Hearts'
import { patchSave } from '../lib/save'
import { equip } from '../lib/avatar'
import { sfx } from '../lib/sound'
import { Invencao } from './Invencao'
import type { FimParada, InvencaoDef, NovoItem } from './contrato'

const A: any = art
const Html = ({ h, cls }: { h: string; cls?: string }) => <span className={cls} style={cls ? undefined : { display: 'contents' }} dangerouslySetInnerHTML={{ __html: h }} />

/** Matiz diferente por parada: a mesma peça ganha uma cor própria na Oficina e na prévia */
export const matiz = (idx: number) => (idx * 47) % 360

const css = `.fp-ic{width:34px;height:34px;flex:none;display:inline-flex}.fp-ic svg{width:100%;height:100%}
.fp-row{display:flex;align-items:center;gap:12px;text-align:left;font-weight:800;font-size:15px;background:var(--locked,#f1ecff);border-radius:16px;padding:8px 12px;width:100%;box-sizing:border-box}
.fp-row small{display:block;color:var(--muted);font-weight:700;font-size:13px}
.fp-p svg{width:56px!important;height:auto;display:block}.fp-chip{background:var(--locked,#f1ecff);border-radius:99px;padding:3px 10px;font-size:13px;font-weight:800}`

/** Linha "Novo para o Pingo" com botão de vestir (só visual, não muda nada do jogo) */
export function NovoItemLinha({ n }: { n: NovoItem }) {
  const [on, setOn] = useState(false)
  return <div className="fp-row" style={{ marginTop: 2 }}>
    <Html cls="fp-ic" h={n.icone} />
    <span style={{ flex: 1 }}><small>Novo para o seu robô</small>{n.nome}</span>
    <button className="btn ghost" style={{ width: 'auto', padding: '6px 14px', minHeight: 0 }} disabled={on}
      onClick={() => { patchSave(s => equip(s, n.slot, n.id)); setOn(true); sfx('ok') }}>{on ? 'Vestido' : 'Vestir'}</button>
  </div>
}

export function FimParadaTela({ S, invencao, fim, novos, onContinuar }: { S: any; invencao: InvencaoDef; fim: FimParada; novos?: NovoItem[]; onContinuar: () => void }) {
  const fade = (d: number) => ({ initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.3, delay: d, ease: 'easeOut' as const } })
  const px = fim.prox
  return <div id="lesson" ref={enter}><style>{css}</style><div className="lw">
    <div className="lbody lscroll"><div className="center" style={{ gap: 10 }}>
      <motion.h1 {...fade(0)} style={{ margin: 0, fontSize: 26 }}>Parada concluída!</motion.h1>
      <motion.p {...fade(0.05)} style={{ margin: 0 }}>{fim.lugar}: {fim.titulo}</motion.p>

      <motion.div {...fade(0.15)} style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%' }}>
        <div className="fp-row">
          <span className="fp-ic" style={{ filter: `hue-rotate(${matiz(fim.idx)}deg)` }}><Invencao invencao={invencao} acesos={invencao.modulos.length} /></span>
          <span><small>Guardada na sua Oficina</small>Estação Pingo · {fim.lugar}</span>
        </div>
        {novos?.map(n => <NovoItemLinha key={n.slot + n.id} n={n} />)}
        {fim.vidasCheias && <div className="fp-row"><Html cls="fp-ic" h={HEART_ICON} /><span><small>Recarregadas</small>Vidas cheias</span></div>}
      </motion.div>

      {px && <motion.div {...fade(0.4)} style={{ width: '100%', borderRadius: 20, padding: '12px 14px', boxSizing: 'border-box', textAlign: 'left',
        background: 'linear-gradient(160deg,var(--locked,#f1ecff),var(--surface,#fff))', border: '2px solid var(--line-deep,#e3dcff)' }}>
        <small style={{ color: 'var(--muted)', fontWeight: 800 }}>PRÓXIMA PARADA</small>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '6px 0' }}>
          <div style={{ position: 'relative', width: 64, height: 64, flex: 'none', borderRadius: 18, background: 'var(--primary)', padding: 8, boxSizing: 'border-box' }}>
            <motion.span style={{ display: 'block', width: 48, height: 48 }} initial={{ y: 6, scale: 0.9 }} animate={{ y: 0, scale: 1 }} transition={{ duration: 0.5, delay: 0.5 }}>
              <Html h={'<svg viewBox="0 0 40 40" aria-hidden="true">' + (A.PLACE_IC[px.idx] || A.PLACE_IC[0]) + '</svg>'} /></motion.span>
          </div>
          <div style={{ flex: 1 }}><b style={{ fontSize: 18 }}>{px.lugar}</b><br /><span style={{ color: 'var(--muted)', fontWeight: 700 }}>{px.titulo}</span></div>
          <div className="fp-p" style={{ width: 56, flex: 'none' }}><Pingo S={S} mood="wave" /></div>
        </div>
        {px.gancho && <p style={{ margin: '4px 0 8px', fontWeight: 800, fontSize: 16, color: 'var(--ink)' }}>{px.gancho}</p>}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>{px.topicos.map(t => <span className="fp-chip" key={t}>{t}</span>)}</div>
      </motion.div>}
      {!px && <motion.p {...fade(0.4)} style={{ margin: 0 }}>Mais paradas chegam em breve. Você já fechou todas as de agora!</motion.p>}
    </div></div>
    <div className="lfoot"><button className="btn" onClick={onContinuar}>{px ? 'Vamos lá!' : 'Continuar'}</button></div>
  </div></div>
}
