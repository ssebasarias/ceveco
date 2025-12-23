# 🎯 Resumen Ejecutivo - Sistema de Enriquecimiento Automático

## ✅ Problema Resuelto

**Antes:** Tenías que buscar manualmente cada producto en internet, descargar imágenes, escribir descripciones, extraer especificaciones... ¡Un trabajo de semanas!

**Ahora:** El sistema automatiza TODO el proceso:
- ✅ Lee tu Excel con referencias y precios
- ✅ Busca automáticamente cada producto en internet
- ✅ Descarga y optimiza imágenes (formato WebP, comprimidas)
- ✅ Genera descripciones profesionales con IA
- ✅ Extrae especificaciones técnicas
- ✅ Clasifica por categoría y marca
- ✅ Inserta todo en la base de datos

**Resultado:** De semanas de trabajo manual a minutos de procesamiento automático.

---

## 🚀 Inicio Rápido (3 Pasos)

### 1. Instalar Dependencias

```bash
npm install xlsx axios cheerio sharp @google/generative-ai dotenv
```

### 2. Preparar Excel

Coloca tu Excel en `raw_data/` con este formato:

| REF | TELEVISORES | CONTADO | PROMO |
|-----|-------------|---------|-------|
| 32LR600 | TV 32" HD Smart... | 845,000 | 765,000 |

### 3. Ejecutar

```bash
node product-enrichment.js raw_data/productos.xlsx
```

¡Listo! El sistema procesará todos los productos automáticamente.

---

## 📊 Características Principales

### 🔍 Búsqueda Inteligente
- Busca automáticamente en Google
- Extrae información de sitios oficiales
- Encuentra imágenes de alta calidad

### 🤖 IA Generativa
- Descripciones profesionales y persuasivas
- Extracción de especificaciones técnicas
- Clasificación automática por categoría

### 📸 Gestión de Imágenes
- Descarga automática
- Optimización (WebP, compresión)
- Almacenamiento local (rápido y confiable)
- Mínimo 2 imágenes por producto

### 💾 Base de Datos
- Inserción automática
- Relaciones correctas (categorías, marcas)
- Especificaciones estructuradas
- Transacciones seguras

---

## 🎨 Modos de Uso

### Modo 1: Básico (Sin APIs)
```bash
node product-enrichment.js raw_data/productos.xlsx
```
- ✅ Gratis, sin configuración
- ✅ Extracción básica de specs
- ⚠️ Descripciones simples

### Modo 2: Con IA (Recomendado)
```bash
# Configurar primero en .env:
# GEMINI_API_KEY=tu_api_key

node product-enrichment-full.js raw_data/productos.xlsx
```
- ✅ Descripciones profesionales
- ✅ Specs completas
- ✅ Mejor clasificación
- ⚠️ Requiere API key (gratuita)

### Modo 3: Completo (IA + Web)
```bash
node product-enrichment-full.js raw_data/productos.xlsx --web-search
```
- ✅ Búsqueda real en internet
- ✅ Imágenes reales del producto
- ✅ Información más precisa
- ⚠️ Más lento pero más completo

---

## 📁 Estructura de Archivos

```
ceveco/
├── product-enrichment.js          # Script básico
├── product-enrichment-full.js     # Script completo (IA + Web)
├── lib/
│   ├── product-searcher.js        # Búsqueda web
│   └── ai-enricher.js             # Enriquecimiento con IA
├── raw_data/                      # Tus archivos Excel aquí
│   └── productos.xlsx
├── frontend/assets/images/productos/  # Imágenes descargadas
├── backups/                       # Backups de BD
└── docs/
    ├── ENRIQUECIMIENTO_AUTOMATICO.md  # Documentación completa
    ├── GUIA_CARGA_PRODUCTOS.md        # Guía de carga
    └── BACKUP_README.md               # Guía de backups
```

---

## 🔧 Configuración

### Variables de Entorno (.env)

```env
# Base de datos
DB_HOST=localhost
DB_PORT=5433
DB_NAME=ceveco_db
DB_USER=postgres
DB_PASSWORD=postgres

# IA (Opcional - para descripciones profesionales)
GEMINI_API_KEY=tu_api_key_aqui
```

### Obtener API Key de Gemini (Gratis)

