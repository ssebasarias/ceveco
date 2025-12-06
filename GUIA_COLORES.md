# Sistema de Colores - Guía de Implementación

Tu archivo `variables.css` define un hermoso sistema de colores vibrantes. Aquí te muestro cómo integrarlo en tu sitio.

## 🎨 Paleta de Colores

### Primario - Naranja Vibrante
- **Primary**: `#FF6B35` - Naranja energético y llamativo
- **Primary Dark**: `#E55A2B` - Para hovers y estados activos
- **Primary Light**: `#FF8C5F` - Para fondos suaves

### Secundario - Azul Profundo
- **Secondary**: `#004E89` - Azul corporativo y confiable
- **Secondary Dark**: `#003D6B` - Para énfasis
- **Secondary Light**: `#1A6BA8` - Para variaciones

### Acento - Amarillo Dorado
- **Accent**: `#FFD23F` - Amarillo brillante para destacar
- **Accent Dark**: `#E6BD38` - Variación más oscura

## 🚀 Cómo Integrar

### 1. Agregar CSS a tus páginas HTML

En el `<head>` de tus páginas, después de Tailwind:

```html
<!-- Variables y estilos globales -->
<link rel="stylesheet" href="../assets/css/global.css">
```

### 2. Actualizar Tailwind Config

Reemplaza el config actual por este:

```javascript
tailwind.config = {
    theme: {
        extend: {
            colors: {
                // Colores del sistema
                primary: {
                    DEFAULT: '#FF6B35',
                    dark: '#E55A2B',
                    light: '#FF8C5F'
                },
                secondary: {
                    DEFAULT: '#004E89',
                    dark: '#003D6B',
                    light: '#1A6BA8'
                },
                accent: {
                    DEFAULT: '#FFD23F',
                    dark: '#E6BD38'
                }
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            }
        }
    }
}
```

### 3. Ejemplos de Uso

#### Botones Vibrantes
```html
<!-- Botón Primario (Naranja) -->
<button class="bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl hover:-translate-y-1">
    Agregar al Carrito
</button>

<!-- Botón Secundario (Azul) -->
<button class="bg-secondary hover:bg-secondary-dark text-white px-6 py-3 rounded-lg font-semibold transition-all">
    Ver Más
</button>

<!-- Botón con Acento (Amarillo) -->
<button class="bg-accent hover:bg-accent-dark text-gray-900 px-6 py-3 rounded-lg font-bold transition-all">
    ¡Oferta!
</button>
```

#### Hero Banner con Gradiente
```html
<section class="relative h-96 flex items-center">
    <div class="absolute inset-0 bg-gradient-to-r from-secondary via-primary to-accent opacity-90"></div>
    <div class="relative z-10 container mx-auto px-4 text-white">
        <h1 class="text-5xl font-bold mb-4">Renueva tu Hogar</h1>
        <p class="text-xl mb-6">Descubre las mejores ofertas</p>
        <button class="bg-white text-primary px-8 py-4 rounded-lg font-bold hover:bg-accent hover:text-gray-900 transition-all">
            Explorar Productos
        </button>
    </div>
</section>
```

#### Cards con Bordes Coloridos
```html
<div class="bg-white rounded-xl shadow-lg border-t-4 border-primary hover:shadow-2xl transition-all hover:-translate-y-2 p-6">
    <h3 class="text-xl font-bold text-secondary mb-2">Producto Destacado</h3>
    <p class="text-gray-600 mb-4">Descripción del producto...</p>
    <span class="bg-accent text-gray-900 px-3 py-1 rounded-full text-sm font-bold">¡Nuevo!</span>
</div>
```

#### Badges y Tags
```html
<!-- Badge Descuento -->
<span class="bg-primary text-white px-3 py-1 rounded-full text-sm font-bold">-30%</span>

<!-- Badge Nuevo -->
<span class="bg-accent text-gray-900 px-3 py-1 rounded-full text-sm font-bold">Nuevo</span>

<!-- Badge Agotándose -->
<span class="bg-secondary text-white px-3 py-1 rounded-full text-sm font-bold">Últimas unidades</span>
```

#### Navbar con Color
```html
<nav class="bg-white border-b-2 border-primary shadow-md">
    <div class="container mx-auto px-4">
        <!-- Logo con color de fondo -->
        <div class="bg-secondary p-2 rounded-lg">
            <img src="logo.png" alt="Logo" class="h-10">
        </div>
    </div>
</nav>
```

#### Footer con Gradiente
```html
<footer class="bg-gradient-to-r from-secondary to-secondary-dark text-white pt-16 pb-8">
    <!-- Contenido del footer -->
</footer>
```

## 🎯 Dónde Aplicar Color

### Prioridades Alto Impacto:

1. **Botones principales** → Naranja (#FF6B35)
2. **Enlaces y CTA secundarios** → Azul (#004E89)
3. **Badges de oferta/descuento** → Amarillo (#FFD23F)
4. **Hover states** → Versiones dark de cada color
5. **Bordes superiores de cards** → Alterna primary/accent
6. **Icons destacados** → Primary o Accent según contexto
7. **Progress bars** → Gradiente primary
8. **Scrollbar** → Primary

### Mantener Neutro:

- Textos principales → Grises
- Fondos → Blanco/Gray-50
- Bordes sutiles → Gray-200

## 💡 Tips de Implementación

1. **No sobresaturar**: Usa colores vibrantes en ~20% de la UI
2. **Jerarquía visual**: Primary para acciones principales, Secondary para secundarias
3. **Contraste**: Asegura buena legibilidad (textos oscuros en fondos claros)
4. **Consistencia**: Usa los mismos colores para acciones similares
5. **Animaciones**: Añade transitions suaves al cambiar colores

## ✨ Ejemplos Rápidos

```html
<!-- Producto en oferta -->
<div class="relative">
    <span class="absolute top-3 left-3 bg-primary text-white px-3 py-1 rounded-full font-bold text-sm z-10">
        -25%
    </span>
    <!-- Imagen del producto -->
</div>

<!-- Precio con énfasis -->
<div class="flex items-baseline gap-2">
    <span class="text-3xl font-bold text-primary">$299.900</span>
    <span class="text-lg text-gray-400 line-through">$399.900</span>
</div>

<!-- Call to action destacado -->
<div class="bg-accent border-2 border-accent-dark rounded-lg p-4 text-center">
    <p class="text-gray-900 font-bold text-lg">¡Envío Gratis en compras superiores a $100.000!</p>
</div>
```

¡Listo para hacer tu sitio mucho más colorido y atractivo! 🎨✨
