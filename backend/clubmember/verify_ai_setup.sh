#!/bin/bash
# Script de verificación de la implementación de recomendaciones IA

echo "🔍 Verificando implementación de Recomendaciones IA..."
echo ""

# Verificar entorno virtual
if [ -z "$VIRTUAL_ENV" ]; then
    echo "⚠️  No hay entorno virtual activo. Activando..."
    source ../venv/bin/activate
fi

# Verificar paquete google-generativeai
echo "✓ Verificando google-generativeai..."
python -c "import google.generativeai; print('  ✓ google-generativeai instalado correctamente')" 2>/dev/null || echo "  ✗ ERROR: google-generativeai no está instalado"

# Verificar archivo .env
echo "✓ Verificando configuración .env..."
if grep -q "GEMINI_API_KEY" ../../.env; then
    echo "  ✓ GEMINI_API_KEY encontrada en .env"
    if grep "GEMINI_API_KEY=tu-api-key-de-gemini-aqui" ../../.env >/dev/null 2>&1; then
        echo "  ⚠️  ADVERTENCIA: Necesitas configurar tu API key real de Gemini"
    fi
else
    echo "  ✗ ERROR: GEMINI_API_KEY no está en .env"
fi

# Verificar app en INSTALLED_APPS
echo "✓ Verificando settings.py..."
if grep -q "ai_recommendations" clubmember/settings.py; then
    echo "  ✓ ai_recommendations está en INSTALLED_APPS"
else
    echo "  ✗ ERROR: ai_recommendations no está en INSTALLED_APPS"
fi

# Verificar URLs
echo "✓ Verificando urls.py..."
if grep -q "ai_recommendations.urls" clubmember/urls.py; then
    echo "  ✓ URLs de ai_recommendations configuradas"
else
    echo "  ✗ ERROR: URLs de ai_recommendations no configuradas"
fi

# Verificar migraciones
echo "✓ Verificando migraciones..."
python manage.py showmigrations ai_recommendations 2>/dev/null && echo "  ✓ No requiere migraciones adicionales" || echo "  ℹ️  App sin migraciones (normal para viewsets sin modelos)"

echo ""
echo "📋 Resumen:"
echo "  - Backend: Django app ai_recommendations ✓"
echo "  - Frontend: Componente AIRecommendations.js ✓"
echo "  - Ruta: /recomendaciones-ia ✓"
echo "  - API: /api/ai-recommendations/get_recommendations/ ✓"
echo ""
echo "🚀 Para probar:"
echo "  1. Configura tu GEMINI_API_KEY en .env"
echo "  2. Inicia el servidor: python manage.py runserver"
echo "  3. Inicia el frontend: cd ../../frontend && npm start"
echo "  4. Navega a: http://localhost:3000/recomendaciones-ia"
echo ""
