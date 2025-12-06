# 🎯 Guía de Migración CSS - Centralización

## 📋 Objetivo
Migrar todo el CSS inline y en `<style>` tags de los archivos HTML a una estructura modular y centralizada.

## 🗂️ Nueva Estructura CSS

```
frontend/assets/css/
├── main.css                    ✅ CREADO - Importa todo
│
├── tokens/                     
│   ├── colors.css             ✅ CREADO
│   ├── typography.css         ✅ CREADO
│   ├── spacing.css            ⏳ PENDIENTE
│   ├── radius.css             ⏳ PENDIENTE
│   ├── shadows.css            ⏳ PENDIENTE
│   └── transitions.css        ⏳ PENDIENTE
│
├── base/
│   ├── reset.css              ⏳ PENDIENTE
│   ├── typography.css         ⏳ PENDIENTE
│   └── scrollbar.css          ✅ CREADO
│
├── layout/
│   ├── container.css          ⏳ PENDIENTE
│   ├── grid.css               ⏳ PENDIENTE
│   └── sections.css           ⏳ PENDIENTE
│
├── components/
│   ├── buttons.css            ⏳ PENDIENTE
│   ├── cards.css              ⏳ PENDIENTE
│   ├── navbar.css             ⏳ PENDIENTE
│   ├── footer.css             ⏳ PENDIENTE
│   ├── forms.css              ⏳ PENDIENTE
│   ├── badges.css             ⏳ PENDIENTE
│   └── modals.css             ⏳ PENDIENTE
│
└── utilities/
    ├── animations.css         ⏳ PENDIENTE
    ├── helpers.css            ⏳ PENDIENTE
    └── responsive.css         ⏳ PENDIENTE
```

## 🔍 CSS Detectado en HTML (Para Extraer)

### 📄 index.html
```css
/* SCROLLBAR */
::-webkit-scrollbar { width: 10px; }
::-webkit-scrollbar-track { background: #f3f4f6; }
::-webkit-scrollbar-thumb { background: #FF6B35; border-radius: 10px; }
::-webkit-scrollbar-thumb:hover { background: #E55A2B; }

/* MEGA MENU */
.group:hover .mega-menu {
    display: block;
    opacity: 1;
    visibility: visible;
    transform: translateY(0);
}

/* INFINITE SCROLL ANIMATION */
@keyframes scroll {
    0% { transform: translateX(0); }
    100% { transform: translateX(-50%); }
}
.animate-scroll { animation: scroll 30s linear infinite; }
.animate-scroll:hover { animation-play-state: paused; }

/* HIDE SCROLLBAR */
.hide-scrollbar::-webkit-scrollbar { display: none; }
.hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

/* PRODUCT CARD IN CAROUSEL */
#featured-products>div {
    min-width: 280px;
    max-width: 280px;
    scroll-snap-align: start;
}
@media (min-width: 640px) {
    #featured-products>div {
        min-width: 320px;
        max-width: 320px;
    }
}
```
**Migrar a:**
- Scrollbar → `base/scrollbar.css` ✅ YA MIGRADO
- Mega menu → `components/navbar.css`
- Animations → `utilities/animations.css`
- Hide scrollbar → `utilities/helpers.css`
- Product card → `components/cards.css`

### 📄 productos.html
```css
/* SCROLLBAR (mismo que index.html) */
/* MEGA MENU (mismo que index.html) */
```
**Migrar a:** Mismo destino que index.html

### 📄 Otras páginas
Revisar: `detalle-producto.html`, `favoritos.html`, `checkout.html`, etc.

## 📝 Plan de Migración

### Fase 1: Completar Tokens ⏳
1. Crear `tokens/spacing.css`
2. Crear `tokens/radius.css`
3. Crear `tokens/shadows.css`
4. Crear `tokens/transitions.css`

### Fase 2: Crear Base ⏳
1. Crear `base/reset.css`
2. Crear `base/typography.css`

### Fase 3: Extraer CSS de index.html ⏳
1. Mover mega menu → `components/navbar.css`
2. Mover animaciones → `utilities/animations.css`
3. Mover helpers → `utilities/helpers.css`
4. Mover cards → `components/cards.css`

### Fase 4: Actualizar HTML ⏳
1. Eliminar `<style>` tags de todos los HTML
2. Reemplazar por: `<link rel="stylesheet" href="../assets/css/main.css">`

### Fase 5: Crear Components ⏳
Extract from existing code and create:
1. `components/buttons.css`
2. `components/cards.css`
3. `components/navbar.css`
4. `components/footer.css`
5. `components/forms.css`
6. `components/badges.css`

### Fase 6: Testing 🧪
1. Verificar cada página
2. Asegurar que nada se rompió
3. Optimizar si es necesario

## ✅ Cómo Usar el Nuevo Sistema

### En tus archivos HTML:
```html
<head>
    <!-- ANTES: Cada HTML tenía su propio <style> -->
    
    <!-- DESPUÉS: Un solo link -->
    <link rel="stylesheet" href="../assets/css/main.css">
</head>
```

### Para modificar colores:
```css
/* Antes: Cambiar en cada HTML */

/* Ahora: Cambiar en tokens/colors.css */
:root {
  --color-primary: #FF6B35;
}
```

### Para agregar un nuevo componente:
1. Crear `components/mi-componente.css`
2. Agregar import en `main.css`
3. El componente estará disponible en TODAS las páginas

## 🎯 Beneficios

✅ **Un solo lugar** para cambiar colores, fuentes, espaciados
✅ **Reutilización** de estilos en todas las páginas
✅ **Mantenibilidad** fácil de entender y modificar
✅ **Escalabilidad** fácil agregar nuevos componentes
✅ **Performance** el navegador cachea el CSS
✅ **Consistencia** mismo diseño en todo el sitio

## ⚠️ Importante

- No borres los HTML hasta verificar que todo funciona
- Haz cambios página por página
- Prueba cada cambio antes de continuar
- Mantén un backup (git commit)

## 🚀 Siguiente Paso

1. Terminar de crear todos los archivos de tokens
2. Extraer el CSS de index.html
3. Probar que funciona
4. Repetir con las demás páginas

---

**Estado Actual**: 
- ✅ Estructura creada
- ✅ Tokens colors y typography creados
- ✅ Scrollbar migrado
- ⏳ Pendiente completar migración

**Última actualización**: 2025-12-05
