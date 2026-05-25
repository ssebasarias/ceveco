# Restauración del Diseño Aprobado + Scraper Profesional de Productos

**Fecha:** 2026-05-25
**Autor:** sebasarias (con Claude Code)
**Estado:** Borrador para revisión

## Contexto

El merge `production-ready-refactor` (commit `2be127e`) introdujo 40 commits que mejoraron seguridad, admin CRUD, autocompletar y scraping, pero **rompió el diseño visual que ya había sido aprobado** en la rama principal (último commit aprobado: `7a85252`).

El usuario solicitó textualmente: *"la idea era mejorar sobre lo que había no modificar la página completa"*. Esto define la estrategia: **rescatar el diseño aprobado y fusionarlo con las mejoras técnicas del refactor que sí valen la pena conservar**.

Adicionalmente, el scraper actual (`scripts/scraping/fetch-product-images.js`) usa Google Images y DuckDuckGo, lo que produce imágenes inconsistentes (algunas muestran el logo de la marca en vez del producto, otras son de Facebook Marketplace, etc.). Hay que reemplazarlo por un scraper profesional con Playwright MCP que vaya a los sitios oficiales de cada marca y extraiga imagen + descripción + especificaciones técnicas reales.

## Objetivos

1. **Restaurar la experiencia visual aprobada** de:
   - Hero (texto legible, categorías en una sola fila, productos destacados)
   - Catálogo (filtros a la izquierda, productos a la derecha, tarjetas pequeñas)
   - Detalle de producto (imágenes a la izquierda, info a la derecha)
   - Footer (distribución 4 columnas, logos oficiales en métodos de pago)
   - Modal de cotización con asesor en botones "Cotizar"
   - Versión responsive móvil
2. **Mejorar el scraper** para que extraiga imagen profesional (fondo blanco, múltiples ángulos) + descripción + ficha técnica desde sitios oficiales por marca.
3. **Pulir el modal de admin de productos** para que la selección de imagen principal sea estética e intuitiva para un usuario no técnico.

## Lo que se conserva del refactor

No se va a tocar:
- Mejoras de seguridad (XSS, CSP, rate-limit, password reset)
- Admin CRUD completo (consolidación en `admin-crud.js`)
- Autocompletado con `pg_trgm`
- Compilación local de Tailwind
- Endpoints `/api/v1/asesores` y otros
- Estructura de tests E2E

## Estrategia: 3 Pistas Paralelas

Las correcciones se reparten en 3 pistas que pueden trabajar en paralelo porque tocan archivos disjuntos.

```
┌────────────────────────────────────┐
│  PISTA A: Scraper + Datos          │   backend/ scripts/scraping/
│  (independiente, backend)          │   migrations/
└────────────────────────────────────┘

┌────────────────────────────────────┐
│  PISTA B: Restauración Visual      │   frontend/pages/
│  (frontend público)                │   frontend/components/
│                                    │   frontend/assets/css/
│                                    │   frontend/assets/js/pages/
└────────────────────────────────────┘

┌────────────────────────────────────┐
│  PISTA C: Admin Modal de Imágenes  │   frontend/pages/admin.html
│  (frontend admin)                  │   frontend/assets/js/pages/admin-crud.js
└────────────────────────────────────┘
```

Cada pista se asigna a un agente independiente. El coordinador (yo) revisa los resultados, integra y verifica.

---

## Pista A — Scraper Profesional con Playwright MCP

### Diseño

**Reemplazar** `scripts/scraping/fetch-product-images.js` por un scraper que:

1. **Por cada marca relevante en BD**, defina un *adaptador* en `scripts/scraping/brands/<marca>.js` con:
   - `searchUrl(producto)` — URL del buscador o catálogo oficial.
   - `extractProductLink(page, producto)` — selectores para encontrar el producto exacto.
   - `extractImages(page)` — URLs de fotos profesionales (preferir vista frontal blanco, laterales, detalles).
   - `extractDescription(page)` — descripción larga oficial.
   - `extractSpecs(page)` — pares clave/valor de la ficha técnica.

   Marcas con adaptador propio (basadas en el catálogo actual): **Honda Motos**, **Suzuki**, **AKT**, **Yamaha**, **Samurai**, **Whirlpool**, **LG**, **Samsung**, **Mabe**, **HACEB**, **Challenger**.

