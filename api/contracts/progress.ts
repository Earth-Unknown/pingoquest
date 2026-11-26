import { z } from 'zod'
import { serverDaySchema } from './common'

/**
 * Contrato do B1: estado sincronizado do aluno (`users/{uid}/data/progress` e `data/game`)
 * e save legado (`pingoquest-v3`) aceito em `POST /me/import`.
 * Só tipos e schemas. Normalização, merge e validação contra o catálogo ficam no servidor.
 */

export const LIMITS = {
  counter: 10_000_000,
  balance: 500_000,
  dayCounter: 10_000,
  hearts: 99,
  nick: 14,
  questionText: 160,
  miss: 600,
  missCount: 9_999,
  courses: 8,
  knowPerCourse: 100,
  xchPerCourse: 50,
  xseen: 60,
  donePerCourse: 200,
  casosPerCourse: 50,
  hist: 2_000,
  conq: 100,
  badges: 520,
  invItems: 300,
  invColl: 100,
  events: 10,
  eventSteps: 30,
  eventUsed: 80,
  ledger: 300,
  av: 16,
  onbC: 16,
  reportItems: 64,
} as const

/* ---------- chaves ---------- */

const reservedKey = /^(?!__.*__$)/
const idKey = z.string().regex(/^[A-Za-z0-9_.:-]{1,64}$/).regex(reservedKey)
const courseId = z.string().regex(/^[a-z][a-z0-9_-]{0,31}$/)
const phaseKey = z.string().regex(/^\d{1,2}-\d{1,2}$/)
const groupKey = z.string().regex(/^\d{1,2}$/)
const questionText = z.string().min(1).max(LIMITS.questionText).regex(reservedKey)
const dateOrEmpty = z.union([serverDaySchema, z.literal('')])

const counter = (max: number) => z.number().int().min(0).max(max)
const boundedRecord = <V extends z.ZodType>(key: z.ZodType<string>, value: V, max: number) =>
  z.record(key, value).refine((o) => Object.keys(o).length <= max, { message: `máximo de ${max} chaves` })
const boundedArray = <V extends z.ZodType>(item: V, max: number) => z.array(item).max(max)

/* ---------- estado sincronizado: data/progress (cliente é dono, sempre) ---------- */

const knowEntrySchema = z.strictObject({
  ok: counter(LIMITS.counter),
  bad: counter(LIMITS.counter),
  seen: z.union([z.literal(0), z.literal(1)]),
  at: serverDaySchema.optional(),
})

const xchEntrySchema = z.strictObject({ w: z.union([z.literal(0), z.literal(1)]), t: counter(LIMITS.dayCounter) })

const progressCourseSchema = z.strictObject({
  know: boundedRecord(idKey, knowEntrySchema, LIMITS.knowPerCourse),
  xch: boundedRecord(groupKey, xchEntrySchema, LIMITS.xchPerCourse),
  xseen: boundedArray(questionText, LIMITS.xseen),
})

export const progressStateSchema = z.strictObject({
  curso: courseId,
  plan: z.union([z.literal(0), z.literal(3), z.literal(5), z.literal(7)]),
  hearts: counter(LIMITS.hearts),
  nick: z.string().max(LIMITS.nick),
  av: boundedRecord(idKey, z.string().max(64), LIMITS.av),
  total: counter(LIMITS.counter),
  ok: counter(LIMITS.counter),
  onb: z.boolean(),
  onbC: boundedRecord(courseId, z.literal(true), LIMITS.onbC),
  picked: z.boolean(),
  level: z.enum(['', 'zero', 'alguma']),
  duel: z.strictObject({ w: counter(LIMITS.counter), l: counter(LIMITS.counter), d: counter(LIMITS.counter) }),
  miss: boundedRecord(questionText, counter(LIMITS.missCount).min(1), LIMITS.miss),
  courses: boundedRecord(courseId, progressCourseSchema, LIMITS.courses),
})
export type ProgressState = z.infer<typeof progressStateSchema>

/* ---------- estado sincronizado: data/game (provisório no B1; do servidor a partir do B2) ---------- */

const flagSet = (key: z.ZodType<string>, max: number) => boundedRecord(key, z.literal(true), max)

