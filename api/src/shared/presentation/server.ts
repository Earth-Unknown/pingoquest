import Fastify, { type FastifyInstance, type FastifyServerOptions } from 'fastify'
import type { Clock } from '@/shared/domain/clock'
import type { TokenVerifier } from '@/shared/domain/token-verifier'
import { createAuthHook } from '@/shared/presentation/auth-hook'
import { NOT_FOUND_RESPONSE, mapError } from '@/shared/presentation/error-response'
import { registerSystemRoutes } from '@/shared/presentation/system-routes'

const BODY_LIMIT_BYTES = 256 * 1024

export type ServerDeps = {
  clock: Clock
  tokenVerifier: TokenVerifier
  version: string
  logger: FastifyServerOptions['logger']
}

export function buildServer({ clock, tokenVerifier, version, logger }: ServerDeps): FastifyInstance {
  const app = Fastify({
    logger,
    bodyLimit: BODY_LIMIT_BYTES,
    trustProxy: true,
    forceCloseConnections: 'idle',
  })

  app.decorateRequest('user', null)

  app.addHook('onSend', async (_request, reply) => {
    reply.header('Cache-Control', 'private, no-store')
  })

  app.setErrorHandler((error, request, reply) => {
    const { status, body } = mapError(error)
    if (status >= 500) {
      request.log.error({ err: error }, 'unhandled error')
    }
    return reply.status(status).send(body)
  })

  app.setNotFoundHandler((_request, reply) => reply.status(404).send(NOT_FOUND_RESPONSE))

  registerSystemRoutes(app, { clock, version, authenticate: createAuthHook(tokenVerifier) })

  return app
}
