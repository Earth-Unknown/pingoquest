import { describe, expect, test } from 'vitest'
import { z } from 'zod'
import { errorResponseSchema } from '@contracts/common'
import { DomainError, type DomainErrorKind } from '@/shared/domain/domain-error'
import { mapError } from '@/shared/presentation/error-response'

describe('mapError', () => {
  test.each<[DomainErrorKind, number]>([
    ['invalid_input', 400],
    ['unauthenticated', 401],
    ['forbidden', 403],
    ['not_found', 404],
    ['conflict', 409],
    ['rule_violation', 422],
  ])('mapeia DomainError %s para HTTP %i', (kind, status) => {
    const mapped = mapError(new DomainError(kind, 'some_code', 'Mensagem.', { field: 'x' }))

    expect(mapped.status).toBe(status)
    expect(mapped.body).toEqual({ error: { code: 'some_code', message: 'Mensagem.', details: { field: 'x' } } })
  })

  test('mapeia ZodError para 400 invalid_input com os caminhos inválidos', () => {
    const result = z.object({ qty: z.number() }).safeParse({ qty: 'a' })
    if (result.success) throw new Error('esperava falha de validação')

    const mapped = mapError(result.error)

    expect(mapped.status).toBe(400)
    expect(mapped.body.error.code).toBe('invalid_input')
    expect(mapped.body.error.details).toEqual({ issues: [{ path: 'qty', message: expect.any(String) }] })
  })

  test('mapeia corpo grande demais (413) para payload_too_large', () => {
    const mapped = mapError(Object.assign(new Error('too large'), { statusCode: 413 }))

    expect(mapped.status).toBe(413)
    expect(mapped.body.error.code).toBe('payload_too_large')
  })

  test('mapeia erros 4xx do Fastify (JSON inválido) para invalid_input sem vazar a mensagem', () => {
    const mapped = mapError(Object.assign(new Error('Unexpected token } in JSON'), { statusCode: 400 }))

    expect(mapped.status).toBe(400)
    expect(mapped.body.error.code).toBe('invalid_input')
    expect(JSON.stringify(mapped.body)).not.toContain('Unexpected token')
  })

  test.each([new Error('boom: senha=123'), 'texto', null, undefined, { statusCode: 503 }])(
    'esconde erro desconhecido %j atrás de 500 internal_error',
    (error) => {
      const mapped = mapError(error)

      expect(mapped.status).toBe(500)
      expect(mapped.body.error.code).toBe('internal_error')
      expect(JSON.stringify(mapped.body)).not.toContain('senha')
    },
  )

  test('sempre produz o formato do contrato de erro', () => {
    const bodies = [new DomainError('not_found', 'x', 'y'), new Error('z')].map((e) => mapError(e).body)

    for (const body of bodies) {
      expect(errorResponseSchema.safeParse(body).success).toBe(true)
    }
  })
})
