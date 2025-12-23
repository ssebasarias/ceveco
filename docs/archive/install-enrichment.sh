#!/bin/bash
# 🚀 Instalación Rápida del Sistema de Enriquecimiento

echo "================================================"
echo "  INSTALACIÓN - Sistema de Enriquecimiento"
echo "================================================"
echo ""

# Crear directorios necesarios
echo "📁 Creando directorios..."
mkdir -p raw_data
mkdir -p frontend/assets/images/productos
mkdir -p temp_downloads
mkdir -p lib
echo "✅ Directorios creados"
echo ""

# Instalar dependencias
echo "📦 Instalando dependencias npm..."
echo "   Esto puede tomar unos minutos..."
npm install xlsx axios cheerio sharp puppeteer @google/generative-ai csv-parser dotenv

if [ $? -eq 0 ]; then
    echo "✅ Dependencias instaladas"
else
    echo "❌ Error instalando dependencias"
    exit 1
fi
echo ""

# Verificar archivo .env
echo "⚙️  Verificando configuración..."
if [ ! -f "backend/.env" ]; then
    echo "⚠️  No se encontró archivo .env en backend/"
else
    echo "✅ Archivo .env encontrado"
fi
echo ""

# Mostrar instrucciones
echo "================================================"
echo "  ✅ INSTALACIÓN COMPLETADA"
echo "================================================"
echo ""
echo "📋 Próximos pasos:"
echo ""
echo "1. Coloca tus archivos Excel en:"
echo "   ./raw_data/"
echo ""
echo "2. (Opcional) Configura API de IA:"
echo "   - Ve a: https://makersuite.google.com/app/apikey"
echo "   - Crea una API key gratuita"
echo "   - Agrégala al archivo .env:"
echo "     GEMINI_API_KEY=tu_api_key_aqui"
echo ""
echo "3. Ejecuta el enriquecimiento:"
echo "   node product-enrichment.js raw_data/tu_archivo.xlsx"
echo ""
echo "📚 Documentación completa:"
echo "   - ENRIQUECIMIENTO_AUTOMATICO.md"
echo "   - GUIA_CARGA_PRODUCTOS.md"
echo ""
echo "¡Listo para comenzar! 🎉"
echo ""
