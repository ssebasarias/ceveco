# Ceveco — Catálogo + cotización por WhatsApp

E-commerce de catálogo para electrodomésticos, muebles, motos y herramientas STIHL.
Modelo de venta: cotización vía WhatsApp (no pasarela de pago).

## Stack

- **Backend:** Node.js 18 + Express 4 + PostgreSQL 17
- **Frontend:** HTML multipágina + Tailwind (compilado) + vanilla JS
- **Auth:** JWT cookie HttpOnly
- **Image scraping:** Puppeteer + Sharp (200 productos con imágenes locales)

## Setup local

### 1. Requisitos
- Node 18+, PostgreSQL 17, Git

### 2. Clonar e instalar
```bash
git clone <repo>
cd ceveco
npm install                 # root deps (scraper, tests)
cd backend && npm install   # backend deps
cd ../frontend && npm install && npm run build:css   # tailwind
```

### 3. Base de datos
```bash
sudo -u postgres createdb ceveco_db
PGPASSWORD=postgres pg_restore -h localhost -U postgres -d ceveco_db --clean --if-exists backups/backup_bd.backup
```

### 4. Configurar `.env`
```bash
cp backend/.env.example backend/.env   # editar con tus credenciales
```

### 5. Levantar
```bash
cd backend && npm start    # http://localhost:3000
```

## Estructura

- `backend/` — API Express
  - `src/routes/` — endpoints REST
  - `src/controllers/` — handlers
  - `src/services/` — lógica + SQL
  - `src/middleware/` — auth, role, validators
  - `public/images/productos/` — imágenes locales de productos (200 × 3 formatos)
- `frontend/` — sitio estático
  - `pages/` — páginas HTML (index, productos, detalle, admin, login, sedes, contacto, etc.)
  - `components/` — fragmentos reutilizables (navbar, footer, filters-sidebar)
  - `assets/css/` — tokens + componentes + utilities
  - `assets/js/` — core + services + page-specific
- `scripts/` — utilidades
  - `scraping/` — Puppeteer scraper de imágenes
  - `maintenance/` — sync banners, check services
- `e2e/` — tests Playwright
- `docs/` — DEPLOY.md, planes
- `migrations/` — SQL migrations
- `backups/` — DB backups (gitignored)

## Admin

- URL: `http://localhost:3000/admin.html`
- Login: `admin@ceveco.com` / `admin123` (cambiar en producción)
- Tabs: Dashboard, Productos, Banners, Productos Destacados, Backup, Categorías, Marcas, Sedes, Asesores

## Comandos útiles

```bash
# E2E tests
npm run test:e2e

# Backup BD manual
node scripts/backup-db.js

# Re-scrape imagen de 1 producto
node scripts/scraping/fetch-product-images.js --only <id>

# Sync banners FS -> DB (idempotente)
node scripts/maintenance/sync-banners.js
```

## Producción

Ver [docs/DEPLOY.md](docs/DEPLOY.md) para instrucciones completas de deploy.
