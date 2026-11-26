// Prévia isolada da nova conclusão de lição. Só roda com `npm run dev` (abra /preview-conclusao.html); NÃO entra no build do site.
// Parâmetros na URL: ?i=0..3 (módulo) &rep=1 (repetição) &xp=10 &chips=15 &tema=dark &mov=0 (reduzir movimento) &auto=1 (abre a cena direto)
import { StrictMode, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { MotionConfig } from 'motion/react'
import './legacy/jogo.css'
import './app.css'
import { ESTACAO_PINGO } from './conclusao/contrato'
import { Invencao } from './conclusao/Invencao'
import { CenaConclusao } from './conclusao/CenaConclusao'

const q = new URLSearchParams(location.search)
document.documentElement.setAttribute('data-theme', q.get('tema') === 'dark' ? 'dark' : 'light')
const S = { av: {} }

function Prévia() {
  const [indice, setIndice] = useState(+(q.get('i') ?? 0))
  const [rep, setRep] = useState(q.get('rep') === '1')
  const [xp, setXp] = useState(+(q.get('xp') ?? 10))
  const [chips, setChips] = useState(+(q.get('chips') ?? 15))
  const [aberta, setAberta] = useState(q.get('auto') === '1')
  const [vez, setVez] = useState(0)
  return <MotionConfig reducedMotion={q.get('mov') === '0' ? 'always' : 'user'}>
    <div style={{ maxWidth: 520, margin: '0 auto', padding: 16, fontFamily: 'system-ui' }}>
      <h2 style={{ margin: '0 0 8px' }}>Prévia: conclusão de lição</h2>
      <p style={{ margin: '0 0 12px', color: '#6c6492' }}>Somente desenvolvimento. Nada aqui grava no save.</p>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
        <label>Módulo <select value={indice} onChange={e => setIndice(+e.target.value)}>{[0, 1, 2, 3].map(i => <option key={i} value={i}>{i} · {ESTACAO_PINGO.modulos[i].nome}</option>)}</select></label>
        <label><input type="checkbox" checked={rep} onChange={e => setRep(e.target.checked)} /> repetição</label>
        <label>XP <input type="number" value={xp} onChange={e => setXp(+e.target.value)} style={{ width: 56 }} /></label>
        <label>Chips <input type="number" value={chips} onChange={e => setChips(+e.target.value)} style={{ width: 56 }} /></label>
        <button onClick={() => { setVez(v => v + 1); setAberta(true) }}>Abrir a cena</button>
      </div>
      <h3 style={{ margin: '8px 0' }}>A invenção em cada estado</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 6 }}>
        {[0, 1, 2, 3, 4].map(n => <div key={n} style={{ textAlign: 'center', fontSize: 12 }}><Invencao invencao={ESTACAO_PINGO} acesos={n} vazio={n < 4 ? n : undefined} />{n} acesos</div>)}
      </div>
    </div>
    {aberta && <CenaConclusao key={vez} S={S} invencao={ESTACAO_PINGO} indice={indice} repeticao={rep}
      titulo={rep ? 'Lição revisada!' : 'Lição concluída!'} subtitulo={rep ? 'Você já tinha essa peça.' : 'Mais uma descoberta!'}
      xp={xp} chips={chips} acertos={100} onContinuar={() => setAberta(false)} />}
  </MotionConfig>
}
createRoot(document.getElementById('root')!).render(<StrictMode><Prévia /></StrictMode>)
