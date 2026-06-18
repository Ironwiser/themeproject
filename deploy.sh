#!/bin/bash
# ThemeProject – statik site deploy (Vite build + nginx)
# Proje kökünden: ./deploy.sh  veya  bash deploy.sh
#
# Kaynak kod:  /var/www/themeproject
# Canlı site:  /var/www/themeproject-live  (nginx buraya bakar)
#
# Ortam değişkenleri (isteğe bağlı):
#   THEMEPROJECT_DOMAIN   varsayılan: themeproject.omurgenc.dev
#   THEMEPROJECT_WEB_ROOT varsayılan: /var/www/themeproject-live

set -e
ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT_DIR"

DOMAIN="${THEMEPROJECT_DOMAIN:-themeproject.omurgenc.dev}"
WEB_ROOT="${THEMEPROJECT_WEB_ROOT:-/var/www/themeproject-live}"
NGINX_SITE="themeproject.conf"

resolve_path() {
  local target="$1"
  if command -v realpath &>/dev/null; then
    realpath -m "$target" 2>/dev/null && return
  fi
  if command -v readlink &>/dev/null; then
    readlink -f "$target" 2>/dev/null && return
  fi
  echo "$target"
}

assert_safe_web_root() {
  local root_real web_real
  root_real="$(resolve_path "$ROOT_DIR")"
  web_real="$(resolve_path "$WEB_ROOT")"

  if [ -z "$web_real" ] || [ "$web_real" = "/" ]; then
    echo "HATA: Geçersiz WEB_ROOT ($WEB_ROOT)."
    exit 1
  fi

  if [ "$web_real" = "$root_real" ]; then
    echo "HATA: WEB_ROOT proje köküyle aynı olamaz."
    echo "  Proje: $root_real"
    echo "  Canlı: $web_real"
    exit 1
  fi

  case "$web_real" in
    "$root_real"/*)
      echo "HATA: WEB_ROOT proje klasörünün içinde olamaz (kaynak kod silinir)."
      exit 1
      ;;
  esac

  case "$root_real" in
    "$web_real"/*)
      echo "HATA: WEB_ROOT proje klasörünün üst dizini olamaz (deploy.sh ve repo silinir)."
      echo "  Örnek yanlış: WEB_ROOT=/var/www  proje=/var/www/themeproject"
      exit 1
      ;;
  esac
}

assert_safe_web_root

echo "→ Git'ten son değişiklikler çekiliyor (git pull)"
if [ -d ".git" ]; then
  git pull || echo "  UYARI: git pull başarısız oldu, local değişiklikler olabilir."
fi

echo "→ Build için yalnızca node_modules ve dist temizleniyor"
rm -rf node_modules dist
npm install
npm run build

if [ ! -d "dist" ]; then
  echo "HATA: dist/ oluşmadı. Build başarısız."
  exit 1
fi

echo "→ Canlı site güncelleniyor (yalnızca $WEB_ROOT): $WEB_ROOT"
sudo mkdir -p "$WEB_ROOT"

if command -v rsync &>/dev/null; then
  sudo rsync -a --delete dist/ "$WEB_ROOT/"
else
  echo "  rsync yok; find + cp kullanılıyor"
  sudo find "$WEB_ROOT" -mindepth 1 -maxdepth 1 -exec rm -rf {} +
  sudo cp -a dist/. "$WEB_ROOT/"
fi

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
echo "Kaynak: $ROOT_DIR"
echo "Canlı:  $WEB_ROOT"
echo "Site:   http://$DOMAIN"
