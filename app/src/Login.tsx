import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, confetti, motion, stagger } from './Fx'
import { Pingo } from './Pingo'
import { GoogleButton } from './GoogleButton'
import { AuthError, type AuthErrorInfo } from './AuthError'
import { classifyAuthError, errorCode, signInGoogle, signInGuest, type AuthStep } from './lib/auth'
import { done, totalFases } from './lib/cursos'
import { cursoAtivo, streakNow, gamesOf } from './lib/progress'
import { buzz, reducedMotion, sfx } from './lib/sound'
import type { Save } from './lib/store'

export type LoginDest = 'welcome' | 'trail'
type Props = {
  S: Save
  booting: boolean
  signedIn?: boolean // já entrou com Google: não oferece o Google de novo
  onBusy: (busy: boolean) => void
  onContinueLocal: () => void
  onDone: (dest: LoginDest) => void
}
type Failure = AuthErrorInfo & { step: AuthStep }

const SLOW_BOOT_MS = 4000
const SKELETON_DELAY_MS = 300
const SAD_MS = 2400
const HINT_MS = 3000
const SUCCESS_MS = 900
const SUCCESS_REDUCED_MS = 500

const SUPPORT_DEFAULT = {
  A: 'Com Google, seu progresso fica guardado e você libera amigos e presentes. Como convidado, você joga já e salva depois.',
  B: 'Entre com o Google para guardar seu progresso na nuvem e continuar em outro aparelho.',
}

/** Fala do Pingo para quem volta: cumprimenta pela hora e diz o que vem agora (tirado do progresso real) */
function falaDoPingo(S: Save, dias: number): { titulo: string; sub: string } {
  const h = new Date().getHours()
  const saud = h < 5 ? 'Oi, coruja' : h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite'
  const nome = S.nick ? ', ' + S.nick : ''
  const cur = cursoAtivo(S)
  const games = gamesOf(cur.id)
  const feitas = (S.done || {}) as Record<string, boolean>
  const paradas: any[] = cur.json.mundos?.[0]?.paradas || []
  let prox = ''
  outer: for (let g = 0; g < games.length; g++) {
    for (let k = 0; k < 4; k++) {
      if (k === 3 && !games[g].phases.length) continue
      if (!feitas[g + '-' + k]) {
        const lugar = paradas[g]?.lugar || 'a trilha'
        prox = k < 3 ? `Lição ${k + 1}, “${games[g].names[k]}” (parada ${lugar})` : `Prova final (parada ${lugar})`
        break outer
      }
    }
  }
  const algo = Object.keys(feitas).length > 0
  const titulo = saud === 'Oi, coruja' ? `Oi, coruja${nome}!` : `${saud}${nome}!`
  if (!prox) return { titulo, sub: 'Você fechou todas as paradas de agora. Bora revisar e manter o brilho?' }
  if (!algo) return { titulo, sub: `Já deixei tudo pronto! Sua primeira missão: ${prox}. Bora?` }
  const brilho = dias > 1 ? ` Seu brilho está em ${dias} dias, não deixa apagar!` : ''
  return { titulo, sub: `Estava te esperando! Sua próxima missão: ${prox}.${brilho}` }
}

/** Texto que aparece como se o Pingo estivesse digitando (sem animar para quem pediu menos movimento) */
function Digita({ texto }: { texto: string }) {
  const [n, setN] = useState(reducedMotion() ? texto.length : 0)
  useEffect(() => {
    if (reducedMotion()) return
    const t = setInterval(() => setN(x => (x >= texto.length ? (clearInterval(t), x) : x + 2)), 22)
    return () => clearInterval(t)
  }, [texto])
  return <span aria-label={texto}><span aria-hidden="true">{texto.slice(0, n)}</span></span>
}

