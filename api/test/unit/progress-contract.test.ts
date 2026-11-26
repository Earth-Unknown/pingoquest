import { describe, expect, test } from 'vitest'
import {
  LIMITS,
  emptyGameState,
  emptyProgressState,
  importRequestSchema,
  legacySaveSchema,
  patchStateRequestSchema,
  syncedStateSchema,
} from '@contracts/progress'

const legacyReal = {
  xp: 120,
  gems: 85,
  hearts: 3,
  streak: 4,
  last: '2026-11-25',
  done: { '0-0': true, '0-1': true, '1-3': true },
  ok: 40,
  total: 55,
  bosses: 1,
  miss: { 'O que é um host?': 2 },
  day: { d: '2026-11-25', xp: 20, phases: 1, correct: 5, bestRun: 5, perfect: 0, pairs: 0, claimed: [true, false, false], chest: false },
  casos: { wifi: { n: 2, best: 3 } },
  week: { k: '2026-11-23', n: 1, claimed: false },
  badges: [],
  onb: true,
  onbC: { redes: true, _m: 1 },
  plan: 5,
  level: 'zero',
  hist: { '2026-11-25': 1 },
  best: 4,
  lupa: false,
  know: { 'rede.def': { ok: 3, bad: 1, seen: 1, last: '', at: '2026-11-24' } },
  xch: {},
  ev: { 'rede-conectada': { steps: { s1: { day: '2026-11-24', c: 4 } }, used: ['O que é um host?'], pieces: 1, fresh: 1 } },
  ledger: { 'ev:rede-conectada:s1': 1 },
  inv: { items: ['cor:azul'], coll: {} },
  av: { cor: 'azul' },
  conq: { 'primeiro-ping': 1 },
  perfectN: 0,
  maxDay: '2026-11-25',
  devStart: '',
  nick: '  Dona  ',
  code: 'ABCDEF',
  fr: [{ n: 'Ana', r: 12, b: 3 }],
  gifts: { sent: [], inbox: [] },
  curso: 'redes',
  cursos: { linux: { done: { '0-0': true }, bosses: 0 } },
}

describe('legacySaveSchema', () => {
  test('aceita um save real, descarta campos de mentira e normaliza', () => {
    const out = legacySaveSchema.parse(legacyReal)

    expect(out).not.toHaveProperty('fr')
    expect(out).not.toHaveProperty('gifts')
    expect(out).not.toHaveProperty('code')
    expect(out).not.toHaveProperty('maxDay')
    expect(out.nick).toBe('Dona')
    expect(out.done).toEqual({ '0-0': true, '0-1': true, '1-3': true })
    expect(out.know?.['rede.def']).toEqual({ ok: 3, bad: 1, seen: 1, at: '2026-11-24' })
    expect(out.onbC).toEqual({ redes: true })
    expect(out.ledger).toEqual({ 'ev:rede-conectada:s1': true })
    expect(out.day?.claimed).toEqual([true, false, false])
    expect(out.day?.cases).toBe(0)
    expect(out.week?.days).toEqual([])
    expect(out.cursos?.linux?.done).toEqual({ '0-0': true })
  })

  test('aceita save vazio e antigo (campos ausentes)', () => {
    expect(legacySaveSchema.parse({})).toEqual({})
    expect(legacySaveSchema.parse({ xp: 10 })).toEqual({ xp: 10 })
  })

  test('campo com tipo errado é descartado, não derruba o save', () => {
    const out = legacySaveSchema.parse({ done: 'sim', know: [], gems: 'muito', streak: null, xp: 7 })

    expect(out.gems).toBeUndefined()
    expect(out.streak).toBeUndefined()
    expect(out.know).toEqual({})
    expect(out.done).toEqual({})
    expect(out.xp).toBe(7)
  })

  test('número fora da faixa vira o limite e negativo vira 0', () => {
    const out = legacySaveSchema.parse({ gems: 99_999_999, xp: -5, hearts: 3.7 })

    expect(out.gems).toBe(LIMITS.balance)
    expect(out.xp).toBe(0)
    expect(out.hearts).toBe(3)
  })

  test('entrada inválida dentro de um mapa some, as válidas ficam', () => {
    const out = legacySaveSchema.parse({
      know: { 'rede.def': { ok: 1, bad: 0, seen: 1 }, 'x y/z': { ok: 1 }, '__proto__': { ok: 1 } },
      done: { '0-0': true, abc: true, '0-1': false },
    })

    expect(Object.keys(out.know ?? {})).toEqual(['rede.def'])
    expect(out.done).toEqual({ '0-0': true })
  })

  test('mapa com chaves demais rejeita o save inteiro', () => {
    const miss = Object.fromEntries(Array.from({ length: LIMITS.miss + 1 }, (_, i) => [`pergunta ${i}`, 1]))

    expect(legacySaveSchema.safeParse({ miss }).success).toBe(false)
  })

  test('raiz que não é objeto é rejeitada', () => {
    expect(legacySaveSchema.safeParse(null).success).toBe(false)
    expect(legacySaveSchema.safeParse('oi').success).toBe(false)
    expect(legacySaveSchema.safeParse([]).success).toBe(false)
  })

  test('plan inválido é descartado', () => {
    expect(legacySaveSchema.parse({ plan: 4 }).plan).toBeUndefined()
  })
})

