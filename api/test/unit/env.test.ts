import { describe, expect, test } from 'vitest'
import { loadEnv } from '@/config/env'

describe('loadEnv', () => {
  test('aplica os padrões quando só GCP_PROJECT_ID existe', () => {
    const env = loadEnv({ GCP_PROJECT_ID: 'pingoquest' })

    expect(env).toEqual({ PORT: 8080, GCP_PROJECT_ID: 'pingoquest', NODE_ENV: 'development', LOG_LEVEL: 'info' })
  })

  test('converte PORT para número', () => {
    expect(loadEnv({ GCP_PROJECT_ID: 'p', PORT: '3000' }).PORT).toBe(3000)
  })

  test('falha sem GCP_PROJECT_ID', () => {
    expect(() => loadEnv({})).toThrow(/GCP_PROJECT_ID/)
  })

  test.each(['0', '70000', 'abc', '-1'])('falha com PORT inválida %s', (port) => {
    expect(() => loadEnv({ GCP_PROJECT_ID: 'p', PORT: port })).toThrow(/PORT/)
  })

  test('falha com LOG_LEVEL desconhecido', () => {
    expect(() => loadEnv({ GCP_PROJECT_ID: 'p', LOG_LEVEL: 'verbose' })).toThrow(/LOG_LEVEL/)
  })
})
