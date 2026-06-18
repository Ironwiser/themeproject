# Sunucuda git pull ve deploy

Sunucuda aşağıdaki adımları **sırayla** uygula.

## Önce: deploy.sh CRLF düzelt (pull olmasa da çalışsın)

```bash
cd /var/www/themeproject
sed -i 's/\r$//' deploy.sh
chmod +x deploy.sh
```

Bundan sonra `./deploy.sh` çalışır.

---

## Seçenek A – Repo ile tam senkron (önerilen)

Sunucudaki değişiklikleri bırakıp repodaki son hali çekmek istiyorsan:

### 1. Takip edilen dosyaları repoya göre sıfırla

```bash
cd /var/www/themeproject
git reset --hard HEAD
```

### 2. Pull ile çakışacak untracked dosyaları temizle

```bash
rm -f scripts/nginx/themeproject.conf deploy.sh
```

Veya tek komut:

```bash
bash scripts/server-clean-for-pull.sh
```

### 3. Pull ve deploy

```bash
git pull
sed -i 's/\r$//' deploy.sh
chmod +x deploy.sh
./deploy.sh
```

`deploy.sh` sırasıyla:

1. `git pull`
2. Yalnızca `node_modules` ve `dist` siler → `npm install` → `npm run build`
3. **`/var/www/themeproject-live`** dizinini `rsync` ile günceller (proje dosyalarına dokunmaz)
4. nginx + certbot

**Önemli:** Canlı site asla proje kökü (`/var/www/themeproject`) olmamalı. Script bunu kontrol eder ve hata verir.

---

## Ortam değişkenleri (isteğe bağlı)

```bash
export THEMEPROJECT_DOMAIN="senindomain.com"
export THEMEPROJECT_WEB_ROOT="/var/www/themeproject-live"
./deploy.sh
```

---

## Seçenek B – Pull yapmadan sadece deploy

Mevcut sunucu koduyla build alıp yayınlamak için:

```bash
cd /var/www/themeproject
sed -i 's/\r$//' deploy.sh
./deploy.sh
```

---

## İlk kurulum (sunucuda bir kez)

```bash
sudo apt update
sudo apt install -y nginx git nodejs npm certbot python3-certbot-nginx
sudo mkdir -p /var/www/themeproject
git clone https://github.com/Ironwiser/themeproject.git /var/www/themeproject
cd /var/www/themeproject
sed -i 's/\r$//' deploy.sh
chmod +x deploy.sh
./deploy.sh
```
