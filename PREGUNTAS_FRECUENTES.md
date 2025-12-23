# 📚 Guía Completa - Respuestas a tus Preguntas

## ❓ Pregunta 1: ¿Necesito convertir Excel a CSV?

### Respuesta: **NO es necesario**

El sistema lee directamente archivos Excel (`.xlsx`, `.xls`) sin necesidad de convertir a CSV.

**Formatos soportados:**
- ✅ Excel (.xlsx, .xls)
- ✅ CSV (.csv)
- ✅ Múltiples hojas en un mismo Excel

**Ubicación de archivos:**
```
ceveco/
└── raw_data/          ← Coloca tus Excel aquí
    ├── productos_lg.xlsx
    ├── productos_motos.xlsx
    ├── productos_muebles.xlsx
    └── ...
```

**Ingesta automática:**
```bash
# Procesar un archivo
node product-enrichment-full.js raw_data/productos_lg.xlsx

# Procesar múltiples archivos
node product-enrichment-full.js raw_data/*.xlsx
```

---

## ❓ Pregunta 2: Diferentes Formatos de Excel

### Respuesta: **El sistema se adapta automáticamente**

He creado un **normalizador inteligente** que detecta y adapta diferentes formatos:

### Formatos Detectados Automáticamente:

#### Formato 1: LG/Samsung (tu ejemplo original)
```
| REF     | TELEVISORES              | CONTADO   | PROMO     |
|---------|--------------------------|-----------|-----------|
| 32LR600 | TV 32" HD Smart TV...    | 845,000   | 765,000   |
```

#### Formato 2: Motos (tu imagen)
```
| REFERENCIA  | MODELO | CONTADO   | PROMOCION |
|-------------|--------|-----------|-----------|
| WAVE 110S   | 2026   | 7,750,000 | 7,550,000 |
```

#### Formato 3: Genérico
```
| CODIGO | DESCRIPCION | PRECIO | OFERTA |
|--------|-------------|--------|--------|
| ...    | ...         | ...    | ...    |
```

### Cómo Funciona el Normalizador:

```javascript
// El sistema busca automáticamente estas variaciones:
Referencia: ['REF', 'REFERENCIA', 'CODIGO', 'SKU', 'REFERENCE']
Modelo: ['MODELO', 'MODEL', 'DESCRIPCION', 'NOMBRE', 'PRODUCTO']
Precio: ['CONTADO', 'PRECIO', 'PRICE', 'VALOR']
Promo: ['PROMO', 'PROMOCION', 'OFERTA', 'DESCUENTO']
```

### Probar el Normalizador:

```bash
# Ver cómo detecta tu Excel
node lib/excel-normalizer.js raw_data/tu_archivo.xlsx
```

**Salida esperada:**
```
📂 Leyendo Excel: tu_archivo.xlsx
📋 Columnas detectadas: REFERENCIA, MODELO, CONTADO, PROMOCION

🔍 Mapeo de columnas:
  - Referencia: REFERENCIA ✅
  - Modelo/Descripción: MODELO ✅
  - Precio Contado: CONTADO ✅
  - Precio Promo: PROMOCION ✅

✅ 25 productos normalizados de 25 filas

📊 Muestra del primer producto:
{
  "ref": "WAVE 110S CBS",
  "nombre": "2026",
  "categoria": "MOTOS",
  "precio_contado": 7750000,
  "precio_promo": 7550000
}
```

---

## ❓ Pregunta 3: Generar Descripciones desde Especificaciones

### Respuesta: **¡SÍ! La IA puede hacer exactamente eso**

He agregado una función especial: `generateDescriptionFromSpecs()`

### Cómo Funciona:

#### Entrada (Especificaciones técnicas):
```json
{
  "Color": "Azul cielo",
  "Material": "Tela premium",
  "Dimensiones": "200x90x85 cm",
  "Tipo": "Sofá 3 puestos",
  "Acabados": "Costuras reforzadas",
  "Patas": "Madera maciza"
}
```

#### Salida (Descripción generada por IA):

**Descripción Corta:**
```
Elegante sofá de 3 puestos en tela premium azul cielo. 
Diseño moderno con acabados de alta calidad y patas de madera maciza.
```

