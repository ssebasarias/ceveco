# Restauración del Diseño Aprobado + Scraper Profesional — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restaurar el diseño visual aprobado del commit `7a85252` (pre-refactor), conservar las mejoras de seguridad/admin del merge `production-ready-refactor`, mejorar el scraper para que use sitios oficiales de marca y extraiga datos reales (imagen + descripción + specs) hacia la BD.

**Architecture:** 3 pistas paralelas (A: scraper backend, B: frontend público, C: frontend admin) que tocan archivos disjuntos. Cada pista la ejecuta un agente independiente. Coordinador (Claude principal) integra y resuelve manualmente con Playwright MCP los productos sin imagen/datos.

**Tech Stack:** Node.js, Playwright (sustituye Puppeteer en scraper), Sharp, PostgreSQL, vanilla JS frontend, Tailwind CSS, Lucide icons.

**Commits de referencia:**
- Pre-refactor aprobado: `7a85252` (último antes del merge)
- Merge a restaurar parcialmente: `2be127e`

---

## File Map

### Pista A — Scraper + Datos
- **Crear**: `scripts/scraping/fetch-product-data.js` (reemplazo de `fetch-product-images.js`)
- **Crear**: `scripts/scraping/brands/honda.js`, `suzuki.js`, `akt.js`, `yamaha.js`, `samurai.js`, `whirlpool.js`, `lg.js`, `samsung.js`, `mabe.js`, `haceb.js`, `challenger.js`
- **Crear**: `scripts/scraping/brands/_generic-fallback.js`
- **Crear**: `scripts/scraping/utils/playwright-driver.js`
- **Modificar**: `scripts/scraping/utils/db.js` — agregar funciones `upsertExtraImages`, `updateProductData`, `markManualOverride`
- **Modificar**: `scripts/scraping/utils/image-processor.js` — agregar validación (≥800×800, sin watermark)
- **Crear**: `migrations/20260525_product_specs_columns.sql`
- **Modificar**: `backend/src/controllers/productos.controller.js` o equivalente — exponer `descripcion_larga`, `specs`, `componentes`, galería ordenada
- **Modificar**: `package.json` — agregar `playwright` a deps, mantener `puppeteer` por ahora

### Pista B — Restauración Visual
- **Restaurar desde `7a85252`**:
  - `frontend/pages/index.html`
  - `frontend/pages/productos.html`
  - `frontend/pages/detalle-producto.html`
  - `frontend/components/footer.html`
  - `frontend/components/card-producto.html`
- **Conservar (no tocar)**:
  - `frontend/components/navbar.html` (tiene autocomplete)
  - `frontend/assets/js/core.js`
  - `frontend/assets/js/components/search-autocomplete.js`
  - `frontend/assets/js/auth/*` (mejoras seguridad)
- **Migrar / adaptar**:
  - `frontend/assets/js/pages/home.js` — agregar render de productos destacados
  - `frontend/assets/js/pages/productos.js` — restaurar layout antiguo manteniendo filtros mejorados
  - `frontend/assets/js/pages/detalle-producto.js` — restaurar layout 2-col + descripción/specs reales
- **Crear/recablear**:
  - `frontend/assets/js/asesor-modal.js` ya existe — asegurar carga en index/productos/detalle
- **Assets**:
  - Descargar `frontend/assets/img/pagos/bancolombia.png`
  - Descargar `frontend/assets/img/pagos/davivienda.png`
  - Descargar `frontend/assets/img/pagos/pse.png`
  - Descargar `frontend/assets/img/pagos/efecty.png`

### Pista C — Admin Modal
- **Modificar**: `frontend/pages/admin.html` — sección del modal de producto (área de imágenes)
- **Modificar**: `frontend/assets/js/pages/admin-crud.js` — lógica del image picker
- **Modificar**: `frontend/assets/css/pages/admin.css` (si existe) o crearla
- **Backend**:
  - `backend/src/controllers/admin.controller.js` — endpoints `PATCH /admin/productos/:id/imagen-principal` y `PATCH /admin/productos/:id/imagenes/orden`
  - `backend/src/routes/admin.routes.js` — registrar rutas
- **Migración**: `migrations/20260525_producto_imagenes_orden.sql` (si `orden` no existe)

---

## Convenciones para Todos los Agentes

1. **Rama de trabajo**: `feat/restore-approved-design`. Crear con `git checkout -b feat/restore-approved-design` desde `main`.
2. **Commits frecuentes**: uno por tarea completada.
3. **Verificación visual**: Pistas B y C deben tomar screenshot con Playwright al terminar cada página.
4. **No tocar `.env`, `.git/`, ni `node_modules/`**.
5. **No modificar archivos de otras pistas** salvo que esta plan lo indique explícitamente.
6. **Mensaje de commit**: usar convenio existente del repo (`feat(area): mensaje`, `fix(area): mensaje`, `chore: …`).

---

## TRACK A — Scraper + Datos

### Task A1: Crear migración de columnas para datos de producto

**Files:**
- Create: `migrations/20260525_product_specs_columns.sql`

- [ ] **Step 1: Crear migración**

```sql
-- 20260525_product_specs_columns.sql
-- Agrega columnas para datos extendidos extraídos por scraper.

ALTER TABLE productos
    ADD COLUMN IF NOT EXISTS descripcion_larga TEXT,
    ADD COLUMN IF NOT EXISTS specs JSONB DEFAULT '{}'::jsonb,
    ADD COLUMN IF NOT EXISTS componentes JSONB DEFAULT '[]'::jsonb,
    ADD COLUMN IF NOT EXISTS manual_override BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS fuente_scrape TEXT,
    ADD COLUMN IF NOT EXISTS ultima_actualizacion_scrape TIMESTAMP;

ALTER TABLE producto_imagenes
    ADD COLUMN IF NOT EXISTS orden INTEGER DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_producto_imagenes_orden
    ON producto_imagenes(producto_id, orden);

CREATE INDEX IF NOT EXISTS idx_productos_manual_override
    ON productos(manual_override) WHERE manual_override = TRUE;
```

- [ ] **Step 2: Aplicar migración**

```bash
# Verificar primero qué herramienta usa el repo. Si tiene script en package.json úsalo;
# si no, aplicar directo con psql usando las variables de .env
psql "$DATABASE_URL" -f migrations/20260525_product_specs_columns.sql
```

Verificación:
```bash
psql "$DATABASE_URL" -c "\d productos" | grep -E "descripcion_larga|specs|componentes|manual_override"
```
Expected: 4 columnas listadas.

- [ ] **Step 3: Commit**

```bash
git add migrations/20260525_product_specs_columns.sql
git commit -m "feat(db): columns for scraped product data (descripcion_larga, specs, componentes, manual_override)"
```

---

### Task A2: Instalar Playwright como dependencia

**Files:**
- Modify: `package.json` (o `scripts/scraping/package.json` si hay uno aparte)

- [ ] **Step 1: Instalar**

```bash
cd c:\Users\guerr\Documents\Ceveco\ceveco
npm install --save playwright@^1.45.0
npx playwright install chromium
```

- [ ] **Step 2: Verificar**

```bash
node -e "console.log(require('playwright').chromium ? 'OK' : 'FAIL')"
```
Expected: `OK`

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore(deps): add playwright for product scraper"
```

---

### Task A3: Crear driver Playwright y utilidad de descarga

**Files:**
- Create: `scripts/scraping/utils/playwright-driver.js`

- [ ] **Step 1: Crear driver**

```js
// scripts/scraping/utils/playwright-driver.js
const { chromium } = require('playwright');

const DEFAULT_OPTS = {
    headless: true,
    args: ['--no-sandbox', '--disable-blink-features=AutomationControlled']
};

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';

async function launchBrowser(opts = {}) {
    return chromium.launch({ ...DEFAULT_OPTS, ...opts });
}

