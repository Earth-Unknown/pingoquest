import { createContainer } from '@/composition/container'
import { loadEnv } from '@/config/env'

const HOST = '0.0.0.0'

async function main(): Promise<void> {
  const env = loadEnv()
  const { app } = createContainer(env)

  let isShuttingDown = false
  const shutdown = async (signal: string): Promise<void> => {
    if (isShuttingDown) return
    isShuttingDown = true
    app.log.info({ signal }, 'shutting down')
    try {
      await app.close()
      process.exit(0)
    } catch (error) {
      app.log.error({ err: error }, 'shutdown failed')
      process.exit(1)
    }
  }
  process.on('SIGTERM', () => void shutdown('SIGTERM'))
  process.on('SIGINT', () => void shutdown('SIGINT'))

  await app.listen({ host: HOST, port: env.PORT })
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error)
  process.stderr.write(`${JSON.stringify({ severity: 'CRITICAL', message: `startup failed: ${message}` })}\n`)
  process.exit(1)
})