1. Ve a [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Crea una API key (gratis, sin tarjeta de crédito)
3. Agrégala al archivo `.env`

---

## 📸 Gestión de Imágenes

### ¿Por qué descargar localmente?

| Aspecto | Local | URLs Externas |
|---------|-------|---------------|
| Velocidad | ⚡ Muy rápida | 🐌 Lenta |
| Confiabilidad | ✅ 100% | ⚠️ Puede caducar |
| Control | ✅ Total | ❌ Ninguno |
| Optimización | ✅ WebP, comprimido | ❌ No controlable |

### Configuración de Imágenes

```javascript
images: {
  maxWidth: 1200,      // Ancho máximo
  maxHeight: 1200,     // Alto máximo
  quality: 85,         // Calidad (0-100)
  format: 'webp',      // Formato moderno
  minImages: 2,        // Mínimo por producto
  maxImages: 5         // Máximo por producto
}
```

---

## 📊 Ejemplo de Procesamiento

```
==================================================================
  🤖 INICIANDO ENRIQUECIMIENTO AUTOMÁTICO DE PRODUCTOS
==================================================================

📂 Leyendo Excel: productos_lg.xlsx
✅ 25 productos válidos encontrados

📊 Configuración:
  - IA: ✅ Habilitada
  - Búsqueda Web: ✅ Habilitada

==================================================================
Procesando: 32LR600 - TV 32" HD Smart TV WebOS...
==================================================================

🔍 Buscando en web...
  📄 5 URLs encontradas
  📸 10 imágenes encontradas
  ✅ Imagen guardada: 32LR600_1.webp
  ✅ Imagen guardada: 32LR600_2.webp

🤖 Generando con IA...
  ✅ Descripción generada
  ✅ 8 especificaciones extraídas

✅ Producto insertado: 32LR600 (ID: 1)

[... continúa con cada producto ...]

==================================================================
📊 RESUMEN FINAL
==================================================================
✅ Exitosos: 23
❌ Errores: 2
📦 Total: 25
```

---

## 🎯 Casos de Uso

### Catálogo Pequeño (< 100 productos)
```bash
node product-enrichment-full.js raw_data/productos.xlsx --web-search
```
**Tiempo:** 10-20 minutos

### Catálogo Mediano (100-500 productos)
```bash
# Procesar en modo básico primero
node product-enrichment.js raw_data/productos.xlsx

# Luego enriquecer con IA si es necesario
```
**Tiempo:** 30-60 minutos

### Catálogo Grande (> 500 productos)
```bash
# Dividir en lotes de 100 productos
node product-enrichment.js raw_data/lote1.xlsx
node product-enrichment.js raw_data/lote2.xlsx
# ...
```
**Recomendación:** Procesar por lotes

---

## 🛡️ Seguridad y Backups

### Antes de Cargar Productos

```bash
# Crear backup de la BD actual
node backup-and-clean.js
# (Escribe "NO" si solo quieres backup)
```

### Después de Cargar

```bash
# Verificar que todo esté bien
node check-db.js

# Crear backup de los nuevos productos
node backup-and-clean.js
# (Escribe "NO" cuando pregunte)
```

### Restaurar si algo sale mal

```bash
node restore-backup.js ceveco_backup_2025-12-22T14-38-17.sql
```

---

## 📚 Documentación Completa

- **[ENRIQUECIMIENTO_AUTOMATICO.md](./ENRIQUECIMIENTO_AUTOMATICO.md)** - Guía completa del sistema
- **[GUIA_CARGA_PRODUCTOS.md](./GUIA_CARGA_PRODUCTOS.md)** - Métodos de carga manual
- **[BACKUP_README.md](./BACKUP_README.md)** - Sistema de backups

---

## ❓ Preguntas Frecuentes

### ¿Necesito pagar por APIs?
No. Gemini AI tiene un tier gratuito muy generoso.

### ¿Las imágenes tienen copyright?
Usa imágenes de sitios oficiales o marketplaces. Para producción, considera usar imágenes propias.

### ¿Puedo personalizar las descripciones?
Sí. Edita el prompt en `lib/ai-enricher.js` o edita manualmente después.

### ¿Qué pasa si hay errores?
El sistema usa transacciones. Si falla un producto, continúa con el siguiente.

### ¿Puedo procesar el mismo Excel dos veces?
No, dará error de SKU duplicado. Limpia la BD primero con `backup-and-clean.js`.

---

## 🎉 ¡Listo para Comenzar!

```bash
# 1. Instalar
npm install xlsx axios cheerio sharp @google/generative-ai dotenv

# 2. Configurar (opcional)
# Agregar GEMINI_API_KEY al .env

# 3. Ejecutar
node product-enrichment.js raw_data/tu_archivo.xlsx

# 4. Verificar
node check-db.js
```

**¡Disfruta de tu catálogo automatizado!** 🚀

---

## 📞 Soporte

Si tienes problemas:
1. Revisa la documentación completa
2. Verifica los logs de error
3. Ejecuta `node check-db.js`
4. Contacta al equipo de desarrollo

---

**Creado con ❤️ para Ceveco**
