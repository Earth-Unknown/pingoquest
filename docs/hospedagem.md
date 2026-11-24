# Hospedagem do Pingo Quest (Firebase Hosting + Cloudflare)

O jogo é um site estático (um `index.html` + `content/*.json`). Não precisa de servidor, então Firebase Hosting serve direto, sem Cloud Run.

## Subir no Firebase Hosting (uma vez)
1. `npm i -g firebase-tools && firebase login`
2. `firebase use --add` e escolha o projeto do Google Cloud que você já paga (isso cria o `.firebaserc`).
3. `sh tools/montar-site.sh` (gera a pasta `_site/`).
4. `firebase deploy --only hosting`

Nas próximas vezes: `sh tools/montar-site.sh && firebase deploy --only hosting`.

## Domínio e Cloudflare
- Firebase Console > Hosting > "Adicionar domínio personalizado" e siga os registros DNS.
- No Cloudflare (DNS), deixe os registros do Firebase em "somente DNS" (nuvem cinza) até o certificado ser emitido; depois pode ligar o proxy (nuvem laranja).

## Depois (quando tiver login e nuvem)
- Firebase Auth + Firestore para salvar o progresso por conta (hoje fica no navegador, em `pingoquest-v3`).
- Cloud Run só se aparecer um back-end próprio.

## Sobre a pasta `app/` (React)
É um teste de migração, ainda incompleto (só Trilha, Perfil e lições simples). Não é necessário para hospedar. O jogo oficial continua sendo `index.html`.
