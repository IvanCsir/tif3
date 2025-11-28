# Configuración de Variables de Entorno en Render

## Problema
El envío de correos funciona localmente pero falla en Render con error 500 porque las variables de entorno no están configuradas.

## Solución

### 1. Configurar Variables de Entorno en Render

1. Ve a tu [Dashboard de Render](https://dashboard.render.com/)
2. Selecciona tu servicio de **Backend**
3. Ve a la pestaña **Environment**
4. Haz clic en **Add Environment Variable**
5. Agrega las siguientes variables:

#### Variables Requeridas para Email

```
EMAIL_HOST_USER=tu-correo@gmail.com
EMAIL_HOST_PASSWORD=tu-app-password-de-gmail
```

**⚠️ IMPORTANTE para Gmail:**
- No uses tu contraseña normal de Gmail
- Debes crear una "App Password" (Contraseña de aplicación):
  1. Ve a tu cuenta de Google → Seguridad
  2. Activa la verificación en 2 pasos (si no la tienes)
  3. Ve a "Contraseñas de aplicaciones" (App Passwords)
  4. Genera una nueva contraseña para "Correo" / "Otro"
  5. Usa esa contraseña de 16 caracteres en `EMAIL_HOST_PASSWORD`

#### Variable para API del Clima

```
WEATHER_API_KEY=tu-clave-de-weatherbit
```

Obtén tu API key desde: https://www.weatherbit.io/

#### Otras Variables Recomendadas

```
SECRET_KEY=genera-una-clave-secreta-unica-y-larga
DEBUG=False
DJANGO_SUPERUSER_USERNAME=admin
DJANGO_SUPERUSER_EMAIL=admin@clubmember.com
DJANGO_SUPERUSER_PASSWORD=tu-password-seguro
```

### 2. Verificar la Configuración

Después de agregar las variables:

1. Guarda los cambios (Render redesplegará automáticamente)
2. Espera a que el despliegue termine (2-3 minutos)
3. Revisa los logs en la pestaña **Logs** para verificar:
   - ✓ "EMAIL_HOST_USER configurado: True"
   - ✓ "Email enviado exitosamente a..."

### 3. Mejoras Implementadas en el Código

El código ahora:

1. **Verifica** si las variables de entorno están configuradas antes de intentar enviar correos
2. **Registra** información detallada en los logs para debugging
3. **No falla** la reserva si el email no se puede enviar (la reserva se crea de todas formas)
4. **Muestra** mensajes claros sobre el estado de la configuración

### 4. Logs de Debugging

En los logs de Render verás mensajes como:

- `✓ Email enviado exitosamente a usuario@email.com` - Email enviado correctamente
- `⚠ Advertencia: EMAIL_HOST_USER o EMAIL_HOST_PASSWORD no están configurados` - Falta configuración
- `✗ Error al enviar email: [detalle del error]` - Error al enviar

### 5. Comandos Útiles para Testing Local

Para probar localmente con las mismas variables:

```bash
# Crea un archivo .env en /backend/clubmember/
cd backend/clubmember
cat > .env << EOF
SECRET_KEY=tu-secret-key
DEBUG=True
EMAIL_HOST_USER=tu-correo@gmail.com
EMAIL_HOST_PASSWORD=tu-app-password
WEATHER_API_KEY=tu-api-key
EOF
```

### 6. Seguridad

- ✅ **NUNCA** commites el archivo `.env` a Git
- ✅ El archivo `.env` debe estar en `.gitignore`
- ✅ Usa contraseñas de aplicación específicas, no tu contraseña principal
- ✅ Mantén `DEBUG=False` en producción

## Verificación Final

Después de configurar todo:

1. Haz una reserva de prueba en tu app deployada
2. Revisa los logs de Render
3. Verifica que llegue el email con el archivo .ics adjunto
4. Si hay errores, los logs mostrarán información detallada

## Contacto/Recursos

- [Documentación de Render sobre Variables de Entorno](https://render.com/docs/environment-variables)
- [Cómo crear App Password en Gmail](https://support.google.com/accounts/answer/185833)
- [API de Weatherbit](https://www.weatherbit.io/api)
