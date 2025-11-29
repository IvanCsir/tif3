# Diagnóstico: Email no se envía en Render

## 🔍 Problema

La reserva se guarda correctamente en la base de datos, pero **el email no se envía en Render** (funciona localmente).

## 📊 Pasos para Diagnosticar

### 1. Verificar Logs en Render

Después de deployar los cambios, ve a Render → Logs y busca estos mensajes cuando hagas una reserva:

```
=== INICIO RESERVA ===
...
✓ Reserva guardada en BD
Email configurado: True/False
```

**Si ves `Email configurado: False`:**
- Las variables `EMAIL_HOST_USER` o `EMAIL_HOST_PASSWORD` no están configuradas
- Ve a Render → Environment y agrégalas

**Si ves errores como:**
- `Connection refused` o `timeout` → Render está bloqueando el puerto SMTP
- `Authentication failed` → Credenciales incorrectas
- `SMTPServerDisconnected` → Problema de configuración TLS/SSL

### 2. Ejecutar Comando de Diagnóstico en Render

Conéctate a la shell de Render y ejecuta:

```bash
# Diagnóstico de conectividad SMTP
python manage.py diagnose_smtp

# Prueba de envío de email
python manage.py test_email tu_email@ejemplo.com
```

Estos comandos te dirán exactamente qué está fallando.

### 3. Causas Comunes y Soluciones

#### 🔒 A. Render bloquea puertos SMTP (MÁS PROBABLE)

**Síntoma:** `Connection refused`, `timeout`, o el email nunca llega

**Causa:** Render puede bloquear los puertos estándar de SMTP (25, 465, 587) por políticas de seguridad

**Soluciones:**

##### Opción 1: Intentar con puerto SSL (465)

Modifica `settings.py`:

```python
EMAIL_PORT = 465
EMAIL_USE_TLS = False
EMAIL_USE_SSL = True
```

##### Opción 2: Usar un servicio de email externo (RECOMENDADO)

Render recomienda usar servicios de terceros como:

**SendGrid (Gratis hasta 100 emails/día):**
```python
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.sendgrid.net'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = 'apikey'
EMAIL_HOST_PASSWORD = 'tu-api-key-de-sendgrid'
```

1. Regístrate en https://sendgrid.com/
2. Crea una API Key
3. Agrega estas variables en Render:
   - `EMAIL_HOST_USER=apikey`
   - `EMAIL_HOST_PASSWORD=tu-api-key`

**Mailgun:**
```python
EMAIL_HOST = 'smtp.mailgun.org'
EMAIL_PORT = 587
EMAIL_HOST_USER = 'tu-usuario-mailgun'
EMAIL_HOST_PASSWORD = 'tu-password-mailgun'
```

**Amazon SES:**
```python
EMAIL_HOST = 'email-smtp.us-east-1.amazonaws.com'
EMAIL_PORT = 587
EMAIL_HOST_USER = 'tu-access-key'
EMAIL_HOST_PASSWORD = 'tu-secret-key'
```

#### 🔐 B. Credenciales de Gmail incorrectas

**Síntoma:** `SMTPAuthenticationError`, `username and password not accepted`

**Solución:**

1. **Asegúrate de usar App Password, NO tu contraseña normal**
   - Ve a https://myaccount.google.com/security
   - Activa verificación en 2 pasos
   - Ve a "Contraseñas de aplicaciones"
   - Genera una nueva para "Correo" / "Otro dispositivo"
   - Usa esa contraseña de 16 caracteres

2. **Verifica que no haya espacios en las variables**
   ```bash
   # INCORRECTO (con espacios)
   EMAIL_HOST_PASSWORD= abcd efgh ijkl mnop
   
   # CORRECTO (sin espacios)
   EMAIL_HOST_PASSWORD=abcdefghijklmnop
   ```

3. **Variables en Render deben estar sin comillas**
   ```bash
   # INCORRECTO
   EMAIL_HOST_USER="tucorreo@gmail.com"
   
   # CORRECTO
   EMAIL_HOST_USER=tucorreo@gmail.com
   ```

#### ⏱️ C. Timeout

**Síntoma:** `socket.timeout`, la operación tarda mucho

**Solución:** Aumenta el timeout en `settings.py`:

```python
EMAIL_TIMEOUT = 60  # 60 segundos
```

#### 🚫 D. Gmail bloquea el acceso

**Síntoma:** Email se envía localmente pero no en Render

**Solución:**

1. Revisa https://myaccount.google.com/notifications
2. Gmail podría estar bloqueando el acceso desde Render
3. Considera usar un servicio de email dedicado (ver Opción 2 arriba)

## 🧪 Testing Local vs Render

### Local (funciona):
```bash
cd backend/clubmember
python manage.py test_email tu_email@ejemplo.com
```

### Render (para probar):

1. Ve a Render Dashboard → tu servicio
2. Abre la **Shell** (pestaña "Shell")
3. Ejecuta:
```bash
cd /opt/render/project/src/backend/clubmember
python manage.py diagnose_smtp
python manage.py test_email tu_email@ejemplo.com
```

## 📝 Configuración Recomendada para Render

### Usando SendGrid (Gratis y Confiable):

**1. Regístrate en SendGrid:**
https://signup.sendgrid.com/

**2. Crea una API Key:**
- Settings → API Keys → Create API Key
- Selecciona "Restricted Access"
- Activa solo "Mail Send"
- Copia la API Key

**3. En Render, agrega estas variables:**
```
EMAIL_HOST_USER=apikey
EMAIL_HOST_PASSWORD=tu-api-key-de-sendgrid
SENDGRID_ENABLED=True
```

**4. Modifica `settings.py` (opcional):**
```python
# Detectar si estamos usando SendGrid
if os.getenv('SENDGRID_ENABLED'):
    EMAIL_HOST = 'smtp.sendgrid.net'
else:
    EMAIL_HOST = 'smtp.gmail.com'
```

## ✅ Checklist de Verificación

- [ ] Variables de entorno configuradas en Render sin espacios ni comillas
- [ ] App Password de Gmail (no contraseña normal) si usas Gmail
- [ ] Ejecutado `diagnose_smtp` en Render
- [ ] Ejecutado `test_email` en Render
- [ ] Revisado logs detallados después de intentar reserva
- [ ] Considerado usar SendGrid/Mailgun si Gmail no funciona

## 🎯 Próximos Pasos

1. **Deploy los cambios actuales** con los logs mejorados
2. **Haz una reserva de prueba** en Render
3. **Revisa los logs** para ver el error específico
4. **Ejecuta los comandos de diagnóstico** en la Shell de Render
5. **Reporta el error específico** que aparece en los logs

Con la información de los logs podremos determinar la solución exacta.