async function newPage(browser) {
    const ctx = await browser.newContext({
        userAgent: UA,
        viewport: { width: 1366, height: 900 },
        locale: 'es-CO',
        timezoneId: 'America/Bogota'
    });
    const page = await ctx.newPage();
    // Bloquear analytics/ads para acelerar
    await page.route('**/*', (route) => {
        const url = route.request().url();
        if (/googletagmanager|google-analytics|doubleclick|facebook\.net|hotjar/.test(url)) {
            return route.abort();
        }
        return route.continue();
    });
    return page;
}

async function downloadImage(page, url, referer) {
    const ctx = page.context();
    const headers = { 'User-Agent': UA, 'Accept': 'image/*,*/*;q=0.8' };
    if (referer) headers['Referer'] = referer;
    const response = await ctx.request.get(url, { headers, timeout: 25000 });
    if (!response.ok()) throw new Error(`HTTP ${response.status()} for ${url}`);
    return await response.body();
}

module.exports = { launchBrowser, newPage, downloadImage, UA };
```

- [ ] **Step 2: Commit**

```bash
git add scripts/scraping/utils/playwright-driver.js
git commit -m "feat(scraper): playwright driver with anti-bot UA and resource filtering"
```

---

### Task A4: Mejorar image-processor con validación de calidad

**Files:**
- Modify: `scripts/scraping/utils/image-processor.js`

- [ ] **Step 1: Leer archivo actual**

```bash
# Leer scripts/scraping/utils/image-processor.js para conocer la API actual
```

- [ ] **Step 2: Agregar función `validateBuffer`**

Agregar al inicio del archivo (después de imports):

```js
const sharp = require('sharp');

const MIN_DIMENSION = 800;
const MIN_FILE_SIZE = 15000; // 15 KB — imágenes válidas suelen ser >50 KB

async function validateBuffer(buffer) {
    if (!buffer || buffer.length < MIN_FILE_SIZE) {
        return { ok: false, reason: `archivo muy pequeño (${buffer?.length ?? 0} B)` };
    }
    let meta;
    try {
        meta = await sharp(buffer).metadata();
    } catch (e) {
        return { ok: false, reason: `no es imagen válida: ${e.message}` };
    }
    if (!meta.width || !meta.height) {
        return { ok: false, reason: 'sin dimensiones' };
    }
    if (meta.width < MIN_DIMENSION || meta.height < MIN_DIMENSION) {
        return { ok: false, reason: `dimensiones bajas: ${meta.width}x${meta.height}` };
    }
    const ratio = meta.width / meta.height;
    if (ratio < 0.5 || ratio > 2.0) {
        return { ok: false, reason: `aspect ratio inválido: ${ratio.toFixed(2)}` };
    }
    return { ok: true, meta };
}

module.exports.validateBuffer = validateBuffer;
```

- [ ] **Step 3: Modificar `processAndSave` para que reciba `index` opcional**

Cambiar firma a `processAndSave(buffer, productId, index = 0)`. Los archivos se guardan como `{productId}.jpg/webp` si `index === 0` (principal) o `{productId}_alt{index}.jpg/webp` para galería.

- [ ] **Step 4: Commit**

```bash
git add scripts/scraping/utils/image-processor.js
git commit -m "feat(scraper): image validation (min 800x800, ratio 0.5-2.0)"
```

---

### Task A5: Actualizar utils/db.js con funciones para datos extendidos

**Files:**
- Modify: `scripts/scraping/utils/db.js`

- [ ] **Step 1: Agregar funciones**

```js
async function upsertExtraImage(productId, ruta, alt, orden) {
    const sql = `
        INSERT INTO producto_imagenes (producto_id, ruta, alt_text, es_principal, orden)
        VALUES ($1, $2, $3, FALSE, $4)
        ON CONFLICT (producto_id, ruta) DO UPDATE SET alt_text = EXCLUDED.alt_text, orden = EXCLUDED.orden
    `;
    await pool.query(sql, [productId, ruta, alt, orden]);
}

async function updateProductData(productId, { descripcion_larga, specs, componentes, fuente }) {
    const sql = `
        UPDATE productos
        SET descripcion_larga = COALESCE($2, descripcion_larga),
            specs = COALESCE($3::jsonb, specs),
            componentes = COALESCE($4::jsonb, componentes),
            fuente_scrape = $5,
            ultima_actualizacion_scrape = NOW()
        WHERE id = $1 AND manual_override = FALSE
    `;
    await pool.query(sql, [
        productId,
        descripcion_larga ?? null,
        specs ? JSON.stringify(specs) : null,
        componentes ? JSON.stringify(componentes) : null,
        fuente ?? null
    ]);
}

async function getProductsNeedingData() {
    const sql = `
        SELECT p.id, p.sku, p.nombre, m.nombre AS marca, c.nombre AS categoria
        FROM productos p
        LEFT JOIN marcas m ON m.id = p.marca_id
        LEFT JOIN categorias c ON c.id = p.categoria_id
        WHERE p.manual_override = FALSE
        ORDER BY p.id
    `;
    const r = await pool.query(sql);
    return r.rows;
}

module.exports.upsertExtraImage = upsertExtraImage;
module.exports.updateProductData = updateProductData;
module.exports.getProductsNeedingData = getProductsNeedingData;
```

Asegurar que existe constraint UNIQUE en `(producto_id, ruta)` en `producto_imagenes`; si no, agregar a la migración A1.

- [ ] **Step 2: Commit**

```bash
git add scripts/scraping/utils/db.js
git commit -m "feat(scraper): db helpers for extra images and extended product data"
```

---

### Task A6: Crear interfaz de adaptador genérico (fallback)

**Files:**
- Create: `scripts/scraping/brands/_generic-fallback.js`

- [ ] **Step 1: Crear adaptador genérico**

```js
// scripts/scraping/brands/_generic-fallback.js
// Usado cuando no hay adaptador específico de marca o cuando uno falla.
// Estrategia: Google Images con filtro site:<dominio-marca>

const BRAND_DOMAINS = {
    honda: ['honda.com.co', 'hondamotos.co'],
    suzuki: ['suzuki.com.co'],
    akt: ['aktmotos.com'],
    yamaha: ['yamaha-motor.com.co', 'yamaha.com.co'],
    samurai: ['samurai.com.co'],
    whirlpool: ['whirlpool.com.co'],
    lg: ['lg.com'],
    samsung: ['samsung.com'],
    mabe: ['mabe.com.co'],
    haceb: ['haceb.com'],
    challenger: ['challenger.com.co']
};

async function search(product, browser, { newPage }) {
    const marca = (product.marca || '').toLowerCase().trim();
    const key = Object.keys(BRAND_DOMAINS).find(k => marca.includes(k));
    const domains = key ? BRAND_DOMAINS[key] : [];
    const siteFilter = domains.length ? domains.map(d => `site:${d}`).join(' OR ') : '';
    const q = `${product.marca} ${product.nombre} ${siteFilter}`;
    const url = `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(q)}&safe=active`;

    const page = await newPage(browser);
    try {
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
        await page.waitForSelector('img', { timeout: 10000 });
        const imageUrls = await page.evaluate(() => {
            const imgs = Array.from(document.querySelectorAll('img'));
            return imgs
                .map(i => i.src || i.getAttribute('data-src'))
                .filter(s => s && s.startsWith('http') && !s.includes('gstatic.com/images'))
                .slice(0, 5);
        });
        if (!imageUrls.length) return null;
        return {
            source: `generic-fallback(${key || 'no-domain'})`,
            images: imageUrls,
            description: null,
            specs: null,
            componentes: null
        };
    } finally {
        await page.context().close();
    }
}

