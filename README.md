# Ceveco — Catálogo + cotización por WhatsApp

E-commerce de catálogo para electrodomésticos, muebles, motos y herramientas STIHL.
Modelo de venta: cotización vía WhatsApp (sin pasarela de pago).

## Stack

- **Backend:** Node.js 18 + Express 4 + PostgreSQL 17
- **Frontend:** HTML multipágina + Tailwind (compilado) + vanilla JS
- **Auth:** JWT cookie HttpOnly
- **Despliegue:** Docker Compose (db + app + nginx + certbot) con HTTPS Let's Encrypt
- **Datos:** ~200 productos seed (`backups/ceveco-seed.sql`)

---

## Producción en un comando

Una vez con un servidor Linux limpio (Ubuntu 22.04+) y un dominio apuntado a su IP:

```bash
# 1. Instalar Docker (una sola vez)
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER     # cerrar sesión y volver a entrar

# 2. Clonar el repo
git clone https://github.com/ssebasarias/ceveco.git /var/www/ceveco
cd /var/www/ceveco

# 3. Configurar variables
cp .env.example .env
nano .env   # editar DB_PASSWORD, JWT_SECRET, DOMAIN, CERTBOT_EMAIL, EMAIL_USER, EMAIL_PASS

# 4. Levantar todo (BD restaurada + app + nginx + cert HTTPS)
./deploy.sh --first
```

Listo. La página queda en `https://<DOMAIN>` con cert Let's Encrypt válido y
auto-renovación cada 12 horas (renueva si quedan <30 días).

**Redeploys posteriores** (cuando hagas `git push` con cambios nuevos):

```bash
./deploy.sh
```

Hace `git pull`, rebuild de la imagen, aplica migraciones nuevas idempotentes,
recrea contenedores y verifica salud.

### Comandos útiles de operación

```bash
./deploy.sh --logs     # logs en vivo de los 4 servicios
./deploy.sh --down     # parar todo (datos persisten en volúmenes)
./deploy.sh --no-restart   # rebuild sin tumbar la app

docker compose -f docker-compose.prod.yml ps                # estado
docker compose -f docker-compose.prod.yml exec db psql -U postgres -d ceveco_db
docker compose -f docker-compose.prod.yml exec app sh       # shell dentro del backend
```

---

## Setup local (desarrollo)

Para desarrollo se usa PostgreSQL en el host (no Docker) y Node directo:

```bash
# 1. Requisitos: Node 18+, PostgreSQL 17, Git

# 2. Clonar e instalar
git clone <repo>
cd ceveco
cd backend  && npm install
cd ../frontend && npm install && npm run build:css
cd ..

# 3. Base de datos
sudo -u postgres createdb ceveco_db
PGPASSWORD=postgres psql -h localhost -U postgres -d ceveco_db -f bd.sql
PGPASSWORD=postgres psql -h localhost -U postgres -d ceveco_db -f backups/ceveco-seed.sql

# 4. .env
cp .env.example backend/.env
# Editar DB_HOST=localhost y demás credenciales

# 5. Levantar
cd backend && npm start    # http://localhost:3000
```

### Local con Docker (igual a producción pero sin SSL)

```bash
# .env en raíz como en producción
cp .env.example .env

# Stack completo (db + app + nginx en puerto 80 sin SSL)
docker compose -f docker-compose.prod.yml up -d db app
# (omitir nginx/certbot para evitar pelearse con SSL local)

# El backend queda expuesto en http://localhost:3000 si redirigís el puerto en compose
```

---

## Backup y restauración de BD

```bash
# Generar backup local (después de hacer cambios en BD)
PGPASSWORD=postgres pg_dump -h localhost -U postgres -d ceveco_db \
    --clean --if-exists --no-owner --no-privileges \
    -f backups/ceveco-seed.sql

# Commitear el archivo si se quiere actualizar el seed que ve producción
git add backups/ceveco-seed.sql
git commit -m "chore(db): refresh seed con cambios actuales"
```

En producción el seed se carga **una sola vez**, cuando el volumen `pgdata`
está vacío (primer `--first`). Para forzar reset:

```bash
docker compose -f docker-compose.prod.yml down -v    # ⚠ BORRA datos
./deploy.sh --first                                  # recarga seed
```

Para restauración manual en un servidor con datos:

```bash
docker compose -f docker-compose.prod.yml exec -T db \
    psql -U postgres -d ceveco_db < backups/ceveco-seed.sql
```

---

## Certificado SSL (Let's Encrypt)

- Se emite en `./deploy.sh --first` vía HTTP-01 challenge sobre el puerto 80.
- Renovación automática: contenedor `certbot` corre `certbot renew` cada 12h.
- Nginx hace reload cada 6h para tomar certs renovados.
- Pruebas: poner `STAGING=1` en `.env` para evitar rate-limits de Let's Encrypt
  durante pruebas (el cert no será válido en navegadores).
- Logs:
  ```bash
  docker compose -f docker-compose.prod.yml logs -f certbot
  ```

Si DNS aún no propagó al iniciar, certbot fallará. Esperar la propagación y
reintentar:

```bash
bash nginx/init-letsencrypt.sh
```

---

## Estructura del repo

```
ceveco/
├── deploy.sh                  # script único de deploy a producción (Docker)
├── docker-compose.prod.yml    # stack: db + app + nginx + certbot
├── Dockerfile                 # imagen del backend
├── .env.example               # plantilla — copiar a .env
├── nginx/
│   ├── nginx.conf             # config principal de nginx
│   ├── conf.d/ceveco.conf     # vhost HTTPS + ACME
│   └── init-letsencrypt.sh    # bootstrap del cert SSL (primera vez)
├── backend/                   # API Express
│   ├── src/                   # routes, controllers, services, middleware
│   └── public/images/         # imágenes versionadas + uploads
├── frontend/                  # sitio estático
│   ├── pages/                 # HTML
│   ├── components/            # fragmentos reutilizables
│   ├── assets/css/            # tokens, componentes, utilities, tailwind.min.css
│   └── assets/js/             # core, services, page-specific
├── migrations/                # SQL idempotentes (deploy.sh aplica en orden)
├── backups/
│   └── ceveco-seed.sql        # dump completo de BD (committed para prod seed)
├── bd.sql                     # esquema inicial (sin datos)
└── docs/DEPLOY.md             # guía detallada de deploy
```

---

## Admin

- URL: `https://<DOMAIN>/admin.html`
- Crear usuario admin si no existe:
  ```bash
  docker compose -f docker-compose.prod.yml exec app node scripts/create-admin-user.js
  ```
- Tabs: Dashboard, Productos, Banners, Categorías, Marcas, Sedes, Asesores, Backup.

---

## Documentación adicional

- [docs/DEPLOY.md](docs/DEPLOY.md) — guía de despliegue paso a paso (incluye versión nativa sin Docker).
- [docs/VERIFICACION_SERVICIOS.md](docs/VERIFICACION_SERVICIOS.md) — checklist post-deploy.
- [docs/DIMENSIONES_BANNER.md](docs/DIMENSIONES_BANNER.md) — guía de banners para admin.
