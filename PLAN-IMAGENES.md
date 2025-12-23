# 🎯 PLAN DE ACCIÓN - IMÁGENES MOTOS HONDA

## ✅ COMPLETADO

1. ✅ Docker reiniciado
2. ✅ Base de datos limpiada (185 productos eliminados)
3. ✅ Nombres y descripciones funcionan perfectamente

---

## 🔍 DIAGNÓSTICO DEL PROBLEMA

### Problema Identificado:
Las imágenes se ven mal porque:

1. **Conversión de imágenes:** Sharp puede estar reduciendo calidad
2. **Frontend CSS:** `object-cover` puede estar recortando mal
3. **Tamaño original:** Las imágenes scrapeadas pueden ser pequeñas

---

## 📋 PLAN DE SOLUCIÓN

### PASO 1: Revisar Frontend (Cómo se muestran)
```css
/* Verificar en card-producto.html */
object-cover vs object-contain
width/height de las imágenes
```

### PASO 2: Revisar Backend (Cómo se optimizan)
```javascript
// Sharp configuration
.resize(800, 800, { fit: 'inside' })  // ← PROBLEMA AQUÍ
.webp({ quality: 80 })                 // ← Y AQUÍ
```

### PASO 3: Procesar Solo Motos Honda
- Descargar imágenes ORIGINALES sin optimizar
- Guardar en alta resolución
- NO convertir a WebP (usar JPG/PNG original)

---

## 🚀 PRÓXIMOS PASOS

### 1. Crear script que:
- Descargue imágenes de motos Honda
- NO las redimensione (mantener tamaño original)
- NO las convierta a WebP
- Las guarde directamente

### 2. Procesar Excel Honda
- Solo 19 productos
- Nombres y descripciones (ya funcionan)
- Imágenes SIN optimización

### 3. Verificar en frontend
- Ver cómo se muestran
- Ajustar CSS si es necesario

---

## ¿Procedo con este plan?

A) Sí, crear script para descargar imágenes SIN optimización
B) Primero revisar más el frontend
C) Otra idea