export function Login({ S, booting, signedIn, onBusy, onContinueLocal, onDone }: Props) {
  const [hasLocal] = useState(() => !!S.onb)
  const variant = hasLocal ? 'B' : 'A'
  const [busy, setBusy] = useState<'google' | 'guest' | null>(null)
  const [fail, setFail] = useState<Failure | null>(null)
  const [hint, setHint] = useState<string | null>(null)
  const [sad, setSad] = useState(false)
  const [slow, setSlow] = useState(false)
  const [showSkel, setShowSkel] = useState(false)
  const [acena, setAcena] = useState(hasLocal)
  useEffect(() => { if (!acena) return; const t = setTimeout(() => setAcena(false), 2200); return () => clearTimeout(t) }, [acena])
  const [success, setSuccess] = useState<{ text: string; dest: LoginDest } | null>(null)
  const heading = useRef<HTMLHeadingElement>(null)
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])
  const skip = useRef<(() => void) | null>(null)

  useEffect(() => {
    const pending = timers.current
    return () => pending.forEach(clearTimeout)
  }, [])

  useEffect(() => {
    if (!booting) heading.current?.focus({ preventScroll: true })
  }, [booting])

  useEffect(() => {
    if (!booting) return
    const t = setTimeout(() => setSlow(true), SLOW_BOOT_MS)
    const k = setTimeout(() => setShowSkel(true), SKELETON_DELAY_MS)
    return () => { clearTimeout(t); clearTimeout(k) }
  }, [booting])

  useEffect(() => {
    if (!success) return
    let fired = false
    const go = () => { if (fired) return; fired = true; onDone(success.dest) }
    skip.current = go
    const t = setTimeout(go, reducedMotion() ? SUCCESS_REDUCED_MS : SUCCESS_MS)
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Enter') go() }
    window.addEventListener('keydown', onKey)
    return () => { clearTimeout(t); window.removeEventListener('keydown', onKey) }
  }, [success, onDone])

  const later = (fn: () => void, ms: number) => { timers.current.push(setTimeout(fn, ms)) }

  const run = async (step: 'google' | 'guest') => {
    if (busy || success) return
    setBusy(step)
    setFail(null)
    setHint(null)
    onBusy(true)
    sfx(step === 'google' ? 'ping' : 'start')
    try {
      if (step === 'google') await signInGoogle()
      else await signInGuest()
      setBusy(null)
      setSuccess({
        text: variant === 'B' ? 'Seu progresso está salvo. Bora aprender!' : step === 'google' ? 'Conectado! Bora aprender.' : 'Tudo pronto! Bora aprender.',
        dest: variant === 'B' ? 'trail' : 'welcome',
      })
      sfx('win')
      confetti()
    } catch (e) {
      console.error('login failed', { step, code: errorCode(e) }, e)
      setBusy(null)
      onBusy(false)
      const f = classifyAuthError(e, step)
      if (f.kind === 'cancelled') {
        setHint('Tudo bem, sem pressa.')
        later(() => setHint(null), HINT_MS)
        return
      }
      setFail({ ...f, step })
      setSad(true)
      sfx('bad')
      buzz(30)
      later(() => setSad(false), SAD_MS)
    }
  }

  const mood = success ? 'cheer' : busy || booting ? 'think' : sad ? 'sad' : acena ? 'wave' : 'happy'
  const stage = (
    <div className={'lg-stage' + (busy || booting ? ' busy' : '') + (sad ? ' sad' : '')}>
      <Pingo S={S} mood={mood} cls="lg-pingo" />
      <span className="lg-sonar" aria-hidden="true"><i /></span>
    </div>
  )
  const bits = <div className="lg-bits" aria-hidden="true"><i /><i /><i /><i /><i /><i /></div>

  if (booting) {
    return (
      <main id="login" aria-label="Pingo Quest">
        {bits}
        <div className="lg-col">
          <div className="lg-top">
            <p className="lg-word">PINGO QUEST</p>
            {stage}
          </div>
          <div className="lg-actions">
            <div role="status" aria-label="Abrindo o Pingo Quest">
              {showSkel && <><div className="lg-skel" /><div className="lg-skel" /></>}
            </div>
            {slow && <p className="lg-note" role="status">Está demorando mais que o normal...</p>}
            {slow && hasLocal && <button type="button" className="btn ghost" onClick={onContinueLocal}>Continuar sem conexão por enquanto</button>}
          </div>
        </div>
      </main>
    )
  }

  const cur = cursoAtivo(S)
  const days = streakNow(S)
  const stats: [string, string][] = [
    [done(S, cur.id).length + '/' + totalFases(cur.json), 'fases'],
    ...(days > 0 ? [[String(days), 'dias de brilho'] as [string, string]] : []),
    [String(S.gems ?? 0), 'chips'],
  ]
  const fala = variant === 'B' ? falaDoPingo(S, days) : null
  const support = busy === 'google' ? 'Termine o login na janelinha do Google.' : hint ?? SUPPORT_DEFAULT[variant]

  return (
    <main id="login" onClick={() => skip.current?.()}>
      {bits}
      <div className="lg-col">
        <div className="lg-top">
          {variant === 'A' && !success && <p className="lg-word">PINGO QUEST</p>}
          {stage}
          <motion.h1 ref={heading} tabIndex={-1} {...stagger(1)}>
            {success ? success.text : variant === 'A' ? 'Oi! Eu sou o Pingo.' : fala?.titulo}
          </motion.h1>
          {!success && (
            <motion.p className="lg-sub" {...stagger(2)}>
              {variant === 'A' ? 'Vou te ensinar Redes e Linux, um passo de cada vez.' : <Digita texto={fala?.sub || ''} />}
            </motion.p>
          )}
          {!success && variant === 'B' && (
            <motion.div className="mini lg-mini" style={{ gridTemplateColumns: `repeat(${stats.length},1fr)` }} {...stagger(3)}>
              {stats.map(([v, l]) => <div key={l}><b>{v}</b><span>{l}</span></div>)}
            </motion.div>
          )}
        </div>
        <span className="lg-sr" role="status">{success?.text}</span>
        <AnimatePresence>
          {!success && (
            <motion.div key="actions" className="lg-actions" {...stagger(4)} exit={{ opacity: 0, transition: { duration: 0.15 } }}>
              {fail && <AuthError failure={fail} />}
              {variant === 'A' ? (
                <>
                  <GoogleButton label="Continuar com o Google" busy={busy === 'google'} blocked={busy === 'guest'} onClick={() => run('google')} />
                  <GuestButton busy={busy === 'guest'} blocked={busy === 'google'} onClick={() => run('guest')} />
                </>
              ) : (
                <>
                  <button type="button" className="btn" aria-disabled={busy ? true : undefined} onClick={() => { if (!busy) { sfx('start'); onContinueLocal() } }}>Bora aprender!</button>
                  {!signedIn && <>
                    <p className="lg-or" aria-hidden="true">ou</p>
                    <GoogleButton label="Continuar com o Google" busy={busy === 'google'} onClick={() => run('google')} />
                  </>}
                </>
              )}
              <p className="lg-note" role="status">{support}</p>
              {variant === 'A' && (
                <p className="lg-legal">
                  Ao continuar, você aceita os <a href="termos/" target="_blank" rel="noopener noreferrer">Termos</a> e a <a href="privacidade/" target="_blank" rel="noopener noreferrer">Política de Privacidade</a>.
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  )
}

function GuestButton({ busy, blocked, onClick }: { busy: boolean; blocked: boolean; onClick: () => void }) {
  const inert = busy || blocked
  return (
    <button type="button" className="btn ghost" aria-busy={busy || undefined} aria-disabled={inert || undefined} onClick={() => { if (!inert) onClick() }}>
      {busy ? 'Preparando seu robô...' : 'Entrar como convidado'}
    </button>
  )
}
