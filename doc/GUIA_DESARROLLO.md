# 💻 Guía de Desarrollo Local

Esta guía documenta los comandos y flujos de trabajo para desarrollar en el proyecto **Ceveco**.

## ⚙️ Configuración Inicial

1.  **Instalar Dependencias:**
    
    Asegúrate de estar en la carpeta `backend` para las dependencias del servidor:
    ```bash
    cd backend
    npm install
    ```

2.  **Configurar Entorno Local:**
    
    Crea un archivo `.env` dentro de `backend/` con tus credenciales locales (DB_HOST=localhost).

3.  **Base de Datos Local:**
    
    Debes tener PostgreSQL instalado y corriendo localmente. Crea una base de datos llamada `ceveco_db` y ejecuta el script `bd.sql` para crear las tablas.

## 📜 Comandos Disponibles

### Servidor de Desarrollo
Para iniciar el backend con recarga automática (Nodemon):

```bash
# Desde la carpeta backend/
npm run dev
```
O simplemente iniciar el servidor:
```bash
npm start
```

### Frontend
El frontend es estático y servido por el backend. No requiere un servidor de compilación (build step) separado como React/Vue, ya que usa JavaScript Vanilla y Tailwind vía CDN (o archivo estático).

Para ver cambios en el frontend, simplemente edita los archivos en `frontend/` y recarga la página.

### Tests End-to-End (Playwright)
El proyecto incluye tests automatizados E2E ubicados en la carpeta `e2e/`.

**Instalar navegadores de prueba:**
```bash
npx playwright install
```

**Ejecutar todos los tests:**
```bash
npx playwright test
```

**Ejecutar con interfaz visual (UI Mode):**
```bash
npx playwright test --ui
```

**Ejecutar un test específico:**
```bash
npx playwright test e2e/nombre-del-test.spec.js
```

## 📁 Estructura Rápida
*   `backend/src/`: Código fuente del API (Controladores, Modelos, Rutas).
*   `frontend/pages/`: Archivos HTML de las vistas.
*   `frontend/assets/js/`: Lógica del cliente, organizada por módulos (`services`, `components`, `pages`).
*   `frontend/assets/css/`: Estilos CSS propios.
*   `doc/`: Documentación del proyecto.
