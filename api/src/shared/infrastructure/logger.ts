import type { FastifyServerOptions } from 'fastify'

const SEVERITY_BY_LEVEL: Record<string, string> = {
  trace: 'DEBUG',
  debug: 'DEBUG',
  info: 'INFO',
  warn: 'WARNING',
  error: 'ERROR',
  fatal: 'CRITICAL',
}

export function buildLoggerOptions(level: string): Exclude<FastifyServerOptions['logger'], boolean | undefined> {
  return {
    level,
    messageKey: 'message',
    base: null,
    formatters: {
      level: (label) => ({ severity: SEVERITY_BY_LEVEL[label] ?? 'DEFAULT' }),
    },
  }
}
