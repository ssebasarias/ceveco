# Deploy Ceveco a producción

## Stack

- **Backend**: Node.js 18+, Express 4, PostgreSQL 17
- **Frontend**: HTML + Tailwind (compilado) + vanilla JS, servido por Express
- **Auth**: JWT en cookie HttpOnly (mismo dominio)
- **Modelo**: cotización vía WhatsApp (no pasarela de pago)

## Requisitos previos

- Servidor Linux (Ubuntu 22.04 LTS recomendado)
- Node 18 LTS
- PostgreSQL 17
- Nginx (reverse proxy)
- Certbot (Let's Encrypt para HTTPS)
- Dominio apuntando al servidor (ej. ceveco.com.co)

## Pasos de deploy

### 1. Clonar repo y dependencias

```bash
git clone <repo-url> /var/www/ceveco
cd /var/www/ceveco/backend
npm ci --production
cd ../frontend
npm ci && npm run build:css
```

### 2. Configurar `.env`

```bash
cp backend/.env.example backend/.env
nano backend/.env
```

Mínimo requerido:
- `JWT_SECRET` — string aleatorio largo (use `openssl rand -hex 32`)
- `DB_*` — credenciales PostgreSQL
- `NODE_ENV=production`
- `EMAIL_USER` / `EMAIL_PASS` — Gmail App Password para reset de contraseña

### 3. Restaurar BD

```bash
sudo -u postgres createdb ceveco_db
PGPASSWORD=... pg_restore -h localhost -U postgres -d ceveco_db --clean --if-exists /path/to/backup_bd.backup
```

### 4. Servicio systemd

`/etc/systemd/system/ceveco.service`:

```ini
[Unit]
Description=Ceveco Node.js Backend
After=network.target postgresql.service

[Service]
Type=simple
User=ceveco
WorkingDirectory=/var/www/ceveco/backend
ExecStart=/usr/bin/node index.js
Restart=on-failure
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl enable ceveco
sudo systemctl start ceveco
sudo systemctl status ceveco
```

### 5. Nginx reverse proxy

`/etc/nginx/sites-available/ceveco.com.co`:

```nginx
server {
    listen 80;
    server_name ceveco.com.co www.ceveco.com.co;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name ceveco.com.co www.ceveco.com.co;

    ssl_certificate     /etc/letsencrypt/live/ceveco.com.co/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/ceveco.com.co/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    client_max_body_size 10M;

    # Static files served directly by Nginx for speed
    location /images/ {
        alias /var/www/ceveco/backend/public/images/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
    location /assets/ {
        alias /var/www/ceveco/frontend/assets/;
        expires 7d;
        add_header Cache-Control "public";
    }

    # Everything else goes to Node
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/ceveco.com.co /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 6. HTTPS con Certbot

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d ceveco.com.co -d www.ceveco.com.co
```

Auto-renewal:
```bash
sudo systemctl enable certbot.timer
```

### 7. Backups automáticos

Crontab (`crontab -e`):

```cron
# Daily backup at 2am
0 2 * * * /var/www/ceveco/scripts/HACER_BACKUP.bat >> /var/log/ceveco-backup.log 2>&1
```

O usar el endpoint `/api/v1/admin/backup` con autenticación admin desde cron.

### 8. Monitoreo

- Logs: `journalctl -u ceveco -f`
- Nginx access: `tail -f /var/log/nginx/access.log`
- DB: `sudo -u postgres psql ceveco_db -c "SELECT count(*) FROM productos;"`

## Checklist pre-launch

- [ ] `JWT_SECRET` cambiado del valor de dev (use `openssl rand -hex 64`)
- [ ] `DB_PASSWORD` cambiado de `postgres` a uno fuerte
- [ ] `NODE_ENV=production` en `.env`
- [ ] `cors.ALLOWED_ORIGINS` en `backend/index.js` incluye el dominio real
- [ ] Helmet HSTS habilitado (default 180 días)
- [ ] Backup script funciona y restaura limpio
- [ ] Test E2E `npm run test:e2e` pasa contra el servidor de producción
- [ ] Lighthouse score > 85 en Performance, > 90 Accessibility
- [ ] 200 productos visibles y cotizables vía WhatsApp
- [ ] Admin login funciona y dashboard muestra KPIs
- [ ] Email de recovery configurado (`EMAIL_USER` + `EMAIL_PASS` Gmail App Password)
- [ ] Imagen de banner-hero subidas y visibles en home

## Recovery / rollback

```bash
# Rollback al commit anterior si algo falla
cd /var/www/ceveco
git log --oneline -5
git checkout <prev-commit-sha>
sudo systemctl restart ceveco
```

## Troubleshooting común

| Síntoma | Causa probable | Fix |
| --- | --- | --- |
| 500 en /admin endpoints | JWT_SECRET no seteado | Verificar `.env`, reiniciar service |
| Imágenes 404 | nginx no sirve `/images/` o permisos | `ls -la /var/www/ceveco/backend/public/images/productos/`; chown ceveco:ceveco |
| CORS bloqueado | dominio no está en ALLOWED_ORIGINS | Editar `backend/index.js`, restart |
| Login da 429 | rate-limit activo | Esperar 1 min o ajustar `max` en `auth.routes.js` |
