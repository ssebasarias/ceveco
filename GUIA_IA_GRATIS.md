# 🆓 Guía: IA Local Gratis con Ollama

## 🎯 Opciones Gratuitas

### **Opción 1: Gemini API (Gratis en la nube)** ⭐ RECOMENDADA

**Ventajas:**
- ✅ Completamente gratis (sin tarjeta de crédito)
- ✅ Muy rápido
- ✅ No requiere instalación
- ✅ 1,500 requests/día gratis

**Límites:**
- 15 requests/minuto
- 1,500 requests/día
- 1 millón tokens/mes

**Para tus 202 productos:**
- Tiempo: ~15 minutos
- Costo: **$0.00**

**Cómo obtener:**
1. Ve a: https://makersuite.google.com/app/apikey
2. Inicia sesión con Google
3. Click "Create API Key"
4. Copia la key
5. Agrégala al `.env`:
   ```env
   GEMINI_API_KEY=tu_key_aqui
   ```

---

### **Opción 2: Ollama (Local, Open Source)** ⭐

**Ventajas:**
- ✅ 100% gratis
- ✅ Sin límites
- ✅ Sin internet
- ✅ Privacidad total
- ✅ Open source

**Requisitos:**
- 8GB RAM mínimo
- 10GB espacio en disco
- Windows 10/11

---

## 📥 Instalación de Ollama (Windows)

### Paso 1: Descargar Ollama

```
1. Ve a: https://ollama.ai
2. Click "Download for Windows"
3. Ejecuta el instalador
4. Sigue las instrucciones
```

### Paso 2: Instalar Modelo

Abre PowerShell y ejecuta:

```powershell
# Instalar modelo Llama 3.1 (recomendado)
ollama pull llama3.1

# O modelo más pequeño (si tienes poca RAM)
ollama pull llama3.1:8b
```

**Tiempo de descarga:** 5-10 minutos (4-8GB)

### Paso 3: Verificar Instalación

```powershell
# Ver modelos instalados
ollama list

# Probar modelo
ollama run llama3.1 "Hola, ¿cómo estás?"
```

**Salida esperada:**
```
¡Hola! Estoy bien, gracias por preguntar...
```

### Paso 4: Dejar Ollama Corriendo

Ollama debe estar corriendo en segundo plano:

```powershell
# Verificar que esté corriendo
curl http://localhost:11434/api/tags
```

**Si ves JSON con modelos, está funcionando** ✅

---

## 🔧 Configuración en el Proyecto

### Usar Ollama (Local):

```javascript
const LocalClassifier = require('./lib/local-classifier');

const classifier = new LocalClassifier({
  host: 'localhost',
  port: 5433,
  database: 'ceveco_db',
  user: 'postgres',
  password: 'postgres'
});

// Verificar que Ollama esté corriendo
await classifier.checkOllama();

// Clasificar producto
const result = await classifier.classifyProduct({
  ref: 'WAVE 110S CBS',
  nombre: '2026',
  categoria: 'MOTOS'
});
```

### Usar Gemini (Nube):

```javascript
const IntelligentClassifier = require('./lib/intelligent-classifier');

const classifier = new IntelligentClassifier(
  process.env.GEMINI_API_KEY,
  {
    host: 'localhost',
    port: 5433,
    database: 'ceveco_db',
    user: 'postgres',
    password: 'postgres'
  }
);

const result = await classifier.classifyProduct({
  ref: 'WAVE 110S CBS',
  nombre: '2026',
  categoria: 'MOTOS'
});
```

---

## 📊 Comparación

| Aspecto | Gemini (Nube) | Ollama (Local) |
|---------|---------------|----------------|
| **Costo** | Gratis | Gratis |
| **Velocidad** | ⚡⚡⚡ Muy rápido | ⚡⚡ Rápido |
| **Calidad** | ⭐⭐⭐⭐⭐ Excelente | ⭐⭐⭐⭐ Muy buena |
| **Internet** | ✅ Requiere | ❌ No requiere |
| **Instalación** | ✅ Solo API key | ⚠️ Descargar 8GB |
| **RAM** | ✅ Ninguna | ⚠️ 8GB mínimo |
| **Límites** | ⚠️ 1,500/día | ✅ Sin límites |
| **Privacidad** | ⚠️ Datos en nube | ✅ 100% local |

---

## 🎯 Recomendación

### Para tu caso (202 productos):

**Usa Gemini API** ⭐

**Razones:**
1. ✅ Más rápido (15 min vs 30 min)
2. ✅ Mejor calidad
3. ✅ No requiere instalación
4. ✅ 202 productos << 1,500 límite diario
5. ✅ Gratis para siempre

**Ollama es mejor si:**
- ❌ No tienes internet confiable
- ❌ Necesitas procesar > 1,500 productos/día
- ❌ Privacidad es crítica

---

## 🚀 Inicio Rápido

### Con Gemini (5 minutos):

```bash
# 1. Obtener API key
# Ve a: https://makersuite.google.com/app/apikey

# 2. Agregar al .env
echo "GEMINI_API_KEY=tu_key_aqui" >> backend/.env

# 3. Listo para usar
node product-enrichment-full.js raw_data/productos.xlsx
```

### Con Ollama (15 minutos):

```powershell
# 1. Descargar Ollama
# https://ollama.ai

# 2. Instalar modelo
ollama pull llama3.1

# 3. Verificar
ollama list

# 4. Usar
node product-enrichment-full.js raw_data/productos.xlsx --local
```

---

## ⚙️ Configuración Avanzada

### Cambiar modelo de Ollama:

```javascript
const classifier = new LocalClassifier(dbConfig, 'http://localhost:11434');
classifier.model = 'llama3.1:70b'; // Modelo más grande (mejor calidad)
```

### Modelos disponibles:

| Modelo | Tamaño | RAM | Calidad |
|--------|--------|-----|---------|
| `llama3.1:8b` | 4GB | 8GB | ⭐⭐⭐ |
| `llama3.1` | 8GB | 16GB | ⭐⭐⭐⭐ |
| `llama3.1:70b` | 40GB | 64GB | ⭐⭐⭐⭐⭐ |

---

## 🔍 Troubleshooting

### Ollama no inicia:

```powershell
# Reiniciar servicio
Stop-Service Ollama
Start-Service Ollama

# O reiniciar PC
```

### Modelo muy lento:

```javascript
// Usar modelo más pequeño
classifier.model = 'llama3.1:8b';
```

### Error "Out of memory":

```
Solución: Cerrar otras aplicaciones o usar Gemini API
```

---

## ✅ Resumen

**Para Ceveco, recomiendo:**

1. **Usar Gemini API** (gratis, rápido, fácil)
2. **Tener Ollama como backup** (si Gemini tiene problemas)

**Pasos:**
```bash
# 1. Obtener Gemini API key (2 minutos)
https://makersuite.google.com/app/apikey

# 2. Agregar al .env
GEMINI_API_KEY=tu_key

# 3. Procesar productos
node product-enrichment-full.js raw_data/*.xlsx

# Total: 15-20 minutos para 202 productos
# Costo: $0.00
```

---

¿Prefieres Gemini (nube, más fácil) u Ollama (local, más privado)?
