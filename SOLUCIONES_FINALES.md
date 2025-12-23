# 📋 Respuestas a tus Nuevas Preguntas

## ✅ Resumen de Soluciones

### 1️⃣ **SKU vs Referencia - RESUELTO**

**Decisión:** Usar la referencia como SKU directamente

**Si NO hay referencia:** El sistema genera SKU automático

**Formato de SKU generado:**
```
MARCA-CATEGORIA-NUMERO
Ejemplos:
- LG-TV-001
- HON-MOT-042
- XX-SOU-001  (si no detecta marca)
```

**Ventajas:**
- ✅ Simple y directo
- ✅ Único por producto
- ✅ Fácil de rastrear
- ✅ No duplica información

---

### 2️⃣ **Logo y Encabezados en Excel - RESUELTO**

He visto tu imagen con:
- Logo de CEVECO
- Título "LYL SOUND"
- Fecha "DICIEMBRE 06 DE 2025"
- Luego las columnas reales (REF., CABINAS, CONTADO, PROMOCIÓN)

**Solución Implementada:**

El sistema ahora:
1. ✅ Lee el Excel fila por fila
2. ✅ Busca la fila que contiene "REF" o "REFERENCIA" o "MODELO"
3. ✅ Ignora todo lo anterior (logos, títulos, fechas)
4. ✅ Usa esa fila como encabezados
5. ✅ Procesa solo las filas de datos

**Ejemplo de detección:**
```
Fila 1: [Logo CEVECO] → ❌ Ignorada
Fila 2: "LYL SOUND" → ❌ Ignorada
Fila 3: "DICIEMBRE 06 DE 2025" → ❌ Ignorada
Fila 4: "REF. | CABINAS | CONTADO | PROMOCIÓN" → ✅ ENCABEZADOS
Fila 5+: Datos de productos → ✅ Procesados
```

---

### 3️⃣ **Excel sin Referencia - RESUELTO**

**Problema:** Algunos Excel no tienen columna de referencia

**Solución:** Sistema de fallback inteligente

```javascript
Si tiene REF:
  → Usar REF como SKU
  
Si NO tiene REF:
  → Generar SKU automático desde:
     - Nombre del producto
     - Categoría (del nombre de la hoja)
     - Marca (detectada del nombre)
  → Formato: MARCA-CAT-001
```

**Ejemplo Real:**

```
Excel sin REF:
| CABINAS | CONTADO | PROMOCIÓN |
|---------|---------|-----------|
| Cabina RECARGABLE 8" 250W... | 920,000 | 840,000 |

SKU Generado:
→ XX-SOU-001  (XX=sin marca, SOU=SOUND de la hoja, 001=contador)
```

**Validación de Productos:**

El sistema también:
- ✅ Compara nombre del Excel vs nombre encontrado en internet
- ✅ Si no coincide, marca como "revisar manualmente"
- ✅ Genera reporte de productos dudosos

---

### 4️⃣ **Carpeta para Excel - CREADA**

✅ **Carpeta creada:** `raw_data/`

**Estructura:**
```
ceveco/
└── raw_data/          ← COLOCA TUS EXCEL AQUÍ
    ├── productos_lg.xlsx
    ├── productos_motos.xlsx
    ├── productos_sound.xlsx
    └── ... (todos tus Excel)
```

**Uso:**
```bash
# Procesar un archivo
node product-enrichment-full.js raw_data/productos_lg.xlsx

# Procesar todos los archivos
node product-enrichment-full.js raw_data/*.xlsx
```

---

## 🎯 Flujo Completo Actualizado

### Paso 1: Coloca tus Excel

```bash
# Copia todos tus Excel a raw_data/
cp mis_excel/*.xlsx raw_data/
```

### Paso 2: Prueba el Normalizador

```bash
# Ver cómo detecta cada archivo
node lib/excel-normalizer.js raw_data/productos_sound.xlsx
```

**Salida esperada:**
```
📂 Leyendo Excel: raw_data/productos_sound.xlsx
📊 Total de filas en Excel: 25
✅ Encabezados encontrados en fila 4: REF., CABINAS, CONTADO, PROMOCIÓN

🔍 Mapeo de columnas:
  - Referencia: REF. ✅
  - Modelo/Descripción: CABINAS ✅
  - Precio Contado: CONTADO ✅
  - Precio Promo: PROMOCIÓN ✅

  ℹ️  SKU generado: XX-SOU-001 para "Cabina RECARGABLE..."

✅ 20 productos normalizados de 20 filas de datos

📊 Muestra del primer producto:
{
  "ref": "10007772237",
  "nombre": "Cabina RECARGABLE, con parlante de 8\", 250 Watts...",
  "categoria": "LYL SOUND",
  "precio_contado": 920000,
  "precio_promo": 840000
}
```

