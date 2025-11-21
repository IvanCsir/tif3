# Configuración de Deployment - Superusuario Django

## Creación Automática del Superusuario

Este proyecto está configurado para crear automáticamente un superusuario de Django durante el deployment.

### Variables de Entorno Requeridas

Para configurar el superusuario automático, asegúrate de definir las siguientes variables de entorno en tu plataforma de deployment (ej: Render):

```bash
DJANGO_SUPERUSER_USERNAME=admin
DJANGO_SUPERUSER_EMAIL=admin@clubmember.com
DJANGO_SUPERUSER_PASSWORD=tu-password-seguro
```

### Configuración en Render

1. Ve a tu servicio en Render Dashboard
2. Dirígete a la sección "Environment"
3. Agrega las siguientes variables de entorno:

| Variable | Valor | Descripción |
|----------|--------|-------------|
| `DJANGO_SUPERUSER_USERNAME` | admin | Nombre de usuario del administrador |
| `DJANGO_SUPERUSER_EMAIL` | admin@clubmember.com | Email del administrador |
| `DJANGO_SUPERUSER_PASSWORD` | [password_seguro] | Contraseña del administrador |

### Valores por Defecto

Si no se especifican las variables de entorno, se usarán los siguientes valores por defecto:

- **Username:** `admin`
- **Email:** `admin@clubmember.com`  
- **Password:** `admin`

⚠️ **Importante:** Cambia la contraseña por defecto en producción por seguridad.

### Cómo Funciona

El script `build.sh` ejecuta automáticamente el comando `python manage.py create_admin_user` después de las migraciones. Este comando:

1. Verifica si ya existe un superusuario
2. Si no existe, crea uno nuevo con las credenciales proporcionadas
3. Si ya existe, muestra un mensaje y no hace cambios
4. Proporciona logs detallados para debugging

### Acceso al Admin

Después del deployment, podrás acceder al panel de administración de Django en:

```
https://tu-app.onrender.com/admin/
```

Usa las credenciales configuradas para iniciar sesión.

### Prueba Local

Para probar el comando localmente, puedes ejecutar:

```bash
cd backend/clubmember
python manage.py create_admin_user
```