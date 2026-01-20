# 🔍 Verificación de Servicios Ceveco

Este documento explica cómo verificar que todos los servicios del backend y frontend estén funcionando correctamente.

## 📋 Verificación del Backend

### Opción 1: Script Automático (Recomendado)

Ejecuta el script de verificación desde la raíz del proyecto:

```bash
cd backend
npm run check-services
```

O directamente:

```bash
node scripts/check-services.js
```

Este script verificará:
- ✅ Health Check (`/health`)
- ✅ Config Pública (`/api/v1/config`)
- ✅ Hero Banners (`/api/v1/hero-banners`)
- ✅ Productos (`/api/v1/productos`)
- ✅ Marcas (`/api/v1/marcas`)
- ✅ Sedes (`/api/v1/sedes`)

### Opción 2: Verificación Manual

1. **Verificar que el servidor esté corriendo:**
   ```bash
   cd backend
   npm start
   ```

2. **Probar el endpoint de health check:**
   ```bash
   curl http://localhost:3000/health
   ```
   
   O abre en tu navegador: `http://localhost:3000/health`

3. **Verificar otros endpoints:**
   - `http://localhost:3000/api/v1/config`
   - `http://localhost:3000/api/v1/hero-banners`
   - `http://localhost:3000/api/v1/productos?limit=1`

## 🌐 Verificación del Frontend

### Desde la Consola del Navegador

1. Abre la aplicación en tu navegador
2. Abre las herramientas de desarrollador (F12)
3. Ve a la pestaña "Console"
4. Ejecuta el siguiente comando:

```javascript
checkServicesStatus()
```

Esto verificará:
- ✅ CONSTANTS
- ✅ StorageUtils
- ✅ API
- ✅ AuthService
- ✅ ProductService
- ✅ FavoritesService
- ✅ OrdersService
- ✅ Conectividad con el backend

### Verificación Visual

Los servicios del frontend se inicializan automáticamente cuando se carga la página. Puedes verificar en la consola del navegador:

- ✅ Si ves `✅ Core Services Ready`, todos los servicios están disponibles
- ⚠️ Si ves `⚠️ Core Dependencies Missing`, algunos servicios no se cargaron correctamente

## 🐛 Solución de Problemas

### El servidor no inicia

1. **Verifica que PostgreSQL esté corriendo:**
   ```bash
   # Windows
   Get-Service -Name postgresql*
   
   # Linux/Mac
   sudo systemctl status postgresql
   ```

2. **Verifica las variables de entorno:**
   - Asegúrate de que existe el archivo `.env` en `backend/`
   - Verifica que las credenciales de la base de datos sean correctas

3. **Verifica los logs del servidor:**
   - Busca errores de conexión a la base de datos
   - Verifica que el puerto 3000 no esté en uso

### Los servicios del frontend no se cargan

1. **Verifica el orden de carga de scripts:**
   - Los servicios deben cargarse antes que `core.js`
   - Verifica que no haya errores de JavaScript en la consola

2. **Verifica la conectividad:**
   - Abre las herramientas de desarrollador (F12)
   - Ve a la pestaña "Network"
   - Recarga la página y verifica que las peticiones al API sean exitosas

3. **Limpia la caché:**
   - Presiona `Ctrl + Shift + R` (Windows/Linux) o `Cmd + Shift + R` (Mac)
   - O limpia la caché del navegador manualmente

## 📊 Endpoints Disponibles

### Públicos
- `GET /health` - Health check
- `GET /api/v1/config` - Configuración pública
- `GET /api/v1/hero-banners` - Banners del hero
- `GET /api/v1/productos` - Lista de productos
- `GET /api/v1/marcas` - Lista de marcas
- `GET /api/v1/sedes` - Lista de sedes

### Autenticados
- `POST /api/v1/auth/login` - Iniciar sesión
- `POST /api/v1/auth/register` - Registro
- `GET /api/v1/favoritos` - Favoritos del usuario
- `GET /api/v1/orders` - Pedidos del usuario

### Admin
- `GET /api/v1/admin/banners` - Gestión de banners
- `POST /api/v1/admin/banners` - Crear banner
- `PUT /api/v1/admin/banners/:id` - Actualizar banner
- `DELETE /api/v1/admin/banners/:id` - Eliminar banner

## 💡 Notas

- El script de verificación requiere que el servidor esté corriendo
- Si el servidor no está corriendo, el script te indicará cómo iniciarlo
- Los servicios del frontend se verifican automáticamente al cargar la página
- Usa `checkServicesStatus()` en la consola del navegador para diagnóstico rápido