const daySchema = z.strictObject({
  d: serverDaySchema,
  xp: counter(LIMITS.dayCounter),
  phases: counter(LIMITS.dayCounter),
  correct: counter(LIMITS.dayCounter),
  bestRun: counter(LIMITS.dayCounter),
  perfect: counter(LIMITS.dayCounter),
  pairs: counter(LIMITS.dayCounter),
  cases: counter(LIMITS.dayCounter),
  clean: counter(LIMITS.dayCounter),
  insp: counter(LIMITS.dayCounter),
  claimed: z.tuple([z.boolean(), z.boolean(), z.boolean()]),
  chest: z.boolean(),
  call: z.boolean(),
})

const gameCourseSchema = z.strictObject({
  done: flagSet(phaseKey, LIMITS.donePerCourse),
  bosses: counter(LIMITS.donePerCourse),
  casos: boundedRecord(idKey, z.strictObject({ n: counter(LIMITS.counter), best: counter(3) }), LIMITS.casosPerCourse),
})

const eventProgressSchema = z.strictObject({
  steps: boundedRecord(idKey, z.strictObject({ day: serverDaySchema, c: counter(50) }), LIMITS.eventSteps),
  used: boundedArray(questionText, LIMITS.eventUsed),
  pieces: counter(100),
  fresh: counter(100),
  status: z.literal('completed').optional(),
})

export const gameStateSchema = z.strictObject({
  gems: counter(LIMITS.balance),
  xp: counter(LIMITS.balance),
  streak: counter(LIMITS.counter),
  best: counter(LIMITS.counter),
  last: dateOrEmpty,
  perfectN: counter(LIMITS.counter),
  lupa: z.boolean(),
  hist: flagSet(serverDaySchema, LIMITS.hist),
  wk: z.strictObject({ k: serverDaySchema, xp: counter(LIMITS.counter) }).nullable(),
  week: z
    .strictObject({
      k: serverDaySchema,
      n: counter(LIMITS.dayCounter),
      claimed: z.boolean(),
      days: boundedArray(counter(6), 7),
    })
    .nullable(),
  day: daySchema.nullable(),
  conq: flagSet(idKey, LIMITS.conq),
  badges: boundedArray(serverDaySchema, LIMITS.badges),
  inv: z.strictObject({
    items: boundedArray(idKey, LIMITS.invItems),
    coll: flagSet(idKey, LIMITS.invColl),
  }),
  ev: boundedRecord(idKey, eventProgressSchema, LIMITS.events),
  ledger: flagSet(idKey, LIMITS.ledger),
  courses: boundedRecord(courseId, gameCourseSchema, LIMITS.courses),
})
export type GameState = z.infer<typeof gameStateSchema>

export const syncedStateSchema = z.strictObject({ progress: progressStateSchema, game: gameStateSchema })
export type SyncedState = z.infer<typeof syncedStateSchema>

export const emptyProgressState: ProgressState = {
  curso: 'redes',
  plan: 0,
  hearts: 5,
  nick: '',
  av: {},
  total: 0,
  ok: 0,
  onb: false,
  onbC: {},
  picked: false,
  level: '',
  duel: { w: 0, l: 0, d: 0 },
  miss: {},
  courses: {},
}

export const emptyGameState: GameState = {
  gems: 50,
  xp: 0,
  streak: 0,
  best: 0,
  last: '',
  perfectN: 0,
  lupa: false,
  hist: {},
  wk: null,
  week: null,
  day: null,
  conq: {},
  badges: [],
  inv: { items: [], coll: {} },
  ev: {},
  ledger: {},
  courses: {},
}

/* ---------- rotas: GET/PATCH /me/state ---------- */

const revSchema = z.number().int().min(0)

export const getStateResponseSchema = z.strictObject({
  rev: revSchema,
  state: syncedStateSchema,
  serverDay: serverDaySchema,
})
export type GetStateResponse = z.infer<typeof getStateResponseSchema>

// Campo ausente = não tocou. Em `miss`, o valor 0 remove a pergunta (lápide); o estado guardado nunca tem 0.
const progressChangesSchema = progressStateSchema.partial().extend({
  miss: boundedRecord(questionText, counter(LIMITS.missCount), LIMITS.miss).optional(),
  courses: boundedRecord(courseId, progressCourseSchema.partial(), LIMITS.courses).optional(),
})
const gameChangesSchema = gameStateSchema.partial().extend({
  courses: boundedRecord(courseId, gameCourseSchema.partial(), LIMITS.courses).optional(),
})