### Paso 3: Procesar con IA

```bash
# Procesar archivo por archivo
node product-enrichment-full.js raw_data/productos_sound.xlsx
```

### Paso 4: Verificar

```bash
node check-db.js
```

---

## 🔧 Configuración de SKU

### Opción 1: Usar Referencia como SKU (Actual)

```javascript
// En product-enrichment-full.js
sku: product.ref  // Simple y directo
```

### Opción 2: Generar SKU Personalizado

```javascript
// Puedes personalizar el formato en lib/excel-normalizer.js
generateSKU(nombre, categoria, marca) {
  // Tu formato personalizado aquí
  return `CEVECO-${categoria}-${contador}`;
}
```

---

## 📊 Manejo de Diferentes Formatos

El sistema ahora maneja automáticamente:

### Formato 1: Con Logo y Título
```
[Logo CEVECO]
LYL SOUND
DICIEMBRE 06 DE 2025
REF. | CABINAS | CONTADO | PROMOCIÓN
10007772237 | Cabina... | 920,000 | 840,000
```

### Formato 2: Simple
```
REF | TELEVISORES | CONTADO | PROMO
32LR600 | TV 32"... | 845,000 | 765,000
```

### Formato 3: Sin Referencia
```
MODELO | DESCRIPCION | PRECIO
2026 | Moto Honda... | 7,750,000
```
→ SKU generado: `HON-MOT-001`

---

## ⚠️ Validación de Productos

Para evitar meter productos incorrectos:

```javascript
// El sistema compara:
1. Nombre del Excel
2. Nombre encontrado en internet
3. Especificaciones

// Si no coinciden:
→ Marca como "revisar"
→ Genera reporte
→ No inserta automáticamente
```

**Reporte generado:**
```
productos_a_revisar.txt:
- SKU: XX-SOU-001
  Nombre Excel: "Cabina RECARGABLE 8"..."
  Nombre Web: "Bocina Bluetooth XYZ"
  Coincidencia: 30%
  Acción: REVISAR MANUALMENTE
```

---

## 📁 Estructura Final

```
ceveco/
├── raw_data/                    ← TUS EXCEL AQUÍ
│   ├── productos_lg.xlsx
│   ├── productos_motos.xlsx
│   ├── productos_sound.xlsx
│   └── ...
├── lib/
│   ├── excel-normalizer.js      ← Detecta formatos
│   ├── ai-enricher.js           ← Genera descripciones
│   └── product-searcher.js      ← Busca en web
├── frontend/assets/images/productos/  ← Imágenes descargadas
├── backups/                     ← Backups de BD
└── product-enrichment-full.js   ← Script principal
```

---

## 🚀 Comandos Rápidos

```bash
# 1. Probar normalizador con tu Excel
node lib/excel-normalizer.js raw_data/tu_archivo.xlsx

# 2. Procesar productos
node product-enrichment-full.js raw_data/tu_archivo.xlsx

# 3. Verificar resultados
node check-db.js

# 4. Crear backup
node backup-and-clean.js
```

---

## ✅ Checklist Final

- [x] SKU: Usa referencia o genera automático
- [x] Logos: Sistema los detecta y salta
- [x] Sin referencia: Genera SKU automático
- [x] Carpeta raw_data: Creada y lista
- [x] Múltiples formatos: Detectados automáticamente
- [x] Validación: Compara con web para evitar errores

---

## 💡 Recomendaciones

1. **Prueba primero con 1 archivo pequeño**
   ```bash
   # Crea un Excel con 5-10 productos
   node lib/excel-normalizer.js raw_data/prueba.xlsx
   ```

2. **Verifica la detección de columnas**
   - El sistema te mostrará qué columnas detectó
   - Si algo está mal, ajusta los nombres en el Excel

3. **Procesa por lotes**
   - No proceses todos los Excel a la vez
   - Hazlo de a uno para verificar resultados

4. **Revisa productos sin referencia**
   - El sistema generará SKUs automáticos
   - Verifica que sean correctos

---

¿Listo para probar? 🎉

```bash
# Coloca un Excel en raw_data/ y ejecuta:
node lib/excel-normalizer.js raw_data/tu_primer_archivo.xlsx
```
