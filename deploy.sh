#!/bin/bash
# ThemeProject – statik site deploy (Vite build + nginx)
# Proje kökünden: ./deploy.sh  veya  bash deploy.sh
#
# Ortam değişkenleri (isteğe bağlı):
#   THEMEPROJECT_DOMAIN   varsayılan: themeproject.omurgenc.dev
#   THEMEPROJECT_WEB_ROOT varsayılan: /var/www/themeproject

set -e
ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT_DIR"

DOMAIN="${THEMEPROJECT_DOMAIN:-themeproject.omurgenc.dev}"
WEB_ROOT="${THEMEPROJECT_WEB_ROOT:-/var/www/themeproject}"
NGINX_SITE="themeproject.conf"

echo "→ Git'ten son değişiklikler çekiliyor (git pull)"
if [ -d ".git" ]; then
  git pull || echo "  UYARI: git pull başarısız oldu, local değişiklikler olabilir."
fi

echo "→ Eski node_modules ve dist siliniyor, npm install + build"
rm -rf node_modules dist
npm install
npm run build

if [ ! -d "dist" ]; then
  echo "HATA: dist/ oluşmadı. Build başarısız."
  exit 1
fi

echo "→ Canlı dizinde eski dosyalar siliniyor: $WEB_ROOT"
sudo mkdir -p "$WEB_ROOT"
sudo rm -rf "${WEB_ROOT:?}/"*

echo "→ Yeni build canlı dizine kopyalanıyor"
sudo cp -a dist/. "$WEB_ROOT/"
sudo chown -R www-data:www-data "$WEB_ROOT" 2>/dev/null || true

echo "→ Nginx konfigürasyonu yazılıyor..."
if [ ! -d "/etc/nginx/sites-available" ]; then
  echo "UYARI: /etc/nginx/sites-available yok. Nginx atlanıyor."
else
  if [ -f "$ROOT_DIR/scripts/nginx/themeproject.conf" ]; then
    sudo cp "$ROOT_DIR/scripts/nginx/themeproject.conf" "/etc/nginx/sites-available/$NGINX_SITE"
    sudo sed -i "s|__WEB_ROOT__|$WEB_ROOT|g" "/etc/nginx/sites-available/$NGINX_SITE"
    sudo sed -i "s|__DOMAIN__|$DOMAIN|g" "/etc/nginx/sites-available/$NGINX_SITE"
  else
    sudo tee "/etc/nginx/sites-available/$NGINX_SITE" > /dev/null << EOF
server {
    listen 80;
    listen [::]:80;
    server_name $DOMAIN;

    root $WEB_ROOT;
    index index.html;

    location / {
        try_files \$uri \$uri/ /index.html;
    }

    location ~* \.(?:mp4|mp3|png|jpe?g|webp|gif|svg|ico|css|js|woff2?|ttf|otf)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
        try_files \$uri =404;
    }
}
EOF
  fi

  if [ -d "/etc/nginx/sites-enabled" ]; then
    sudo ln -sf "/etc/nginx/sites-available/$NGINX_SITE" /etc/nginx/sites-enabled/
  fi
  sudo nginx -t && sudo systemctl reload nginx
  echo "Nginx reload edildi."
fi

echo "→ SSL sertifikası (certbot)"
if command -v certbot &>/dev/null; then
  sudo certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos --register-unsafely-without-email 2>/dev/null \
    || echo "  Sertifika alınamadı; elle: sudo certbot --nginx -d $DOMAIN"
else
  echo "  certbot yok; kur: sudo apt install certbot python3-certbot-nginx"
fi

echo ""
echo "Deploy tamamlandı."
echo "Site:  http://$DOMAIN"
echo "Kök:   $WEB_ROOT"
