#!/bin/sh
# O jogo é escrito em src/jogo.html como fragmento (formato do Artifact do claude.ai).
# Este script gera o index.html da raiz, que é uma página completa (doctype, head, regra [hidden])
# e serve tanto o GitHub Pages por branch (main, raiz) quanto por Actions.
# Depois de mexer em src/jogo.html: rode `sh build-site.sh` e faça commit dos dois arquivos.
set -e
cd "$(dirname "$0")"
{
  printf '%s\n' '<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><style>:root{color-scheme:light;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}body{margin:0;font:14px system-ui,sans-serif}img{max-width:100%}[hidden]{display:none!important}</style></head><body>'
  cat src/jogo.html
  printf '\n%s\n' '</body></html>'
} > index.html
