import { createContext, useContext } from 'react'
import type { User } from 'firebase/auth'

export type AuthStatus = 'booting' | 'out' | 'in'
export type AuthValue = { status: AuthStatus; user: User | null; isAnonymous: boolean; refresh: () => void }

export const AuthContext = createContext<AuthValue | null>(null)

export function useAuth(): AuthValue {
  const v = useContext(AuthContext)
  if (!v) throw new Error('useAuth precisa estar dentro de AuthProvider')
  return v
}
