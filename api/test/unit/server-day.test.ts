import { describe, expect, test } from 'vitest'
import { DomainError } from '@/shared/domain/domain-error'
import { ServerDay } from '@/shared/domain/server-day'

describe('ServerDay.fromDate', () => {
  test('mantém o dia anterior até 23:59:59 em Brasília (02:59:59Z)', () => {
    expect(ServerDay.fromDate(new Date('2026-11-26T02:59:59.999Z')).value).toBe('2026-11-25')
  })

  test('vira o dia à meia-noite de Brasília (03:00:00Z)', () => {
    expect(ServerDay.fromDate(new Date('2026-11-26T03:00:00.000Z')).value).toBe('2026-11-26')
  })

  test('usa o dia de Brasília mesmo quando o UTC já está no dia seguinte', () => {
    expect(ServerDay.fromDate(new Date('2026-11-25T23:30:00Z')).value).toBe('2026-11-25')
  })

  test('vira o ano em Brasília, não em UTC', () => {
    expect(ServerDay.fromDate(new Date('2027-01-01T02:59:59Z')).value).toBe('2026-12-31')
    expect(ServerDay.fromDate(new Date('2027-01-01T03:00:00Z')).value).toBe('2027-01-01')
  })

  test('trata 29 de fevereiro de ano bissexto', () => {
    expect(ServerDay.fromDate(new Date('2028-03-01T02:59:59Z')).value).toBe('2028-02-29')
    expect(ServerDay.fromDate(new Date('2028-03-01T03:00:00Z')).value).toBe('2028-03-01')
  })

  test('rejeita data inválida', () => {
    expect(() => ServerDay.fromDate(new Date('invalid'))).toThrow(DomainError)
  })
})

describe('ServerDay.parse', () => {
  test('aceita AAAA-MM-DD válido', () => {
    expect(ServerDay.parse('2026-11-25').toString()).toBe('2026-11-25')
  })

  test.each(['', '2026-1-1', '26-11-25', '2026/11/25', '2026-11-25T00:00:00Z'])(
    'rejeita formato inválido %j',
    (input) => {
      expect(() => ServerDay.parse(input)).toThrow(DomainError)
    },
  )

  test.each(['2026-02-30', '2027-02-29', '2026-13-01', '2026-00-10', '2026-04-31'])(
    'rejeita dia inexistente %s',
    (input) => {
      expect(() => ServerDay.parse(input)).toThrow(DomainError)
    },
  )

  test('aceita 29 de fevereiro em ano bissexto', () => {
    expect(ServerDay.parse('2028-02-29').value).toBe('2028-02-29')
  })
})

describe('ServerDay', () => {
  test('compara por valor', () => {
    expect(ServerDay.parse('2026-11-25').equals(ServerDay.parse('2026-11-25'))).toBe(true)
    expect(ServerDay.parse('2026-11-25').equals(ServerDay.parse('2026-11-26'))).toBe(false)
  })

  test('é imutável', () => {
    const day = ServerDay.parse('2026-11-25')
    expect(Object.isFrozen(day)).toBe(true)
  })
})
