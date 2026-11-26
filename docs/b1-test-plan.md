# B1: plano de testes (progresso na conta)

Escopo: `docs/backend.md` seções 3 (contrato B1), 5 (sincronização, merge, offline, import), 6 (login e conflito) e 9 (estratégia). Stack: Vitest (unit e integração com `fastify.inject`), emulador do Firestore (`firebase emulators:exec`), Playwright (E2E do app).

Convenções deste plano:

- Pontos marcados **[DEFINIR]** são lacunas do contrato que o teste precisa de uma decisão. Cada um tem a recomendação adotada pelos testes; se o contrato mudar, o teste muda junto.
- Os testes são a especificação: o dev escreve o teste vermelho primeiro (TDD) e implementa até ficar verde.
- Os formatos reais do save (`pingoquest-v3`) vêm de `app/src/lib/progress.ts` e `events.ts`: `done[k]=true`, `know[c]={seen,ok,bad}`, `ledger[chave]=1`, `ev[id]={steps:{s1:{day,c}},used[],pieces}`, `miss[texto]=n`, `day={d,xp,phases,...,claimed:[bool,bool,bool],chest,call}`, `gems ?? 50`.

---

## 1. Casos de aceite por parte

### B1a: API (bootstrap, GET/PATCH state, import, link-complete)

| # | Given / When / Then |
|---|---|
| A1 | Given um convidado sem documento, When `POST /me/bootstrap`, Then 200 com `account.isAnonymous=true`, `rev=0`, `importPending=true`, `serverDay`; existem `users/{uid}`, `data/progress`, `data/game`, e `ledger/starter` com 50 chips |
| A2 | Given bootstrap já feito, When `POST /me/bootstrap` de novo, Then 200 idêntico, `rev` e `ledger/starter` inalterados (idempotente) |
| A3 | Given estado vazio, When `GET /me/state`, Then `{rev:0, state:{...vazio válido pelo schema}, serverDay}` |
| A4 | Given `rev=3`, When `PATCH` com `baseRev=3` e `changes.know` novo, Then `rev=4` e o `state` devolvido já mesclado |
| A5 | Given `PATCH` com campo do servidor (`done`, `ledger`, `gems`...), When enviado, Then 422 `field_not_allowed` e nada gravado |
| A6 | Given conta sem import, When `POST /me/import` com save válido, Then 200, `report` preenchido, `importedAt` gravado, `importPending=false` no próximo bootstrap |
| A7 | Given conta já importada, When `POST /me/import`, Then 409 `already_imported` e o estado não muda |
| A8 | Given convidado, When `POST /me/link-complete` sem ter ligado Google, Then 409 `not_linked` |
| A9 | Given token Google de conta bootstrapada como convidada, When `link-complete`, Then `isAnonymous=false`, e o estado do convidado continua intacto |
| A10 | Given qualquer rota `/me/*` sem token ou com token inválido, When chamada, Then 401 no formato de erro padrão e `Cache-Control: private, no-store` |

### B1b: app (sync, cache, outbox, import no primeiro login)

| # | Given / When / Then |
|---|---|
| B1 | Given aluno com `pingoquest-v3` avançado e sem conta, When entra como convidado pela primeira vez, Then o app chama bootstrap, depois import, mostra o mesmo progresso, renomeia a chave para `pingoquest-v3-importado` e cria `pingoquest-cache-v1` |
| B2 | Given convidado novo sem `pingoquest-v3`, When entra, Then bootstrap sem import (nenhum `POST /me/import`) |
| B3 | Given import com 5xx ou rede caindo, When falha, Then `pingoquest-v3` fica intacto (não renomeia) e o app tenta de novo no próximo carregamento |
| B4 | Given progresso no aparelho 1, When o aparelho 2 abre a mesma conta, Then `GET /me/state` mostra tudo |
| B5 | Given offline, When o aluno estuda e acerta/erra perguntas, Then o app funciona, `know`/`miss` entram na outbox e saem ao reconectar |
| B6 | Given mudanças locais, When passa 5 s sem novas mudanças, Then um único `PATCH` com debounce; ao esconder a página (`pagehide`) sai um `fetch` `keepalive` |
| B7 | Given reload da página, When recarrega, Then o cache `pingoquest-cache-v1` renderiza na hora e o `GET /me/state` reconcilia depois, sem piscar para vazio |
| B8 | Given duas abas, When uma grava, Then a outra recebe o evento `storage` e recarrega o cache |
| B9 | Given tentativa na outbox com mais de 24 h, When reenvia, Then descartada com aviso ao aluno |
| B10 | Given "Sair" de conta Google, When confirma, Then `pingoquest-cache-v1` é apagado; convidado não vê "Sair", vê "Entrar com Google" |
| B11 | Given `pingoquest-v3` corrompido (JSON inválido), When entra, Then o app trata como save vazio, não quebra e não envia import |
| B12 | Given convidado sem fases e saldo inicial, When liga o Google, Then sem tela de conflito (ver B1c) |

### B1c: conflito, export/delete, limpeza

