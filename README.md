# 📘 Ceveco - Documentación del Proyecto

Bienvenido a la documentación oficial de **Ceveco**, una plataforma de comercio electrónico moderna y robusta.

## 🚀 Inicio Rápido

### ¿Quieres desplegar en un servidor?
Consulta la [Guía de Instalación en Servidor (Docker)](doc/INSTALACION_SERVIDOR.md).
> **Resumen:** `git clone` -> configurar `.env` -> `docker-compose up -d`.

### ¿Quieres desarrollar localmente?
Consulta la [Guía de Desarrollo Local](doc/GUIA_DESARROLLO.md).
> **Resumen:** Instalar Postgres, `npm install` en backend, y `npm run dev`.

---

## 📚 Índice de Documentación

Toda la documentación detallada se encuentra en la carpeta `doc/`:

*   **Infraestructura y Despliegue:**
    *   [`INSTALACION_SERVIDOR.md`](doc/INSTALACION_SERVIDOR.md): Guía completa de Docker y Docker Compose.
    *   [`BASE_DE_DATOS.md`](doc/BASE_DE_DATOS.md): Detalles del esquema SQL y modelos.

*   **Desarrollo:**
    *   [`GUIA_DESARROLLO.md`](doc/GUIA_DESARROLLO.md): Comandos, scripts y setup.
    *   [`GUIA_COLORES.md`](doc/GUIA_COLORES.md) y [`MIGRACION_CSS.md`](doc/MIGRACION_CSS.md): Estándares de diseño y estilos.

*   **Arquitectura:**
    *   [`arquitectura/estructura_proyecto.txt`](doc/arquitectura/estructura_proyecto.txt): Mapa del árbol de archivos.
    *   [`funcionalidades/BUSQUEDA_UNIFICADA.md`](doc/funcionalidades/BUSQUEDA_UNIFICADA.md): Detalles sobre la implementación de búsqueda.

---

## 🏗️ Stack Tecnológico

*   **Frontend:** HTML5, CSS3 (Tailwind + Vanilla), JavaScript (Módulos ES6).
*   **Backend:** Node.js, Express.js.
*   **Base de Datos:** PostgreSQL.
*   **Infraestructura:** Docker, Docker Compose.
*   **Testing:** Playwright (E2E).

---
*Ceveco Development Team - 2025*
