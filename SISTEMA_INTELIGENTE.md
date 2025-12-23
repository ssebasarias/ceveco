# 🤖 Sistema Inteligente de Clasificación con IA

## 🎯 Problema Resuelto

**Antes (Hardcoded):**
```javascript
if (nombre.includes('SEMIORTOPEDICO')) {
  categoria = 'Muebles';
  subcategoria = 'Colchones';
}
// ❌ Cada nuevo formato requiere modificar código
```

**Ahora (IA + BD):**
```javascript
const classification = await classifier.classifyProduct(product);
// ✅ La IA aprende de ejemplos y consulta la BD
// ✅ Se adapta a nuevos formatos automáticamente
// ✅ No duplica subcategorías existentes
```

---

## 🧠 Cómo Funciona

### 1. **Carga Estado Actual de la BD**

Al iniciar, el sistema consulta:
```sql
SELECT * FROM categorias;        -- 4 categorías fijas
SELECT * FROM subcategorias;     -- Todas las subcategorías existentes
SELECT * FROM marcas;            -- Todas las marcas existentes
```

**Ejemplo de lo que carga:**
```
Categorías:
  1. Electro Hogar
  2. Muebles y Organización
  3. Motos
  4. Herramientas STIHL

Subcategorías existentes:
  - Electro Hogar → Televisores (ID: 4)
  - Electro Hogar → Neveras (ID: 5)
  - Electro Hogar → Lavadoras (ID: 6)
  ...

Marcas existentes:
  - LG (ID: 5)
  - Samsung (ID: 6)
  - Honda (ID: 8)
  ...
```

---

### 2. **Envía Contexto a la IA**

Para cada producto, la IA recibe:

**Entrada:**
```javascript
{
  ref: "CSO 90 - 15 cm",
  nombre: "SEMIORTOPEDICO",
  categoria: "COMODISIMOS",
  archivo: "COMODISIMOS AGOSTO 15 2025.xlsx"
}
```

**Contexto que recibe la IA:**
```
CATEGORÍAS FIJAS (solo 4):
  1. Electro Hogar
  2. Muebles y Organización
  3. Motos
  4. Herramientas STIHL

SUBCATEGORÍAS QUE YA EXISTEN:
  - Electro Hogar → Televisores (ID: 4)
  - Electro Hogar → Neveras (ID: 5)
  - Muebles → Colchones (ID: X) ← Si ya existe
  ...

MARCAS QUE YA EXISTEN:
  - LG (ID: 5)
  - Honda (ID: 8)
  - Comodisimos (ID: 13) ← Si ya existe
  ...

EJEMPLOS DE CLASIFICACIÓN:
  [Ejemplos de cómo clasificar correctamente]
```

---

### 3. **IA Decide Inteligentemente**

**Caso 1: Subcategoría YA existe**
```json
{
  "subcategoria": {
    "nombre": "Televisores",
    "id": 4,
    "accion": "usar_existente",
    "razon": "La subcategoría 'Televisores' ya existe en Electro Hogar"
  }
}
```

**Caso 2: Subcategoría NO existe**
```json
{
  "subcategoria": {
    "nombre": "Colchones",
    "id": null,
    "accion": "crear_nueva",
    "razon": "No existe subcategoría para colchones en Muebles"
  }
}
```

**Caso 3: Atributo, NO subcategoría**
```json
{
  "subcategoria": {
    "nombre": "Colchones",
    "id": 15,
    "accion": "usar_existente"
  },
  "atributos": [
    {
      "nombre": "Tipo",
      "valor": "Semiortopédico"  ← NO es subcategoría
    }
  ]
}
```

---

### 4. **Crea Automáticamente si es Necesario**

```javascript
// Si la IA dice "crear_nueva"
if (classification.subcategoria.accion === 'crear_nueva') {
  // Verifica primero que no exista (doble check)
  const existing = await db.query(
    'SELECT id FROM subcategorias WHERE nombre ILIKE $1',
    [classification.subcategoria.nombre]
  );
  
  if (existing.rows.length > 0) {
    // Ya existe, usar ese
    classification.subcategoria.id = existing.rows[0].id;
  } else {
    // Crear nuevo
    const result = await db.query(
      'INSERT INTO subcategorias (id_categoria, nombre) VALUES ($1, $2) RETURNING id',
      [classification.categoria.id, classification.subcategoria.nombre]
    );
    classification.subcategoria.id = result.rows[0].id;
  }
}
```

---

## 📊 Ejemplos Reales

### Ejemplo 1: Primer Colchón (Crea Subcategoría)

**Entrada:**
```
REF: CSO 90 - 15 cm
Nombre: SEMIORTOPEDICO
```

**Proceso:**
1. IA consulta BD → No existe subcategoría "Colchones"
2. IA decide: Crear "Colchones" en "Muebles"
3. Sistema crea subcategoría automáticamente
4. Clasifica producto