| # | Given / When / Then |
|---|---|
| C1 | Given convidado A com progresso e Google já usado por G, When `linkWithPopup` falha com `credential-already-in-use`, Then o app chama `GET /me/summary` (A), `POST /me/merge-intent` (A), faz `signInWithCredential` (G) e mostra a tela comparando "Neste aparelho" x "Na sua conta Google" |
| C2 | Given a tela de conflito, When escolhe "Ficar com a conta Google" (padrão), Then o cache do convidado é descartado e nenhum `adopt` é chamado |
| C3 | Given a tela de conflito, When escolhe "Trazer o deste aparelho" e confirma a ação destrutiva, Then `adopt` roda e o estado de G é substituído pelo de A; A deixa de existir |
| C4 | Given `intentId` válido, When `adopt` é chamado duas vezes, Then a segunda dá 409 `intent_used` |
| C5 | Given `intentId` com mais de 10 min, When `adopt`, Then 422 `intent_expired` |
| C6 | Given `intentId` inexistente, When `adopt`, Then 404 `intent_not_found` |
| C7 | Given quem chama `adopt` é convidado, When chama, Then 403 `account_required` |
| C8 | Given `intentId` criado por outro uid de origem, When `adopt` por conta que não deveria ter a posse, Then rejeitado (a posse é do `fromUid` da intent; o teste usa uma intent de A tentando ser usada para trazer B) |
| C9 | Given `adopt` interrompido no meio (falha injetada na etapa 3), When repetido, Then converge: G com o estado de A completo, `intent` marcada `usedAt` só no fim, sem ledger duplicado |
| C10 | Given conta com dados, When `GET /me/export`, Then JSON com perfil, progress, game, wallet, ledger e events; sem e-mail nem foto |
| C11 | Given `DELETE /me` com `{confirm:true}`, When chamado, Then 204, `users/{uid}` e subcoleções somem, usuário some do Auth; sem `confirm:true` dá 400 |
| C12 | Given job `housekeeping` e anônimos (vazio 8 dias, com fase 91 dias, com fase 30 dias, Google 200 dias), When roda, Then apaga só os dois primeiros; o job é idempotente |

---

## 2. B1a em detalhe (especificação executável)

### 2.1 Merge (função pura, `progress/domain/merge.ts`)

Tipo: `mergeState(a: ServerState, b: ServerState): ServerState`. Roda no unit, sem Firestore, sem relógio. Arquivo: `api/test/unit/merge.test.ts`.

Decisão de modelagem (importante para as propriedades): os campos "última escrita vence" (`miss`, `plan`, `curso`, `av`, `nick`, `hearts`) dependem da ordem de chegada, então **não são comutativos**. Os testes tratam o merge em duas camadas:

| Camada | Função | Propriedades testadas |
|---|---|---|
| Convergente | `mergeConvergent(a,b)` (todos os campos com regra de união, máximo, OU, maior `last`, `day`, `ev`) | comutativa, associativa, idempotente |
| Última escrita | `mergeState(base, incoming)`: aplica `mergeConvergent` e depois sobrescreve os campos LWW com os de `incoming` | idempotente (`merge(x,x)=x`); não comutativa, e isso é afirmado de propósito num teste de exemplo (`merge(a,b).plan='b'`, `merge(b,a).plan='a'`) |

A property-based usa `fast-check` (dependência de dev nova, pequena e consolidada; checar se já existe antes de instalar). Gerador de estados com: `done` (chaves `"g-f"`, valor `true`), `know` (3 conceitos, `seen` bool, `ok`/`bad` 0..20), `xch`, `xseen` (conjuntos), `casos` (`n`, `best` 0..3), `bosses`, `best`, `total`, `ok`, `gems`, `xp`, `streak`/`last`, `day`, `ev`, `ledger`, `hist`, `conq`, `inv`. 200 execuções por propriedade, seed fixa no CI (evita flakiness; ao falhar, imprime o seed).

Propriedades obrigatórias (todas sobre `mergeConvergent`):

| Propriedade | Enunciado |
|---|---|
| Comutativa | `m(a,b) = m(b,a)` |
| Associativa | `m(m(a,b),c) = m(a,m(b,c))` |
| Idempotente | `m(a,a) = a` |
| Identidade | `m(a, vazio) = a` e `m(vazio, a) = a` (estado vazio é elemento neutro) |
| Monotônica | para os campos de união/máximo, o resultado nunca perde um item/valor que `a` ou `b` tinham |
| Imutável | não muta as entradas (comparar com `structuredClone` antes e depois) |

Exemplos concretos por campo (tabela de decisão; cada linha vira um `test`):

