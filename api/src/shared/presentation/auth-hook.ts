import type { FastifyRequest } from 'fastify'
import { DomainError } from '@/shared/domain/domain-error'
import type { AuthenticatedUser, TokenVerifier } from '@/shared/domain/token-verifier'

declare module 'fastify' {
  interface FastifyRequest {
    user: AuthenticatedUser | null
  }
}

const BEARER_PATTERN = /^Bearer\s+(\S+)$/i

export function createAuthHook(verifier: TokenVerifier) {
  return async function authenticate(request: FastifyRequest): Promise<void> {
    const match = BEARER_PATTERN.exec(request.headers.authorization ?? '')
    if (!match) {
      throw new DomainError('unauthenticated', 'unauthenticated', 'Autenticação necessária.')
    }
    request.user = await verifier.verify(match[1]!)
  }
}

export function requireUser(request: FastifyRequest): AuthenticatedUser {
  if (!request.user) {
    throw new DomainError('unauthenticated', 'unauthenticated', 'Autenticação necessária.')
  }
  return request.user
}
