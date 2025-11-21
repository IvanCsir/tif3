#!/usr/bin/env bash
# exit on error
set -o errexit

# Primero construir el frontend
echo "=== Construyendo el frontend ==="
cd frontend

# Instalar dependencias del frontend
npm ci

# Construir la aplicación para producción
npm run build

# Copiar los archivos construidos al backend
echo "=== Copiando archivos del frontend al backend ==="
cp -r build/* ../backend/clubmember/build/ || mkdir -p ../backend/clubmember/build && cp -r build/* ../backend/clubmember/build/

# Navegar al directorio del backend
cd ../backend/clubmember

# Instalar dependencias del backend
pip install -r requirements.txt

# Recopilar archivos estáticos
python manage.py collectstatic --no-input

# Ejecutar migraciones
python manage.py migrate

# Crear superusuario automáticamente
echo "=== Ejecutando comando de creación de superusuario ==="
python manage.py create_admin_user
echo "=== Comando de superusuario completado ==="