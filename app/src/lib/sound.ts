// Sons do Pingo (Web Audio, sem arquivos): timbres suaves, só seno/triângulo, ataque macio e filtro passa-baixa
const KEY='pingoquest-snd'
let on=true
try{if(localStorage.getItem(KEY)==='0')on=false}catch{}
let ctx:AudioContext|null=null,out:AudioNode|null=null

export const soundOn=()=>on
export function setSound(v:boolean){on=v;try{localStorage.setItem(KEY,v?'1':'0')}catch{}}
export const reducedMotion=()=>{try{return window.matchMedia('(prefers-reduced-motion: reduce)').matches}catch{return false}}

function ac():AudioContext|null{
  if(!ctx){
    try{
      const AC=window.AudioContext||(window as any).webkitAudioContext
      const c:AudioContext=new AC()
      const lp=c.createBiquadFilter();lp.type='lowpass';lp.frequency.value=3800;lp.Q.value=.4
      const m=c.createGain();m.gain.value=.9;lp.connect(m);m.connect(c.destination)
      ctx=c;out=lp
    }catch{return null}
  }
  try{if(ctx!.state==='suspended')void ctx!.resume()}catch{}
  return ctx
}
function tone(f:number,t0:number,d:number,type:OscillatorType='sine',vol=.08,f2?:number){
  const c=ac();if(!c)return
  const o=c.createOscillator(),g=c.createGain(),n=c.currentTime+t0
  o.type=type;o.frequency.setValueAtTime(f,n)
  if(f2)o.frequency.exponentialRampToValueAtTime(f2,n+d)
  g.gain.setValueAtTime(0.0001,n);g.gain.exponentialRampToValueAtTime(vol,n+0.02);g.gain.exponentialRampToValueAtTime(0.0001,n+d)
  o.connect(g);g.connect(out||c.destination);o.start(n);o.stop(n+d+0.05)
}
/** sino: fundamental + oitava mais alta, com cauda longa */
const bell=(f:number,t0:number,d:number,vol=.08)=>{tone(f,t0,d,'sine',vol);tone(f*2,t0,d*.6,'sine',vol*.3)}

const SFX={
  tap:()=>tone(470,0,.05,'sine',.016),
  sel:()=>tone(560,0,.07,'sine',.035,640),
  next:()=>{tone(523,0,.1,'sine',.07);tone(784,.07,.2,'sine',.07);tone(1047,.14,.26,'sine',.04)},
  start:()=>{tone(392,0,.12,'triangle',.07);tone(523,.08,.12,'triangle',.07);tone(784,.16,.28,'triangle',.07);bell(1047,.24,.4,.04)},
  confirm:()=>{tone(380,0,.2,'sine',.05,880);bell(988,.14,.4,.08);bell(1319,.24,.5,.06)},
  boop:()=>{tone(520,0,.09,'sine',.09,780);tone(780,.09,.12,'sine',.08,1100)},
  ping:()=>{tone(1320,0,.4,'sine',.09);tone(990,.14,.45,'sine',.06)},
  ok:()=>{bell(784,0,.3,.09);bell(1175,.09,.4,.08)},
  combo:()=>{bell(784,0,.25,.08);bell(988,.08,.25,.08);bell(1319,.16,.5,.09)},
  bad:()=>tone(310,0,.26,'sine',.07,210),
  coin:()=>{bell(1319,0,.2,.06);bell(1760,.07,.34,.06)},
  open:()=>{[523,659,784,988,1175,1319,1568,2093].forEach((f,i)=>bell(f,i*.075,.5,.06));tone(262,0,.5,'sine',.06,392)},
  tick:()=>bell(1568,0,.07,.035),
  plim0:()=>{bell(988,0,.35,.09);bell(1319,.05,.45,.06)},
  plim1:()=>{bell(1175,0,.35,.09);bell(1568,.05,.45,.06)},
  plim2:()=>{bell(1319,0,.4,.09);bell(1760,.05,.5,.07);bell(2093,.12,.5,.04)},
  win:()=>{[523,659,784,1047].forEach((f,i)=>bell(f,i*.11,.4,.08));bell(1319,.5,.7,.06);bell(1568,.62,.8,.04)},
}
export type Sfx=keyof typeof SFX
export function sfx(n:Sfx){if(!on)return;try{SFX[n]()}catch{}}
/** vibração leve (celulares) */
export function buzz(ms:number|number[]){try{if(on&&navigator.vibrate)navigator.vibrate(ms)}catch{}}

/** Toque geral: navegar é quase mudo, escolher é um clique macio, avançar/confirmar é mais rico */
const CLS:[string,Sfx][]=[
  ['.nbtn','tap'],['.opt','sel'],['.duopt','sel'],['.dchip','sel'],['.dth','sel'],['.avchip','sel'],['.tchip','sel'],['.dev','sel'],['.plan','sel'],['.pl','sel'],['.seg button','sel'],
  ['.btn.prim','next'],['.btn','tap'],['.node','tap'],['.srow','next'],['.xbtn','tap'],['.mbtn','coin'],['.evcard','next'],['#evfab','next'],
]
let armed=false
/** Liga o som de toque em todos os botões (uma vez só) */
export function armClickSounds(){
  if(armed)return;armed=true
  document.addEventListener('click',e=>{
    const t=e.target as Element|null;if(!t||!t.closest)return
    const b=t.closest('button');if(!b||(b as HTMLButtonElement).disabled)return
    for(const [sel,s] of CLS)if(b.matches(sel)){sfx(s);return}
  },true)
}
