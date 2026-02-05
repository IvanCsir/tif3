# Sistema de Recomendaciones con IA

## 🤖 Descripción

Este sistema utiliza inteligencia artificial (Google Gemini 1.5 Flash) para generar recomendaciones personalizadas de actividades para cada usuario basándose en su historial de reservas.

## ✨ Características

- **Recomendaciones personalizadas**: Analiza el historial de cada usuario para sugerir actividades relevantes
- **Explicaciones claras**: Cada recomendación incluye una explicación de por qué se sugiere
- **Fallback inteligente**: Si la API de Gemini no está disponible, usa un algoritmo de reglas como respaldo
- **Interfaz atractiva**: Componente React con Material-UI que muestra las recomendaciones de forma visual

## 🛠️ Configuración

### 1. Instalar dependencias

```bash
cd backend/clubmember
pip install -r requirements.txt
```

### 2. Configurar la API Key de Gemini

1. Obtén una API key de Gemini en: https://aistudio.google.com/app/apikey
2. Edita el archivo `.env` en la raíz del proyecto:

```bash
GEMINI_API_KEY=tu-clave-api-aqui
```

> **Nota**: Si no configuras la API key, el sistema funcionará con el algoritmo de fallback basado en reglas.

### 3. Migrar la base de datos

```bash
cd backend/clubmember
python manage.py makemigrations
python manage.py migrate
```

## 🚀 Uso

### Acceso desde la interfaz

1. Inicia sesión en la aplicación
2. Haz clic en "Recomendaciones IA" en el menú de navegación
3. El sistema generará automáticamente recomendaciones personalizadas

### Endpoint de la API

**GET** `/api/ai-recommendations/get_recommendations/`

**Headers:**
```
Authorization: Bearer <token>
```

**Respuesta exitosa:**
```json
{
  "success": true,
  "recommendations": [
    {
      "id": 1,
      "nombre": "Paddle dobles",
      "descripcion": "Juego de paddle en parejas",
      "aire_libre": true,
      "razon": "Basado en tu preferencia por actividades al aire libre"
    }
  ],
  "has_history": true,
  "total_reservations": 5
}
```

## 🧠 Cómo funciona

### 1. Análisis del historial
- Obtiene las últimas 20 reservas del usuario
- Identifica patrones (preferencia por actividades al aire libre vs bajo techo)

### 2. Generación con IA
- Construye un prompt con el historial del usuario
- Envía el prompt a Gemini 1.5 Flash para generar recomendaciones
- Parsea y valida las recomendaciones

### 3. Fallback sin IA
Si la API de Gemini no está disponible o configurada:
- Usuarios con historial: recomienda actividades similares a las que ha reservado
- Usuarios nuevos: recomienda actividades variadas para explorar

## 📊 Métricas y mejoras futuras

### Posibles mejoras:
- Agregar embeddings semánticos con `sentence-transformers` para similitud más precisa
- Implementar sistema de feedback (👍/👎) para mejorar recomendaciones
- Cachear recomendaciones para reducir costos de API
- Considerar factores adicionales:
  - Día de la semana preferido
  - Horarios preferidos
  - Clima (para actividades al aire libre)
  - Popularidad de actividades
  - Actividades de amigos/contactos

### Métricas a trackear:
- Click-through rate (CTR) de recomendaciones
- Tasa de conversión (recomendación → reserva)
- Feedback de usuarios

## 💰 Costos

Usando Gemini 1.5 Flash:
- **GRATIS** hasta 15 RPM (requests por minuto)
- Para uso de pago: $0.075 / 1M input tokens, $0.30 / 1M output tokens
- Costo aproximado: $0.0001 - $0.0005 por recomendación
- ~500-2000 tokens por llamada
- **Mucho más económico que OpenAI** (hasta 10x más barato)

**Recomendación**: Con el tier gratuito es suficiente para la mayoría de clubs pequeños/medianos.

## 🔒 Seguridad

- La API key se almacena en variables de entorno (nunca en código)
- El endpoint requiere autenticación (JWT token)
- No se envían datos sensibles a Gemini
- Gemini no almacena tus prompts por defecto (según política de Google)

## 🐛 Troubleshooting

### Error: "No se pudieron cargar las recomendaciones"
- Verifica que `GEMINI_API_KEY` esté configurada en `.env`
- Verifica que la app `ai_recommendations` esté en `INSTALLED_APPS`
- Revisa los logs del servidor Django

### Las recomendaciones no son relevantes
- Verifica que el usuario tenga historial de reservas
- Ajusta el prompt en `views.py` → `_generate_recommendations()`
- Ajusta la `temperature` en la configuración del modelo

### Error 401 o 403 de Gemini
- Verifica que la API key sea válida
- Verifica que no hayas excedido el límite de requests (15 RPM en tier gratuito)
- Si usas tier pago, verifica que tengas créditos

## 📝 Archivos importantes

```
backend/clubmember/
├── ai_recommendations/
│   ├── __init__.py
│   ├── apps.py
│   ├── views.py          # Lógica de recomendaciones
│   └── urls.py           # Rutas de la API
├── clubmember/
│   ├── settings.py       # Agregar 'ai_recommendations' a INSTALLED_APPS
│   └── urls.py           # Incluir URLs de ai_recommendations
└── requirements.txt      # Incluye google-generativeai==0.8.3

frontend/src/
├── components/Activity/
│   └── AIRecommendations.js  # Componente React
├── components/Navbar/
│   └── Navbar.js             # Enlace en menú
└── index.js                  # Ruta /recomendaciones-ia
```

## 🎯 Próximos pasos

1. **Obtener API key de Gemini** y configurarla en `.env` (si aún no lo hiciste)
2. **Probar** la funcionalidad con usuarios que tengan historial de reservas
3. **Ajustar** el prompt según los resultados obtenidos
4. **Recopilar feedback** de usuarios reales
5. **Iterar** mejorando el algoritmo según métricas

---

**Creado**: Diciembre 2025  
**Versión**: 1.0.0  
**IA utilizada**: Google Gemini 1.5 Flash