| Campo | A | B | Resultado esperado |
|---|---|---|---|
| `done` (união) | `{"0-0":true}` | `{"0-1":true}` | `{"0-0":true,"0-1":true}` |
| `done` (mesma chave) | `{"0-0":true}` | `{"0-0":true}` | `{"0-0":true}` |
| `conq` (união) | `{"primeiro-ping":1}` | `{"rede-estavel":1}` | os dois |
| `hist` (união) | `{"2026-11-20":1}` | `{"2026-11-21":1}` | os dois |
| `ledger` (união) | `{"ev:rede-conectada:s1":1}` | `{"ev:rede-conectada:s2":1}` | os dois (não duplica, não soma) |
| `inv.items` (união sem repetição) | `["bone-rede"]` | `["bone-rede","luva"]` | `["bone-rede","luva"]` (sem duplicado; ordem estável, definir ordenação por id para a comutativa) |
| `inv.coll` | `{a:1}` | `{b:1}` | `{a:1,b:1}` |
| `xch`, `xseen` | `{x:1}` | `{y:1}` | `{x:1,y:1}` |
| `bosses` (máx) | 2 | 3 | 3 |
| `best`, `total`, `ok`, `gems`, `xp` (máx) | `gems:50`, `xp:120` | `gems:35`, `xp:200` | `gems:50`, `xp:200` (documenta o limite conhecido: gasto em outro aparelho é ignorado) |
| `know[c]` | `{seen:true,ok:2,bad:5}` | `{seen:false,ok:4,bad:1}` | `{seen:true,ok:4,bad:5}` |
| `know[c]` só em um lado | `{seen:true,ok:1,bad:0}` | ausente | o de A |
| `casos[id]` | `{n:1,best:3}` | `{n:4,best:2}` | `{n:4,best:3}` |
| `streak`/`last` (maior `last`) | `last:"2026-11-24",streak:5` | `last:"2026-11-25",streak:2` | `last:"2026-11-25",streak:2` (o par inteiro de B, não o máximo do streak) |
| `streak`/`last` (empate em `last`) | `last:"2026-11-25",streak:3` | `last:"2026-11-25",streak:4` | `streak:4` (desempate determinístico por maior `streak`; senão perde a comutativa) |
| `best` junto com `streak` | `best:9, streak:1` | `best:4, streak:4` | `best:9` (máximo independente do par) |
| `day` mesmo `d` | `{d:"2026-11-25",xp:10,phases:1,claimed:[true,false,false],chest:false}` | `{d:"2026-11-25",xp:30,phases:0,claimed:[false,true,false],chest:true}` | `xp:30, phases:1, claimed:[true,true,false], chest:true` |
| `day` `d` diferente | `d:"2026-11-24"` | `d:"2026-11-25"` | o objeto inteiro de B (o mais novo), sem misturar contadores |
| `ev[id].steps` | `{s1:{day:"2026-11-22",c:5}}` | `{s2:{day:"2026-11-25",c:6}}` | `steps` com `s1` e `s2`; `pieces` recalculado pelo catálogo (soma das peças das etapas presentes), ignorando o `pieces` enviado |
| `ev` mesma etapa, dias diferentes | `s1:{day:"2026-11-23"}` | `s1:{day:"2026-11-22"}` | `s1.day="2026-11-22"` (a mais antiga, igual à regra do import) |
| `ev.used` | `["q1"]` | `["q2"]` | união, existentes primeiro, sem repetir, mantendo os últimos 80 (decidido, ver `docs/backend.md` seção 5) |
| `miss[q]` (LWW) | base `{q1:3}` | incoming `{q1:1}` | `{q1:1}` (pode diminuir) |
| `miss[q]` só na base | base `{q1:3,q2:2}` | incoming `{q1:1}` | decidido: `q2` ausente = não tocou (`q1:1` vence só em `q1`, `q2` fica 2). `changes.miss` envia só as chaves tocadas e o valor `0` remove; `null` não é aceito |
| `plan`, `curso`, `hearts`, `nick`, `av` (LWW) | base `plan:7` | incoming `plan:5` | `plan:5` |

Casos de borda do merge: `undefined`/campos ausentes em um dos lados; `ok`/`bad` negativos ou não numéricos (rejeitados pelo Zod antes, e o merge nunca produz negativo); `know` com 200 conceitos; chaves com unicode e pontos em `miss` (texto da pergunta é a chave: `"O que é um IP?"`, acentos, aspas, `/` e `.`; o Firestore tem restrições de nome de campo, então o teste de integração (2.5) grava e relê essas chaves); objetos com chave `__proto__` (não pode poluir o protótipo).

### 2.2 Import (`POST /me/import`)

Fixtures em `api/test/fixtures/saves/` (anonimizados, JSON do `pingoquest-v3` real; o dev exporta de um aparelho de teste). Unit testa o use case com repositório em memória e catálogo real; integração roda o mesmo fixture pela rota no emulador.

Constantes do teto plausível (X por fase, Y por prova, missões por dia de `hist`) são do dev; os testes importam a constante e afirmam o comportamento, não o número.

