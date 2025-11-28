#!/usr/bin/env python3
"""
Script de verificación de configuración para deployment en Render
Ejecutar: python3 check_config.py
"""

import os
import sys

def check_env_var(var_name, required=True):
    """Verifica si una variable de entorno está configurada"""
    value = os.getenv(var_name)
    is_set = value is not None and value != ''
    
    status = "✓" if is_set else ("✗" if required else "⚠")
    type_req = "REQUERIDA" if required else "OPCIONAL"
    
    print(f"{status} {var_name}: {'Configurada' if is_set else 'NO CONFIGURADA'} ({type_req})")
    
    if is_set and var_name not in ['SECRET_KEY', 'EMAIL_HOST_PASSWORD', 'DJANGO_SUPERUSER_PASSWORD']:
        print(f"  Valor: {value[:20]}..." if len(value) > 20 else f"  Valor: {value}")
    elif is_set:
        print(f"  Valor: *** (oculto por seguridad, longitud: {len(value)} caracteres)")
    
    return is_set

def main():
    print("=" * 60)
    print("VERIFICACIÓN DE CONFIGURACIÓN - Render Deployment")
    print("=" * 60)
    print()
    
    # Variables requeridas
    print("📧 CONFIGURACIÓN DE EMAIL:")
    print("-" * 60)
    email_user = check_env_var('EMAIL_HOST_USER', required=True)
    email_pass = check_env_var('EMAIL_HOST_PASSWORD', required=True)
    print()
    
    # Variables de clima
    print("🌤️  CONFIGURACIÓN DE API CLIMA:")
    print("-" * 60)
    weather_key = check_env_var('WEATHER_API_KEY', required=True)
    print()
    
    # Variables de Django
    print("🔐 CONFIGURACIÓN DE DJANGO:")
    print("-" * 60)
    secret_key = check_env_var('SECRET_KEY', required=True)
    debug = check_env_var('DEBUG', required=False)
    print()
    
    # Variables de base de datos
    print("🗄️  CONFIGURACIÓN DE BASE DE DATOS:")
    print("-" * 60)
    database_url = check_env_var('DATABASE_URL', required=True)
    print()
    
    # Variables de superusuario
    print("👤 CONFIGURACIÓN DE SUPERUSUARIO:")
    print("-" * 60)
    su_username = check_env_var('DJANGO_SUPERUSER_USERNAME', required=False)
    su_email = check_env_var('DJANGO_SUPERUSER_EMAIL', required=False)
    su_password = check_env_var('DJANGO_SUPERUSER_PASSWORD', required=False)
    print()
    
    # Resumen
    print("=" * 60)
    print("RESUMEN:")
    print("=" * 60)
    
    required_vars = [
        ('EMAIL_HOST_USER', email_user),
        ('EMAIL_HOST_PASSWORD', email_pass),
        ('WEATHER_API_KEY', weather_key),
        ('SECRET_KEY', secret_key),
        ('DATABASE_URL', database_url),
    ]
    
    all_configured = all(configured for _, configured in required_vars)
    
    if all_configured:
        print("✓ Todas las variables requeridas están configuradas")
        print("✓ El sistema debería funcionar correctamente")
        return 0
    else:
        print("✗ Faltan variables requeridas:")
        for var_name, configured in required_vars:
            if not configured:
                print(f"  - {var_name}")
        print()
        print("⚠️  Configura las variables faltantes en Render Dashboard")
        print("   Environment → Add Environment Variable")
        return 1

if __name__ == '__main__':
    sys.exit(main())
