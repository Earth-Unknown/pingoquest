import { useCallback, useEffect, useMemo, useState } from 'react'
import { onAuthStateChanged, type User } from 'firebase/auth'
import { auth } from './lib/firebase'
import { AuthContext, type AuthStatus, type AuthValue } from './lib/use-auth'

type State = { status: AuthStatus; user: User | null }

const BOOT_TIMEOUT_MS = 8000

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<State>({ status: 'booting', user: null })
  useEffect(() => {
    // Se o Firebase não responder, mostra o Login em vez de ficar preso no boot; um disparo tardio ainda corrige o estado
    const bootTimeout = setTimeout(() => {
      console.error('auth state not resolved, falling back to signed out', { afterMs: BOOT_TIMEOUT_MS })
      setState(s => (s.status === 'booting' ? { status: 'out', user: null } : s))
    }, BOOT_TIMEOUT_MS)
    const unsubscribe = onAuthStateChanged(
      auth,
      user => { clearTimeout(bootTimeout); setState(user ? { status: 'in', user } : { status: 'out', user: null }) },
      error => { clearTimeout(bootTimeout); console.error('auth state listener failed', error); setState({ status: 'out', user: null }) },
    )
    return () => { clearTimeout(bootTimeout); unsubscribe() }
  }, [])
  // linkWithPopup troca o provedor do mesmo usuário sem disparar onAuthStateChanged
  const refresh = useCallback(() => setState(s => ({ ...s })), [])
  const value = useMemo<AuthValue>(() => ({ ...state, isAnonymous: state.user?.isAnonymous ?? false, refresh }), [state, refresh])
  return <AuthContext value={value}>{children}</AuthContext>
}
