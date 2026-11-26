import { initializeApp } from 'firebase-admin/app'
import { getAuth, type Auth } from 'firebase-admin/auth'
import { DomainError } from '@/shared/domain/domain-error'
import type { AuthenticatedUser, TokenVerifier } from '@/shared/domain/token-verifier'

export class FirebaseTokenVerifier implements TokenVerifier {
  private readonly auth: Auth

  constructor(projectId: string) {
    this.auth = getAuth(initializeApp({ projectId }))
  }

  async verify(idToken: string): Promise<AuthenticatedUser> {
    try {
      const decoded = await this.auth.verifyIdToken(idToken)
      return { uid: decoded.uid, isAnonymous: decoded.firebase.sign_in_provider === 'anonymous' }
    } catch (error) {
      if (isFirebaseAuthError(error)) {
        throw new DomainError('unauthenticated', 'invalid_token', 'Token inválido ou expirado.', undefined, {
          cause: error,
        })
      }
      throw new Error('Falha ao verificar o ID token', { cause: error })
    }
  }
}

export function isFirebaseAuthError(error: unknown): boolean {
  if (typeof error !== 'object' || error === null || !('code' in error)) return false
  const { code } = error
  return typeof code === 'string' && code.startsWith('auth/')
}
