# 🚀 Sistema de Enriquecimiento Automático de Productos

## 📋 Resumen

Este sistema automatiza completamente el proceso de carga de productos desde Excel, buscando automáticamente:
- 📸 **Imágenes reales** del producto
- 📝 **Descripciones profesionales** generadas con IA
- 🔧 **Especificaciones técnicas** completas
- 🏷️ **Clasificación automática** por categoría y marca

---

## 🎯 Problema que Resuelve

**Antes:** Tenías que buscar manualmente cada producto en internet, descargar imágenes, escribir descripciones...

**Ahora:** El sistema hace todo automáticamente:
1. Lee tu Excel con referencias y precios
2. Busca cada producto en internet
3. Descarga y optimiza imágenes
4. Genera descripciones con IA
5. Extrae especificaciones técnicas
6. Inserta todo en la base de datos

---

## 📦 Instalación

### 1. Instalar dependencias

```bash
npm install xlsx axios cheerio sharp puppeteer @google/generative-ai csv-parser
```

### 2. Configurar API de IA (Opcional pero Recomendado)

Para usar la generación de descripciones con IA, necesitas una API key de Google Gemini:

1. Ve a [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Crea una API key gratuita
3. Crea un archivo `.env` en la raíz del proyecto:

```env
GEMINI_API_KEY=tu_api_key_aqui
```

---

## 🚀 Uso Básico

### Paso 1: Preparar tu Excel

Asegúrate de que tu Excel tenga este formato:

| REF | TELEVISORES | CONTADO | PROMO |
|-----|-------------|---------|-------|
| 32LR600 | TV 32" HD, USB - 2 HDMI... | 845,000 | 765,000 |
| 43LM6370 | TV 43" Full HD... | 1,465,000 | 1,330,000 |

**Columnas requeridas:**
- `REF`: Referencia del producto
- Segunda columna: Categoría (TELEVISORES, NEVERAS, etc.)
- `CONTADO`: Precio normal
- `PROMO`: Precio promocional

### Paso 2: Guardar Excel en carpeta

```bash
# Crear carpeta para archivos Excel
mkdir raw_data

# Copiar tu Excel ahí
copy productos_lg.xlsx raw_data/
```

### Paso 3: Ejecutar el enriquecimiento

```bash
node product-enrichment.js raw_data/productos_lg.xlsx
```

---

## 🎨 Modos de Operación

### Modo 1: Básico (Sin IA)

Usa solo los datos del Excel + extracción básica de especificaciones:

```bash
node product-enrichment.js raw_data/productos.xlsx
```

**Ventajas:**
- ✅ No requiere API keys
- ✅ Rápido
- ✅ Gratis

**Limitaciones:**
- ⚠️ Descripciones básicas
- ⚠️ Especificaciones limitadas

### Modo 2: Con IA (Recomendado)

Usa Gemini AI para generar descripciones profesionales:

```bash
# Configurar API key primero
export GEMINI_API_KEY=tu_api_key

# Ejecutar con IA
node product-enrichment-ai.js raw_data/productos.xlsx
```

**Ventajas:**
- ✅ Descripciones profesionales y persuasivas
- ✅ Especificaciones técnicas completas
- ✅ Clasificación automática inteligente
- ✅ Mejor SEO

**Limitaciones:**
- ⚠️ Requiere API key (gratuita)
- ⚠️ Más lento (pero más completo)

### Modo 3: Con Búsqueda Web (Más Completo)

Busca activamente en internet información del producto:

```bash
node product-enrichment-full.js raw_data/productos.xlsx
```

**Ventajas:**
- ✅ Encuentra imágenes reales del producto
- ✅ Extrae información de sitios oficiales
- ✅ Más preciso

**Limitaciones:**
- ⚠️ Más lento
- ⚠️ Puede ser bloqueado por algunos sitios

---

## 📸 Gestión de Imágenes

### Estrategia Recomendada

El sistema descarga y optimiza imágenes automáticamente:

1. **Descarga** imágenes de internet
2. **Optimiza** (redimensiona, comprime)
3. **Convierte** a WebP (formato moderno y ligero)
4. **Guarda** en `frontend/assets/images/productos/`
5. **Registra** solo la ruta en la BD

**Ejemplo de ruta guardada:**
```
/assets/images/productos/50UA8050_1.webp
/assets/images/productos/50UA8050_2.webp
```

### Configuración de Imágenes

Puedes ajustar la calidad en `product-enrichment.js`:

```javascript
images: {
  maxWidth: 1200,      // Ancho máximo
  maxHeight: 1200,     // Alto máximo
  quality: 85,         // Calidad (0-100)
  format: 'webp',      // Formato (webp/jpg/png)
  minImages: 2,        // Mínimo de imágenes por producto
  maxImages: 5         // Máximo de imágenes por producto
}
```

### Ventajas de Descargar vs URLs Externas

| Aspecto | Descargar Localmente | URLs Externas |
|---------|---------------------|---------------|
| **Velocidad** | ⚡ Muy rápida | 🐌 Depende del sitio externo |
| **Confiabilidad** | ✅ 100% disponible | ⚠️ Puede caducar |
| **Control** | ✅ Total | ❌ Ninguno |
| **Optimización** | ✅ Personalizada | ❌ No controlable |
| **Costo** | 💾 Espacio en disco | 🌐 Ancho de banda externo |

**Recomendación:** Descargar localmente siempre que sea posible.

---

## 🔧 Especificaciones Técnicas

### Extracción Automática

El sistema extrae automáticamente especificaciones del nombre del producto:

**Ejemplo:**
```
Entrada: "TV 55" 4K UHD Smart TV WebOS 2 HDMI USB"

Especificaciones extraídas:
- Tamaño de Pantalla: 55 pulgadas
- Resolución: 4K Ultra HD
- Smart TV: Sí
- Sistema Operativo: webOS
- Puertos HDMI: 2
- Puerto USB: Sí
```

### Con IA (Más Completo)

La IA puede inferir especificaciones adicionales:

```
Entrada: "TV LG 55" 4K"

Especificaciones generadas:
- Tamaño de Pantalla: 55 pulgadas
- Resolución: 4K Ultra HD (3840x2160)
- Tecnología: LED
- Smart TV: Sí (típico en modelos 4K)
- HDR: Probablemente sí
- Frecuencia: 60Hz (estándar)
```

---

## 🏷️ Clasificación Automática

### Categorías y Marcas

El sistema detecta automáticamente:

**Por palabra clave en nombre:**
```javascript
"TELEVISORES" → Categoría: Electro Hogar, Subcategoría: Televisores
"NEVERAS" → Categoría: Electro Hogar, Subcategoría: Neveras
"MOTOS" → Categoría: Motos
```

**Marcas por referencia:**
```javascript
"32LR600" (LG) → Marca: LG
"UN55" (Samsung) → Marca: Samsung
"KLV" (Kalley) → Marca: Kalley
```

### Personalizar Mapeo

Edita `product-enrichment.js`:

```javascript
categoryMapping: {
  'AIRES': { 
    id_categoria: 1, 
    id_subcategoria: 8, 
    keywords: ['aire', 'acondicionado', 'clima'] 
  },
  // Agregar más...
}
```

---

## 📊 Monitoreo y Logs

Durante la ejecución verás:

```
==================================================================
  🤖 INICIANDO ENRIQUECIMIENTO AUTOMÁTICO DE PRODUCTOS
==================================================================

📂 Leyendo archivo Excel: raw_data/productos_lg.xlsx
✅ 25 productos encontrados en Excel

📦 Total de productos a procesar: 25

==================================================================
Procesando 1/25: 32LR600
==================================================================

🔍 Buscando información para: 32LR600
📸 Buscando imágenes para: 32LR600
  ✅ Imagen guardada: 32LR600_1.webp
  ✅ Imagen guardada: 32LR600_2.webp
✅ Producto insertado: 32LR600 (ID: 1)

[... continúa con cada producto ...]

==================================================================
📊 RESUMEN FINAL
==================================================================
✅ Productos procesados exitosamente: 23
❌ Productos con errores: 2
📦 Total: 25
```

---

## ⚙️ Configuración Avanzada

### Ajustar Velocidad

Para evitar ser bloqueado por sitios web:

```javascript
// En product-enrichment.js
requestDelay: 2000  // Milisegundos entre requests (2 segundos)
```

### Fuentes de Datos

Priorizar ciertos sitios:

```javascript
productSites: [
  'lg.com',              // Sitio oficial (prioridad 1)
  'samsung.com',         // Sitio oficial
  'mercadolibre.com.co', // Marketplace
  'exito.com',           // Retail
  // ... más sitios
]
```

### Modo Debug

Para ver más detalles:

```bash
DEBUG=true node product-enrichment.js raw_data/productos.xlsx
```

---

## 🔄 Flujo Completo

```
1. Leer Excel
   ↓
2. Para cada producto:
   ├─ Buscar en Google
   ├─ Extraer URLs relevantes
   ├─ Buscar imágenes
   ├─ Descargar y optimizar imágenes
   ├─ Generar descripción con IA (opcional)
   ├─ Extraer especificaciones
   ├─ Clasificar automáticamente
   └─ Insertar en base de datos
   ↓
3. Generar reporte final
```

---

## 🎯 Casos de Uso

### Caso 1: Catálogo Pequeño (< 100 productos)

```bash
# Modo completo con IA
node product-enrichment-full.js raw_data/productos.xlsx
```

**Tiempo estimado:** 5-10 minutos

### Caso 2: Catálogo Mediano (100-500 productos)

```bash
# Modo básico primero, luego enriquecer con IA
node product-enrichment.js raw_data/productos.xlsx

# Luego enriquecer descripciones con IA
node enrich-descriptions.js
```

**Tiempo estimado:** 30-60 minutos

### Caso 3: Catálogo Grande (> 500 productos)

```bash
# Procesar por lotes
node product-enrichment.js raw_data/productos_lote1.xlsx
node product-enrichment.js raw_data/productos_lote2.xlsx
# ...
```

**Recomendación:** Dividir en archivos de 100 productos cada uno.

---

## 🛠️ Troubleshooting

### Problema: "Cannot find module 'xlsx'"

**Solución:**
```bash
npm install xlsx axios cheerio sharp
```

### Problema: "Error descargando imagen"

**Causas posibles:**
- URL inválida
- Imagen protegida
- Timeout de red

**Solución:**
- El sistema continúa con la siguiente imagen
- Revisa los logs para ver qué imágenes fallaron
- Puedes agregar manualmente después

### Problema: "Producto duplicado (SKU)"

**Solución:**
```bash
# Verificar productos existentes
node check-db.js

# Si quieres reemplazar, limpia primero
node backup-and-clean.js
```

### Problema: Descripciones muy genéricas

**Solución:**
- Usa el modo con IA (`product-enrichment-ai.js`)
- Proporciona más información en el Excel
- Edita manualmente las descripciones importantes

---

## 📈 Mejoras Futuras

### Próximas Funcionalidades

- [ ] Integración con APIs oficiales (LG, Samsung, etc.)
- [ ] Detección de productos duplicados
- [ ] Actualización automática de precios
- [ ] Generación de variantes (colores, tamaños)
- [ ] OCR para extraer specs de imágenes
- [ ] Traducción automática de specs en inglés

---

## 📞 Soporte

Si tienes problemas:

1. Revisa esta documentación
2. Verifica los logs de error
3. Ejecuta `node check-db.js` para ver el estado
4. Contacta al equipo de desarrollo

---

## 🎉 ¡Listo!

Ahora puedes cargar cientos de productos automáticamente desde Excel con:
- ✅ Imágenes reales optimizadas
- ✅ Descripciones profesionales
- ✅ Especificaciones completas
- ✅ Clasificación automática

**Siguiente paso:** Ejecuta tu primer enriquecimiento:

```bash
node product-enrichment.js raw_data/productos_lg.xlsx
```

¡Buena suerte! 🚀
