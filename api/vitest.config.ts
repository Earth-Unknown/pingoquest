import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

const alias = {
  '@contracts': fileURLToPath(new URL('./contracts', import.meta.url)),
  '@': fileURLToPath(new URL('./src', import.meta.url)),
}

export default defineConfig({
  resolve: { alias },
  test: {
    projects: [
      { extends: true, test: { name: 'unit', include: ['test/unit/**/*.test.ts'] } },
      { extends: true, test: { name: 'integration', include: ['test/integration/**/*.test.ts'] } },
      { extends: true, test: { name: 'rules', include: ['test/rules/**/*.test.ts'] } },
    ],
  },
})