| Fixture | Given | Resultado esperado | `report` |
|---|---|---|---|
| `vazio.json` (`{}`) | conta nova | 200; estado vazio; `importedAt` gravado; `gems=50` só pelo `ledger/starter`, sem entrada `import` | `accepted` vazio, `clamped=[]`, `dropped=[]` |
| `novato.json` (1 fase, `gems:65`, `xp:30`, `streak:1`) | 1 fase concluída | `done` com a fase; `gems=65`; ledger tem `starter` (50) e `import` (+15); `xp:30` | `clamped=[]` |
| `avancado.json` (fases em vários grupos, 2 provas, `casos`, `conq`, `inv` de progresso, `hist` com 20 dias) | uso de semanas | tudo aceito dentro do teto; `inv` recalculado pelo servidor (itens de progresso decorrem das fases/provas) | `dropped` lista só o que é de mentira (`fr`,`gifts`,`code`,`maxDay`) |
| `evento-andamento.json` (`ev['rede-conectada'].steps` s1 em 2026-11-23 e s2 em 2026-11-26, `pieces:2`, `ledger` com `ev:rede-conectada:s1` e `:s2`) | evento aberto (22/11 a 01/12) | `ev` preservado com as duas etapas; ledger do evento preservado; `pieces` recalculado = 2 | sem `dropped` do evento |
| `evento-fora-janela.json` (etapa em 2026-11-10 e outra em 2026-12-05) | etapas fora da janela | essas etapas saem; a chave do ledger correspondente também; peças recalculadas | `dropped` inclui `ev.rede-conectada.steps.s1` etc. |
| `evento-duas-no-dia.json` (s1 e s2 no mesmo `day`) | duas etapas no mesmo dia | fica só a mais antiga do dia (menor id de etapa na ordem do catálogo); a outra sai | em `dropped` |
| `evento-prize-falso.json` (`inv.items` com o item do prêmio, mas sem `ledger['ev:rede-conectada:prize']`) | item de evento forjado | item removido (só vale com prêmio no ledger e etapas na janela) | em `dropped` |
| `evento-completo.json` (3 etapas válidas, `prize` no ledger, item) | evento concluído | item e `coll` preservados | |
| `corrompido-texto.txt` (`"{nao-e-json"`) | corpo não é objeto | 422 `invalid_legacy_save`, nada gravado, `importedAt` **não** é marcado (aluno pode tentar de novo com save válido) | |
| `corrompido-tipos.json` (`done:"sim"`, `know:[]`, `gems:"muito"`, `streak:null`) | tipos errados | 422 `invalid_legacy_save` se o schema raiz falha; campo isolado inválido: decidido, o campo é descartado e listado em `report.dropped` (o aluno não perde tudo por um campo); só raiz inválida ou mapa acima do limite de chaves dá 422 |
| `campos-desconhecidos.json` (`foo:1`, `admin:true`, `isTester:true`, `testDayOffset:9`, `__proto__`, `constructor`) | campos fora da allowlist | nenhum entra no estado, principalmente `isTester`/`testDayOffset`/`admin` (campos privilegiados do `users`) | todos em `dropped` |
| `fases-inexistentes.json` (`done:{"9-9":true,"0-0":true}`, `casos:{"fantasma":{n:1}}`) | catálogo | só `0-0` entra | `dropped` com `done.9-9`, `casos.fantasma` |
| `absurdo.json` (`gems:99999999`, `xp:1e12`, `bosses:500`, `streak:9999`, `total:-5`) | valores forjados | `gems` e `xp` cortados no teto; `bosses` limitado ao nº de provas do catálogo; negativos viram 0 ou são descartados; nunca `NaN`/`Infinity` (`1e999` no JSON vira `Infinity` em alguns parsers: caso explícito) | `clamped` traz `{field, sent, kept}` para cada corte |
| `gems-undefined.json` (save sem `gems`, só `xp`) | cliente usa `gems ?? 50` | `gems=50`, sem entrada `import`, sem pagar o starter duas vezes | |
| `repetido` (mesmo `avancado.json`, 2ª chamada) | já importado | 409 `already_imported`; estado e ledger idênticos aos da 1ª chamada (comparar snapshot) | |
| `repetido-concorrente` | duas requisições simultâneas de import | exatamente uma recebe 200 e a outra 409; uma só entrada `import` no ledger (integração, transação em `importedAt`) | |
| `grande.json` (>256 KB, p. ex. `miss` com 5 mil chaves) | corpo grande | 413 antes de qualquer processamento; abaixo do limite mas com `miss` enorme dentro do corpo: decidido: o schema limita (`miss` até 600 chaves de 160 caracteres); acima disso 422 `invalid_legacy_save` no import e `invalid_input` no PATCH | |

Verificações transversais em todo import bem-sucedido:

| Verificação | Como |
|---|---|
| Ledger coerente | saldo `wallet.chips` = soma de `ledger.delta.chips` |
| `report.accepted` é consistente | contagens batem com o estado gravado |
| Segunda leitura igual | `GET /me/state` logo após o import devolve o mesmo `state` do corpo da resposta |
| Sem efeito no `users` público | `nick`, `code`, `avatar` não mudam por campos do import (o `nick` do save é só dado do cliente) |
| `fr`, `gifts`, `code`, `maxDay` | nunca persistidos |

### 2.3 PATCH (`PATCH /me/state`)