**Descripción Larga:**
```html
<div class="product-description">
  <h3>Sobre este producto</h3>
  <p>
    Este elegante sofá en tono azul cielo aporta un toque de sofisticación 
    a cualquier espacio. Fabricado con tela premium de primera calidad, 
    combina durabilidad excepcional con un confort incomparable.
  </p>
  
  <h3>Características destacadas</h3>
  <p>
    Sus generosas dimensiones de 200x90x85 cm lo hacen ideal para salas 
    amplias donde el estilo y la comodidad son prioridad. El diseño de 
    3 puestos permite acomodar cómodamente a toda la familia, mientras 
    que sus costuras reforzadas garantizan años de uso intensivo.
  </p>
  
  <p>
    Las patas de madera maciza no solo aportan estabilidad superior, 
    sino que también añaden un toque de calidez natural que complementa 
    perfectamente el tono azul cielo de la tapicería.
  </p>
  
  <h3>¿Por qué elegirlo?</h3>
  <p>
    Ideal para quienes buscan un mueble que combine estética moderna 
    con funcionalidad práctica. Perfecto para salas de estar, estudios 
    o espacios de entretenimiento donde el confort y el estilo son 
    igualmente importantes.
  </p>
</div>
```

### Ejemplo Real con Motos:

#### Entrada (Especificaciones):
```json
{
  "Modelo": "2026",
  "Cilindraje": "110cc",
  "Tipo": "Moto urbana",
  "Sistema de frenos": "CBS (Combined Braking System)",
  "Arranque": "Eléctrico y pedal"
}
```

#### Salida (Descripción generada):
```
Moto urbana Honda Wave 110S CBS modelo 2026. Motor de 110cc con 
sistema de frenos combinados CBS para mayor seguridad. Arranque 
eléctrico y pedal de respaldo. Ideal para ciudad con excelente 
rendimiento de combustible.
```

### Cómo Usar en el Código:

```javascript
const AIEnricher = require('./lib/ai-enricher');
const enricher = new AIEnricher(process.env.GEMINI_API_KEY);

// Generar descripción desde specs
const specs = {
  "Color": "Azul cielo",
  "Material": "Tela premium",
  "Dimensiones": "200x90x85 cm",
  "Tipo": "Sofá 3 puestos"
};

const description = await enricher.generateDescriptionFromSpecs(
  'SOF-001',           // Referencia
  'Sofá 3 puestos',    // Nombre
  'MUEBLES',           // Categoría
  specs                // Especificaciones
);

console.log(description.descripcion_corta);
console.log(description.descripcion_larga);
```

---

## 🎯 Flujo Completo Recomendado

### Paso 1: Preparar tus Excel

```
raw_data/
├── productos_lg.xlsx        (Formato: REF, TELEVISORES, CONTADO, PROMO)
├── productos_motos.xlsx     (Formato: REFERENCIA, MODELO, CONTADO, PROMOCION)
└── productos_muebles.xlsx   (Formato: CODIGO, DESCRIPCION, PRECIO, OFERTA)
```

### Paso 2: Probar Normalización

```bash
# Ver cómo se detecta cada archivo
node lib/excel-normalizer.js raw_data/productos_lg.xlsx
node lib/excel-normalizer.js raw_data/productos_motos.xlsx
node lib/excel-normalizer.js raw_data/productos_muebles.xlsx
```

### Paso 3: Procesar con IA

```bash
# Configurar API key en .env
echo "GEMINI_API_KEY=tu_api_key_aqui" >> backend/.env

# Procesar archivos
node product-enrichment-full.js raw_data/productos_lg.xlsx
node product-enrichment-full.js raw_data/productos_motos.xlsx
node product-enrichment-full.js raw_data/productos_muebles.xlsx
```

### Paso 4: Verificar Resultados

```bash
# Ver productos insertados
node check-db.js

# Ver productos en la BD
psql -h localhost -p 5433 -U postgres -d ceveco_db -c "
  SELECT 
    p.sku,
    p.nombre,
    p.descripcion_corta,
    c.nombre as categoria,
    m.nombre as marca
  FROM productos p
  JOIN categorias c ON p.id_categoria = c.id_categoria
  JOIN marcas m ON p.id_marca = m.id_marca
  ORDER BY p.fecha_creacion DESC
  LIMIT 10;
"
```

---

## 🔧 Configuración Avanzada

### Para Productos con Especificaciones en Sitios Web

Si encuentras que los sitios oficiales tienen especificaciones pero no descripciones:

