import type { FastifyInstance } from 'fastify'
import { afterEach, beforeEach, describe, expect, test } from 'vitest'
import {
  errorResponseSchema,
  healthResponseSchema,
  timeResponseSchema,
  whoamiResponseSchema,
} from '@contracts/common'
import { DomainError } from '@/shared/domain/domain-error'
import type { Clock } from '@/shared/domain/clock'
import type { AuthenticatedUser, TokenVerifier } from '@/shared/domain/token-verifier'
import { buildServer } from '@/shared/presentation/server'

class FixedClock implements Clock {
  constructor(private readonly instant: Date) {}
  now(): Date {
    return this.instant
  }
}

class FakeTokenVerifier implements TokenVerifier {
  constructor(private readonly users: Record<string, AuthenticatedUser>) {}
  async verify(idToken: string): Promise<AuthenticatedUser> {
    const user = this.users[idToken]
    if (!user) throw new DomainError('unauthenticated', 'invalid_token', 'Token inválido ou expirado.')
    return user
  }
}

describe('rotas do B0', () => {
  let app: FastifyInstance

  beforeEach(async () => {
    app = buildServer({
      clock: new FixedClock(new Date('2026-11-26T02:30:00Z')),
      tokenVerifier: new FakeTokenVerifier({
        'token-guest': { uid: 'uid-guest', isAnonymous: true },
        'token-google': { uid: 'uid-google', isAnonymous: false },
      }),
      version: 'test-rev-1',
      logger: false,
    })
  })

  afterEach(async () => {
    await app.close()
  })

  describe('GET /api/v1/health', () => {
    test('responde ok e a versão, sem exigir auth', async () => {
      const res = await app.inject({ method: 'GET', url: '/api/v1/health' })

      expect(res.statusCode).toBe(200)
      expect(healthResponseSchema.parse(res.json())).toEqual({ ok: true, version: 'test-rev-1' })
    })

    test('nunca permite cache da resposta', async () => {
      const res = await app.inject({ method: 'GET', url: '/api/v1/health' })

      expect(res.headers['cache-control']).toBe('private, no-store')
    })
  })

  describe('GET /api/v1/time', () => {
    test('devolve o instante, o dia oficial de Brasília e o fuso', async () => {
      const res = await app.inject({ method: 'GET', url: '/api/v1/time' })

      expect(res.statusCode).toBe(200)
      expect(timeResponseSchema.parse(res.json())).toEqual({
        now: '2026-11-26T02:30:00.000Z',
        serverDay: '2026-11-25',
        tz: 'America/Sao_Paulo',
      })
      expect(res.headers['cache-control']).toBe('private, no-store')
    })
  })

  describe('GET /api/v1/whoami', () => {
    test('sem token devolve 401 unauthenticated', async () => {
      const res = await app.inject({ method: 'GET', url: '/api/v1/whoami' })

      expect(res.statusCode).toBe(401)
      expect(errorResponseSchema.parse(res.json()).error.code).toBe('unauthenticated')
      expect(res.headers['cache-control']).toBe('private, no-store')
    })

    test('header Authorization sem esquema Bearer devolve 401 unauthenticated', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/v1/whoami',
        headers: { authorization: 'token-guest' },
      })

      expect(res.statusCode).toBe(401)
      expect(res.json().error.code).toBe('unauthenticated')
    })

    test('token inválido devolve 401 invalid_token', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/v1/whoami',
        headers: { authorization: 'Bearer lixo' },
      })

      expect(res.statusCode).toBe(401)
      expect(errorResponseSchema.parse(res.json()).error).toEqual({
        code: 'invalid_token',
        message: 'Token inválido ou expirado.',
      })
    })

    test('convidado: devolve uid e isAnonymous true', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/v1/whoami',
        headers: { authorization: 'Bearer token-guest' },
      })

      expect(res.statusCode).toBe(200)
      expect(whoamiResponseSchema.parse(res.json())).toEqual({ uid: 'uid-guest', isAnonymous: true })
    })

    test('conta Google: devolve uid e isAnonymous false, sem outros campos', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/v1/whoami',
        headers: { authorization: 'bearer token-google' },
      })

      expect(res.statusCode).toBe(200)
      expect(res.json()).toEqual({ uid: 'uid-google', isAnonymous: false })
    })
  })

  describe('comportamento comum', () => {
    test('rota inexistente devolve 404 not_found no formato do contrato', async () => {
      const res = await app.inject({ method: 'GET', url: '/api/v1/nao-existe' })

      expect(res.statusCode).toBe(404)
      expect(errorResponseSchema.parse(res.json()).error.code).toBe('not_found')
      expect(res.headers['cache-control']).toBe('private, no-store')
    })

    test('corpo acima de 256 KB devolve 413 payload_too_large', async () => {
      app.post('/api/v1/echo', async (request) => request.body)

      const res = await app.inject({
        method: 'POST',
        url: '/api/v1/echo',
        headers: { 'content-type': 'application/json' },
        payload: JSON.stringify({ data: 'x'.repeat(256 * 1024 + 1) }),
      })

      expect(res.statusCode).toBe(413)
      expect(errorResponseSchema.parse(res.json()).error.code).toBe('payload_too_large')
    })

    test('JSON malformado devolve 400 invalid_input', async () => {
      app.post('/api/v1/echo', async (request) => request.body)

      const res = await app.inject({
        method: 'POST',
        url: '/api/v1/echo',
        headers: { 'content-type': 'application/json' },
        payload: '{ quebrado',
      })

      expect(res.statusCode).toBe(400)
      expect(errorResponseSchema.parse(res.json()).error.code).toBe('invalid_input')
    })
  })
})
