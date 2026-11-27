// Fim de parada: o que o aluno ganhou (item do robô, invenção na Oficina, vidas) e uma prévia da próxima parada.
import { useState } from 'react'
import { motion } from 'motion/react'
import art from '../legacy/art.json'
import { Pingo } from '../Pingo'
import { enter } from '../Fx'
import { HEART_ICON } from '../Hearts'
import { patchSave } from '../lib/save'
import { equip, concederBrinde } from '../lib/avatar'
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
.fp-p svg{width:100%!important;height:auto;display:block}.fp-chip{background:var(--locked,#f1ecff);border-radius:99px;padding:3px 10px;font-size:13px;font-weight:800}`

/** Linha "Novo para o Pingo" com botão de vestir (só visual, não muda nada do jogo) */
export function NovoItemLinha({ n, simulado, rotulo = 'Novo para o seu robô' }: { n: NovoItem; simulado?: boolean; rotulo?: string }) {
  const [on, setOn] = useState(false)
  return <div className="fp-row" style={{ marginTop: 2 }}><style>{css}</style>
    <Html cls="fp-ic" h={n.icone} />
    <span style={{ flex: 1 }}><small>{rotulo}</small>{n.nome}</span>
    <button className="btn ghost" style={{ width: 'auto', padding: '6px 14px', minHeight: 0 }} disabled={on}
      onClick={() => { if (!simulado) patchSave(s => equip(s, n.slot, n.id)); setOn(true); sfx('ok') }}>{on ? 'Vestido' : 'Vestir'}</button>
  </div>
}

/** Fim de parada: 3 adereços para o aluno escolher 1 (ou nenhum). Em modo simulado (modo dono) não grava nada. */
function EscolhaAdereco({ opcoes, simulado }: { opcoes: NovoItem[]; simulado?: boolean }) {
  const [pick, setPick] = useState<NovoItem | null>(null)
  if (pick) return <NovoItemLinha n={pick} simulado={simulado} rotulo="Você escolheu" />
  return <div style={{ background: 'var(--locked,#f1ecff)', borderRadius: 16, padding: '10px 12px', width: '100%', boxSizing: 'border-box' }}>
    <b style={{ fontSize: 15 }}>Escolha um adereço para o seu robô</b>
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${opcoes.length},1fr)`, gap: 8, marginTop: 8 }}>
      {opcoes.map(o => <button type="button" key={o.slot + o.id} aria-label={'Escolher ' + o.nome}
        onClick={() => { if (!simulado) patchSave(s => concederBrinde(s, o.slot, o.id)); sfx('ok'); setPick(o) }}
        style={{ border: '2px solid var(--line-deep,#e3dcff)', background: 'var(--surface,#fff)', borderRadius: 14, padding: '8px 4px', font: 'inherit', fontWeight: 800, fontSize: 12, color: 'var(--ink)', cursor: 'pointer' }}>
        <Html cls="fp-ic" h={o.icone} /><br />{o.nome}</button>)}
    </div>
    <small style={{ color: 'var(--muted)', fontWeight: 700 }}>Toque em um. Se preferir nenhum, é só continuar.</small>
  </div>
}

export function FimParadaTela({ S, invencao, fim, novos, onContinuar }: { S: any; invencao: InvencaoDef; fim: FimParada; novos?: NovoItem[]; onContinuar: () => void }) {
  const fade = (d: number) => ({ initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.3, delay: d, ease: 'easeOut' as const } })
  const px = fim.prox
  const placa = (idx: number) => '<svg viewBox="0 0 40 40" aria-hidden="true">' + (A.PLACE_IC[idx] || A.PLACE_IC[0]) + '</svg>'
  return <div id="lesson" ref={enter}><style>{css}</style><div className="lw">
    <div className="lbody lscroll"><div className="center" style={{ gap: 10 }}>
      <motion.h1 {...fade(0)} style={{ margin: 0, fontSize: 26 }}>Parada {fim.idx + 1} concluída!</motion.h1>
      <motion.p {...fade(0.05)} style={{ margin: 0 }}>{fim.lugar}: {fim.titulo}</motion.p>

      <motion.div {...fade(0.15)} style={{ display: 'flex', flexDirection: 'column', gap: 6, width: '100%' }}>
        <div className="fp-row">
          <span className="fp-ic" style={{ filter: `hue-rotate(${matiz(fim.idx)}deg)` }}><Invencao invencao={invencao} acesos={invencao.modulos.length} /></span>
          <span><small>Guardada na sua Oficina</small>Estação Pingo · {fim.lugar}</span>
        </div>
        {novos?.map(n => <NovoItemLinha key={n.slot + n.id} n={n} simulado={fim.simulado} />)}
        {fim.escolha && fim.escolha.length > 0 && <EscolhaAdereco opcoes={fim.escolha} simulado={fim.simulado} />}
        {fim.vidasCheias && <div className="fp-row"><Html cls="fp-ic" h={HEART_ICON} /><span><small>Recarregadas</small>Vidas cheias</span></div>}
      </motion.div>

      {px ? <motion.div {...fade(0.6)} style={{ width: '100%', marginTop: 6, textAlign: 'center' }}>
        <b style={{ fontSize: 18 }}>Você avançou para a Parada {px.idx + 1}!</b>
        {/* caminho: parada que acabou (check) → Pingo andando → próxima parada (cadeado abre) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 0, margin: '14px 4px 6px' }}>
          <div style={{ width: 64, textAlign: 'center', flex: 'none', whiteSpace: 'nowrap' }}>
            <div style={{ width: 48, height: 48, borderRadius: 16, background: '#3fbf5f', margin: '0 auto', display: 'grid', placeItems: 'center' }}>
              <Html cls="fp-ic" h={'<span style="color:#fff;display:contents">' + A.IC.check + '</span>'} /></div>
            <small style={{ fontWeight: 800 }}>Parada {fim.idx + 1}</small></div>
          <div style={{ flex: 1, position: 'relative', height: 48 }}>
            <div style={{ position: 'absolute', left: 4, right: 4, top: 22, height: 6, borderRadius: 3, background: 'var(--line-deep,#e3dcff)' }} />
            <motion.div style={{ position: 'absolute', left: 4, top: 22, height: 6, borderRadius: 3, background: 'var(--cyan,#18ddfb)' }} initial={{ width: 0 }} animate={{ width: 'calc(100% - 8px)' }} transition={{ duration: 1.3, delay: 0.8, ease: 'easeInOut' }} />
            <motion.div className="fp-p" style={{ position: 'absolute', top: -2, width: 44 }} initial={{ left: '0%' }} animate={{ left: 'calc(100% - 44px)' }} transition={{ duration: 1.3, delay: 0.8, ease: 'easeInOut' }}>
              <Pingo S={S} mood="walk" /></motion.div>
          </div>
          <div style={{ width: 64, textAlign: 'center', flex: 'none', position: 'relative', whiteSpace: 'nowrap' }}>
            <div style={{ width: 48, height: 48, borderRadius: 16, background: 'var(--primary)', margin: '0 auto', padding: 8, boxSizing: 'border-box', position: 'relative' }}>
              <Html h={placa(px.idx)} />
              <motion.span aria-hidden initial={{ opacity: 1, scale: 1 }} animate={{ opacity: 0, scale: 1.4 }} transition={{ duration: 0.4, delay: 2.1 }}
                style={{ position: 'absolute', inset: 0, borderRadius: 16, background: '#8b7fb0', display: 'grid', placeItems: 'center', color: '#fff', fontSize: 22 }}>🔒</motion.span>
            </div>
            <small style={{ fontWeight: 800 }}>Parada {px.idx + 1}</small></div>
        </div>
        <motion.div {...fade(2.2)} style={{ borderRadius: 18, padding: '10px 14px', textAlign: 'left', boxSizing: 'border-box', background: 'var(--locked,#f1ecff)', border: '2px solid var(--line-deep,#e3dcff)' }}>
          <b style={{ fontSize: 17 }}>{px.lugar}</b> <span style={{ color: 'var(--muted)', fontWeight: 700 }}>· {px.titulo}</span>
          {px.gancho && <p style={{ margin: '6px 0 8px', fontWeight: 800, fontSize: 16, color: 'var(--ink)' }}>{px.gancho}</p>}
          <small style={{ color: 'var(--muted)', fontWeight: 800 }}>NESSA PARADA VOCÊ VAI VER</small>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>{px.topicos.map(t => <span className="fp-chip" key={t}>{t}</span>)}</div>
        </motion.div>
      </motion.div>
      : <motion.p {...fade(0.4)} style={{ margin: 0 }}>Mais paradas chegam em breve. Você já fechou todas as de agora!</motion.p>}
    </div></div>
    <div className="lfoot"><button className="btn" onClick={onContinuar}>{px ? 'Ir para a Parada ' + (px.idx + 1) : 'Continuar'}</button></div>
  </div></div>
}