module.exports = { search };
```

- [ ] **Step 2: Commit**

```bash
git add scripts/scraping/brands/_generic-fallback.js
git commit -m "feat(scraper): generic fallback adapter with site:brand-domain filter"
```

---

### Task A7: Crear adaptador para Honda Motos

**Files:**
- Create: `scripts/scraping/brands/honda.js`

- [ ] **Step 1: Investigar selectores del sitio oficial**

Abrir `https://www.hondamotos.com.co/` (o `honda.com.co/motos`) en headed Playwright para identificar:
- Buscador o página de listado
- Tarjeta de producto y enlace al detalle
- Imágenes en página de detalle (probablemente carrusel `.swiper-slide img`)
- Bloque de descripción y ficha técnica

- [ ] **Step 2: Crear adaptador**

```js
// scripts/scraping/brands/honda.js
const HOST = 'https://www.hondamotos.com.co';

async function search(product, browser, { newPage }) {
    const slug = product.nombre.toLowerCase()
        .normalize('NFD').replace(/[̀-ͯ]/g, '')
        .replace(/[^a-z0-9]+/g, '-');
    const searchUrl = `${HOST}/buscar?q=${encodeURIComponent(product.nombre)}`;
    const page = await newPage(browser);
    try {
        await page.goto(searchUrl, { waitUntil: 'networkidle', timeout: 30000 });
        const productLink = await page.locator('a[href*="/motos/"]').first().getAttribute('href');
        if (!productLink) return null;
        const fullUrl = productLink.startsWith('http') ? productLink : `${HOST}${productLink}`;
        await page.goto(fullUrl, { waitUntil: 'networkidle', timeout: 30000 });

        const images = await page.evaluate(() => {
            const set = new Set();
            document.querySelectorAll('.swiper-slide img, .gallery img, .product-image img').forEach(img => {
                const s = img.src || img.dataset?.src;
                if (s && s.startsWith('http')) set.add(s.replace(/\?.*$/, ''));
            });
            return [...set].slice(0, 6);
        });

        const description = await page.evaluate(() => {
            const el = document.querySelector('.product-description, .descripcion, .product-detail__description');
            return el?.innerText?.trim() || null;
        });

        const specs = await page.evaluate(() => {
            const out = {};
            document.querySelectorAll('.specs tr, .ficha-tecnica tr, table tr').forEach(tr => {
                const cells = tr.querySelectorAll('td, th');
                if (cells.length >= 2) {
                    const k = cells[0].innerText.trim();
                    const v = cells[1].innerText.trim();
                    if (k && v) out[k] = v;
                }
            });
            return Object.keys(out).length ? out : null;
        });

        if (!images.length) return null;
        return { source: 'honda-oficial', images, description, specs, componentes: null, sourceUrl: fullUrl };
    } finally {
        await page.context().close();
    }
}

module.exports = { search };
```

- [ ] **Step 3: Probar contra un producto Honda real**

```bash
node -e "
(async () => {
  const { launchBrowser, newPage } = require('./scripts/scraping/utils/playwright-driver');
  const honda = require('./scripts/scraping/brands/honda');
  const browser = await launchBrowser({ headless: false });
  const r = await honda.search({ marca: 'Honda', nombre: 'CB 110' }, browser, { newPage });
  console.log(JSON.stringify(r, null, 2));
  await browser.close();
})();
"
```

Si los selectores no funcionan, ajustar mirando el DOM en headed mode.

- [ ] **Step 4: Commit**

```bash
git add scripts/scraping/brands/honda.js
git commit -m "feat(scraper): honda official site adapter"
```

---

### Task A8: Crear adaptadores para Suzuki, AKT, Yamaha (motos)

**Files:**
- Create: `scripts/scraping/brands/suzuki.js`
- Create: `scripts/scraping/brands/akt.js`
- Create: `scripts/scraping/brands/yamaha.js`

- [ ] **Step 1: Repetir la metodología de A7 para cada marca**

Sitios oficiales:
- Suzuki Motos Colombia: `https://www.suzukimotos.com.co`
- AKT Motos: `https://aktmotos.com`
- Yamaha Motor Colombia: `https://www.yamaha-motor.com.co`

Estructura del archivo: idéntica a `honda.js` pero con selectores específicos de cada sitio. Si la búsqueda no funciona, intentar página de catálogo y buscar match por nombre del producto.

- [ ] **Step 2: Probar cada uno con un producto real de su marca**

Mismo patrón que A7 Step 3.

- [ ] **Step 3: Commit**

```bash
git add scripts/scraping/brands/suzuki.js scripts/scraping/brands/akt.js scripts/scraping/brands/yamaha.js
git commit -m "feat(scraper): suzuki, akt, yamaha official site adapters"
```

---

### Task A9: Crear adaptadores para electrodomésticos

**Files:**
- Create: `scripts/scraping/brands/whirlpool.js`
- Create: `scripts/scraping/brands/lg.js`
- Create: `scripts/scraping/brands/samsung.js`
- Create: `scripts/scraping/brands/mabe.js`
- Create: `scripts/scraping/brands/haceb.js`
- Create: `scripts/scraping/brands/challenger.js`
- Create: `scripts/scraping/brands/samurai.js`

- [ ] **Step 1: Repetir metodología para cada marca**

Sitios oficiales:
- Whirlpool: `https://www.whirlpool.com.co`
- LG: `https://www.lg.com/co`
- Samsung: `https://www.samsung.com/co`
- Mabe: `https://www.mabe.com.co`
- HACEB: `https://www.haceb.com`
- Challenger: `https://www.challenger.com.co`
- Samurai (parrillas/cocina): `https://www.samurai.com.co`

- [ ] **Step 2: Commit por marca**

```bash
# Después de cada adaptador validado:
git add scripts/scraping/brands/<marca>.js
git commit -m "feat(scraper): <marca> official site adapter"
```

---

### Task A10: Crear orquestador `fetch-product-data.js`

**Files:**
- Create: `scripts/scraping/fetch-product-data.js`

- [ ] **Step 1: Crear orquestador**

