#!/bin/bash
# Sunucuda git pull öncesi: takip edilen değişiklikleri sıfırlar, çakışan untracked dosyaları kaldırır.
# Kullanım: Sunucuda /var/www/themeproject içinde: bash scripts/server-clean-for-pull.sh
set -e
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "→ Takip edilen değişiklikler sıfırlanıyor (git reset --hard)..."
git reset --hard HEAD

echo "→ Pull'da çakışacak untracked dosyalar kaldırılıyor..."
rm -f scripts/nginx/themeproject.conf
rm -f deploy.sh

echo "→ git pull..."
git pull

echo "→ deploy.sh CRLF düzeltiliyor..."
sed -i 's/\r$//' deploy.sh
chmod +x deploy.sh 2>/dev/null || true

echo "Tamam. Şimdi: ./deploy.sh"