| Caso | Given / When / Then | Camada |
|---|---|---|
| `baseRev` correto | `rev=3`, `baseRev=3` → `rev=4`, `state` mesclado | integração |
| `baseRev` desatualizado | `rev=7`, `baseRev=3` com `know` novo → **não rejeita**: aplica o merge convergente sobre o estado atual, `rev=8`, e devolve o `state` completo (o cliente reconcilia pela resposta). Sem 409. decidido: o `baseRev` serve só para log e diagnóstico (`docs/backend.md` seção 5) | unit (use case) e integração |
| `baseRev` do futuro | `baseRev=99` com `rev=3` → 400 `invalid_input` ou tratado como desatualizado. Recomendação: aceitar (é só diagnóstico) e registrar em log | unit |
| `baseRev` ausente/negativo/não inteiro | 400 `invalid_input` | unit (Zod) |
| Campo não permitido | `changes:{done:{...}}`, `{ledger}`, `{gems}`, `{xp}`, `{wk}`, `{streak}`, `{conq}`, `{inv}`, `{fr}`, `{code}` (e `nick` depois do B4) → 422 `field_not_allowed` com `details.fields`; nada gravado e `rev` não muda; uma chave proibida junto de uma válida rejeita o corpo todo (atomicidade) | unit e integração |
| Campo desconhecido | `changes:{foo:1}` → 422 `field_not_allowed` (mesma regra: allowlist) | unit |
| `changes` vazio | `changes: {}` → 422 `invalid_input` (decidido, o schema exige `progress` ou `game`); PATCH repetido ou sem efeito (por exemplo `{progress:{}}`) → 200, sem escrita, `rev` não avança | unit |
| Tipos inválidos | `know.x.ok="3"`, `ok:-1`, `ok:1e9` → 400 `invalid_input` | unit |
| `av` com item que o aluno não tem | rejeitado ou descartado (regra "só aceito se os itens são do aluno") | unit; decidido: no B1 só o formato do `av` é validado (o `inv` ainda é do cliente); a regra "item é do aluno" entra no B2 com 422 `rule_violation` |
| Corpo grande | 300 KB → 413, sem tocar no banco | integração (`inject` com payload) |
| Corpo no limite | 255 KB válido → 200 | integração |
| JSON malformado, `Content-Type` errado | 400 | integração |
| Idempotência | o mesmo `PATCH` enviado 2 vezes → 2ª devolve o mesmo `state`; `know` não dobra (max) e `rev` avança no máximo 1 a mais ou fica igual (definir; recomendação: `rev` só avança se o estado mudou, então a 2ª não avança) | integração |
| Retry após timeout | cliente reenvia o mesmo corpo depois de uma resposta perdida → estado final igual ao de um envio só | integração |
| Concorrência | `Promise.all` de 2 `PATCH` com o mesmo `baseRev` em campos diferentes (`know.a` e `know.b`) → ambos 200, estado final contém os dois, `rev` final = `rev0+2`, sem lost update | integração (emulador, transação) |
| Concorrência no mesmo campo | `miss.q1=1` e `miss.q1=5` simultâneos → um dos dois vence (LWW), nenhum erro 500, o estado é um dos dois valores, nunca mistura | integração |
| Concorrência de 10 | 10 `PATCH` paralelos incrementando `know.c.ok` (1..10) → `ok=10` (máximo) e `rev=rev0+10` | integração |
| Estado do `users` público | `PATCH` não altera `users.week/streak` (são do servidor) | integração |
| `lastSeenAt` | cada `PATCH`/`GET` atualiza `lastSeenAt` (alimenta o job de limpeza), sem contar como mudança de `rev` | integração |

### 2.4 Auth

Reaproveitar `FakeTokenVerifier` e `FixedClock` de `api/test/integration/routes.test.ts` (extrair para `api/test/helpers/` para não duplicar). Rotas B1 em tabela, rodadas em `test.each`.

| Caso | Esperado |
|---|---|
| Sem header `Authorization` | 401 `unauthenticated`, corpo no formato `{error:{code,message}}` |
| Header sem `Bearer`, `Bearer ` vazio, token com espaço extra | 401 |
| Token inválido/expirado | 401 `invalid_token`; mensagem sem vazar detalhe do verificador |
| Token válido de convidado (`isAnonymous:true`) | `bootstrap`, `GET/PATCH state`, `import` funcionam (convidado também sincroniza) |
| Token válido Google (`isAnonymous:false`) | mesmas rotas funcionam |
| Isolamento entre usuários | token de A nunca lê/escreve o estado de B (não existe parâmetro de uid na rota; o teste prova com 2 usuários e estados distintos) |
| `link-complete` com token de convidado, sem link | 409 `not_linked` |
| `link-complete` com token Google e doc ainda anônimo | 200, `isAnonymous=false`, estado intacto |
| `link-complete` repetido | 200 idempotente |
| `link-complete` com token Google sem doc (nunca fez bootstrap) | decidido: cria os documentos como o `bootstrap` (upsert), já com `isAnonymous=false`; idempotente. |
| `link-complete` quando o claim do token ainda diz `anonymous` (cliente esqueceu `getIdToken(true)`) | 409 `not_linked` |
| App Check ausente com `APPCHECK_MODE=log` | passa, e loga um aviso (assert no logger); com `enforce` 401 `app_check_failed` (unit do hook, sem rota nova) |
| Rate limit | 61ª requisição no minuto → 429 `rate_limited` com `Retry-After`; `bootstrap` e `import` têm limite próprio mais baixo (testar com relógio falso, não com `sleep`) |
| Cache | toda resposta (inclusive erros) com `Cache-Control: private, no-store` |