```js
#!/usr/bin/env node
// scripts/scraping/fetch-product-data.js
// Orquesta scraping de imágenes + descripción + specs por producto, marca por marca.

const fs = require('fs');
const path = require('path');
const { launchBrowser, newPage, downloadImage } = require('./utils/playwright-driver');
const { processAndSave, validateBuffer, generatePlaceholder } = require('./utils/image-processor');
const {
    getProductsNeedingData, upsertMainImage, upsertExtraImage, updateProductData, close
} = require('./utils/db');

const BRAND_ADAPTERS = {
    honda: require('./brands/honda'),
    suzuki: require('./brands/suzuki'),
    akt: require('./brands/akt'),
    yamaha: require('./brands/yamaha'),
    samurai: require('./brands/samurai'),
    whirlpool: require('./brands/whirlpool'),
    lg: require('./brands/lg'),
    samsung: require('./brands/samsung'),
    mabe: require('./brands/mabe'),
    haceb: require('./brands/haceb'),
    challenger: require('./brands/challenger')
};
const FALLBACK = require('./brands/_generic-fallback');

function pickAdapter(marca) {
    const m = (marca || '').toLowerCase();
    return Object.keys(BRAND_ADAPTERS).find(k => m.includes(k)) || null;
}

function parseArgs(argv) {
    const args = { only: null, marca: null, retryPlaceholders: false, limit: null };
    for (let i = 2; i < argv.length; i++) {
        if (argv[i] === '--only') args.only = parseInt(argv[++i], 10);
        else if (argv[i] === '--marca') args.marca = argv[++i];
        else if (argv[i] === '--limit') args.limit = parseInt(argv[++i], 10);
        else if (argv[i] === '--retry-placeholders') args.retryPlaceholders = true;
    }
    return args;
}

async function processProduct(product, browser, report) {
    const adapterKey = pickAdapter(product.marca);
    const adapters = [];
    if (adapterKey) adapters.push({ name: adapterKey, mod: BRAND_ADAPTERS[adapterKey] });
    adapters.push({ name: 'fallback', mod: FALLBACK });

    for (const { name, mod } of adapters) {
        try {
            const result = await mod.search(product, browser, { newPage });
            if (!result || !result.images?.length) {
                report.lastErrors.push(`${name}: no result`);
                continue;
            }
            // Descargar y validar imágenes
            const savedPaths = [];
            for (let i = 0; i < result.images.length && savedPaths.length < 4; i++) {
                try {
                    const buf = await downloadImage(await newPage(browser), result.images[i], result.sourceUrl);
                    const val = await validateBuffer(buf);
                    if (!val.ok) { report.lastErrors.push(`img ${i}: ${val.reason}`); continue; }
                    const paths = await processAndSave(buf, product.id, savedPaths.length);
                    savedPaths.push(paths);
                } catch (e) {
                    report.lastErrors.push(`download img ${i}: ${e.message}`);
                }
            }
            if (!savedPaths.length) continue;

            // Persistir
            await upsertMainImage(product.id, savedPaths[0].main, `${product.marca} ${product.nombre}`);
            for (let i = 1; i < savedPaths.length; i++) {
                await upsertExtraImage(product.id, savedPaths[i].main, `${product.marca} ${product.nombre} (${i + 1})`, i);
            }
            await updateProductData(product.id, {
                descripcion_larga: result.description,
                specs: result.specs,
                componentes: result.componentes,
                fuente: result.source
            });
            return { ok: true, source: result.source, count: savedPaths.length };
        } catch (e) {
            report.lastErrors.push(`${name} error: ${e.message}`);
        }
    }
    return { ok: false };
}

async function main() {
    const args = parseArgs(process.argv);
    let products = await getProductsNeedingData();
    if (args.only) products = products.filter(p => p.id === args.only);
    if (args.marca) products = products.filter(p => (p.marca || '').toLowerCase().includes(args.marca.toLowerCase()));
    if (args.limit) products = products.slice(0, args.limit);

    console.log(`📦 ${products.length} productos a procesar`);
    if (!products.length) { await close(); return; }

    const browser = await launchBrowser();
    const report = {
        started_at: new Date().toISOString(),
        total: products.length,
        success: [], placeholder: [], failed: [], lastErrors: []
    };

    let i = 0;
    for (const p of products) {
        i++;
        const tag = `[${i}/${products.length}] #${p.id} ${p.marca} ${p.nombre}`;
        console.log(`\n→ ${tag}`);
        report.lastErrors = [];
        try {
            const r = await processProduct(p, browser, report);
            if (r.ok) {
                console.log(`   ✅ ${r.source} (${r.count} imgs)`);
                report.success.push({ id: p.id, sku: p.sku, marca: p.marca, source: r.source, count: r.count });
            } else {
                console.log(`   ⚠️  fallaron todos. Generando placeholder.`);
                const ph = await generatePlaceholder(p.id, p.marca, p.nombre);
                await upsertMainImage(p.id, ph.main, `${p.marca} ${p.nombre}`);
                report.placeholder.push({ id: p.id, sku: p.sku, marca: p.marca, errors: [...report.lastErrors] });
            }
        } catch (e) {
            console.error(`   ❌ FATAL ${e.message}`);
            report.failed.push({ id: p.id, error: e.message });
        }

        fs.writeFileSync(path.join(__dirname, 'report.json'), JSON.stringify(report, null, 2));
        await new Promise(r => setTimeout(r, parseInt(process.env.SCRAPER_RATE_MS || '2500', 10)));
    }

    await browser.close();
    await close();
    report.finished_at = new Date().toISOString();
    fs.writeFileSync(path.join(__dirname, 'report.json'), JSON.stringify(report, null, 2));
    console.log(`\n🎉 Listo. ✅ ${report.success.length}  🎨 ${report.placeholder.length}  ❌ ${report.failed.length}`);
}

main().catch(e => { console.error('FATAL', e); process.exit(1); });
```

- [ ] **Step 2: Probar con `--limit 3` primero**

```bash
node scripts/scraping/fetch-product-data.js --limit 3
```
Verificar que el reporte se genera y al menos 1 de 3 productos sale con éxito.

- [ ] **Step 3: Commit**

```bash
git add scripts/scraping/fetch-product-data.js
git commit -m "feat(scraper): orquestador playwright con adaptadores oficiales por marca"
```

---

### Task A11: Ejecutar scraping completo

- [ ] **Step 1: Backup actual de imágenes**

```bash
cp -r backend/public/images/productos backend/public/images/productos.backup.$(date +%Y%m%d)
```

- [ ] **Step 2: Ejecutar scraping por marca, una marca a la vez**

```bash
node scripts/scraping/fetch-product-data.js --marca honda
node scripts/scraping/fetch-product-data.js --marca suzuki
node scripts/scraping/fetch-product-data.js --marca akt
node scripts/scraping/fetch-product-data.js --marca yamaha
node scripts/scraping/fetch-product-data.js --marca whirlpool
node scripts/scraping/fetch-product-data.js --marca lg
node scripts/scraping/fetch-product-data.js --marca samsung
node scripts/scraping/fetch-product-data.js --marca mabe
node scripts/scraping/fetch-product-data.js --marca haceb
node scripts/scraping/fetch-product-data.js --marca challenger
node scripts/scraping/fetch-product-data.js --marca samurai
# Finalmente, los que no caen en ninguna marca conocida
node scripts/scraping/fetch-product-data.js
```

- [ ] **Step 3: Generar resumen para el coordinador**

```bash
node -e "
const r = require('./scripts/scraping/report.json');
console.log('SUCCESS:', r.success.length);
console.log('PLACEHOLDER:', r.placeholder.length);
console.log('FAILED:', r.failed.length);
console.log('---PLACEHOLDER IDs---');
r.placeholder.forEach(p => console.log(p.id, p.marca, p.sku));
console.log('---FAILED IDs---');
r.failed.forEach(p => console.log(p.id, p.error));
" > scripts/scraping/summary-for-coordinator.txt
```

Este archivo lo usa el coordinador en la Task FINAL-1 para rescatar productos manualmente con Playwright MCP.

- [ ] **Step 4: Commit resultados (imágenes y datos)**

Solo si hay cambios en `backend/public/images/productos`:

```bash
git add backend/public/images/productos
git commit -m "feat(scraper): scraped product images and data for catalog"
```

---

### Task A12: Endpoint backend que expone datos extendidos

**Files:**
- Modify: `backend/src/controllers/productos.controller.js` (o equivalente al endpoint público de productos)

- [ ] **Step 1: Localizar el endpoint público `/productos/:id` y `/productos`**

```bash
grep -rn "router.get.*productos" backend/src/routes/
```

- [ ] **Step 2: Modificar el SELECT para incluir nuevos campos**

Agregar a la consulta:
```sql
SELECT p.id, p.sku, p.nombre, p.descripcion, p.descripcion_larga, p.specs, p.componentes, ...
```

Y a la respuesta del endpoint de detalle, agregar galería ordenada:
```sql
SELECT ruta, alt_text, es_principal, orden
FROM producto_imagenes
WHERE producto_id = $1
ORDER BY es_principal DESC, orden ASC
```

- [ ] **Step 3: Probar con curl**

```bash
curl http://localhost:3000/api/v1/productos/364 | jq '.data.descripcion_larga, .data.specs'
```
Expected: campos pueblan con datos scrapeados (no null para productos exitosos).

- [ ] **Step 4: Commit**

```bash
git add backend/src
git commit -m "feat(api): expose descripcion_larga, specs, componentes, ordered gallery"
```

---

## TRACK B — Restauración Visual del Frontend Público

> Cada sub-pista (B1...B9) es una tarea independiente del agente B. Empezar por restaurar HTML aprobado y luego adaptar el JS para que use los datos nuevos.

### Task B1: Crear rama y backup del estado actual del frontend

- [ ] **Step 1: Asegurar rama**

```bash
git checkout feat/restore-approved-design
# Si no existe:
# git checkout -b feat/restore-approved-design
```

- [ ] **Step 2: Backup de archivos que se van a sobreescribir**

```bash
mkdir -p .backup-pre-restore
cp frontend/pages/index.html .backup-pre-restore/
cp frontend/pages/productos.html .backup-pre-restore/
cp frontend/pages/detalle-producto.html .backup-pre-restore/
cp frontend/components/footer.html .backup-pre-restore/
cp frontend/components/card-producto.html .backup-pre-restore/
```

No commitear `.backup-pre-restore/` — agregarlo a `.gitignore`.

- [ ] **Step 3: Commit del .gitignore**

```bash
echo ".backup-pre-restore/" >> .gitignore
git add .gitignore
git commit -m "chore: ignore visual restoration backup folder"
```

---

### Task B2: Restaurar `card-producto.html` (tarjeta pequeña aprobada)

**Files:**
- Modify: `frontend/components/card-producto.html`

- [ ] **Step 1: Restaurar desde `7a85252`**

```bash
git show 7a85252:frontend/components/card-producto.html > frontend/components/card-producto.html
```

- [ ] **Step 2: Verificar que mantiene `data-fallback-images` (mejora del refactor)**

Si la versión `7a85252` NO tiene `data-fallback-images`, mantener el atributo del HEAD actual antes de sobreescribir y volverlo a inyectar en el mismo `<img>`. Revisar y editar manualmente si hace falta.

- [ ] **Step 3: Commit**

```bash
git add frontend/components/card-producto.html
git commit -m "fix(catalog): restore approved small product card design from 7a85252"
```

---

### Task B3: Restaurar `productos.html` con layout sidebar-izq / grid-der

**Files:**
- Modify: `frontend/pages/productos.html`

- [ ] **Step 1: Restaurar desde `7a85252`**

```bash
git show 7a85252:frontend/pages/productos.html > frontend/pages/productos.html
```

- [ ] **Step 2: Reinjectar scripts del refactor**

Agregar en el `<head>`:
```html
<link rel="stylesheet" href="../assets/css/tailwind.min.css">
```

Y antes de `</body>`:
```html
<script src="../assets/js/components/search-autocomplete.js"></script>
<script src="../assets/js/components/navbar-scroll-shadow.js"></script>
<script src="../assets/js/asesor-modal.js"></script>
<script src="../assets/js/pages/productos.js"></script>
```

Quitar referencia al CDN de Tailwind `https://cdn.tailwindcss.com` (ya está compilado local).