describe('importRequestSchema', () => {
  test('exige só a chave legacy', () => {
    expect(importRequestSchema.safeParse({ legacy: {} }).success).toBe(true)
    expect(importRequestSchema.safeParse({ legacy: {}, extra: 1 }).success).toBe(false)
    expect(importRequestSchema.safeParse({}).success).toBe(false)
  })
})

describe('syncedStateSchema', () => {
  test('o estado vazio é válido', () => {
    const state = { progress: emptyProgressState, game: emptyGameState }

    expect(syncedStateSchema.safeParse(state).success).toBe(true)
  })

  test('rejeita campo desconhecido e miss com 0 guardado', () => {
    expect(syncedStateSchema.safeParse({ progress: { ...emptyProgressState, x: 1 }, game: emptyGameState }).success).toBe(false)
    const progress = { ...emptyProgressState, miss: { q: 0 } }
    expect(syncedStateSchema.safeParse({ progress, game: emptyGameState }).success).toBe(false)
  })
})

describe('patchStateRequestSchema', () => {
  test('aceita mudança parcial e miss 0 como remoção', () => {
    const body = { baseRev: 3, changes: { progress: { miss: { q1: 0, q2: 2 }, hearts: 4 } } }

    expect(patchStateRequestSchema.safeParse(body).success).toBe(true)
  })

  test('aceita mudança parcial dentro de um curso', () => {
    const body = { baseRev: 0, changes: { progress: { courses: { redes: { xseen: ['q'] } } } } }

    expect(patchStateRequestSchema.safeParse(body).success).toBe(true)
  })

  test('rejeita changes vazio, campo desconhecido e baseRev inválido', () => {
    expect(patchStateRequestSchema.safeParse({ baseRev: 0, changes: {} }).success).toBe(false)
    expect(patchStateRequestSchema.safeParse({ baseRev: 0, changes: { progress: { foo: 1 } } }).success).toBe(false)
    expect(patchStateRequestSchema.safeParse({ baseRev: -1, changes: { progress: { hearts: 1 } } }).success).toBe(false)
    expect(patchStateRequestSchema.safeParse({ baseRev: 1.5, changes: { progress: { hearts: 1 } } }).success).toBe(false)
  })

  test('rejeita miss acima do limite de chaves', () => {
    const miss = Object.fromEntries(Array.from({ length: LIMITS.miss + 1 }, (_, i) => [`p${i}`, 1]))

    expect(patchStateRequestSchema.safeParse({ baseRev: 0, changes: { progress: { miss } } }).success).toBe(false)
  })
})
