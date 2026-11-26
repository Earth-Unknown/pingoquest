import { ZodError } from 'zod'
import type { ErrorResponse } from '@contracts/common'
import { DomainError, type DomainErrorKind } from '@/shared/domain/domain-error'

const STATUS_BY_KIND: Record<DomainErrorKind, number> = {
  invalid_input: 400,
  unauthenticated: 401,
  forbidden: 403,
  not_found: 404,
  conflict: 409,
  rule_violation: 422,
}

export type MappedError = {
  status: number
  body: ErrorResponse
}

function hasStatusCode(error: unknown): error is { statusCode: number; code?: string } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'statusCode' in error &&
    typeof error.statusCode === 'number'
  )
}

export function mapError(error: unknown): MappedError {
  if (error instanceof DomainError) {
    return {
      status: STATUS_BY_KIND[error.kind],
      body: { error: { code: error.code, message: error.message, details: error.details } },
    }
  }
  if (error instanceof ZodError) {
    return {
      status: 400,
      body: {
        error: {
          code: 'invalid_input',
          message: 'Dados inválidos.',
          details: { issues: error.issues.map((i) => ({ path: i.path.join('.'), message: i.message })) },
        },
      },
    }
  }
  if (hasStatusCode(error)) {
    if (error.statusCode === 413) {
      return {
        status: 413,
        body: { error: { code: 'payload_too_large', message: 'Corpo da requisição grande demais.' } },
      }
    }
    if (error.statusCode >= 400 && error.statusCode < 500) {
      return {
        status: error.statusCode,
        body: { error: { code: 'invalid_input', message: 'Requisição inválida.' } },
      }
    }
  }
  return {
    status: 500,
    body: { error: { code: 'internal_error', message: 'Erro interno. Tente novamente em instantes.' } },
  }
}

export const NOT_FOUND_RESPONSE: ErrorResponse = {
  error: { code: 'not_found', message: 'Rota não encontrada.' },
}