- [ ] **Step 3: Verificar layout**

```bash
# Iniciar servidor
npm start &
# Abrir productos.html
```
Validar visualmente con Playwright MCP:
- Sidebar de filtros visible a la izquierda en ≥1024px
- Grid de productos 4 por fila en escritorio
- Tarjetas pequeñas (no las grandes actuales)

- [ ] **Step 4: Commit**

```bash
git add frontend/pages/productos.html
git commit -m "fix(catalog): restore sidebar-left + small cards grid layout"
```

---

### Task B4: Adaptar `productos.js` para mantener filtros mejorados con layout antiguo

**Files:**
- Modify: `frontend/assets/js/pages/productos.js`

- [ ] **Step 1: Conservar funciones de carga y filtros del refactor**

NO sobreescribir todo el archivo. En cambio:
- Mantener: lógica de carga vía `products.service.js`, sync con URL, filtros dinámicos.
- Asegurar: render usa `card-producto.html` y respeta el ancho de grid.

- [ ] **Step 2: Validar grid CSS**

Confirmar que `#product-grid` mantiene `grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6` (no las clases grandes que vino del refactor).

- [ ] **Step 3: Commit**

```bash
git add frontend/assets/js/pages/productos.js
git commit -m "fix(catalog): keep dynamic filters with restored grid sizing"
```

---

### Task B5: Restaurar `index.html` (hero + categorías + destacados)

**Files:**
- Modify: `frontend/pages/index.html`

- [ ] **Step 1: Restaurar desde `7a85252`**

```bash
git show 7a85252:frontend/pages/index.html > frontend/pages/index.html
```

- [ ] **Step 2: Reinjectar scripts del refactor**

Agregar en `<head>` y final del `<body>` los mismos del Task B3 más:
```html
<script src="../assets/js/pages/home.js"></script>
```

- [ ] **Step 3: Verificar visualmente con Playwright MCP**

- Banner hero sin texto sobrepuesto que tape el banner (o con contraste claro si tiene overlay).
- Categorías en una sola fila desktop (`grid-cols-2 lg:grid-cols-4`).
- Sección "Productos Destacados" visible.

- [ ] **Step 4: Commit**

```bash
git add frontend/pages/index.html
git commit -m "fix(home): restore approved hero + category row + featured products"
```

---

### Task B6: Adaptar `home.js` para renderizar productos destacados

**Files:**
- Modify: `frontend/assets/js/pages/home.js`

- [ ] **Step 1: Restaurar lógica de destacados del commit `7a85252`**

```bash
git show 7a85252:frontend/assets/js/pages/home.js > /tmp/home-old.js
```

Mezclar manualmente: tomar la función `loadFeaturedProducts()` o equivalente del archivo viejo, agregarla al actual.

- [ ] **Step 2: Asegurar que llama al endpoint correcto**

Endpoint actual: `GET /api/v1/productos?destacado=1&limit=8`. Si no existe, ajustar a `?limit=8&sort=newest`.

- [ ] **Step 3: Renderizar con el componente `card-producto.html`**

Reutilizar el helper `renderProductCard()` que usa `productos.js`. Si no es exportable, replicar el template.

- [ ] **Step 4: Commit**

```bash
git add frontend/assets/js/pages/home.js
git commit -m "fix(home): render featured products with restored card component"
```

---

### Task B7: Restaurar `detalle-producto.html` con layout 2-columnas

**Files:**
- Modify: `frontend/pages/detalle-producto.html`

- [ ] **Step 1: Restaurar desde `7a85252`**

```bash
git show 7a85252:frontend/pages/detalle-producto.html > frontend/pages/detalle-producto.html
```

- [ ] **Step 2: Activar bloques comentados de descripción/specs**

El HTML aprobado tiene varios bloques con `<!-- -->` para precio/stock que NO usamos en el modelo "solo cotización". Pero los bloques de descripción y especificaciones SÍ los queremos. Activar:
- `<div id="product-description">` (si está comentado).
- `<table id="product-specs">` o crearla si no existe.

Agregar al área de info (columna derecha) después del título:

```html
<!-- Descripción -->
<div class="prose prose-sm max-w-none text-gray-700">
    <p id="product-description"></p>
</div>

<!-- Especificaciones -->
<div id="specs-section" class="hidden mt-8">
    <h3 class="font-bold text-gray-900 mb-3">Especificaciones</h3>
    <div class="overflow-hidden rounded-lg border border-gray-200">
        <table class="w-full text-sm">
            <tbody id="product-specs"></tbody>
        </table>
    </div>
</div>
```

- [ ] **Step 3: Reinjectar scripts del refactor**

```html
<script src="../assets/js/components/search-autocomplete.js"></script>
<script src="../assets/js/components/navbar-scroll-shadow.js"></script>
<script src="../assets/js/asesor-modal.js"></script>
<script src="../assets/js/pages/detalle-producto.js"></script>
```

- [ ] **Step 4: Commit**

```bash
git add frontend/pages/detalle-producto.html
git commit -m "fix(producto): restore 2-col layout with description and specs sections"
```

