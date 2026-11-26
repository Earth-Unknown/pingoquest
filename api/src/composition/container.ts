import type { FastifyInstance } from 'fastify'
import pkg from '../../package.json'
import type { Env } from '@/config/env'
import { FirebaseTokenVerifier } from '@/shared/infrastructure/firebase-token-verifier'
import { buildLoggerOptions } from '@/shared/infrastructure/logger'
import { SystemClock } from '@/shared/infrastructure/system-clock'
import { buildServer } from '@/shared/presentation/server'

export type Container = {
  app: FastifyInstance
}

export function createContainer(env: Env): Container {
  const app = buildServer({
    clock: new SystemClock(),
    tokenVerifier: new FirebaseTokenVerifier(env.GCP_PROJECT_ID),
    version: env.K_REVISION ?? pkg.version,
    logger: buildLoggerOptions(env.LOG_LEVEL),
  })
  return { app }
}