**Resultado:**
```json
{
  "categoria": {"nombre": "Muebles y Organización", "id": 2},
  "subcategoria": {"nombre": "Colchones", "id": 15, "accion": "crear_nueva"},
  "marca": {"nombre": "Comodisimos", "id": 13},
  "atributos": [
    {"nombre": "Tipo", "valor": "Semiortopédico"},
    {"nombre": "Medida", "valor": "90 x 15 cm"}
  ]
}
```

---

### Ejemplo 2: Segundo Colchón (Usa Existente)

**Entrada:**
```
REF: COP 100 - 20 cm
Nombre: ORTOPEDICO
```

**Proceso:**
1. IA consulta BD → ¡Ya existe "Colchones" (ID: 15)!
2. IA decide: Usar existente
3. No crea duplicado

**Resultado:**
```json
{
  "categoria": {"nombre": "Muebles y Organización", "id": 2},
  "subcategoria": {"nombre": "Colchones", "id": 15, "accion": "usar_existente"},
  "marca": {"nombre": "Comodisimos", "id": 13},
  "atributos": [
    {"nombre": "Tipo", "valor": "Ortopédico"},  ← Diferente tipo
    {"nombre": "Medida", "valor": "100 x 20 cm"}
  ]
}
```

---

### Ejemplo 3: Nuevo Formato de Excel (Se Adapta)

**Entrada (formato nunca visto):**
```
CODIGO: XYZ-123
PRODUCTO: Escritorio Ejecutivo Madera
TIPO: Muebles de Oficina
```

**Proceso:**
1. IA analiza el contexto
2. Identifica: Es un mueble → Categoría "Muebles"
3. Busca subcategoría apropiada
4. Si no existe "Escritorios", la crea

**Resultado:**
```json
{
  "categoria": {"nombre": "Muebles y Organización", "id": 2},
  "subcategoria": {"nombre": "Escritorios", "id": 16, "accion": "crear_nueva"},
  "marca": {"nombre": "Genérica", "id": 1},
  "atributos": [
    {"nombre": "Material", "valor": "Madera"},
    {"nombre": "Tipo", "valor": "Ejecutivo"}
  ]
}
```

---

## ✅ Ventajas del Sistema Inteligente

| Aspecto | Hardcoded | IA Inteligente |
|---------|-----------|----------------|
| **Nuevos formatos** | ❌ Requiere modificar código | ✅ Se adapta automáticamente |
| **Duplicados** | ⚠️ Puede crear duplicados | ✅ Consulta BD antes de crear |
| **Mantenimiento** | ❌ Constante | ✅ Mínimo |
| **Escalabilidad** | ❌ Limitada | ✅ Infinita |
| **Aprendizaje** | ❌ No aprende | ✅ Mejora con ejemplos |

---

## 🔧 Configuración

### Requisitos:
```bash
npm install @google/generative-ai pg
```

### Variables de entorno:
```env
GEMINI_API_KEY=tu_api_key_aqui
DB_HOST=localhost
DB_PORT=5433
DB_NAME=ceveco_db
DB_USER=postgres
DB_PASSWORD=postgres
```

### Uso:
```javascript
const IntelligentClassifier = require('./lib/intelligent-classifier');

const classifier = new IntelligentClassifier(
  process.env.GEMINI_API_KEY,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
  }
);

// Clasificar producto
const classification = await classifier.classifyProduct({
  ref: 'CSO 90 - 15 cm',
  nombre: 'SEMIORTOPEDICO',
  categoria: 'COMODISIMOS',
  archivo: 'COMODISIMOS AGOSTO 15 2025.xlsx'
});

console.log(classification);
// {
//   categoria: { nombre: 'Muebles', id: 2 },
//   subcategoria: { nombre: 'Colchones', id: 15, accion: 'crear_nueva' },
//   marca: { nombre: 'Comodisimos', id: 13 },
//   atributos: [...]
// }
```

---

## 🎯 Flujo Completo

```
1. Leer Excel
   ↓
2. Para cada producto:
   ├─ Normalizar datos (ref, nombre, precios)
   ├─ Enviar a IA con contexto de BD
   ├─ IA clasifica inteligentemente
   ├─ Si necesita crear subcategoría → Crear
   ├─ Si necesita crear marca → Crear
   └─ Insertar producto con clasificación correcta
   ↓
3. Resultado: BD organizada sin duplicados
```

---

## 🚀 Beneficios

1. **Cero mantenimiento** - No más modificar código para nuevos formatos
2. **Inteligente** - Aprende de ejemplos y contexto
3. **Seguro** - Consulta BD antes de crear duplicados
4. **Flexible** - Se adapta a cualquier formato de Excel
5. **Escalable** - Funciona con 10 o 10,000 productos

---

## 💡 Próximos Pasos

1. Integrar `IntelligentClassifier` en `product-enrichment-full.js`
2. Probar con todos los Excel
3. Verificar que no crea duplicados
4. Ajustar ejemplos en el prompt si es necesario

---

¿Listo para probarlo? 🎉
