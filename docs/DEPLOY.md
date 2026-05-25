# Deploy Ceveco a producción

## Stack

- **Backend:** Node.js 18 + Express 4
- **Frontend:** HTML + Tailwind (compilado) + vanilla JS
- **DB:** PostgreSQL 17
- **Reverse proxy + HTTPS:** Nginx + Certbot (Let's Encrypt)
- **Orquestación:** Docker Compose v2
- **Modelo:** cotización vía WhatsApp (no pasarela de pago)

---

## TL;DR — Quick start

En un servidor Linux limpio con Docker, un dominio (DNS A record apuntado al
servidor) y este repo clonado:

```bash
cp .env.example .env
nano .env       # llenar DB_PASSWORD, JWT_SECRET, DOMAIN, CERTBOT_EMAIL, EMAIL_*
./deploy.sh --first
```

Listo. La página queda en `https://<DOMAIN>` con HTTPS válido.
Redeploys posteriores: `./deploy.sh`.

---

## Requisitos previos

- Servidor Linux (Ubuntu 22.04 LTS recomendado)
- Docker Engine 24+ y Docker Compose v2
- Git
- Dominio con DNS A record apuntando al servidor **antes** de correr `--first`
  (si no, certbot fallará la validación HTTP-01)

```bash
# Bootstrap del servidor (una sola vez)
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER     # cerrar sesión y volver a entrar
sudo apt install -y git
```

---

## Variables de entorno (`.env`)

Copiar de `.env.example` y completar:

| Variable | Obligatorio | Para qué sirve |
| --- | --- | --- |
| `DOMAIN` | sí | Dominio principal (ej. `ceveco.com.co`) — usado por nginx y certbot |
| `CERTBOT_EMAIL` | sí (primer deploy) | Email de notificaciones de Let's Encrypt |
| `DB_PASSWORD` | sí | Password de PostgreSQL — generar con `openssl rand -hex 24` |
| `JWT_SECRET` | sí | Secreto JWT — generar con `openssl rand -hex 64` |
| `EMAIL_USER` | recomendado | Gmail (para recovery de contraseña) |
| `EMAIL_PASS` | recomendado | Gmail App Password |
| `STAGING` | opcional | `1` = usar staging de Let's Encrypt en pruebas |

---

## Flujo de deploy

### 1. Primera instalación (`./deploy.sh --first`)

Hace, en orden:

1. Verifica `docker`, `git`, `docker compose`, `.env`.
2. `git pull` de `main`.
3. Build de la imagen `ceveco-app` (Dockerfile multi-stage: backend deps +
   tailwind build).
4. Llama a `nginx/init-letsencrypt.sh`:
   - Crea cert dummy self-signed para que nginx arranque.
   - Levanta `db`, `app`, `nginx` (HTTP + ACME challenge).
   - Postgres inicializa el volumen con `bd.sql` + `backups/ceveco-seed.sql`.
   - Pide cert real a Let's Encrypt vía HTTP-01 (`/.well-known/acme-challenge`).
   - Reload nginx para usar el cert real.
   - Levanta `certbot` (loop de renovación).
5. Health check contra `https://<DOMAIN>/api/v1/productos`.

### 2. Redeploys (`./deploy.sh`)

1. `git pull`.
2. Rebuild de la imagen `ceveco-app`.
3. Sube `db` (si estaba abajo) y espera `pg_isready`.
4. Aplica todos los `migrations/*.sql` (idempotentes, orden alfanumérico).
5. `docker compose up -d` para recrear servicios con la imagen nueva.
6. Health check.

### Flags útiles

```bash
./deploy.sh --first        # primera vez (cert + seed BD)
./deploy.sh                # redeploy estándar
./deploy.sh --no-restart   # rebuild sin tumbar (smoke test antes de switch)
./deploy.sh --logs         # logs en vivo del stack
./deploy.sh --down         # parar todo (volúmenes conservan datos)
```

---

## Estructura de los volúmenes

| Volumen | Path en contenedor | Qué guarda |
| --- | --- | --- |
| `ceveco_pgdata` | `/var/lib/postgresql/data` | Todos los datos de PostgreSQL |
| `ceveco_uploads` | `/app/backend/public/images/productos` | Imágenes subidas por admin |
| `ceveco_certs` | `/etc/letsencrypt` | Certificados Let's Encrypt |
| `ceveco_certbot_www` | `/var/www/certbot` | ACME challenge tokens |
| `ceveco_nginx_logs` | `/var/log/nginx` | Access + error logs de nginx |

**Backup recomendado:** dump diario de `ceveco_pgdata` + snapshot del directorio
de uploads. Ver `scripts/backup-db.js` para el dump automatizado.

---

## HTTPS y renovación automática

- Cert emitido en el primer `--first` mediante HTTP-01 challenge.
- Contenedor `certbot` corre en loop:
  ```
  while true; do certbot renew --webroot -w /var/www/certbot --quiet; sleep 12h; done
  ```
  Renueva sólo si quedan <30 días para expirar (comportamiento por defecto).
- Contenedor `nginx` hace `nginx -s reload` cada 6h para tomar certs nuevos sin
  reinicio.
- Logs:
  ```bash
  docker compose -f docker-compose.prod.yml logs -f certbot
  docker compose -f docker-compose.prod.yml logs -f nginx
  ```

### Si falla la primera emisión

Causas comunes:

1. DNS aún no propagó → `dig +short <DOMAIN>` debe devolver la IP del servidor.
2. Puerto 80 bloqueado por firewall → `sudo ufw allow 80/tcp && sudo ufw allow 443/tcp`.
3. Rate-limit de Let's Encrypt → poner `STAGING=1` en `.env` y reintentar.

Para re-intentar manualmente:

```bash
bash nginx/init-letsencrypt.sh
```

---

## Restauración / cambio del seed

El seed `backups/ceveco-seed.sql` se carga **una sola vez** (cuando el volumen
`ceveco_pgdata` está vacío). Para regenerar desde producción local nuevo:

```bash
# En local (donde tenés la data buena)
PGPASSWORD=postgres pg_dump -h localhost -U postgres -d ceveco_db \
    --clean --if-exists --no-owner --no-privileges \
    -f backups/ceveco-seed.sql

git add backups/ceveco-seed.sql
git commit -m "chore(db): refresh seed"
git push
```

En producción:

```bash
./deploy.sh    # redeploy normal — NO recarga el seed automáticamente

# Para FORZAR recarga del seed (⚠ borra datos existentes):
docker compose -f docker-compose.prod.yml down -v
./deploy.sh --first
```

Restauración manual sin perder otros datos:

```bash
docker compose -f docker-compose.prod.yml exec -T db \
    psql -U postgres -d ceveco_db < backups/ceveco-seed.sql
```

---

## Operación

```bash
# Estado de servicios
docker compose -f docker-compose.prod.yml ps

# Shell dentro del backend
docker compose -f docker-compose.prod.yml exec app sh

# Shell de PostgreSQL
docker compose -f docker-compose.prod.yml exec db psql -U postgres -d ceveco_db

# Crear usuario admin
docker compose -f docker-compose.prod.yml exec app node scripts/create-admin-user.js

# Verificar HTTPS
curl -I https://<DOMAIN>
```

### Cron sugerido (backups diarios)

`crontab -e`:

```cron
# Backup BD a las 02:00 cada día
0 2 * * * cd /var/www/ceveco && docker compose -f docker-compose.prod.yml exec -T db pg_dump -U postgres ceveco_db | gzip > /var/backups/ceveco-$(date +\%Y\%m\%d).sql.gz
# Retención: borrar backups de más de 30 días
0 3 * * * find /var/backups/ceveco-*.sql.gz -mtime +30 -delete
```

---

## Checklist pre-launch

- [ ] DNS A record (`<DOMAIN>`, `www.<DOMAIN>`) apuntan al IP del servidor
- [ ] Puertos 80 y 443 abiertos en el firewall
- [ ] `.env` completo: `DB_PASSWORD`, `JWT_SECRET`, `DOMAIN`, `CERTBOT_EMAIL`, `EMAIL_*`
- [ ] `JWT_SECRET` ≠ valor de ejemplo (`openssl rand -hex 64`)
- [ ] `DB_PASSWORD` fuerte (`openssl rand -hex 24`)
- [ ] `./deploy.sh --first` corrió sin errores
- [ ] `curl -I https://<DOMAIN>` devuelve 200 con cert válido
- [ ] Login de admin funciona (cambiar contraseña por defecto)
- [ ] Modal de cotización abre WhatsApp con número correcto del asesor
- [ ] 200 productos visibles en `/pages/productos.html`
- [ ] Cron de backup diario instalado

---

## Troubleshooting

| Síntoma | Causa probable | Fix |
| --- | --- | --- |
| `502 Bad Gateway` | Contenedor app caído | `./deploy.sh --logs` para ver error |
| `ERR_CERT_AUTHORITY_INVALID` | Cert dummy o staging activo | Borrar `STAGING=1` y reintentar `bash nginx/init-letsencrypt.sh` |
| Imágenes 404 | Volumen `uploads` vacío | Restaurar manual desde backup o resubir desde admin |
| CORS bloqueado | `FRONTEND_URL` no coincide con el dominio | Editar `.env` y `./deploy.sh` |
| Login da 429 | Rate-limit por brute-force | Esperar 1 min |
| `pg_isready` falla en deploy | Volumen `pgdata` corrupto | `docker compose down` → `down -v` (⚠ borra datos) → `--first` |
| Cert no renueva | Logs muestran rate-limit | Esperar 7 días o usar `STAGING=1` para verificar |

---

## Versión nativa (sin Docker) — deprecada

Si el servidor no soporta Docker, existe la versión legacy en commits anteriores:

```bash
# Antes había un deploy.sh con systemd + nginx host + certbot host.
# Para usarla, hacer checkout de un commit pre-Docker:
git log --all --oneline | grep "fix(scraper)" | tail -1   # commit pre-Docker
# Y leer la versión vieja de docs/DEPLOY.md ahí.
```

No se mantiene activamente. Recomendado: usar Docker en cualquier servidor que
lo soporte (más portable y reproducible).
