import { useState } from 'react'
import { patchSave } from './lib/save'
import { load } from './lib/store'
import { sfx, buzz } from './lib/sound'
import { confetti, popIn } from './Fx'
import { rankList, myCode, addFriend, demoFriends, clearFriends, pendGifts, giftItems, giftDesc, giftsS, GiftAPI, GIFT_OPTS, GIFT_MSGS, hash32 } from './lib/friends'

const GIFT='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="8" width="18" height="5" rx="1.5"/><path d="M5 13v7h14v-7M12 8v12"/><path d="M12 8c-1-3-5-3.5-5-1.2S10 8 12 8zM12 8c1-3 5-3.5 5-1.2S14 8 12 8z"/></svg>'
const CROWN='<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M3 8l4.5 4L12 5l4.5 7L21 8l-2 11H5z" fill="#ffc933" stroke="#e59a00" stroke-width="1.6" stroke-linejoin="round"/></svg>'
const Html=({h,cls}:{h:string;cls?:string})=><span className={cls} style={cls?undefined:{display:'contents'}} dangerouslySetInnerHTML={{__html:h}}/>
const Av=({n,me}:{n:string;me:boolean})=><span className={'fav'+(me?' me':'')} style={{background:['#7b3ff2','#18b4d8','#ff4fae','#ff9a1f','#3fbf5f','#6a5cff'][hash32(n)%6]}}>{n.charAt(0).toUpperCase()}</span>

function Rows({S,max,gift,onGift}:{S:any;max?:number;gift?:boolean;onGift?:(n:string)=>void}){
  return <>{rankList(S).slice(0,max||99).map((r,i)=><div key={r.n+i} className={'frrow'+(r.me?' me':'')}>
    <span className="frpos">{i===0?<Html h={CROWN}/>:i+1}</span><Av n={r.n} me={r.me}/>
    <div className="frn"><b>{r.n}{r.me?' (você)':''}</b><small>{r.b} {r.b===1?'dia':'dias'} de brilho</small></div>
    <span className="frxp">{r.xp}<small> energia</small></span>
    {gift&&!r.me&&<button className="frgift" aria-label={'Enviar presente para '+r.n} onClick={()=>onGift?.(r.n)}><Html h={GIFT}/></button>}</div>)}</>
}

/** Cartão "Amigos" do Perfil */
export function FriendsCard({S,onOpen}:{S:any;onOpen:()=>void}){
  const n=(S.fr||[]).length,p=pendGifts(S)
  return <><div className="sect">Amigos{p>0&&<> <span className="gdot">{p}</span></>}</div>
    <div className="frcard">{n?<Rows S={S} max={3}/>:<p className="note" style={{margin:'0 0 10px'}}>Convide amigos para ver quem lidera a semana em energia.</p>}
      <button className="btn prim" style={{marginTop:10}} onClick={onOpen}>{n?'Ver ranking e convidar':'Convidar amigos'}</button></div></>
}