### 2.5 Camadas: o que roda onde

| Camada | O quê | Onde | Tempo-alvo |
|---|---|---|---|
| Unit (sem I/O) | `mergeConvergent`/`mergeState` e propriedades; schemas Zod de `contracts/` (aceita/rejeita); allowlist de campos; plausibilidade e teto do import; normalização do evento (janela, uma etapa por dia, recálculo de `pieces`); recálculo de `inv` pelo catálogo; use cases com repositórios em memória e `Clock` falso | `api/test/unit/*.test.ts` (projeto `unit`) | menos de 5 s |
| Integração, sem emulador | Rotas Fastify com `app.inject`, use cases reais e repositório em memória: auth, erros HTTP, 413, 422, formato de erro, `no-store`, contratos (snapshot da resposta) | `api/test/integration/*.test.ts` (projeto `integration`) | menos de 15 s |
| Integração, emulador do Firestore | Repositório Firestore real: transação do `PATCH`, concorrência (`Promise.all`), `import` concorrente, `bootstrap` concorrente (duas chamadas simultâneas criam um único `users/{uid}` e um único `starter`), chaves de `miss` com caracteres especiais, limite de tamanho de documento, `ledger/starter` com `create` falhando na segunda vez | `api/test/integration-firestore/*.test.ts`, novo projeto Vitest `firestore` (script `test:firestore` com `firebase emulators:exec --only firestore`, como o `test:rules` atual) | menos de 60 s |
| Regras | Cliente não lê nem escreve `users/**` (inclui `data/progress`, `data/game`, `ledger`), autenticado ou não | `api/test/rules` (já existe; acrescentar os caminhos novos do B1) | |
| Contrato | Os schemas de `contracts/` são importados pelo teste da API e (no B1b) pelo app; um teste do app valida a resposta mockada contra o mesmo schema, para o mock não mentir | unit/integração | |
| Smoke em produção, pós-deploy | Só leitura e criação descartável (ver abaixo) | script no workflow de deploy, depois do `health` já existente | menos de 30 s |

Smoke em produção pós-deploy (workflow de deploy, falha o job e dispara rollback manual do tráfego):

| Passo | Verificação |
|---|---|
| 1 | `GET /api/v1/health` pelo domínio do Hosting retorna `version` = SHA do deploy (prova que o rewrite aponta para a revisão nova) |
| 2 | Token real de uma conta de teste **dedicada** (convidado de teste, uid fixo guardado como variável do GitHub; nunca conta de aluno) |
| 3 | `POST /me/bootstrap` → 200 e idempotente na segunda chamada |
| 4 | `GET /me/state` → 200, passa no schema de `contracts/` |
| 5 | `PATCH /me/state` com mudança inofensiva (`know` de um conceito sintético) → `rev` avança |
| 6 | Resposta sem token em `/me/state` → 401 (garante que a auth não foi desligada) |
| 7 | Sem `import` e sem `DELETE` no smoke (não repetível e destrutivo). A conta de teste é reaproveitada, não criada a cada deploy, para não encher o Auth |

---

## 3. B1b: E2E Playwright

Local: `app/e2e/` (o app é React/Vite; os `tests/*.test.js` antigos são do jogo velho e vão aposentar). Projeto Playwright com `webServer` subindo o Vite, a API (`tsx`) e os emuladores de Auth e Firestore. Dois `browser.newContext()` simulam dois aparelhos (storage isolado).

### O que mockar e o que não

| Peça | No E2E | Motivo |
|---|---|---|
| API Fastify | **Real**, contra emuladores | o E2E valida o contrato ponta a ponta; mock esconderia divergência |
| Firestore | Emulador | idem |
| Firebase Auth | Emulador do Auth; popup do Google falso do emulador | não depende de conta real nem de rede externa |
| Google real, reCAPTCHA/App Check | Fora (App Check em `off` no ambiente E2E) | instável, cota e captcha |
| Rede (offline, falha, lentidão) | `context.setOffline`, `page.route` para `abort`/atraso/5xx | testar outbox e retry sem derrubar o servidor |
| Relógio | `page.clock` do Playwright para debounce de 5 s e expiração de 24 h da outbox; `Clock` falso na API só nos testes de API | sem `waitForTimeout` |
| Conteúdo do curso | Real (bundle) | a lógica depende dele |
| Conta de produção | Nunca | |
| Teste de componente da UI de conflito | Vitest + Testing Library com `fetch` mockado (MSW, se já houver; senão `vi.fn`) validado pelo schema do contrato | rápido e cobre ramos que o E2E não precisa repetir |

### Fluxos críticos