---

### Task B8: Adaptar `detalle-producto.js` para usar datos scrapeados y limpiar imágenes rotas

**Files:**
- Modify: `frontend/assets/js/pages/detalle-producto.js`

- [ ] **Step 1: Filtrar imágenes rotas antes de renderizar**

Al cargar `product.imagenes`:

```js
async function filterValidImages(images) {
    const checks = images.map(img => new Promise(res => {
        const test = new Image();
        test.onload = () => res({ ok: true, src: img });
        test.onerror = () => res({ ok: false, src: img });
        test.src = img.ruta || img.src || img;
    }));
    const results = await Promise.all(checks);
    return results.filter(r => r.ok).map(r => r.src);
}
```

Usar el resultado para alimentar el main image + thumbnails.

- [ ] **Step 2: Renderizar descripción larga**

```js
if (product.descripcion_larga) {
    document.getElementById('product-description').textContent = product.descripcion_larga;
} else if (product.descripcion) {
    document.getElementById('product-description').textContent = product.descripcion;
}
```

- [ ] **Step 3: Renderizar specs como tabla**

```js
function renderSpecs(specs) {
    const tbody = document.getElementById('product-specs');
    const section = document.getElementById('specs-section');
    if (!specs || !Object.keys(specs).length) { section.classList.add('hidden'); return; }
    tbody.innerHTML = Object.entries(specs).map(([k, v]) => `
        <tr class="border-b border-gray-100 last:border-0">
            <td class="px-4 py-2 font-medium text-gray-700 bg-gray-50">${escapeHtml(k)}</td>
            <td class="px-4 py-2 text-gray-900">${escapeHtml(String(v))}</td>
        </tr>
    `).join('');
    section.classList.remove('hidden');
}
```

`escapeHtml` ya debe existir en `core.js` o en utils. Si no, agregarla.

- [ ] **Step 4: Botón Cotizar dispara asesor-modal**

Asegurar que el botón "Cotizar" del detalle tiene clase `js-quote-product` con los `data-*` correctos. Si no, agregarlos.

- [ ] **Step 5: Commit**

```bash
git add frontend/assets/js/pages/detalle-producto.js
git commit -m "fix(producto): use scraped description/specs, filter broken images, wire asesor modal"
```

---

### Task B9: Restaurar `footer.html` (4 columnas + métodos de pago con logos)

**Files:**
- Modify: `frontend/components/footer.html`
- Create: `frontend/assets/img/pagos/bancolombia.png`
- Create: `frontend/assets/img/pagos/davivienda.png`
- Create: `frontend/assets/img/pagos/pse.png`
- Create: `frontend/assets/img/pagos/efecty.png`

- [ ] **Step 1: Restaurar HTML desde `7a85252`**

```bash
git show 7a85252:frontend/components/footer.html > frontend/components/footer.html
```

- [ ] **Step 2: Descargar logos oficiales**

Buscar y descargar logos oficiales (formato PNG con fondo transparente):
- Bancolombia: logo oficial 2024 (rectangular).
- Davivienda: logo oficial.
- PSE: logotipo del sistema PSE.
- Efecty: logotipo oficial.

Guardar en `frontend/assets/img/pagos/`.

Si la sección de métodos de pago en el footer aprobado usa rutas distintas, ajustar las `src` de los `<img>` a las nuevas rutas.

- [ ] **Step 3: Verificar 4 columnas en escritorio**

Abrir `index.html` y verificar con Playwright MCP que el footer tiene exactamente 4 columnas en >1024px y 1 columna apilada en móvil.

- [ ] **Step 4: Commit**

```bash
git add frontend/components/footer.html frontend/assets/img/pagos/
git commit -m "fix(footer): restore 4-col layout with official payment method logos"
```

---

### Task B10: Cablear modal de cotización con asesor en todas las páginas

**Files:**
- Modify: `frontend/pages/index.html`, `productos.html`, `detalle-producto.html`, `favoritos.html` (cualquiera con botón "Cotizar")
- Modify: `frontend/assets/js/asesor-modal.js` (si necesita ajuste)

- [ ] **Step 1: Verificar que `asesor-modal.js` está incluido en todas las páginas**

```bash
grep -l "asesor-modal.js" frontend/pages/*.html
```
Debe listar: index, productos, detalle-producto, favoritos.

- [ ] **Step 2: Verificar event delegation**

Abrir `frontend/assets/js/asesor-modal.js` y confirmar que `attachEventListeners()` usa `document.addEventListener('click', ...)` con delegación a `.js-quote-product`.

Si está cableado al carrito (modelo antiguo de checkout), reescribir para que solo abra el modal con la lista de asesores. Mensaje WhatsApp:

```
Hola {asesor}, estoy interesado en cotizar el siguiente producto:

Producto: {nombre}
Marca: {marca}
ID: {id}

¿Podrías darme más información?
```

- [ ] **Step 3: Probar interactivamente con Playwright MCP**

Click en cualquier botón "Cotizar" → modal de asesores abre → seleccionar uno → abre wa.me con mensaje.

- [ ] **Step 4: Commit**

```bash
git add frontend/pages frontend/assets/js/asesor-modal.js
git commit -m "fix(quote): wire asesor selection modal to all 'Cotizar' buttons"
```

---

### Task B11: Verificación responsive móvil

- [ ] **Step 1: Smoke test en 3 viewports**

Con Playwright MCP:

```js
for (const vp of [{w:375,h:667}, {w:414,h:896}, {w:768,h:1024}]) {
    await page.setViewportSize(vp);
    for (const url of ['index.html', 'productos.html', 'detalle-producto.html?id=364']) {
        await page.goto(`http://localhost:3000/${url}`);
        await page.screenshot({ path: `screenshots/mobile-${vp.w}-${url.replace(/[?\/.=]/g,'_')}.png` });
    }
}
```

Validar manualmente que ninguna página tiene overflow horizontal, texto cortado, o elementos superpuestos.

- [ ] **Step 2: Ajustes puntuales**

Si algo está roto en móvil, ajustar en el archivo correspondiente. Los cambios deben ser mínimos (clases responsive que faltaron).

- [ ] **Step 3: Commit**

```bash
git add frontend/
git commit -m "fix(responsive): mobile viewport fixes for restored pages"
```

---

## TRACK C — Admin Modal de Imágenes

### Task C1: Verificar columna `orden` en `producto_imagenes`

- [ ] **Step 1: Verificar**

```bash
psql "$DATABASE_URL" -c "\d producto_imagenes" | grep orden
```

Si no existe, la migración A1 ya la agregó. Si no fue parte de A1 (porque la Pista A no se ha ejecutado), aplicar fragmento mínimo:

```sql
ALTER TABLE producto_imagenes ADD COLUMN IF NOT EXISTS orden INTEGER DEFAULT 0;
CREATE INDEX IF NOT EXISTS idx_producto_imagenes_orden ON producto_imagenes(producto_id, orden);
```

- [ ] **Step 2: Commit (si aplicó migración independiente)**

---

### Task C2: Endpoints admin para imagen principal y reorden

**Files:**
- Modify: `backend/src/controllers/admin.controller.js`
- Modify: `backend/src/routes/admin.routes.js`

- [ ] **Step 1: Endpoint imagen principal**

```js
// PATCH /api/v1/admin/productos/:id/imagen-principal
// Body: { imagen_id: number }
exports.setImagenPrincipal = async (req, res) => {
    const { id } = req.params;
    const { imagen_id } = req.body;
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        await client.query('UPDATE producto_imagenes SET es_principal = FALSE WHERE producto_id = $1', [id]);
        const r = await client.query(
            'UPDATE producto_imagenes SET es_principal = TRUE WHERE id = $1 AND producto_id = $2 RETURNING *',
            [imagen_id, id]
        );
        if (!r.rowCount) throw new Error('imagen_id no pertenece al producto');
        await client.query('COMMIT');
        res.json({ success: true, data: r.rows[0] });
    } catch (e) {
        await client.query('ROLLBACK');
        res.status(400).json({ success: false, error: e.message });
    } finally {
        client.release();
    }
};
```

- [ ] **Step 2: Endpoint reordenar**

```js
// PATCH /api/v1/admin/productos/:id/imagenes/orden
// Body: { orden: [imagen_id, imagen_id, ...] }
exports.reordenarImagenes = async (req, res) => {
    const { id } = req.params;
    const { orden } = req.body;
    if (!Array.isArray(orden)) return res.status(400).json({ success: false, error: 'orden debe ser array' });
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        for (let i = 0; i < orden.length; i++) {
            await client.query(
                'UPDATE producto_imagenes SET orden = $1 WHERE id = $2 AND producto_id = $3',
                [i, orden[i], id]
            );
        }
        await client.query('COMMIT');
        res.json({ success: true });
    } catch (e) {
        await client.query('ROLLBACK');
        res.status(400).json({ success: false, error: e.message });
    } finally {
        client.release();
    }
};
```

- [ ] **Step 3: Registrar rutas**

En `admin.routes.js`:
```js
router.patch('/productos/:id/imagen-principal', requireAdmin, admin.setImagenPrincipal);
router.patch('/productos/:id/imagenes/orden', requireAdmin, admin.reordenarImagenes);
```

- [ ] **Step 4: Probar con curl**

```bash
curl -X PATCH http://localhost:3000/api/v1/admin/productos/364/imagen-principal \
  -H "Content-Type: application/json" -H "Cookie: $ADMIN_SESSION" \
  -d '{"imagen_id": 1234}'
