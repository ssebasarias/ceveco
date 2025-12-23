# 📊 Estructura de Categorías - Ceveco

## 🎯 Regla Principal

**Solo existen 4 categorías principales (FIJAS):**

1. **Electro Hogar**
2. **Muebles y Organización**
3. **Motos**
4. **Herramientas STIHL**

---

## 📁 Estructura Completa

### 1️⃣ **Electro Hogar** (ID: 1)

**Subcategorías:**
- Televisores (ID: 4)
- Neveras (ID: 5)
- Lavadoras (ID: 6)
- Estufas (ID: 7)
- Aires Acondicionados (ID: 8)
- Audio/Sonido (crear si no existe)

**Marcas:**
- LG, Samsung, Kalley, Haceb, Hyundai, LYL Sound

**Ejemplo:**
```
Categoría: Electro Hogar
Subcategoría: Televisores
Producto: TV LG 32" HD Smart TV
```

---

### 2️⃣ **Muebles y Organización** (ID: 2)

**Subcategorías:**
- Colchones
- Escritorios
- Sillas
- Archivadores
- Estanterías

**Marcas:**
- Comodisimos, Inval, Maximuebles

**Ejemplo - Colchones:**
```
Categoría: Muebles y Organización
Subcategoría: Colchones
Producto: Colchón Semiortopédico CSO 90 - 15 cm
Atributo "Tipo": Semiortopédico  ← Esto NO es categoría ni subcategoría
```

**Tipos de Colchones (como atributos):**
- Semiortopédico
- Ortopédico
- Pillow Top
- Resortado
- Espuma

---

### 3️⃣ **Motos** (ID: 3)

**Subcategorías:**
- Motos Urbanas
- Motos Deportivas
- Accesorios

**Marcas:**
- Honda, Suzuki, Yamaha

**Ejemplo:**
```
Categoría: Motos
Subcategoría: Motos Urbanas
Producto: Honda Wave 110S CBS Modelo 2026
REF: WAVE 110S CBS  ← Esta ES el nombre de la moto
```

---

### 4️⃣ **Herramientas STIHL** (ID: 4)

**Subcategorías:**
- Motosierras
- Guadañas
- Sopladores
- Desbrozadoras

**Marca:**
- STIHL (única)

**Ejemplo:**
```
Categoría: Herramientas STIHL
Subcategoría: Motosierras
Producto: Motosierra STIHL GTA 26 10CM
```

---

## 🔍 Detección Automática

### Ejemplo 1: COMODISIMOS

**Excel:**
```
REF. - MEDIDA          | CONTADO | PROMOCION
SEMIORTOPEDICO         |         |
CSO 90 - 15 cm        | 705,000 | 635,000
```

**Detección:**
1. Palabra clave: "SEMIORTOPEDICO" → Categoría: **Muebles**
2. Palabra clave: "COLCHON" o "CSO" → Subcategoría: **Colchones**
3. "SEMIORTOPEDICO" → Atributo `tipo_colchon`: **Semiortopédico**

**Resultado:**
```javascript
{
  ref: "CSO-90-15",
  nombre: "Colchón Semiortopédico CSO 90 - 15 cm",
  id_categoria: 2,  // Muebles
  id_subcategoria: X,  // Colchones
  id_marca: 13,  // Comodisimos
  atributos: [
    { nombre: "Tipo de Colchón", valor: "Semiortopédico" },
    { nombre: "Medida", valor: "90 x 15 cm" }
  ]
}
```

---

### Ejemplo 2: MOTOS (Honda)

**Excel:**
```
REFERENCIA     | MODELO | CONTADO   | PROMOCION
WAVE 110S CBS  | 2026   | 7,750,000 | 7,550,000
```

**Detección:**
1. Palabra clave: "WAVE" → Categoría: **Motos**
2. Palabra clave: "WAVE" + "110" → Subcategoría: **Motos Urbanas**
3. Marca: "WAVE" → **Honda**

