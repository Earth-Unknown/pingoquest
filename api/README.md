# pingoquest-api

API do Pingo Quest: Fastify + TypeScript (ESM, Node 22) em Cloud Run. Arquitetura e contratos em `../docs/backend.md`. Estado atual: B0 (esqueleto, sem funcionalidade para o aluno).

## Comandos

| Comando | O que faz |
|---|---|
| `npm ci` | Instala as dependências |
| `npm run dev` | Sobe com reload, lendo `.env` (copie de `.env.example`) |
| `npm run build` | Gera `dist/main.js` (esbuild; resolve o alias `@/`) |
| `npm start` | Roda `dist/main.js` |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | oxlint |
| `npm test` | Unitários e integração (`fastify.inject`, sem emulador) |
| `npm run test:rules` | Testa o `firestore.rules` no emulador (precisa de Java e `firebase-tools` no PATH) |
| `docker build -f api/Dockerfile .` | Imagem; rodar da raiz do repositório |

## Rotas (B0)

| Rota | Auth | Resposta |
|---|---|---|
| `GET /api/v1/health` | não | `{ ok, version }` |
| `GET /api/v1/time` | não | `{ now, serverDay, tz }` |
| `GET /api/v1/whoami` | Bearer (Firebase ID token) | `{ uid, isAnonymous }`; diagnóstico do R18 |

## Variáveis de ambiente

| Nome | Obrigatória | Observação |
|---|---|---|
| `GCP_PROJECT_ID` | sim | Projeto do Firebase |
| `PORT` | não | Padrão 8080 (injetada pelo Cloud Run) |
| `NODE_ENV` | não | `development`, `test` ou `production` |
| `LOG_LEVEL` | não | Padrão `info` |
| `K_REVISION` | não | Injetada pelo Cloud Run; vira o `version` do health |
| `FIREBASE_AUTH_EMULATOR_HOST` | não | Para verificar tokens do emulador do Auth em desenvolvimento |
