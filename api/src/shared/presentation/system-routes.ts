import type { FastifyInstance, preHandlerAsyncHookHandler } from 'fastify'
import type { HealthResponse, TimeResponse, WhoamiResponse } from '@contracts/common'
import type { Clock } from '@/shared/domain/clock'
import { APP_TIMEZONE, ServerDay } from '@/shared/domain/server-day'
import { requireUser } from '@/shared/presentation/auth-hook'

type Deps = {
  clock: Clock
  version: string
  authenticate: preHandlerAsyncHookHandler
}

export function registerSystemRoutes(app: FastifyInstance, { clock, version, authenticate }: Deps): void {
  app.get('/api/v1/health', async (): Promise<HealthResponse> => ({ ok: true, version }))

  app.get('/api/v1/time', async (): Promise<TimeResponse> => {
    const now = clock.now()
    return { now: now.toISOString(), serverDay: ServerDay.fromDate(now).value, tz: APP_TIMEZONE }
  })

  app.get('/api/v1/whoami', { preHandler: authenticate }, async (request): Promise<WhoamiResponse> => {
    const { uid, isAnonymous } = requireUser(request)
    return { uid, isAnonymous }
  })
}
