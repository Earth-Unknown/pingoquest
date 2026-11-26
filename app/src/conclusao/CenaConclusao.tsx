// STUB: o agente da CENA substitui este arquivo. Mantenha a assinatura (ConclusaoProps).
import type { ConclusaoProps } from './contrato'
export function CenaConclusao(p: ConclusaoProps) {
  return <div style={{ padding: 24 }}><h1>{p.titulo}</h1><p>+{p.xp} energia · +{p.chips} chips</p><button className="btn" onClick={p.onContinuar}>Continuar</button></div>
}
