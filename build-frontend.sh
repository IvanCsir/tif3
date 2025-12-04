#!/usr/bin/env bash
# exit on error
set -o errexit

# Navegar al directorio del frontend
cd frontend

# Instalar dependencias
npm ci

# Construir la aplicación para producción
npm run build

# Copiar archivos de configuración al directorio build
cp public/_redirects build/
cp public/serve.json build/