| # | Fluxo | Passos e asserções | Prio |
|---|---|---|---|
| E1 | Primeiro login com progresso local | Given `localStorage['pingoquest-v3']` = `avancado.json` (injetado com `addInitScript`), When abre o app e entra como convidado, Then espera `POST /me/bootstrap` e `POST /me/import` (200), a trilha mostra as mesmas fases, `pingoquest-v3` deixa de existir e `pingoquest-v3-importado` existe, `pingoquest-cache-v1` tem `uid`, `rev` e `state` | P0 |
| E2 | Primeiro login com evento em andamento | Mesmo fluxo com `evento-andamento.json`; a tela do evento mostra as peças e etapas, e o prêmio não é pago de novo | P0 |
| E3 | Falha no import | `page.route` devolve 503 no `import` → `pingoquest-v3` continua; remove o mock, recarrega → import ocorre e só então renomeia | P0 |
| E4 | Reload | Após estudar, recarrega; a tela renderiza do cache sem passar por vazio (assert: nenhum frame com 0 fases); o `GET /me/state` reconcilia sem mudar a UI | P0 |
| E5 | Dois aparelhos | Contexto 1 (A) estuda e aguarda o `PATCH`; contexto 2 faz login na mesma conta (Google do emulador) e vê o progresso; estuda lá; contexto 1 recarrega e vê as duas partes (merge) | P0 |
| E6 | Offline e volta | Contexto offline: o aluno responde perguntas; o app não mostra erro; `pingoquest-cache-v1.outbox` cresce; ao `setOffline(false)` sai um `PATCH` e a outbox esvazia; o estado do servidor (via `GET` direto na API) contém os `know` | P0 |
| E7 | Offline com tentativa velha | Com `page.clock`, avança 25 h offline; ao voltar, a tentativa é descartada com aviso na tela | P1 |
| E8 | Fechar a página no meio | `pagehide` dispara `fetch` `keepalive`; verificar no log/servidor que o `PATCH` chegou (aceitar `sendBeacon`/`keepalive` pelo `page.route` observando a requisição) | P1 |
| E9 | Duas abas | Aba 1 grava; aba 2 recebe o `storage` e atualiza sem novo login | P1 |
| E10 | Convidado vira Google (link ok) | `linkWithPopup` com emulador; `link-complete` 200; mesmo `uid`; progresso intacto | P0 |
| E11 | Sair | Conta Google: "Sair" apaga `pingoquest-cache-v1`; convidado não vê "Sair" | P1 |
| E12 | Convidado sem progresso liga Google já existente | Pula a tela de conflito (B12 acima) | P1 |
| E13 | Resiliência | 401 por token expirado → o app renova o token e repete; 429 → backoff e mensagem calma; 5xx no `PATCH` → mantém na outbox | P1 |
| E14 | Acessibilidade mínima | Banner/estado de sincronização anunciado (`aria-live="polite"`), foco devolvido ao fechar a tela de conflito, alvo de toque de 44 px nos botões das duas escolhas, navegação por teclado (axe nas telas de login e conflito) | P1 |

Dados de teste do E2E: fixtures de `api/test/fixtures/saves/` compartilhadas por caminho relativo (uma só fonte); contas do emulador criadas por teste (uid novo por `test`, sem reutilizar entre testes); limpeza do emulador (`DELETE` do endpoint de reset do emulador) no `beforeEach`.

Regras anti-flakiness: sem `waitForTimeout`; esperar por `page.waitForResponse`/`expect.poll`; `retries: 0` localmente e 1 no CI (se um teste passa só no retry, vira bug a investigar e não é ignorado); `trace: 'retain-on-failure'`; viewports 375, 768 e 1440 só nos fluxos E1 e E10 (mobile-first); workers isolados por emulador (um projeto Firebase por worker ou `workers: 1` no começo).

---

## 4. Quality gates por PR

| Gate | B1a (API) | B1b (app) | B1c (conflito, export/delete, limpeza) |
|---|---|---|---|
| `pnpm/npm` lint, `tsc --noEmit`, build do esbuild | passa | passa (Vite build) | passa |
| Cobertura em funções puras | `domain/` (merge, import, normalização de evento, plausibilidade) >= 90% linhas e 85% de branches; `application/` >= 80% | store/outbox/sync (lógica sem React) >= 85%; componentes novos com teste do comportamento | `adopt`, `export`, `delete`, `housekeeping` >= 85% |
| Property tests do merge | verdes com seed fixa; 3 propriedades + identidade + monotonicidade | n/a | n/a |
| Cada código de erro do contrato B1 | tem ao menos 1 teste (400, 401, 403, 404, 409, 413, 422, 429 listados) | o app trata cada código mostrável ao aluno | `intent_*`, `account_required` cobertos |
| Integração no emulador | PATCH concorrente, import concorrente, bootstrap concorrente verdes | E2E P0 verdes | adopt interrompido e repetido (C9) verde |
| Regras do Firestore | `test:rules` verde (+ caminhos B1) | n/a | + `mergeIntents` fechado |
| Contrato | `contracts/` sem mudança quebrando o app; snapshot revisado | resposta mockada validada pelo schema | idem |
| Segurança | nada de `isTester`/`testDayOffset`/`admin` aceitos de entrada; sem token/uid/e-mail em log (assert no logger de teste); `security-review` antes do deploy | sem token no `localStorage` (Firebase SDK guarda a sessão, o cache próprio não) | `export` sem e-mail/foto |
| Flakiness | rodar a suíte 3 vezes seguidas no CI uma vez por semana (job agendado); nenhum `sleep`/`waitForTimeout`; seed do fast-check impresso | E2E com `retries<=1`; teste que só passa com retry é bug | idem |
| Tempo | unit + integração sem emulador < 30 s; com emulador < 90 s | E2E P0 < 5 min | |
| Deploy (só B1a e depois de cada parte) | smoke pós-deploy verde | n/a | smoke + `housekeeping` em modo "dry-run" antes do primeiro agendamento |
| Review | `code-reviewer` + `/verify` (obrigatórios pelo DoD) | idem | idem |

