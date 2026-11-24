#!/bin/sh
# Monta a pasta _site/ com tudo que vai para a hospedagem (GitHub Pages, Firebase Hosting ou Cloudflare Pages).
#   /               app React (app/), versão principal
#   /jogo-antigo/   jogo antigo de um arquivo só (src/jogo.html), mantido como reserva; usa o mesmo progresso salvo
#   /beta/          só redireciona para a raiz (links antigos)
set -e
cd "$(dirname "$0")/.."

# 1) app React
( cd app && npm ci && npm run build )

# 2) jogo antigo (index.html gerado a partir de src/jogo.html e content/*.json)
sh build-site.sh

rm -rf _site && mkdir _site
cp -r app/dist/. _site/
cp -r icons manifest.webmanifest _site/
mkdir _site/jogo-antigo
cp index.html _site/jogo-antigo/index.html
cp -r icons manifest.webmanifest content _site/jogo-antigo/

# 3) links antigos de /beta
mkdir _site/beta
cat > _site/beta/index.html <<'HTML'
<!doctype html><html lang="pt-BR"><meta charset="utf-8"><title>Pingo Quest</title><meta http-equiv="refresh" content="0; url=../"><link rel="canonical" href="../"><a href="../">Abrir o Pingo Quest</a></html>
HTML
echo "_site pronto: $(ls _site | tr '\n' ' ')"
