#!/bin/sh
# Monta a pasta _site/ com tudo que vai para a hospedagem (GitHub Pages, Firebase Hosting ou Cloudflare Pages).
set -e
cd "$(dirname "$0")/.."
sh build-site.sh
rm -rf _site && mkdir _site
cp index.html _site/index.html
cp -r icons manifest.webmanifest _site/ 2>/dev/null || true
cp -r content _site/content
cp -r beta _site/beta
echo "_site pronto: $(ls _site | tr '\n' ' ')"