2. **Fallback genérico**: si no hay adaptador o el adaptador falla, hace `site:<dominio-marca>` en Google Images filtrado por dominio oficial (`honda.com.co`, `suzuki.com.co`, etc.).

3. **Pipeline de descarga**:
   - Filtros: PNG/JPG, mínimo 800×800, formato relación ~1:1, sin watermark detectable.
   - Procesa con `sharp` → WebP 1200×1200 + JPG + thumb 400×400.
   - Guarda primera imagen como `es_principal=true`, las demás como galería.

4. **Datos extraídos a BD**:
   - Nuevas columnas en `productos` (migración): `descripcion_larga TEXT`, `specs JSONB`, `componentes JSONB`.
   - Tabla `producto_imagenes` ya acepta múltiples imágenes — agregar `orden INTEGER` para ordenar miniaturas.
   - Si el producto ya tiene descripción/specs editadas por admin (campo `manual_override = true`), no las sobreescribe.

5. **Reporte**: `scripts/scraping/report.json` con éxitos, fallos, fuente usada, y campos faltantes por producto.

6. **Escalación al coordinador** (Playwright MCP):
   - Cuando un producto cae en `failed` o el agente A entrega un `placeholder` (no encontró imagen oficial de calidad), el **coordinador** (Claude principal) toma la lista de productos pendientes del `report.json` y los resuelve uno por uno usando **el MCP de Playwright directamente**:
     - Navega manualmente al sitio oficial de la marca o al buscador.
     - Inspecciona la página para encontrar la mejor imagen profesional del producto (fondo blanco, frontal, sin watermark).
     - Captura URL + descripción + specs y los inserta en la BD vía endpoint admin o SQL directo.
   - El criterio del coordinador es de **página seria de empresa**: rechaza imágenes con fondo de mercado, logos sobrepuestos sin sentido, capturas de pantalla, o resultados que no muestran el producto. Si después de buscar manualmente no hay nada apto, anota el producto en `report.json` como `requires_manual_upload` para que el admin lo cargue desde el modal de Pista C.
   - Esta escalación se ejecuta **después** de que Pista A termine, no en paralelo.

### Comando de ejecución

```bash
# Re-scrape todos los productos (no destructivo: solo actualiza los que no tienen manual_override)
node scripts/scraping/fetch-product-data.js

# Solo un producto
node scripts/scraping/fetch-product-data.js --only 364

# Solo una marca
node scripts/scraping/fetch-product-data.js --marca honda

# Solo limpieza de placeholders (re-intentar fallidos)
node scripts/scraping/fetch-product-data.js --retry-placeholders
```

### Driver

Usa `playwright` (no puppeteer) para mejor compatibilidad con el MCP de Playwright que el usuario ya tiene configurado. Modo headless por defecto, headed con `--debug`.

---

## Pista B — Restauración Visual del Frontend Público

### B1 — Hero (`frontend/pages/index.html` + `assets/css/components/hero-banner.css`)

**Estado actual:** texto sobrepuesto al banner pero con color que no contrasta, ocupa demasiado espacio.

**Restaurar de `7a85252`**:
- Banner con imagen completa, sin texto sobrepuesto que tape el banner; o si hay texto, con gradient overlay solo en la zona del texto y color de alto contraste.
- Altura `md:h-[700px] h-[450px]` original.

### B2 — Sección de Categorías

**Estado actual:** grid 2×2 (4 categorías en cuadrícula).

**Restaurar:** `grid-cols-2 lg:grid-cols-4` — en móvil 2 columnas, en escritorio **una sola fila de 4**.

### B3 — Productos Destacados en Hero

**Agregar de vuelta** la sección de "Productos Destacados" en `index.html` que el refactor eliminó. Tomar HTML+JS de `7a85252:frontend/pages/index.html` y `home.js`. Renderizar tarjetas usando el componente `card-producto.html` (mismo que catálogo).

