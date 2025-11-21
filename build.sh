#!/usr/bin/env bash
# exit on error
set -o errexit

# Navegar al directorio del backend
cd backend/clubmember

# Instalar dependencias
pip install -r requirements.txt

# Recopilar archivos estáticos
python manage.py collectstatic --no-input

# Ejecutar migraciones
python manage.py migrate

# Crear superusuario automáticamente
echo "=== Ejecutando comando de creación de superusuario ==="
python manage.py create_admin_user
echo "=== Comando de superusuario completado ==="