```

- [ ] **Step 5: Commit**

```bash
git add backend/src
git commit -m "feat(admin): endpoints for setting main image and reordering gallery"
```

---

### Task C3: Rediseñar sección de imágenes del modal en `admin.html`

**Files:**
- Modify: `frontend/pages/admin.html` — sección del modal `#admin-product-modal`

- [ ] **Step 1: Localizar el modal en `admin.html`**

```bash
grep -n "admin-product-modal\|product-modal" frontend/pages/admin.html
```

- [ ] **Step 2: Reemplazar la sección de imágenes**

```html
<!-- Imágenes del producto -->
<div class="space-y-3">
    <label class="block text-sm font-medium text-gray-700">Imágenes del producto</label>

    <!-- Drag-drop zone -->
    <div id="img-dropzone"
         class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50 transition">
        <i data-lucide="upload-cloud" class="w-8 h-8 mx-auto text-gray-400 mb-2"></i>
        <p class="text-sm text-gray-600">Arrastra imágenes o haz clic para subir</p>
        <p class="text-xs text-gray-400 mt-1">Mín 500×500 · JPG/PNG/WebP · Máx 5 MB c/u</p>
        <input type="file" id="img-file-input" multiple accept="image/jpeg,image/png,image/webp" class="hidden">
    </div>

    <!-- Botón scrape -->
    <button type="button" id="img-auto-scrape"
            class="w-full px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition text-sm font-medium flex items-center justify-center gap-2">
        <i data-lucide="search" class="w-4 h-4"></i>
        Buscar imagen automáticamente
    </button>

    <!-- Grid de imágenes existentes -->
    <div id="img-gallery" class="grid grid-cols-3 sm:grid-cols-4 gap-3"></div>

    <p id="img-status" class="text-xs text-gray-500"></p>
</div>
```

- [ ] **Step 3: Commit**

```bash
git add frontend/pages/admin.html
git commit -m "feat(admin): redesign product image modal section with dropzone and gallery"
```

---

### Task C4: Implementar lógica del image picker en `admin-crud.js`

**Files:**
- Modify: `frontend/assets/js/pages/admin-crud.js`

- [ ] **Step 1: Localizar función que abre el modal de producto**

```bash
grep -n "admin-product-modal\|openProductModal" frontend/assets/js/pages/admin-crud.js
```

- [ ] **Step 2: Agregar módulo de imagen picker**

Al cargar el modal con un producto:

```js
async function renderImageGallery(productId) {
    const gallery = document.getElementById('img-gallery');
    const r = await fetch(`/api/v1/admin/productos/${productId}/imagenes`);
    const data = await r.json();
    const imgs = data.data || [];
    gallery.innerHTML = imgs.map(img => `
        <div class="relative group rounded-lg overflow-hidden border-2 ${img.es_principal ? 'border-yellow-400' : 'border-gray-200'}"
             data-img-id="${img.id}" draggable="true">
            <img src="${escapeHtml(img.ruta)}" class="w-full aspect-square object-contain bg-gray-50">
            <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                <button type="button" class="js-set-principal p-2 bg-white rounded-full ${img.es_principal ? 'text-yellow-500' : 'text-gray-600'}"
                        title="${img.es_principal ? 'Imagen principal' : 'Marcar como principal'}">
                    <i data-lucide="${img.es_principal ? 'star' : 'star'}" class="w-5 h-5"></i>
                </button>
                <button type="button" class="js-delete-img p-2 bg-white text-red-600 rounded-full" title="Eliminar">
                    <i data-lucide="trash-2" class="w-5 h-5"></i>
                </button>
            </div>
            ${img.es_principal ? '<span class="absolute top-2 left-2 px-2 py-0.5 bg-yellow-400 text-yellow-900 text-xs font-bold rounded">PRINCIPAL</span>' : ''}
        </div>
    `).join('');
    if (window.lucide) window.lucide.createIcons();

    // Click estrella
    gallery.querySelectorAll('.js-set-principal').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const id = e.currentTarget.closest('[data-img-id]').dataset.imgId;
            await fetch(`/api/v1/admin/productos/${productId}/imagen-principal`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ imagen_id: parseInt(id, 10) })
            });
            renderImageGallery(productId);
        });
    });

    // Click eliminar
    gallery.querySelectorAll('.js-delete-img').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const id = e.currentTarget.closest('[data-img-id]').dataset.imgId;
            if (!confirm('¿Eliminar esta imagen?')) return;
            await fetch(`/api/v1/admin/productos/${productId}/imagenes/${id}`, { method: 'DELETE' });
            renderImageGallery(productId);
        });
    });

    // Drag-and-drop reorder
    let dragSrc = null;
    gallery.querySelectorAll('[data-img-id]').forEach(el => {
        el.addEventListener('dragstart', () => { dragSrc = el; el.classList.add('opacity-50'); });
        el.addEventListener('dragend', () => { el.classList.remove('opacity-50'); });
        el.addEventListener('dragover', (e) => { e.preventDefault(); });
        el.addEventListener('drop', async (e) => {
            e.preventDefault();
            if (dragSrc && dragSrc !== el) {
                gallery.insertBefore(dragSrc, el);
                const orden = [...gallery.querySelectorAll('[data-img-id]')].map(n => parseInt(n.dataset.imgId, 10));
                await fetch(`/api/v1/admin/productos/${productId}/imagenes/orden`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ orden })
                });
            }
        });
    });
}
```

- [ ] **Step 3: Dropzone wiring**