**Resultado:**
```javascript
{
  ref: "WAVE 110S CBS",
  nombre: "Honda Wave 110S CBS Modelo 2026",  // REF + Modelo
  id_categoria: 3,  // Motos
  id_subcategoria: X,  // Motos Urbanas
  id_marca: 8,  // Honda
  atributos: [
    { nombre: "Año Modelo", valor: "2026" },
    { nombre: "Cilindraje", valor: "110cc" }
  ]
}
```

---

### Ejemplo 3: STIHL

**Excel:**
```
MOTOSIERRA  | CODIGO       | DESCRIPCIÓN                    | CONTADO   | PROMO
GTA 26 10CM | GA010116911  | Cadena 1/4", cubierta...      | 1,065,000 | 910,000
```

**Detección:**
1. Palabra clave: "MOTOSIERRA" → Categoría: **STIHL**
2. Palabra clave: "MOTOSIERRA" → Subcategoría: **Motosierras**
3. Marca: Siempre **STIHL**

**Resultado:**
```javascript
{
  ref: "GA010116911",
  nombre: "Motosierra STIHL GTA 26 10CM",
  id_categoria: 4,  // STIHL
  id_subcategoria: X,  // Motosierras
  id_marca: 11,  // STIHL
  atributos: [
    { nombre: "Modelo", valor: "GTA 26" },
    { nombre: "Tamaño", valor: "10CM" }
  ]
}
```

---

## 🎨 Palabras Clave por Categoría

### Electro Hogar
```
TV, TELEVISOR, NEVERA, LAVADORA, ESTUFA, MICROONDAS, 
AIRE, SONIDO, AUDIO, CABINA, PARLANTE
```

### Muebles
```
COLCHON, SEMIORTOPEDICO, ORTOPEDICO, PILLOW, 
ESCRITORIO, SILLA, MESA, ARCHIVADOR, CSO, COP
```

### Motos
```
MOTO, WAVE, AX4, CB, XR, MODELO 202
```

### STIHL
```
STIHL, MOTOSIERRA, GUADAÑA, SOPLADOR, 
DESBROZADORA, MS, FS, BG, GTA
```

---

## ⚠️ Casos Especiales

### 1. **Colchones - "SEMIORTOPEDICO" NO es categoría**

❌ **INCORRECTO:**
```
Categoría: SEMIORTOPEDICO
```

✅ **CORRECTO:**
```
Categoría: Muebles y Organización
Subcategoría: Colchones
Atributo: Tipo = "Semiortopédico"
```

### 2. **Motos - La REFERENCIA es el NOMBRE**

❌ **INCORRECTO:**
```
REF: WAVE 110S CBS
Nombre: 2026
```

✅ **CORRECTO:**
```
REF: WAVE 110S CBS
Nombre: Honda Wave 110S CBS Modelo 2026
```

### 3. **Audio - Subcategoría de Electro Hogar**

❌ **INCORRECTO:**
```
Categoría: AUDIO
```

✅ **CORRECTO:**
```
Categoría: Electro Hogar
Subcategoría: Audio/Sonido
```

---

## 📝 Resumen

| Nivel | Qué es | Ejemplos |
|-------|--------|----------|
| **Categoría** | 1 de 4 opciones FIJAS | Electro Hogar, Muebles, Motos, STIHL |
| **Subcategoría** | Tipo de producto | Televisores, Colchones, Motos Urbanas |
| **Atributo** | Característica del producto | Semiortopédico, 90x15cm, 2026 |
| **Marca** | Fabricante | LG, Honda, STIHL, Comodisimos |

---

## ✅ Validación

Antes de insertar un producto, verificar:

1. ✅ `id_categoria` está entre 1-4
2. ✅ `id_subcategoria` existe en la BD o se crea
3. ✅ Atributos como "Semiortopédico" van a `producto_atributos`, NO a categoría
4. ✅ La marca está correctamente detectada

---

¿Está claro ahora? 🎯