```javascript
// En product-enrichment-full.js

// 1. Extraer specs del sitio web
const specs = await scrapeProductSpecs(productUrl);

// 2. Generar descripción desde specs
const description = await aiEnricher.generateDescriptionFromSpecs(
  product.ref,
  product.nombre,
  product.categoria,
  specs
);

// 3. Usar la descripción generada
enrichedData.descripcion_corta = description.descripcion_corta;
enrichedData.descripcion_larga = description.descripcion_larga;
```

### Ejemplo de Scraping de Specs:

```javascript
async function scrapeProductSpecs(url) {
  const response = await axios.get(url);
  const $ = cheerio.load(response.data);
  
  const specs = {};
  
  // Buscar tabla de especificaciones
  $('.specs-table tr, .specifications tr').each((i, elem) => {
    const key = $(elem).find('td:first-child, th').text().trim();
    const value = $(elem).find('td:last-child').text().trim();
    if (key && value) {
      specs[key] = value;
    }
  });
  
  return specs;
}
```

---

## 📊 Comparación de Métodos

| Método | Velocidad | Calidad | Costo | Recomendado Para |
|--------|-----------|---------|-------|------------------|
| **Básico** (sin IA) | ⚡⚡⚡ Muy rápido | ⭐⭐ Básico | 💰 Gratis | Pruebas rápidas |
| **Con IA** (descripciones) | ⚡⚡ Rápido | ⭐⭐⭐⭐ Excelente | 💰 Gratis* | Producción |
| **Con IA + Specs** | ⚡ Moderado | ⭐⭐⭐⭐⭐ Premium | 💰 Gratis* | Catálogo premium |
| **Completo** (IA + Web) | 🐌 Lento | ⭐⭐⭐⭐⭐ Premium | 💰 Gratis* | Catálogo completo |

*Gratis con tier gratuito de Gemini AI

---

## 🎨 Ejemplos de Transformación

### Ejemplo 1: Televisor

**Specs extraídas:**
```
- Tamaño: 50"
- Resolución: 4K UHD
- Smart TV: Sí
- Sistema: webOS
- HDMI: 2 puertos
```

**Descripción generada:**
```
Televisor LG de 50 pulgadas que transforma tu experiencia de 
entretenimiento con resolución 4K Ultra HD. Su sistema operativo 
webOS te permite acceder a tus aplicaciones favoritas de streaming 
con facilidad. Los 2 puertos HDMI ofrecen conectividad versátil 
para todos tus dispositivos.
```

### Ejemplo 2: Moto

**Specs extraídas:**
```
- Modelo: 2026
- Cilindraje: 110cc
- Frenos: CBS
- Arranque: Eléctrico
```

**Descripción generada:**
```
Moto Honda Wave 110S modelo 2026, perfecta para movilidad urbana. 
Su motor de 110cc ofrece excelente rendimiento y economía de 
combustible. El sistema de frenos combinados CBS proporciona 
frenado seguro y balanceado, mientras que el arranque eléctrico 
garantiza partidas confiables en cualquier situación.
```

### Ejemplo 3: Sofá

**Specs extraídas:**
```
- Color: Azul cielo
- Material: Tela
- Puestos: 3
- Dimensiones: 200x90x85cm
```

**Descripción generada:**
```
Elegante sofá de 3 puestos en tono azul cielo que aporta frescura 
y estilo a tu sala. Tapizado en tela resistente y confortable, 
ideal para el uso diario. Sus dimensiones de 200x90x85 cm lo hacen 
perfecto para espacios amplios donde la comodidad y el diseño son 
prioridad.
```

---

## ✅ Resumen de Respuestas

1. **¿Convertir a CSV?** → NO, usa Excel directamente
2. **¿Formatos diferentes?** → El sistema se adapta automáticamente
3. **¿Descripciones desde specs?** → SÍ, con IA genera descripciones naturales

---

## 🚀 Siguiente Paso

```bash
# 1. Coloca tus Excel en raw_data/
cp mis_productos.xlsx raw_data/

# 2. Prueba la normalización
node lib/excel-normalizer.js raw_data/mis_productos.xlsx

# 3. Procesa con IA
node product-enrichment-full.js raw_data/mis_productos.xlsx

# 4. Verifica
node check-db.js
```

¡Listo! El sistema manejará automáticamente todos los formatos y generará descripciones profesionales desde las especificaciones. 🎉
