# Configurar SendGrid para Envío de Emails en Render

## 🚨 Problema Identificado

Render **bloquea las conexiones SMTP directas** a Gmail (puertos 587 y 465):
```
OSError: [Errno 101] Network is unreachable
```

## ✅ Solución: SendGrid

SendGrid es un servicio de email transaccional que funciona perfectamente con Render.

### Paso 1: Crear Cuenta en SendGrid (GRATIS)

1. Ve a https://signup.sendgrid.com/
2. Regístrate con tu email
3. Completa la verificación de email
4. **Importante**: Completa el formulario "Tell us about yourself" para activar tu cuenta
   - Selecciona: "I'm sending email to my customers/users"
   - Company Website: Puedes poner tu URL de Render o GitHub
   - Daily sending volume: "100 or less"

### Paso 2: Crear API Key

1. Una vez dentro, ve a **Settings** → **API Keys**
2. Click en **"Create API Key"**
3. Nombre: `Render Production` (o el que prefieras)
4. Tipo: Selecciona **"Restricted Access"**
5. Permisos: Activa solo **"Mail Send"** → **"Full Access"**
6. Click **"Create & View"**
7. **COPIA LA API KEY** (solo se muestra una vez)
   - Se ve algo así: `SG.xxxxxxxxxxxxxxxxxx.yyyyyyyyyyyyyyyyyyyyyyyyyyyy`

### Paso 3: Configurar Single Sender (Requerido)

SendGrid requiere verificar tu email de remitente:

1. Ve a **Settings** → **Sender Authentication**
2. Click en **"Verify a Single Sender"**
3. Completa el formulario:
   - **From Name**: Club Member
   - **From Email Address**: tu-email@gmail.com (el que usabas antes)
   - **Reply To**: mismo email
   - **Company Address**: dirección de tu empresa/personal
4. Click **"Create"**
5. **Revisa tu email** y verifica el remitente haciendo click en el link

### Paso 4: Configurar Variables en Render

1. Ve a tu **Backend Service** en Render
2. Ve a **Environment**
3. **Elimina o comenta** (deja las viejas por si acaso):
   - ~~EMAIL_HOST_USER~~
   - ~~EMAIL_HOST_PASSWORD~~
   - ~~EMAIL_PORT~~
   - ~~EMAIL_USE_TLS~~
   - ~~EMAIL_USE_SSL~~

4. **Agrega NUEVA variable**:
   ```
   SENDGRID_API_KEY=SG.tu-api-key-aqui
   ```

5. **Agrega también** (para usar como remitente):
   ```
   EMAIL_HOST_USER=tu-email-verificado@gmail.com
   ```

### Paso 5: Deploy

1. Guarda los cambios en Render
2. Render redesplegará automáticamente
3. Espera 2-3 minutos

### Paso 6: Probar

1. Haz una reserva de prueba
2. Revisa los logs en Render:
   ```
   Email configurado: True
   ✓ Email enviado exitosamente a ...
   ```
3. Revisa tu bandeja de entrada (y spam)

## 📊 Verificar Configuración

En la Shell de Render:

```bash
cd /opt/render/project/src/backend/clubmember
python manage.py test_email tu_email@ejemplo.com
```

## 🎯 Límites de SendGrid (Capa Gratuita)

- ✅ **100 emails por día** - Más que suficiente para tu app
- ✅ Sin límite de tiempo
- ✅ Sin tarjeta de crédito requerida
- ✅ Análisis de emails (abiertos, clicks, etc.)

## 🔄 Volver a Gmail (Local)

El código está configurado para usar Gmail automáticamente cuando no detecta `SENDGRID_API_KEY`. 

En tu `.env` local puedes seguir usando:
```
EMAIL_HOST_USER=tu-email@gmail.com
EMAIL_HOST_PASSWORD=tu-app-password
```

## ❓ Solución de Problemas

### Error: "The from address does not match a verified Sender Identity"
- **Solución**: Verifica el email en SendGrid (Paso 3)
- El email debe coincidir exactamente con el verificado

### Los emails llegan a spam
- **Solución**: Es normal al principio. Con el tiempo mejora la reputación
- Configura **Domain Authentication** en SendGrid (opcional, mejora entregabilidad)

### Error de autenticación
- **Solución**: Verifica que copiaste bien la API Key
- La API Key debe empezar con `SG.`
- No debe tener espacios ni comillas extra

## 📧 Alternativas si no quieres usar SendGrid

1. **Mailgun**: https://www.mailgun.com/ (5,000 emails/mes gratis)
2. **Amazon SES**: https://aws.amazon.com/ses/ (62,000 emails/mes gratis)
3. **Brevo (antes Sendinblue)**: https://www.brevo.com/ (300 emails/día gratis)

Pero SendGrid es el más fácil de configurar para Render.

## ✅ Checklist Final

- [ ] Cuenta de SendGrid creada y verificada
- [ ] API Key generada con permisos "Mail Send"
- [ ] Single Sender verificado (check email)
- [ ] Variable `SENDGRID_API_KEY` agregada en Render
- [ ] Variable `EMAIL_HOST_USER` con el email verificado
- [ ] Deploy completado en Render
- [ ] Prueba de reserva exitosa
- [ ] Email recibido correctamente

---

**Una vez configurado, los emails se enviarán sin problemas desde Render** 🎉
