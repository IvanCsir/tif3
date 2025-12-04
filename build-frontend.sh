#!/usr/bin/env bash
# exit on error
set -o errexit

# Navegar al directorio del frontend
cd frontend

# Instalar dependencias
npm ci

# Construir la aplicación para producción
npm run build

# Copiar serve.json al directorio build
cp public/serve.json build/
