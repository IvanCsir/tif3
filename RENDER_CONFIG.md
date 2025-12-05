# Instrucciones de Configuración para Render

## Configuración del Frontend en Render

### Opción 1: Static Site (RECOMENDADO - MÁS SIMPLE)

1. **Tipo de Servicio:** Static Site
2. **Build Command:** `npm install && npm run build`
3. **Publish Directory:** `build`
4. **Redirect/Rewrite Rules:**
   - Source: `/*`
   - Destination: `/index.html`
   - Action: `Rewrite`

### Opción 2: Web Service con Express

Si necesitas usar Web Service (por ejemplo, para variables de entorno dinámicas):

1. **Tipo de Servicio:** Web Service
2. **Build Command:** `npm install && npm run build`
3. **Start Command:** `npm run start:prod`
4. **Environment Variables:**
   - `NODE_ENV=production`
   - `PORT=10000` (o el puerto que Render asigne)

## Verificación de la Configuración Actual

Para verificar si tu configuración actual de Render es correcta:

### 1. Verifica el Tipo de Servicio
- Ve a tu servicio en Render Dashboard
- Mira en la parte superior: debe decir "Static Site" o "Web Service"

### 2. Si es Static Site:
- Verifica que "Publish Directory" sea `build`
- Verifica que existan las reglas de reescritura en Settings → Redirects/Rewrites

### 3. Si es Web Service:
- Verifica que "Start Command" sea `npm run start:prod` o `node server.js`
- Asegúrate de que el puerto sea dinámico: `process.env.PORT`

## Solución al Error "Not Found"

El error "Not Found" ocurre cuando:

1. **El servidor no devuelve `index.html` para todas las rutas**
   - Solución Static Site: Configurar Rewrite Rules
   - Solución Web Service: Usar express con catch-all route

2. **Los archivos de configuración no se copian al build**
   - El archivo `_redirects` en `public/` se copia automáticamente a `build/`
   - Verifica que exista: `build/_redirects` después del build

3. **El tipo de servicio no coincide con la configuración**
   - Si es Static Site pero no tienes rewrite rules → Agrégalas
   - Si es Web Service pero no usas servidor → Cambia el start command

## Pasos para Solucionar

### Método 1: Cambiar a Static Site (Más Simple)

1. Ve a tu servicio de frontend en Render
2. Settings → Delete Web Service (si es Web Service)
3. Crea nuevo: New → Static Site
4. Conecta el repositorio
5. Configurar:
   - Root Directory: `frontend`
   - Build Command: `npm install && npm run build`
   - Publish Directory: `build`
6. Después de crear, ve a Settings → Redirects/Rewrites
7. Add Rule:
   - Source: `/*`
   - Destination: `/index.html`
   - Action: `Rewrite`

### Método 2: Arreglar Web Service Actual

1. Ve a Settings de tu servicio frontend
2. Build Command: `npm install && npm run build`
3. Start Command: `npm run start:prod`
4. Redeploy

## Testing Local

Para probar la configuración de producción localmente:

```bash
# Build la aplicación
npm run build

# Opción 1: Probar con serve (simula Static Site)
npm run serve

# Opción 2: Probar con express (simula Web Service)
npm run start:prod

# Luego abre http://localhost:3000
# Navega a /actividades
# Recarga la página (F5)
# No debería mostrar "Not Found"
```

## Archivos Importantes

- `public/_redirects` - Para Netlify y Static Sites que lo soporten
- `public/serve.json` - Para el paquete `serve` de npm
- `server.js` - Para Web Service con Express
- `render.yaml` - Para Blueprint (configuración automática)

## Diagnóstico Rápido

Si después de desplegar sigue apareciendo "Not Found":

1. **Verifica en Render Logs:**
   ```
   Deploy → Latest Deploy → View Logs
   ```
   
2. **Busca errores como:**
   - "404 Not Found" → Problema de redirección
   - "Cannot GET /actividades" → Servidor no configurado correctamente
   - "Failed to load resource" → Archivos no encontrados

3. **Verifica la configuración:**
   ```bash
   # En tu computadora, después del build
   ls -la frontend/build/_redirects
   # Debe existir este archivo
   ```

4. **Verifica el tipo de servicio:**
   - Static Site → No necesita server.js, solo rewrite rules
   - Web Service → Necesita server.js o serve con configuración correcta

## Comando de Emergencia

Si nada funciona, prueba este enfoque:

1. Elimina el servicio actual en Render
2. Crea uno nuevo como **Static Site**
3. Usa estas configuraciones exactas:
   - Root Directory: `frontend`
   - Build Command: `npm install && npm run build`
   - Publish Directory: `build`
4. Después de crear, agrega la regla de reescritura:
   - `/*` → `/index.html` (Rewrite)
5. Deploy

Esto debería funcionar el 100% de las veces para aplicaciones React con React Router.
