# 📐 Dimensiones Recomendadas para Imágenes del Banner Hero

## Dimensiones del Contenedor

El banner hero tiene dimensiones **fijas e inmutables**:

- **Mobile (hasta 767px de ancho)**: 
  - Ancho: 100% del viewport
  - Alto: **250px** (fijo)

- **Desktop (768px en adelante)**:
  - Ancho: 100% del viewport
  - Alto: **500px** (fijo)

## 📏 Dimensiones Recomendadas para las Imágenes

Para que las imágenes se adapten perfectamente al banner sin distorsión ni cortes importantes, se recomienda usar las siguientes dimensiones:

### Opción 1: Formato Landscape (Recomendado) 🌟

**Dimensiones ideales:**
- **Ancho**: 1920px
- **Alto**: 500px
- **Proporción**: 3.84:1 (muy panorámica)

Esta proporción es ideal porque:
- ✅ Se adapta perfectamente al tamaño desktop (500px de alto)
- ✅ En mobile se recortará proporcionalmente pero mantendrá el contenido importante centrado
- ✅ Es el formato estándar para banners web

### Opción 2: Formato Estándar Web Banner

**Dimensiones:**
- **Ancho**: 1920px
- **Alto**: 600px
- **Proporción**: 3.2:1

Esta proporción también funciona bien:
- ✅ Funciona bien en desktop
- ✅ En mobile se recortará un poco más pero sigue siendo aceptable

### Opción 3: Formato Más Cuadrado (No recomendado)

**Dimensiones:**
- **Ancho**: 1920px
- **Alto**: 800px o más
- **Proporción**: 2.4:1 o menos

⚠️ **No recomendado** porque:
- ❌ En mobile se cortará mucho contenido vertical
- ❌ Puede perder información importante en la parte superior o inferior

## 🎨 Recomendaciones de Diseño

### Contenido Importante
- **Coloca el contenido principal en el centro** de la imagen
- Evita colocar texto o elementos importantes en los bordes superior e inferior
- **Zona segura**: Mantén el contenido importante dentro del 60% central de la imagen

### Ejemplo de Zona Segura:
```
┌─────────────────────────────────┐
│  ⚠️ Evitar contenido aquí      │ ← 20% superior
├─────────────────────────────────┤
│                                 │
│  ✅ CONTENIDO PRINCIPAL AQUÍ    │ ← 60% central (zona segura)
│                                 │
├─────────────────────────────────┤
│  ⚠️ Evitar contenido aquí      │ ← 20% inferior
└─────────────────────────────────┘
```

### Resolución y Calidad
- **Resolución mínima**: 1920x500px
- **Resolución recomendada**: 1920x500px a 3840x1000px (para pantallas Retina)
- **Formato**: JPEG (para fotos) o PNG (para gráficos con transparencia)
- **Tamaño de archivo**: Máximo 5MB (se optimiza automáticamente si es mayor a 1MB)
- **Calidad**: 85% de calidad JPEG es suficiente para web

## 📱 Comportamiento en Diferentes Dispositivos

### Desktop (≥768px)
- La imagen se mostrará completa con **500px de alto**
- Si la imagen es más alta, se recortará arriba y abajo (usando `object-fit: cover`)
- El contenido centrado siempre será visible

### Mobile (<768px)
- La imagen se mostrará con **250px de alto**
- Se recortará aproximadamente el 50% de la altura
- El contenido centrado será el que se mantenga visible

## 🔧 Herramientas Recomendadas

Para crear o editar imágenes del banner:

1. **Photoshop**: 
   - Crear nuevo documento: 1920x500px
   - Resolución: 72 DPI (suficiente para web)

2. **Canva**: 
   - Plantilla: "Banner Web" o "Hero Banner"
   - Dimensiones personalizadas: 1920x500px

3. **GIMP** (gratis):
   - Nuevo documento: 1920x500px
   - Exportar como JPEG con calidad 85%

4. **Online**:
   - [Canva](https://www.canva.com)
   - [Figma](https://www.figma.com)
   - [Photopea](https://www.photopea.com) (alternativa gratuita a Photoshop)

## ✅ Checklist Antes de Subir

Antes de subir una imagen al banner, verifica:

- [ ] Dimensiones: 1920x500px (o proporción similar)
- [ ] Contenido importante está en el centro
- [ ] Tamaño de archivo < 5MB
- [ ] Formato: JPEG, PNG, GIF o WEBP
- [ ] Calidad visual buena (no pixelada)
- [ ] Colores vivos y contrastados
- [ ] Texto legible (si aplica)

## 📊 Resumen de Dimensiones

| Dispositivo | Ancho | Alto | Proporción Recomendada |
|------------|-------|------|------------------------|
| **Mobile** | 100% | 250px | 3.84:1 (1920x500px) |
| **Desktop** | 100% | 500px | 3.84:1 (1920x500px) |

## 💡 Tip Final

**La mejor práctica es crear imágenes con proporción 3.84:1 (1920x500px)** porque:
- Se adapta perfectamente al tamaño desktop
- En mobile se recorta proporcionalmente manteniendo el contenido importante
- Es el estándar de la industria para banners web
- Funciona bien en todos los dispositivos modernos