type View={k:'amigos'}|{k:'gift'}|{k:'sent';to:string;desc:string}|{k:'inbox'}|{k:'opened';g:any;extra:number}
/** Folha de Amigos: apelido, convite, seguir, ranking da semana e presentes. Lê o save a cada tela (a folha não some ao gravar). */
export function FriendsSheet({inviteCode,onClose}:{inviteCode?:string|null;onClose:()=>void}){
  const [,tick]=useState(0),rf=()=>tick(x=>x+1)
  const S=load()
  const [v,setV]=useState<View>({k:'amigos'})
  const [msg,setMsg]=useState('')
  const [nick,setNick]=useState(S.nick||''),[who,setWho]=useState('')
  const [invite,setInvite]=useState(inviteCode||null)
  const [gu,setGu]=useState({to:'',tab:'chips',amt:0,item:'',msg:0})
  const mut=(fn:(s:any)=>void)=>{patchSave(fn);rf()}
  const link=location.href.split('#')[0]+'#convite='+(S.code||'')
  const copy=(url:string)=>{try{navigator.clipboard.writeText(url).then(()=>setMsg('Link copiado!'),()=>setMsg('Selecionei o link: copie com o dedo.'))}catch{setMsg('Selecionei o link: copie com o dedo.')}}
  const share=(url:string)=>{if(navigator.share)navigator.share({title:'Pingo Quest',text:'Estude Redes comigo no Pingo Quest!',url}).catch(()=>{});else copy(url)}
  const sheet=(label:string,body:React.ReactNode,tall=true)=><div id="modal" onClick={onClose}><div className={'sheet'+(tall?' tall':'')} ref={popIn} role="dialog" aria-label={label} onClick={e=>e.stopPropagation()}>{body}</div></div>
  if(!S.code)mut(s=>{myCode(s)})

  if(v.k==='sent')return sheet('Presente enviado',<><div className="gdone"><div className="gbox"><Html h={GIFT}/></div><h2>Presente enviado!</h2><p className="note">{v.to} vai receber {v.desc}.</p></div>
    <button className="btn prim" onClick={()=>setV({k:'amigos'})}>Pronto</button></>,false)
  if(v.k==='opened')return sheet('Presente aberto',<><div className="gdone"><div className="gbox pop"><Html h={GIFT}/></div><h2>{v.g.from} mandou {giftDesc(v.g)}!</h2>
    <p className="note">{v.extra?`Você já tinha esse item, então ganhou ${v.extra} chips.`:'Já está com você.'}</p></div><button className="btn prim" onClick={()=>setV({k:'inbox'})}>Continuar</button></>,false)
  if(v.k==='inbox'){
    const list=giftsS(S).inbox.filter(x=>!x.opened)
    return sheet('Presentes recebidos',<><h2 style={{margin:'0 0 8px'}}>Presentes para você</h2>
      {list.length?list.map(g=><div className="grow" key={g.id}><span className="gbox sm"><Html h={GIFT}/></span><div className="frn"><b>{g.from} mandou {giftDesc(g)}</b><small>{g.msg||''}</small></div>
        <button className="btn prim gopen" onClick={()=>{
          let r:any;patchSave(s=>{r=GiftAPI.claim(s,g.id)})
          if(!r.ok){rf();return}
          sfx('win');buzz([20,40,30]);confetti();setV({k:'opened',g:r.gift,extra:r.extra})}}>Abrir</button></div>):<p className="note">Nenhum presente esperando.</p>}
      <button className="btn ghost" style={{marginTop:12}} onClick={()=>setV({k:'amigos'})}>Voltar</button></>)
  }
  if(v.k==='gift'){
    const items=giftItems(S),bal=gu.tab==='chips'?(S.gems??50):(S.xp||0)
    const ok=gu.tab==='item'?!!gu.item:gu.amt>0&&bal>=gu.amt
    const send=()=>{
      let r:any;patchSave(s=>{r=GiftAPI.send(s,gu.to,{type:gu.tab,amount:gu.tab==='item'?0:gu.amt,item:gu.tab==='item'?gu.item:'',msg:GIFT_MSGS[gu.msg]})})
      if(!r.ok){rf();return}
      sfx('win');buzz([20,40,30]);confetti();setV({k:'sent',to:gu.to,desc:giftDesc(r.gift)})
    }
    return sheet('Enviar presente',<><h2 style={{margin:'0 0 2px'}}>Presente para {gu.to}</h2>
      <p className="note" style={{margin:'0 0 10px'}}>Seu saldo: {S.xp||0} de energia · {S.gems??50} chips</p>
      <div className="gtabs">{([['chips','Chips'],['energia','Energia'],['item','Item do robô']] as [string,string][]).map(t=>
        <button key={t[0]} className={'gtab'+(gu.tab===t[0]?' on':'')} onClick={()=>setGu({...gu,tab:t[0],amt:0,item:''})}>{t[1]}</button>)}</div>
      {gu.tab==='item'
        ?(items.length?<><div className="gitems">{items.map(it=><button key={it.id} className={'gopt'+(gu.item===it.id?' on':'')} onClick={()=>setGu({...gu,item:it.id})}><b>{it.nome}</b><small>Item de evento</small></button>)}</div>
          <p className="note" style={{margin:'8px 0 0'}}>Ao dar, você deixa de ter o item.</p></>
          :<p className="note" style={{margin:'8px 0'}}>Você ainda não tem itens de evento para dar. Eles vêm de eventos especiais.</p>)
        :<div className="gamts">{GIFT_OPTS[gu.tab].map(a=>{const lock=bal<a
          return <button key={a} className={'gopt'+(gu.amt===a?' on':'')+(lock?' lock':'')} disabled={lock} onClick={()=>setGu({...gu,amt:a})}><b>{a}</b><small>{gu.tab==='chips'?'chips':'energia'}</small></button>})}</div>}
      <label className="frl" style={{marginTop:14}}>Recado</label>
      <div className="gmsgs">{GIFT_MSGS.map((m,i)=><button key={i} className={'gmsg'+(gu.msg===i?' on':'')} onClick={()=>setGu({...gu,msg:i})}>{m}</button>)}</div>
      <button className="btn prim" style={{marginTop:16}} disabled={!ok} onClick={send}>Enviar presente</button>
      <button className="btn ghost" style={{marginTop:10}} onClick={()=>setV({k:'amigos'})}>Voltar</button>
      <p className="note" style={{margin:'10px 0 0'}}>Prévia: o presente ainda não chega a pessoas de verdade. Quando criarmos as contas online, ele é entregue.</p></>)
  }
  // tela principal
  const n=(S.fr||[]).length,p=pendGifts(S)
  return sheet('Amigos',<><h2 style={{margin:'0 0 4px'}}>Amigos</h2>
    <p className="note" style={{margin:'0 0 12px'}}>Prévia: por enquanto os amigos são de mentira. Quando criarmos as contas online, eles viram pessoas de verdade.</p>
    {p>0&&<button className="frinv gbtn" onClick={()=>setV({k:'inbox'})}><Html h={GIFT}/><span><b>Você tem {p} {p===1?'presente':'presentes'}</b><small>Toque para abrir</small></span></button>}
    {invite&&<div className="frinv">Você abriu o convite <b>{invite}</b>. <button className="btn prim" onClick={()=>{mut(s=>{addFriend(s,'Amigo '+invite)});setMsg('Agora você segue Amigo '+invite+'.');setInvite(null);history.replaceState(null,'',location.href.split('#')[0])}}>Seguir esse amigo</button></div>}
    {msg&&<div className="frmsg">{msg}</div>}
    <label className="frl" htmlFor="amnick">Seu apelido</label>
    <div className="frline"><input id="amnick" maxLength={14} placeholder="Ex.: Lorraine" value={nick} onChange={e=>setNick(e.target.value)} autoComplete="off"/>
      <button className="btn ghost" onClick={()=>{const t=nick.trim().slice(0,14);mut(s=>{s.nick=t});setMsg(t?'Apelido salvo!':'Apelido removido.')}}>Salvar</button></div>
    <label className="frl">Seu link de convite</label><div className="frlink">{link}</div>
    <div className="frline"><button className="btn prim" onClick={()=>share(link)}>Convidar</button><button className="btn ghost" onClick={()=>copy(link)}>Copiar link</button></div>
    <label className="frl" htmlFor="amadd">Seguir pelo apelido</label>
    <div className="frline"><input id="amadd" maxLength={14} placeholder="Apelido do amigo" value={who} onChange={e=>setWho(e.target.value)} autoComplete="off"/>
      <button className="btn ghost" onClick={()=>{if(who.trim()){mut(s=>{addFriend(s,who)});setMsg('Agora você segue '+who.trim().slice(0,14)+'.');setWho('')}}}>Seguir</button></div>
    <div className="sect" style={{marginTop:18}}>Topo da semana</div>
    <div className="frcard"><Rows S={S} gift onGift={to=>{setGu({to,tab:'chips',amt:0,item:'',msg:0});setV({k:'gift'})}}/></div>
    <p className="note" style={{margin:'8px 0 0'}}>Reinicia toda segunda-feira. Conta a energia ganha na semana.</p>
    {n?<button className="btn ghost" style={{marginTop:10}} onClick={()=>mut(clearFriends)}>Remover amigos de mentira</button>
      :<button className="btn ghost" style={{marginTop:10}} onClick={()=>mut(demoFriends)}>Ver com amigos de mentira</button>}
    <button className="btn prim" style={{marginTop:14}} onClick={onClose}>Fechar</button></>)
}
