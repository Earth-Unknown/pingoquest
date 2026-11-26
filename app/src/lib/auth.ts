import { FirebaseError } from 'firebase/app'
import { GoogleAuthProvider, linkWithPopup, signInAnonymously, signInWithPopup, signOut, type User } from 'firebase/auth'
import { auth } from './firebase'

const provider = new GoogleAuthProvider()

export const signInGoogle = () => signInWithPopup(auth, provider)
export const signInGuest = () => signInAnonymously(auth)
export const linkGoogle = (user: User) => linkWithPopup(user, provider)
export const logOut = () => {
  cancelGuestRetry()
  return signOut(auth)
}

export type AuthStep = 'google' | 'guest' | 'link'
export type AuthFailure =
  | { kind: 'cancelled' }
  | { kind: 'error'; message: string; code: string | null; retry: boolean }

const CANCELLED = ['auth/popup-closed-by-user', 'auth/cancelled-popup-request']
const EMBEDDED = ['auth/operation-not-supported-in-this-environment']

export const errorCode = (e: unknown): string | null => (e instanceof FirebaseError ? e.code : null)

export function classifyAuthError(e: unknown, step: AuthStep): AuthFailure {
  const code = errorCode(e)
  if (code && CANCELLED.includes(code)) return { kind: 'cancelled' }
  const embedded = (code !== null && EMBEDDED.includes(code)) || (e instanceof Error && e.message.includes('disallowed_useragent'))
  const fail = (message: string, retry = false, showCode = false): AuthFailure => ({ kind: 'error', message, code: showCode ? code : null, retry })
  if (code === 'auth/popup-blocked') return fail('O navegador bloqueou a janelinha do Google. Libere pop-ups para este site e tente de novo.', true)
  if (code === 'auth/network-request-failed') {
    return step === 'guest'
      ? fail('Não consegui preparar seu robô sem internet. Conecte-se e tente de novo.')
      : fail('Sem internet por aqui. Confira a conexão e tente de novo.', true)
  }
  if (embedded) return fail('O Google não abre dentro deste navegador. Abra o Pingo Quest no Chrome ou no Safari.')
  if (code === 'auth/user-disabled') return fail('Essa conta Google não pode entrar. Tente outra ou jogue como convidado.')
  if (code === 'auth/too-many-requests') return fail('Muitas tentativas seguidas. Espere um minutinho e tente de novo.')
  if (code === 'auth/credential-already-in-use') return fail('Essa conta Google já tem outro progresso guardado. Em breve você vai poder escolher qual manter.')
  return fail('Algo deu errado do nosso lado. Tente de novo em instantes.', true, true)
}

const RETRY_MS = [4_000, 15_000, 45_000, 120_000]
let guestRetrying = false
let guestTimer: ReturnType<typeof setTimeout> | undefined
let stopOnline: (() => void) | null = null

export function cancelGuestRetry() {
  clearTimeout(guestTimer)
  guestTimer = undefined
  stopOnline?.()
  stopOnline = null
  guestRetrying = false
}

/** Cria o convidado sem bloquear o jogo; tenta de novo com espera crescente e, esgotadas as tentativas, ao voltar a internet. */
export function ensureGuestInBackground() {
  if (guestRetrying) return
  guestRetrying = true
  const attempt = async (i: number): Promise<void> => {
    guestTimer = undefined
    let retryLater = false
    try {
      await auth.authStateReady()
      if (!guestRetrying || auth.currentUser) return
      await signInAnonymously(auth)
    } catch (e) {
      console.error('background guest sign-in failed', { attempt: i, code: errorCode(e) }, e)
      retryLater = true
      if (i < RETRY_MS.length) {
        guestTimer = setTimeout(() => void attempt(i + 1), RETRY_MS[i])
      } else {
        const onOnline = () => { stopOnline = null; guestRetrying = false; ensureGuestInBackground() }
        window.addEventListener('online', onOnline, { once: true })
        stopOnline = () => window.removeEventListener('online', onOnline)
      }
    } finally {
      if (!retryLater) guestRetrying = false
    }
  }
  void attempt(0)
}
