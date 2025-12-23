# 🏍️ PLAN PARA PROCESAR TODAS LAS MOTOS

## 📋 ARCHIVOS EXCEL ENCONTRADOS

✅ **HONDA AGOSTO 01 2025.xlsx** - Ya procesado  
✅ **SUZUKI SEPTIEMBRE 01 2025.xlsx** - Listo para procesar

---

## 🚀 SCRIPTS CREADOS

### 1. `process-all-motorcycles.js`
Procesa todos los Excel de motos:
- ✅ Honda
- ✅ Suzuki
- ✅ Otras marcas que se agreguen

**Características:**
- Genera títulos optimizados por marca
- Crea descripciones específicas
- Descarga imágenes (placeholders por ahora)
- Organiza por carpetas de marca

### 2. `extract-all-attributes.js` (Por crear)
Extrae atributos técnicos de todas las marcas

---

## 📝 INSTRUCCIONES PARA EJECUTAR

### PASO 1: Limpiar Base de Datos (Opcional)
```bash
node clean-database.js
```

### PASO 2: Procesar Todas las Motos
```bash
node process-all-motorcycles.js
```

**Esto procesará:**
- Honda: ~18 productos
- Suzuki: ~? productos (por determinar)

### PASO 3: Extraer Atributos
```bash
node extract-all-attributes.js
```

### PASO 4: Descargar Imágenes Reales
```bash
node download-real-images.js
```

---

## 📊 RESULTADO ESPERADO

### Productos:
- ✅ Honda: 18 productos
- ✅ Suzuki: ~15-20 productos (estimado)
- ✅ Total: ~35-40 motos

### Imágenes:
- ✅ Organizadas por marca:
  - `/images/products/honda/`
  - `/images/products/suzuki/`

### Atributos:
- ✅ 10 atributos técnicos
- ✅ Valores específicos por modelo

---

## ⚠️ NOTAS IMPORTANTES

1. **Imágenes:** El script usa placeholders por ahora. Las imágenes reales se descargan con `download-real-images.js`

2. **Suzuki:** Puede tener estructura de Excel diferente. El script se adaptará automáticamente.

3. **Atributos:** Se extraen del nombre del producto y valores predefinidos por modelo.

---

## 🎯 ¿QUIERES EJECUTAR AHORA?

**Opción A:** Ejecutar todo ahora (Honda + Suzuki)  
**Opción B:** Solo ver qué hay en el Excel de Suzuki primero  
**Opción C:** Esperar para ejecutar después

---

**¿Qué prefieres hacer?** 🚀