### B4 — Footer (`frontend/components/footer.html`)

**Restaurar versión `7a85252`**:
- 4 columnas: Logo+descripción / Información Legal / Contacto / Métodos de pago.
- Botones de método de pago **con logos oficiales**:
  - Bancolombia: descargar logo oficial PNG.
  - Davivienda: descargar logo oficial PNG.
  - PSE, Efecty: logos oficiales.
  - Guardar en `frontend/assets/img/pagos/`.

### B5 — Catálogo (`frontend/pages/productos.html` + `productos.js`)

**Restaurar layout aprobado:**
- `flex flex-col lg:flex-row gap-10` — sidebar de filtros a la izquierda (`lg:w-64`), grid de productos a la derecha (`flex-1`).
- Grid de productos: `grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6` (tarjetas pequeñas, no las grandes actuales).
- Tarjeta: usar `card-producto.html` versión `7a85252` (h-full flex flex-col, image area cuadrada con `pt-[100%]`, padding `p-4`).

### B6 — Detalle Producto (`frontend/pages/detalle-producto.html` + `detalle-producto.js`)

**Restaurar layout aprobado**:
- `grid grid-cols-1 lg:grid-cols-2 gap-12` — imágenes izquierda, info derecha.
- Imagen principal `h-[600px]`, thumbnails `grid-cols-4 gap-3` debajo.
- Info derecha: marca chip + título + descripción + características + botón "Cotizar producto" (con asesor modal).
- **Eliminar imágenes rotas**: validar antes de renderizar; si una URL falla, no se muestra (no más "imagen no disponible").
- Componentes/Specs: tabla en sección colapsable debajo del bloque principal o como segunda fila.

### B7 — Modal de Cotización con Asesor

El módulo `frontend/assets/js/asesor-modal.js` ya existe pero **no está cableado** a los botones `.js-quote-product`. Restaurar comportamiento de `7a85252`:

1. Click en cualquier botón con `data-id` de producto → abre el modal de selección de asesor.
2. Modal muestra lista de asesores con foto/nombre/sede + botón "Aleatorio".
3. Al seleccionar asesor → arma mensaje WhatsApp con producto + asesor → abre `wa.me/<numero>?text=...`.

Asegurar que:
- `asesor-modal.js` se carga en `index.html`, `productos.html`, `detalle-producto.html`.
- CSS `asesor-modal.css` ya está incluido — verificar.
- Event listener delegado en `document` para `.js-quote-product`.

### B8 — Responsive Móvil

Verificar que cada página restaurada se ve bien a 375px (iPhone SE), 414px (iPhone 14), 768px (tablet). Usar las clases responsive originales de `7a85252` que ya estaban probadas.

### B9 — Eliminar todos los "Imagen no disponible"

Causas posibles:
- Producto sin fila en `producto_imagenes`.
- URL guardada apunta a archivo borrado.

Solución:
- El scraper (Pista A) llena todos los productos con imagen.
- En el frontend, si por alguna razón hay productos huérfanos, mostrar el placeholder SVG genérico de marca+nombre (ya existe `generatePlaceholder()` en image-processor) **pero generado al ingreso del producto**, no como mensaje de error visible.

---

## Pista C — Admin Modal de Imágenes de Producto

**Estado actual:** El modal abre pero la selección de imagen principal no funciona bien, no es estético ni intuitivo.

**Diseño:**

El modal `#admin-product-modal` (en `admin.html`) tiene un área de imágenes. Rediseñar así:

1. **Drag-and-drop zone** prominente arriba: "Arrastra imágenes o haz clic para subir".
2. **Grid de miniaturas** de las imágenes ya subidas:
   - Cada miniatura con:
     - Botón "★ Principal" (estrella amarilla si es principal, gris si no).
     - Botón "🗑 Eliminar".
     - Drag handle para reordenar.
   - Click en estrella → marca esa como principal, las demás se desmarcan.
   - El reordenamiento actualiza `producto_imagenes.orden`.
