# Guía de Deployment - Solución al Error "Not Found" al recargar

## Problema
Cuando se recarga la página en producción o se navega directamente a una ruta (ej: `/actividades`, `/reservar`), aparece un error "Not Found".

## Causa
Las aplicaciones React con client-side routing (React Router) necesitan que el servidor redirija todas las rutas al archivo `index.html` para que React pueda manejar el routing.

## Soluciones por Plataforma

### 1. Render (Sitio Estático)

**Opción A: Usar el archivo render.yaml (RECOMENDADO)**

Se ha creado un archivo `render.yaml` en la raíz del proyecto que configura automáticamente las redirecciones.

Para usarlo:
1. Ve a tu dashboard de Render
2. Elimina los servicios existentes (si los tienes configurados manualmente)
3. Haz clic en "New" → "Blueprint"
4. Conecta tu repositorio
5. Render detectará automáticamente el archivo `render.yaml` y creará los servicios

**Opción B: Configuración Manual del Frontend**

Si prefieres mantener la configuración manual:

1. Ve a tu servicio de frontend en Render
2. Asegúrate de que el tipo sea "Static Site"
3. En "Build Command": `npm install && npm run build`
4. En "Publish Directory": `build`
5. En "Rewrite Rules", agrega:
   - Source: `/*`
   - Destination: `/index.html`
   - Action: `Rewrite`

### 2. Netlify

Ya tienes configurado el archivo `_redirects` en la carpeta `public/`, que se copiará automáticamente al build:

```
/* /index.html 200
```

Esto funciona automáticamente cuando despliegas en Netlify.

### 3. Vercel

Crea un archivo `vercel.json` en la raíz de `frontend/`:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/" }
  ]
}
```

### 4. Servidor con Express/Node

Si sirves la aplicación con Node.js:

```javascript
const express = require('express');
const path = require('path');
const app = express();

app.use(express.static(path.join(__dirname, 'build')));

app.get('/*', function (req, res) {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(process.env.PORT || 3000);
```

### 5. Servidor Apache

Crea un archivo `.htaccess` en la carpeta `build/`:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteCond %{REQUEST_FILENAME} !-l
  RewriteRule . /index.html [L]
</IfModule>
```

## Verificación

Después de aplicar la solución:

1. Haz un nuevo deployment
2. Navega a una ruta específica (ej: `https://tif3-frontend.onrender.com/actividades`)
3. Recarga la página (F5 o Ctrl+R)
4. La página debería cargar correctamente sin mostrar "Not Found"

## Archivos Importantes

- `/frontend/public/_redirects` - Para Netlify
- `/frontend/public/serve.json` - Para serve (npm package)
- `/frontend/public/netlify.toml` - Configuración alternativa para Netlify
- `/render.yaml` - Configuración completa para Render (backend + frontend)

## Comandos Útiles

```bash
# Build local
cd frontend
npm run build

# Servir localmente con las mismas reglas de producción
npm run serve

# O usar serve directamente
npx serve -s build -l 3000
```

## Notas Adicionales

- El archivo `_redirects` en `public/` se copia automáticamente a `build/` durante el proceso de build
- Para Render, el tipo "Static Site" es el más adecuado para aplicaciones React
- Asegúrate de que todas las variables de entorno estén configuradas correctamente en Render
