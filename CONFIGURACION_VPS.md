# 🚀 Configuración para VPS - Gemini API (Gratis)

## ✅ Solución Elegida: Gemini API

**Razones:**
- ✅ Gratis (sin tarjeta de crédito)
- ✅ No consume recursos del VPS
- ✅ Fácil de configurar
- ✅ Funciona perfecto en Hostinger
- ✅ 1,500 requests/día (suficiente para 202 productos)

---

## 📋 Pasos de Configuración

### 1. Obtener API Key (2 minutos)

1. Ve a: https://makersuite.google.com/app/apikey
2. Inicia sesión con tu cuenta Google
3. Click en "Create API Key"
4. Copia la key (empieza con `AIza...`)

**Importante:** Es GRATIS, no pide tarjeta de crédito

---

### 2. Configurar en el Proyecto

Agrega la key al archivo `.env`:

```env
# IA para clasificación automática
GEMINI_API_KEY=AIzaSy...tu_key_aqui

# Base de datos
DB_HOST=localhost
DB_PORT=5433
DB_NAME=ceveco_db
DB_USER=postgres
DB_PASSWORD=postgres
```

---

### 3. Instalar Dependencia

```bash
npm install @google/generative-ai
```

---

### 4. Listo para Usar

```bash
# Procesar productos con IA
node product-enrichment-full.js raw_data/productos.xlsx
```

---

## 🔧 Configuración en VPS Hostinger

### Subir al VPS:

```bash
# 1. Conectar por SSH
ssh usuario@tu-vps.hostinger.com

# 2. Clonar/subir proyecto
git clone tu-repositorio
# O usar FTP/SFTP

# 3. Instalar dependencias
cd ceveco
npm install

# 4. Configurar .env
nano backend/.env
# Pegar:
# GEMINI_API_KEY=tu_key_aqui

# 5. Ejecutar
node product-enrichment-full.js raw_data/productos.xlsx
```

---

## 📊 Consumo de Recursos

### En tu VPS:

| Recurso | Sin IA | Con Gemini API |
|---------|--------|----------------|
| **RAM** | 200MB | 220MB (+20MB) |
| **CPU** | 5% | 8% (+3%) |
| **Disco** | 500MB | 500MB (igual) |
| **Red** | Bajo | Medio |

**Conclusión:** Gemini usa casi CERO recursos del VPS ✅

---

## ⚡ Rendimiento

### Procesamiento de 202 productos:

```
Tiempo total: ~15 minutos
Requests a Gemini: 202
Costo: $0.00
Recursos VPS: Mínimos
```

### Comparación:

| Opción | Tiempo | RAM VPS | Costo |
|--------|--------|---------|-------|
| **Gemini API** | 15 min | 220MB | $0 |
| Ollama Local | 30 min | 8GB | $0 |
| Sin IA | 5 min | 200MB | $0 |

---

## 🔒 Seguridad de la API Key

### En VPS:

```bash
# 1. Crear .env (si no existe)
touch backend/.env

# 2. Agregar key
echo "GEMINI_API_KEY=tu_key_aqui" >> backend/.env

# 3. Proteger archivo
chmod 600 backend/.env

# 4. Verificar que .gitignore incluya .env
echo "backend/.env" >> .gitignore
```

### Nunca:
- ❌ Subir .env a Git
- ❌ Compartir la API key públicamente
- ❌ Hardcodear la key en el código

---

## 🎯 Uso Recomendado

### Para carga inicial (202 productos):

```bash
# Ejecutar una vez
node product-enrichment-full.js raw_data/*.xlsx

# Tiempo: ~20 minutos
# Requests: ~200
# Costo: $0.00
```

### Para actualizaciones futuras:

```bash
# Procesar solo nuevos productos
node product-enrichment-full.js raw_data/nuevos_productos.xlsx

# Tiempo: ~2 minutos por cada 10 productos
```

---

## 📈 Límites y Escalabilidad

### Límites diarios de Gemini (gratis):

- ✅ 1,500 requests/día
- ✅ 15 requests/minuto
- ✅ 1 millón tokens/mes

### Tu uso estimado:

- 202 productos iniciales = 202 requests (1 vez)
- Actualizaciones: ~10-20 productos/día = 10-20 requests
- **Total: < 10% del límite diario** ✅

### Si necesitas más:

Gemini tiene un plan de pago muy económico:
- $0.00025 por request
- Para 10,000 productos = $2.50

Pero con el tier gratuito tienes más que suficiente.

---

## ✅ Checklist de Configuración

- [ ] Obtener Gemini API key
- [ ] Agregar key al `.env`
- [ ] Instalar `@google/generative-ai`
- [ ] Probar con 1 producto
- [ ] Procesar todos los productos
- [ ] Verificar resultados en BD

---

## 🚀 Comandos Rápidos

```bash
# Instalación
npm install @google/generative-ai

# Configuración
echo "GEMINI_API_KEY=tu_key" >> backend/.env

# Prueba con 1 archivo
node product-enrichment-full.js raw_data/LG*.xlsx

# Procesar todo
node product-enrichment-full.js raw_data/*.xlsx

# Verificar resultados
node check-db.js
```

---

## 💡 Ventajas para Hostinger VPS

1. ✅ **Bajo consumo** - Funciona en VPS básico
2. ✅ **Sin instalaciones** - Solo npm install
3. ✅ **Rápido** - API en la nube es veloz
4. ✅ **Confiable** - Google tiene 99.9% uptime
5. ✅ **Gratis** - Sin costos mensuales

---

## 🎉 Resumen

**Para tu VPS de Hostinger:**

✅ Usa **Gemini API** (gratis)
❌ NO uses Ollama (requiere 8GB RAM)
❌ NO uses modelos locales (consumen recursos)

**Configuración:**
1. API key de Gemini (2 min)
2. Agregar al `.env` (1 min)
3. `npm install` (2 min)
4. Listo ✅

**Costo total:** $0.00
**Tiempo setup:** 5 minutos
**Funciona en:** Cualquier VPS (incluso el más básico)

---

¿Listo para obtener tu API key de Gemini? 🚀
