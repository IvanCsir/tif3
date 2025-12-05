# GUÍA VISUAL: Configurar Redirects en Render

## 🎯 SOLUCIÓN RÁPIDA - Solo necesitas agregar UNA regla de redirección

### Paso 1: Ve a tu Dashboard de Render
1. Abre https://dashboard.render.com
2. Click en tu servicio de frontend (probablemente se llama "tif3-frontend")

### Paso 2: Identifica el tipo de servicio

Mira en la parte superior izquierda, debajo del nombre del servicio.
Dirá uno de estos:

- **"Static Site"** → Sigue los pasos de la Opción A
- **"Web Service"** → Sigue los pasos de la Opción B

---

## OPCIÓN A: Si tu servicio es "Static Site"

### ✅ ESTO ES LO QUE NECESITAS AGREGAR:

1. En tu servicio, ve al menú izquierdo
2. Click en **"Redirects/Rewrites"**
3. Click en **"Add Rule"** o **"Add Redirect/Rewrite"**
4. Llena el formulario:

```
┌─────────────────────────────────────────┐
│ Add Redirect/Rewrite Rule               │
├─────────────────────────────────────────┤
│                                         │
│ Source:      /*                         │
│              (escribe: /*  )            │
│                                         │
│ Destination: /index.html                │
│              (escribe: /index.html )    │
│                                         │
│ Action:      ⚫ Rewrite (selecciona)    │
│              ○ Redirect                 │
│                                         │
│ Status:      [no importa si hay]        │
│                                         │
│         [Cancel]  [Save]                │
└─────────────────────────────────────────┘
```

5. Click en **"Save"**
6. Render automáticamente re-despliega
7. **¡LISTO! Debería funcionar**

### Verificación Settings (también revisa esto):

En el menú izquierdo, click en **"Settings"**:

```
Build Command:     npm install && npm run build
Publish Directory: build
```

Si eso es correcto + agregas la regla de Rewrite → **Funcionará 100%**

---

## OPCIÓN B: Si tu servicio es "Web Service"

### ✅ ESTO ES LO QUE NECESITAS CAMBIAR:

1. En tu servicio, ve al menú izquierdo
2. Click en **"Settings"**
3. Busca estas configuraciones:

```
Build Command:  npm install && npm run build
                (deja esto igual)

Start Command:  npm run start:prod
                (CAMBIA ESTO - debe ser esto exactamente)
```

4. Scroll abajo y click en **"Save Changes"**
5. El servicio se re-despliega automáticamente
6. **¡LISTO!**

---

## 🚨 ¿Cuál Opción Usar?

### USA OPCIÓN A (Static Site) SI:
- ✅ Tu servicio ya dice "Static Site"
- ✅ Solo necesitas servir React
- ✅ No tienes código backend en el frontend

### USA OPCIÓN B (Web Service) SI:
- ✅ Tu servicio ya dice "Web Service"
- ✅ Necesitas ejecutar código Node.js
- ✅ Ya está configurado así

**RECOMENDACIÓN:** Si puedes elegir, usa **Static Site (Opción A)** - es más simple y más rápido.

---

## 🔧 ¿Cómo Cambiar de Web Service a Static Site?

Si actualmente tienes Web Service pero quieres cambiarlo:

1. En tu servicio, arriba a la derecha, click en **"..."** (tres puntos)
2. Click en **"Delete Service"** (no te preocupes, no pierdes nada)
3. En el dashboard principal, click en **"New +"**
4. Selecciona **"Static Site"**
5. Conecta tu repositorio
6. Configuración:

```
Name:              tif3-frontend
Root Directory:    frontend
Build Command:     npm install && npm run build
Publish Directory: build
```

7. Click **"Create Static Site"**
8. Después de creado, ve a **"Redirects/Rewrites"** y agrega la regla del OPCIÓN A
9. **¡Listo!**

---

## 📸 Screenshot de Referencia

Cuando abras tu servicio, deberías ver algo así:

```
┌──────────────────────────────────────────────────────┐
│ < Dashboard    tif3-frontend                    ...  │
├──────────────────────────────────────────────────────┤
│ 🟢 Live        Static Site  ← MIRA ESTO             │
│                                                      │
│ https://tif3-frontend.onrender.com                  │
├──────────────────────────────────────────────────────┤
│ ┌─ Menu                                             │
│ │                                                    │
│ │  Logs                                             │
│ │  Settings                                         │
│ │  Redirects/Rewrites    ← VE AQUÍ                 │
│ │  Environment                                      │
│ │  ...                                              │
│ └─                                                   │
└──────────────────────────────────────────────────────┘
```

---

## 🧪 Cómo Probar que Funciona

Después de agregar la configuración:

1. Espera que termine el deploy (1-3 minutos)
2. Abre tu sitio: `https://tif3-frontend.onrender.com`
3. Navega a: `https://tif3-frontend.onrender.com/actividades`
4. **Presiona F5** (recargar página)
5. Si carga correctamente → **¡FUNCIONÓ!** ✅
6. Si sigue "Not Found" → Revisa que agregaste la regla correctamente

---

## ⚠️ IMPORTANTE

La regla de Rewrite/Redirect es **ESENCIAL** para aplicaciones React con React Router.

Sin esta regla:
- `/` funciona ✅
- `/actividades` funciona si navegas desde la app ✅
- **Recargar `/actividades` → 404 Not Found ❌**

Con esta regla:
- Todo funciona siempre ✅✅✅

---

## 💡 Resumen Ultra-Rápido

**Si es Static Site:**
Settings → Redirects/Rewrites → Add Rule:
- `/*` → `/index.html` (Rewrite)

**Si es Web Service:**
Settings → Start Command:
- `npm run start:prod`

**¡Eso es todo!**