export const patchStateRequestSchema = z.strictObject({
  baseRev: revSchema,
  changes: z
    .strictObject({ progress: progressChangesSchema.optional(), game: gameChangesSchema.optional() })
    .refine((c) => c.progress !== undefined || c.game !== undefined, { message: 'changes vazio' }),
})
export type PatchStateRequest = z.infer<typeof patchStateRequestSchema>

export const patchStateResponseSchema = z.strictObject({ rev: revSchema, state: syncedStateSchema })
export type PatchStateResponse = z.infer<typeof patchStateResponseSchema>

/* ---------- save legado (allowlist, tolerante) ---------- */

/** Campos do `pingoquest-v3` que o servidor ignora de propósito (são de mentira ou do relógio do aparelho). */
export const LEGACY_DROPPED_KEYS = ['fr', 'gifts', 'code', 'maxDay', 'devStart'] as const

const truthy = z.unknown().refine(Boolean).transform(() => true as const)
const bool = z.unknown().optional().transform((v) => Boolean(v))
const flag01 = z.unknown().optional().transform((v): 0 | 1 => (v ? 1 : 0))
// Número fora da faixa vira o limite; tipo errado cai no catch do campo
const legacyCount = (max: number) =>
  z.number().finite().transform((n) => Math.min(max, Math.max(0, Math.trunc(n))))
// Campo opcional: tipo errado vira ausente (o servidor lista em report.dropped)
const soft = <T extends z.ZodType>(schema: T) => schema.optional().catch(undefined)
// Mapas e listas tolerantes não falham sozinhos, exceto por excesso de chaves; um catch engoliria essa rejeição
const keep = <T extends z.ZodType>(schema: T) => schema.optional()

// Entradas inválidas somem; mais chaves que o limite rejeita o save inteiro (payload abusivo)
const lenientRecord = <V extends z.ZodType>(key: z.ZodType<string>, value: V, maxKeys: number) =>
  z.unknown().optional().transform((raw, ctx): Record<string, z.output<V>> => {
    if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) return {}
    const entries = Object.entries(raw)
    if (entries.length > maxKeys) {
      ctx.issues.push({ code: 'custom', message: `máximo de ${maxKeys} chaves`, input: raw })
      return z.NEVER
    }
    const kept: [string, z.output<V>][] = []
    for (const [k, v] of entries) {
      if (!key.safeParse(k).success) continue
      const parsed = value.safeParse(v)
      if (parsed.success) kept.push([k, parsed.data])
    }
    return Object.fromEntries(kept)
  })

const lenientArray = <V extends z.ZodType>(item: V, maxItems: number) =>
  z.unknown().optional().transform((raw, ctx): z.output<V>[] => {
    if (!Array.isArray(raw)) return []
    if (raw.length > maxItems) {
      ctx.issues.push({ code: 'custom', message: `máximo de ${maxItems} itens`, input: raw })
      return z.NEVER
    }
    const kept: z.output<V>[] = []
    for (const v of raw) {
      const parsed = item.safeParse(v)
      if (parsed.success) kept.push(parsed.data)
    }
    return kept
  })

const legacyKnow = z.object({
  ok: legacyCount(LIMITS.counter).catch(0),
  bad: legacyCount(LIMITS.counter).catch(0),
  seen: flag01,
  at: soft(serverDaySchema),
})

const legacyDay = z.object({
  d: serverDaySchema,
  xp: legacyCount(LIMITS.dayCounter).catch(0),
  phases: legacyCount(LIMITS.dayCounter).catch(0),
  correct: legacyCount(LIMITS.dayCounter).catch(0),
  bestRun: legacyCount(LIMITS.dayCounter).catch(0),
  perfect: legacyCount(LIMITS.dayCounter).catch(0),
  pairs: legacyCount(LIMITS.dayCounter).catch(0),
  cases: legacyCount(LIMITS.dayCounter).catch(0),
  clean: legacyCount(LIMITS.dayCounter).catch(0),
  insp: legacyCount(LIMITS.dayCounter).catch(0),
  claimed: z.unknown().optional().transform((v): [boolean, boolean, boolean] => {
    const a = Array.isArray(v) ? v : []
    return [Boolean(a[0]), Boolean(a[1]), Boolean(a[2])]
  }),
  chest: bool,
  call: bool,
})

