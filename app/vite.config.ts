import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import path from 'node:path'
export default defineConfig({
  base:'./',
  plugins:[react()],
  resolve:{alias:{'@content':path.resolve(import.meta.dirname,'../content')}},
  server:{fs:{allow:['..']}},
})
