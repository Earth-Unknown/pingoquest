import { liberadas, totais } from './lib/curiosidades'

/** Tudo que o Pingo já contou fica guardado aqui, para reler quando quiser */
export function Album({S}:{S:any}){
  const id=S.curso||'redes',lib=liberadas(S,id),vistas=lib.filter(c=>!c.novo),total=totais(id)
  if(!total)return null
  const grupos=vistas.reduce((m:Record<string,typeof vistas>,c)=>{(m[c.lugar]=m[c.lugar]||[]).push(c);return m},{})
  return <>
    <div className="sect">Álbum de curiosidades</div>
    <p className="note" style={{margin:'0 0 8px'}}>Curiosidades guardadas: {vistas.length} de {total}. Toque no Pingo para ouvir mais.</p>
    {vistas.length===0
      ?<p className="note" style={{margin:0}}>Toque no Pingo, em qualquer tela, e ele conta uma curiosidade da sua parada.</p>
      :Object.entries(grupos).map(([lugar,cs])=><div key={lugar} style={{background:'var(--locked,#f1ecff)',borderRadius:16,padding:'10px 14px',marginBottom:8}}>
        <b style={{fontSize:14,color:'var(--primary)'}}>{lugar}</b>
        {cs.map(c=><p key={c.key} style={{margin:'6px 0 0',fontSize:15,lineHeight:1.4}}>{c.texto}</p>)}</div>)}
  </>
}
