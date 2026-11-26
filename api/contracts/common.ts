import { z } from 'zod'

export const serverDaySchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/)

export const errorResponseSchema = z.object({
  error: z.object({
    code: z.string().regex(/^[a-z][a-z0-9_]*$/),
    message: z.string(),
    details: z.record(z.string(), z.unknown()).optional(),
  }),
})
export type ErrorResponse = z.infer<typeof errorResponseSchema>

export const healthResponseSchema = z.object({
  ok: z.literal(true),
  version: z.string(),
})
export type HealthResponse = z.infer<typeof healthResponseSchema>

export const timeResponseSchema = z.object({
  now: z.iso.datetime(),
  serverDay: serverDaySchema,
  tz: z.string(),
})
export type TimeResponse = z.infer<typeof timeResponseSchema>

export const whoamiResponseSchema = z.object({
  uid: z.string().min(1),
  isAnonymous: z.boolean(),
})
export type WhoamiResponse = z.infer<typeof whoamiResponseSchema>