3. **Botón "Buscar imagen automáticamente"** que dispara el scraper para ese producto puntual.
4. **Validación de imagen al subir**: tamaño mínimo 500×500, formato JPG/PNG/WebP, máximo 5 MB. Si no cumple, mostrar mensaje claro.
5. **Preview grande** al hacer hover sobre una miniatura.

**Implementación**:
- HTML del modal en `frontend/pages/admin.html` (sección modal de producto).
- Lógica en `frontend/assets/js/pages/admin-crud.js`.
- Endpoint `PATCH /api/v1/admin/productos/:id/imagen-principal` (ya existe o se crea).
- Endpoint `PATCH /api/v1/admin/productos/:id/imagenes/orden` (nuevo, recibe array de IDs).

---

## Riesgos y Mitigaciones

| Riesgo | Mitigación |
|---|---|
| El scraper viola TOS de sitios de marca | Rate limit conservador (3 seg entre requests), respeto a `robots.txt`, User-Agent identificable. Si el sitio bloquea, fallback genérico. |
| Las nuevas columnas de BD rompen `admin.js` | Migración con `IF NOT EXISTS`. Endpoint admin tolera ausencia de specs. |
| Restaurar HTML viejo pierde mejoras del refactor en seguridad | Pista B no toca `core.js`, ni endpoints, ni `escape()` de innerHTML. Solo HTML estructural y CSS. |
| Modal asesor depende del endpoint `/api/v1/asesores` | Endpoint ya existe (commit `87c7a8d`). Verificar en E2E antes de cerrar. |
| Imágenes oficiales pueden estar protegidas con CDN headers | Adaptador por marca puede usar `referer` correcto, fallback descarga via screenshot del producto. |

## Criterios de Éxito

1. Home (`index.html`):
   - Hero con texto legible y banner protagonista.
   - Categorías en una sola fila desktop, 2×2 móvil.
   - Sección "Productos Destacados" visible con cards reales.
   - Footer 4 columnas con logos oficiales Bancolombia/Davivienda/PSE/Efecty.
2. Catálogo (`productos.html`):
   - Sidebar de filtros a la izquierda, grid de productos a la derecha.
   - Tarjetas pequeñas (4 por fila en desktop).
3. Detalle producto:
   - Layout 2 columnas: imágenes izquierda, info derecha.
   - 0 imágenes rotas, 0 mensajes "imagen no disponible".
   - Descripción y specs reales scrapeadas.
4. Botón "Cotizar" en cualquier card o detalle → abre modal de selección de asesor.
5. Móvil responsive en todas las páginas a 375/414/768 px.
6. Admin product modal: subida drag-and-drop, marcar principal con estrella, reordenar.
7. `npm run test:e2e` pasa sin regresiones nuevas.

## Plan de Implementación (alto nivel — el detalle lo escribe writing-plans)

1. **Coordinador** crea rama `feat/restore-approved-design`.
2. **Agente Pista A** (Scraper):
   - Diseña adaptadores por marca.
   - Implementa pipeline Playwright.
   - Crea migración BD para columnas nuevas.
   - Ejecuta scraping completo.
3. **Agente Pista B** (Visual) — en paralelo a A:
   - Restaura HTML/CSS aprobado, página por página, integrando mejoras técnicas del refactor.
   - Recablea asesor-modal.
   - Descarga logos oficiales de bancos.
4. **Agente Pista C** (Admin Modal) — en paralelo:
   - Rediseña sección de imágenes del modal.
   - Implementa endpoints faltantes.
5. **Coordinador**:
   - Verifica cada pista con screenshots y E2E.
   - Resuelve conflictos de merge si los hay.
   - **Resuelve manualmente con Playwright MCP** los productos que el scraper marcó como `failed` o `placeholder`, navegando a sitios oficiales y eligiendo la mejor imagen/descripción.
   - Reporta al usuario para aprobación final antes de PR.

## Fuera de Alcance

- Re-diseño completo de páginas no mencionadas (login, registro, perfil, sedes, contacto) — se dejan como están.
- Reactivar carrito/checkout/Wompi (el usuario confirmó modelo "solo cotización vía WhatsApp").
- Cambios en backend de autenticación/órdenes.
- Internacionalización.
