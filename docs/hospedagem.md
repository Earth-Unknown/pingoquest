# Hospedagem do Pingo Quest (Firebase Hosting + Cloudflare)

## Qual endereço divulgar
- **Oficial: https://pingoquest.web.app** (Firebase Hosting). Tem o login (Google ou convidado) e a API em `/api/**`. Divulgue este.
- **Reserva: https://earth-unknown.github.io/pingoquest** (GitHub Pages). Mesmo jogo, sem API. Não divulgue: o progresso fica no navegador de cada endereço e não passa de um para o outro.
- Os dois são atualizados juntos a cada merge na `main` (ver "Publicação automática" abaixo).

O site é estático (o app React compilado). Não precisa de servidor, então Firebase Hosting serve direto, sem Cloud Run.

- `/` é o **app React** (pasta `app/`), a versão principal.
- `/jogo-antigo/` é o jogo antigo de um arquivo só (`src/jogo.html`), mantido como reserva. Usa o mesmo progresso salvo, então dá para alternar sem perder nada.
- `/beta/` só redireciona para `/` (links antigos).
- O conteúdo dos cursos (`content/*.json`) é embutido no app na hora da compilação: depois de editar um curso, rode `sh tools/montar-site.sh` e publique de novo.

## Subir no Firebase Hosting (uma vez)
1. `npm i -g firebase-tools && firebase login`
2. `firebase use --add` e escolha o projeto do Google Cloud que você já paga (isso cria o `.firebaserc`).
3. `sh tools/montar-site.sh` (compila o app e gera a pasta `_site/`; precisa do Node 22+).
4. `firebase deploy --only hosting`

Nas próximas vezes: `sh tools/montar-site.sh && firebase deploy --only hosting`.

## Publicação automática (a cada merge na main)
Dois workflows publicam o mesmo site, para os dois endereços não ficarem diferentes:
- `pages.yml` → GitHub Pages (earth-unknown.github.io/pingoquest), em qualquer push na `main`.
- `deploy-hosting.yml` → Firebase Hosting (pingoquest.web.app), quando mudam `app/`, `src/`, `content/`, ícones, `index.html`, `firebase.json` ou depois de um deploy da API.
Ambos usam `sh tools/montar-site.sh`. Para publicar na mão: `sh tools/montar-site.sh && firebase deploy --only hosting`.

## Domínio e Cloudflare
- Firebase Console > Hosting > "Adicionar domínio personalizado" e siga os registros DNS.
- No Cloudflare (DNS), deixe os registros do Firebase em "somente DNS" (nuvem cinza) até o certificado ser emitido; depois pode ligar o proxy (nuvem laranja).

## Depois (quando tiver login e nuvem)
- Firebase Auth + Firestore para salvar o progresso por conta (hoje fica no navegador, em `pingoquest-v3`).
- Cloud Run só se aparecer um back-end próprio.

## Sobre a pasta `app/` (React)
É a versão principal: Trilha, Missões, Revisar, Conquistas, Perfil, casos e chamados, Eventos, Duelo, abertura, brilho, sons e animações (`motion`). Para desenvolver: `cd app && npm ci && npm run dev`. O `tools/montar-site.sh` compila tudo e monta o `_site/`. Ainda falta Amigos e Presentes (no jogo antigo também são de mentira, à espera do Supabase).
