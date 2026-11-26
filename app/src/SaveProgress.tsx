import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { useAuth } from './lib/use-auth'
import { AuthError, type AuthErrorInfo } from './AuthError'
import { GoogleButton } from './GoogleButton'
import { Pingo } from './Pingo'
import { confetti, toast } from './Fx'
import { classifyAuthError, errorCode, linkGoogle } from './lib/auth'
import { sfx } from './lib/sound'
import type { Save } from './lib/store'

const CARD_COLOR = { '--tc': 'var(--amarelo)' } as CSSProperties

/** Card do Perfil: liga o convidado a uma conta Google mantendo o mesmo uid. */
export function SaveProgressCard({ S }: { S: Save }) {
  const { user, isAnonymous, refresh } = useAuth()
  const [busy, setBusy] = useState(false)
  const [fail, setFail] = useState<AuthErrorInfo | null>(null)
  const [hint, setHint] = useState(false)
  const hintTimer = useRef<ReturnType<typeof setTimeout>>(undefined)
  useEffect(() => () => clearTimeout(hintTimer.current), [])
  if (!user) return null

  if (!isAnonymous) {
    return (
      <div className="card lg-linked" style={CARD_COLOR}>
        <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="var(--ok)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12.5 4.5 4.5L19 7.500" /></svg>
        <b>Conta Google conectada</b>
      </div>
    )
  }

  const link = async () => {
    if (busy) return
    setBusy(true)
    setFail(null)
    setHint(false)
    sfx('ping')
    try {
      await linkGoogle(user)
      refresh()
      confetti(18)
      sfx('win')
      toast('Progresso salvo na sua conta Google!')
    } catch (e) {
      console.error('link google failed', { code: errorCode(e) }, e)
      const f = classifyAuthError(e, 'link')
      if (f.kind === 'cancelled') {
        setHint(true)
        clearTimeout(hintTimer.current)
        hintTimer.current = setTimeout(() => setHint(false), 3000)
      } else {
        setFail(f)
        sfx('bad')
      }
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="card lg-save" style={CARD_COLOR}>
      <div className="lg-save-head">
        <span className="sp"><Pingo S={S} mood="love" cls="pingo-s" /></span>
        <div>
          <h2>Salvar progresso com Google</h2>
          <p className="note">Hoje seu progresso só existe neste aparelho. Salvando, você não perde nada, joga em outro aparelho e libera amigos e presentes.</p>
        </div>
      </div>
      {fail && <AuthError failure={fail} />}
      <p className="note" role="status" style={{ margin: hint ? '0 0 10px' : 0 }}>{hint ? 'Tudo bem, sem pressa.' : ''}</p>
      <GoogleButton label="Continuar com o Google" busy={busy} onClick={link} />
    </div>
  )
}