Gate extra de entrada para B1b: B1a em produção e smoke verde. Gate de lançamento do B1 ao aluno: E1, E3, E5, E6 e E10 verdes, `jogo-antigo` removido do `_site` (R2) e `GOOGLE` publicado em "Em produção" (R21).

---

## 5. Riscos de teste e o que fica fora

### Riscos

| # | Risco | Mitigação |
|---|---|---|
| T1 | Lacunas do contrato (todas decididas em `docs/backend.md` seção 5) (baseRev desatualizado, `miss` ausente, `ev.used`, campo de tipo errado no import, `link-complete` sem doc, `rev` em `PATCH` repetido) viram testes escritos sobre suposição | Resolver antes do B1a abrir PR; as linhas marcadas ficam no teste como a decisão registrada |
| T2 | Merge comutativo só vale para a camada convergente; LWW (`miss`, `plan`...) depende da ordem de chegada, e a dona pode esperar "converge sempre" | Documentado na seção 2.1; teste de exemplo mostra a divergência de propósito |
| T3 | `gems`/`xp` por máximo ignoram gasto em outro aparelho | Teste fixa o comportamento (limite conhecido) e a nota remete ao B2/B3; sem esse teste, alguém "corrige" e quebra a convergência |
| T4 | Fixtures de save sintéticos não refletem saves reais de alunos | Exportar 3 saves reais anonimizados (novato, avançado, com evento) antes do B1b; pedir ao `data-engineer`/dona; sem dados pessoais (`nick`, `code`) |
| T5 | Catálogo de conteúdo muda e quebra os fixtures (fases/casos inexistentes) | Fixtures derivam ids do catálogo atual por helper, e há um teste "todo id de fixture existe no catálogo" para os saves "válidos" |
| T6 | Emulador do Firestore não reproduz contenção real (1 escrita/s por doc) nem latência | Teste de concorrência valida correção, não desempenho; carga leve em produção fica fora |
| T7 | Emulador do Auth difere do real (popup, `credential-already-in-use`, redirect no iOS) | O erro de conflito é simulado no Auth emulator para o fluxo C1; o redirect em Safari/PWA é manual |
| T8 | Teste de relógio: `serverDay` em `America/Sao_Paulo` (virada de dia 03:00 UTC), o `FixedClock` do B0 já usa 02:30Z | Casos de virada de dia no import/evento usam `Clock` falso, 02:59Z e 03:01Z |
| T9 | Suíte E2E lenta e frágil com 2 contextos e emuladores | Poucos fluxos P0, o restante em Testing Library; execução paralela só depois de estável |
| T10 | Cobertura alta no merge sem asserção real (mutações sobrevivem) | Opcional: Stryker só em `merge.ts` e no normalizador do import; meta de mutação >= 70% (não bloqueia PR no começo) |

### Fora do escopo do B1

| Item | Motivo |
|---|---|
| Recompensas, eventos oficiais, missões, ledger de B2, carteira de B3, amigos e presentes de B4 | Fases posteriores. No B1 só se testa que o cliente não consegue escrevê-los |
| Fraude determinada (cliente que forja o save com valores plausíveis) | Risco R3/R5 aceito; o teste prova o teto, não a impossibilidade |
| Portar `tests/eventos.test.js`, `conhecimento.test.js`, `desafio5.test.js`, `avatar.test.js`, `conteudo.test.js` para unit do servidor | Item do B2 (regras de pagamento). O B1 só aproveita deles os fixtures de `ev` e `know` e o comportamento "uma etapa por dia" para normalizar o import |
| Desempenho e carga (k6), custo no Cloud Run | Opcional, depois do B3 |
| App Check `enforce`, reCAPTCHA Enterprise | B1 roda em `log`; só se testa o hook |
| Redirect do Google em iOS Safari/PWA, popups bloqueados | Verificação manual em aparelhos reais antes do lançamento |
| Acessibilidade completa do app | Só as telas novas do B1 (login, conflito, estado de sync) |
| Teste de restauração de backup do Firestore | Operacional (DevOps), não do B1 |
| Remoção do import e do código do formato antigo | Marco depois do B3; hoje só garantir que o import fica isolado em um módulo para a remoção ser apagar arquivos |

### Ordem sugerida de execução dos testes na construção do B1a

1. Schemas Zod + allowlist (unit).
2. `mergeConvergent` com as propriedades e a tabela de exemplos (unit).
3. Normalização de evento e plausibilidade do import (unit), depois o use case de import com os fixtures.
4. Rotas com repositório em memória (`inject`): auth, 4xx e `no-store`.
5. Repositório Firestore e os testes de concorrência no emulador.
6. Atualizar o teste de regras; ligar o smoke ao workflow de deploy.
