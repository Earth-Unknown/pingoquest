import { describe, expect, test } from 'vitest'
import { isFirebaseAuthError } from '@/shared/infrastructure/firebase-token-verifier'

describe('isFirebaseAuthError', () => {
  test.each(['auth/id-token-expired', 'auth/argument-error', 'auth/invalid-id-token'])(
    'reconhece %s como erro de token (vira 401)',
    (code) => {
      expect(isFirebaseAuthError({ code })).toBe(true)
    },
  )

  test.each<[string, unknown]>([
    ['erro de rede', Object.assign(new Error('fetch failed'), { code: 'ECONNRESET' })],
    ['erro de credencial', { code: 'app/invalid-credential' }],
    ['Error sem code', new Error('boom')],
    ['code não string', { code: 401 }],
    ['null', null],
    ['string', 'auth/id-token-expired'],
  ])('não trata %s como erro de token (vira 500 e é logado)', (_label, error) => {
    expect(isFirebaseAuthError(error)).toBe(false)
  })
})