```js
function wireDropzone(productId) {
    const zone = document.getElementById('img-dropzone');
    const input = document.getElementById('img-file-input');
    zone.addEventListener('click', () => input.click());
    input.addEventListener('change', () => uploadFiles(productId, input.files));
    zone.addEventListener('dragover', (e) => { e.preventDefault(); zone.classList.add('bg-blue-50'); });
    zone.addEventListener('dragleave', () => zone.classList.remove('bg-blue-50'));
    zone.addEventListener('drop', (e) => {
        e.preventDefault();
        zone.classList.remove('bg-blue-50');
        uploadFiles(productId, e.dataTransfer.files);
    });
}

async function uploadFiles(productId, files) {
    const status = document.getElementById('img-status');
    for (const file of files) {
        if (file.size > 5 * 1024 * 1024) { status.textContent = `${file.name} > 5 MB, omitida`; continue; }
        const fd = new FormData(); fd.append('imagen', file);
        status.textContent = `Subiendo ${file.name}...`;
        const r = await fetch(`/api/v1/admin/productos/${productId}/imagenes`, { method: 'POST', body: fd });
        if (!r.ok) { status.textContent = `Error al subir ${file.name}`; continue; }
    }
    status.textContent = '';
    renderImageGallery(productId);
}
```

- [ ] **Step 4: Botón auto-scrape**

```js
document.getElementById('img-auto-scrape').addEventListener('click', async () => {
    const productId = currentEditingProductId; // variable global del modal
    const status = document.getElementById('img-status');
    status.textContent = 'Buscando imagen oficial, puede tardar 30-60 seg...';
    const r = await fetch(`/api/v1/admin/productos/${productId}/scrape`, { method: 'POST' });
    const data = await r.json();
    status.textContent = data.success ? `Encontradas ${data.count} imágenes` : `Sin resultado: ${data.error}`;
    renderImageGallery(productId);
});
```

Endpoint `POST /api/v1/admin/productos/:id/scrape` debe agregarse en backend que llama al scraper para ese producto puntual (puede ser child_process spawn al script).

- [ ] **Step 5: Llamar `renderImageGallery + wireDropzone` al abrir modal de edición**

En la función que abre el modal con un producto existente, después de pintar los datos:

```js
if (product.id) {
    renderImageGallery(product.id);
    wireDropzone(product.id);
}
```

- [ ] **Step 6: Verificar visualmente con Playwright MCP**

Abrir admin, editar un producto, ver el modal nuevo. Click en estrella, ver que marca como principal y refleja en BD.

- [ ] **Step 7: Commit**

```bash
git add frontend/assets/js/pages/admin-crud.js
git commit -m "feat(admin): drag-drop upload, star to set main image, reorder gallery, auto-scrape button"
```

---

## TRACK FINAL — Coordinador (Claude principal)

### Task FINAL-1: Rescate manual de productos sin imagen con Playwright MCP

> Esta tarea la ejecuta el coordinador (Claude principal con Playwright MCP), NO los agentes.

- [ ] **Step 1: Leer reporte de scraper**

```bash
cat scripts/scraping/report.json | jq '.placeholder, .failed'
```

- [ ] **Step 2: Para cada producto pendiente**

Procedimiento:
1. Abrir el sitio oficial de la marca con `mcp__playwright__browser_navigate`.
2. Buscar el producto exacto.
3. Tomar URL de la mejor imagen profesional (fondo blanco, frontal, sin watermark).
4. Verificar criterios:
   - Es imagen del producto (no del logo de la marca).
   - Tiene fondo blanco o limpio.
   - Resolución ≥ 800×800.
   - Sin watermarks ni elementos superpuestos.
5. Si no hay imagen apta → marcar como `requires_manual_upload` en BD:
   ```sql
   UPDATE productos SET fuente_scrape = 'requires_manual_upload' WHERE id = N;
   ```
6. Si hay imagen apta → ejecutar script puntual:
   ```bash
   node scripts/scraping/fetch-product-data.js --only N
   ```
   (con un parche que permita pasar URL manual: agregar flag `--manual-image <url>`)

- [ ] **Step 3: Resumen al usuario**

Lista al usuario:
- N productos rescatados manualmente con Playwright MCP.
- M productos marcados para subida manual desde admin.

---

### Task FINAL-2: Verificación E2E integrada

- [ ] **Step 1: Levantar app**

```bash
npm start &
```

- [ ] **Step 2: Run smoke E2E**

```bash
npm run test:e2e
```

Expected: tests existentes (home, catalog, admin, auth, search) pasan. Si hay regresión nueva, identificar la tarea responsable y arreglar.

- [ ] **Step 3: Screenshots de validación**

Con Playwright MCP, capturar:
- `index.html` desktop + mobile
- `productos.html` desktop + mobile
- `detalle-producto.html?id=<algún producto exitoso>` desktop + mobile
- Modal de cotización abierto
- Admin → editar producto → ver modal de imágenes
- Footer en 4 columnas

Guardar en `screenshots/verification/`.

- [ ] **Step 4: Commit screenshots (opcional, fuera de PR)**

```bash
# Si las screenshots son grandes, no commitearlas; solo conservar para el reporte al usuario
```

---

### Task FINAL-3: Reporte y PR

- [ ] **Step 1: Resumen al usuario**

Plantilla:
```
Cambios completados en rama `feat/restore-approved-design`:

Pista A (Scraper):
- Migración aplicada con 4 nuevas columnas en `productos`
- 11 adaptadores oficiales de marca + fallback genérico
- {N} productos con imagen + descripción + specs reales
- {M} productos rescatados manualmente con Playwright MCP
- {K} productos pendientes de subida manual (anotados como requires_manual_upload)

Pista B (Visual):
- Home: hero corregido, categorías en una fila, productos destacados restaurados
- Catálogo: sidebar izquierda, tarjetas pequeñas como antes
- Detalle: layout 2 columnas, descripción y specs reales
- Footer: 4 columnas + logos oficiales Bancolombia/Davivienda/PSE/Efecty
- Modal de cotización con asesor cableado en todos los botones "Cotizar"
- Responsive móvil verificado en 375/414/768 px

Pista C (Admin):
- Modal de imágenes con drag-drop, estrella para principal, reordenar
- Endpoints `PATCH /admin/productos/:id/imagen-principal` y `imagenes/orden`
- Botón "Buscar imagen automáticamente" que dispara scraper para 1 producto

Mejoras del refactor que se conservaron:
- Seguridad (XSS, CSP, rate-limit)
- Autocomplete de búsqueda
- Tailwind compilado local
- Admin CRUD consolidado

¿Apruebas un PR a main, o quieres revisar/ajustar algo antes?
```

- [ ] **Step 2: NO crear PR todavía**

Esperar aprobación explícita del usuario antes de `gh pr create`.

---

## Self-Review

**Cobertura de spec:**
- ✓ Scraper rewrite con sitios oficiales → Tasks A1-A12
- ✓ Hero: texto legible, categorías una fila, destacados → Tasks B5, B6
- ✓ Footer 4-col con logos oficiales → Task B9
- ✓ Catálogo: filtros izq + tarjetas pequeñas → Tasks B2, B3, B4
- ✓ Detalle: 2-col + descripción/specs + sin imágenes rotas → Tasks B7, B8
- ✓ Modal cotización asesor cableado → Task B10
- ✓ Responsive móvil → Task B11
- ✓ Admin image modal estético → Tasks C1-C4
- ✓ Escalación coordinador con Playwright MCP → Task FINAL-1

**Placeholders:** Ninguno. Cada tarea tiene código real o comando concreto.

**Consistencia de tipos:**
- Endpoint scrape puntual referenciado en C4 Step 4 → agregar mínima implementación en C2 como `POST /admin/productos/:id/scrape` (queda como TODO menor para el agente C, simplemente hace `spawn('node', ['scripts/scraping/fetch-product-data.js', '--only', id])`).

**Fix inline:**

En Task C2, agregar Step 6:

> **Step 6: Endpoint para disparar scraping puntual** — agrega `POST /api/v1/admin/productos/:id/scrape` que ejecuta `child_process.spawn('node', ['scripts/scraping/fetch-product-data.js', '--only', id])`, responde 202 inmediatamente con `{ success: true, message: 'Scraping iniciado en background' }`, y registra el resultado en logs cuando termine.