const legacyEvent = z.object({
  steps: lenientRecord(idKey, z.object({ day: serverDaySchema, c: legacyCount(50).catch(0) }), LIMITS.eventSteps),
  used: lenientArray(questionText, LIMITS.eventUsed),
  pieces: legacyCount(100).catch(0),
  fresh: legacyCount(100).catch(0),
  status: soft(z.literal('completed')),
})

// Campos por curso: o curso ativo vem "achatado" no save; os demais ficam em `cursos[id]`
const legacyCourseShape = {
  done: keep(lenientRecord(phaseKey, truthy, LIMITS.donePerCourse)),
  know: keep(lenientRecord(idKey, legacyKnow, LIMITS.knowPerCourse)),
  xch: keep(
    lenientRecord(groupKey, z.object({ w: flag01, t: legacyCount(LIMITS.dayCounter).catch(0) }), LIMITS.xchPerCourse),
  ),
  casos: keep(
    lenientRecord(
      idKey,
      z.object({ n: legacyCount(LIMITS.counter).catch(0), best: legacyCount(3).catch(0) }),
      LIMITS.casosPerCourse,
    ),
  ),
  bosses: soft(legacyCount(LIMITS.donePerCourse)),
  xseen: keep(lenientArray(questionText, LIMITS.xseen)),
}

export const legacySaveSchema = z.object({
  ...legacyCourseShape,
  curso: soft(courseId),
  cursos: keep(lenientRecord(courseId, z.object(legacyCourseShape), LIMITS.courses)),
  plan: soft(z.union([z.literal(0), z.literal(3), z.literal(5), z.literal(7)])),
  hearts: soft(legacyCount(LIMITS.hearts)),
  nick: soft(z.string().transform((s) => s.trim().slice(0, LIMITS.nick))),
  av: keep(lenientRecord(idKey, z.string().max(64), LIMITS.av)),
  total: soft(legacyCount(LIMITS.counter)),
  ok: soft(legacyCount(LIMITS.counter)),
  onb: soft(bool),
  onbC: keep(lenientRecord(courseId, truthy, LIMITS.onbC)),
  picked: soft(bool),
  level: soft(z.enum(['', 'zero', 'alguma'])),
  duel: soft(
    z.object({
      w: legacyCount(LIMITS.counter).catch(0),
      l: legacyCount(LIMITS.counter).catch(0),
      d: legacyCount(LIMITS.counter).catch(0),
    }),
  ),
  miss: keep(lenientRecord(questionText, legacyCount(LIMITS.missCount), LIMITS.miss)),
  gems: soft(legacyCount(LIMITS.balance)),
  xp: soft(legacyCount(LIMITS.balance)),
  streak: soft(legacyCount(LIMITS.counter)),
  best: soft(legacyCount(LIMITS.counter)),
  last: soft(dateOrEmpty),
  perfectN: soft(legacyCount(LIMITS.counter)),
  lupa: soft(bool),
  hist: keep(lenientRecord(serverDaySchema, truthy, LIMITS.hist)),
  wk: soft(z.object({ k: serverDaySchema, xp: legacyCount(LIMITS.counter).catch(0) })),
  week: soft(
    z.object({
      k: serverDaySchema,
      n: legacyCount(LIMITS.dayCounter).catch(0),
      claimed: bool,
      days: lenientArray(counter(6), 7),
    }),
  ),
  day: soft(legacyDay),
  conq: keep(lenientRecord(idKey, truthy, LIMITS.conq)),
  badges: keep(lenientArray(serverDaySchema, LIMITS.badges)),
  inv: soft(
    z.object({
      items: lenientArray(idKey, LIMITS.invItems),
      coll: lenientRecord(idKey, truthy, LIMITS.invColl),
    }),
  ),
  ev: keep(lenientRecord(idKey, legacyEvent, LIMITS.events)),
  ledger: keep(lenientRecord(idKey, truthy, LIMITS.ledger)),
})
export type LegacySave = z.infer<typeof legacySaveSchema>

/* ---------- rota: POST /me/import ---------- */

export const importRequestSchema = z.strictObject({ legacy: legacySaveSchema })
export type ImportRequest = z.infer<typeof importRequestSchema>

const reportList = z.array(z.string().max(80)).max(LIMITS.reportItems)
export const importResponseSchema = z.strictObject({
  rev: revSchema,
  state: syncedStateSchema,
  report: z.strictObject({ accepted: reportList, clamped: reportList, dropped: reportList }),
})
export type ImportResponse = z.infer<typeof importResponseSchema>
