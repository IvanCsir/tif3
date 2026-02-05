# Mejoras en Recomendaciones Personalizadas con IA

## 📋 Resumen de Cambios

Se han implementado mejoras significativas en el sistema de recomendaciones personalizadas para hacer que las sugerencias sean más contextuales y personalizadas.

## ✨ Nuevas Funcionalidades

### 1. **Personalización con Nombre del Usuario** 👤
Las recomendaciones ahora se dirigen directamente al usuario por su nombre, haciendo la experiencia más personal y cercana.

**Ejemplo anterior:**
```
"Esta actividad es ideal porque combina cardio con entrenamiento funcional"
```

**Ejemplo actual:**
```
"¡Hola María, esta actividad es ideal para ti porque combina cardio con entrenamiento funcional y sueles entrenar por la mañana!"
```

### 2. **Análisis de Patrones Horarios** ⏰
El sistema ahora analiza el historial de reservas del usuario para identificar:

- **Horario preferido**: mañana (6:00-11:59), tarde (12:00-17:59), o noche (18:00-23:59)
- **Días de la semana favoritos**: identifica los 2 días que más suele reservar
- **Duración promedio**: calcula cuánto tiempo suelen durar sus actividades

#### Ejemplo de análisis:
```python
{
  'time_preference': 'mañana',
  'preferred_days': ['Monday', 'Wednesday'],
  'avg_duration': 60,  # minutos
  'total_morning': 15,
  'total_afternoon': 3,
  'total_evening': 2
}
```

### 3. **Recomendaciones Basadas en Horarios** 📅
Las sugerencias ahora consideran:
- Los horarios en los que el usuario suele reservar
- Disponibilidad en sus días favoritos
- Duración compatible con sus preferencias

**Ejemplo de texto personalizado:**
```
"Carlos, te recomiendo CrossFit porque es similar al entrenamiento funcional que ya realizaste y se adapta a tu preferencia de entrenar en la mañana"
```

## 🔧 Cambios Técnicos Implementados

### 1. Método `_get_user_history()` mejorado
Ahora captura información adicional de cada reserva:
```python
{
    'nombre': 'Yoga',
    'descripcion': 'Clase de yoga restaurativo',
    'aire_libre': False,
    'fecha': '2026-02-01',
    'hora_inicio': '09:00',  # ✨ NUEVO
    'hora_fin': '10:00',      # ✨ NUEVO
    'dia_semana': 'Monday'    # ✨ NUEVO
}
```

### 2. Nuevo método `_analyze_user_time_preferences()`
Analiza el historial completo para extraer patrones:
- Clasifica reservas por franjas horarias
- Identifica días más frecuentes
- Calcula duración promedio de actividades

### 3. Prompt de IA mejorado
El prompt ahora incluye:
- Información de preferencias horarias del usuario
- Instrucciones específicas para personalizar con el nombre
- Directrices para mencionar horarios en las recomendaciones

**Extracto del nuevo prompt:**
```
Usuario: {nombre_usuario}
Horario preferido: mañana
Días que suele reservar: lunes, miércoles
Duración promedio de actividades: 60 minutos

FORMATO DE LA EXPLICACIÓN: Habla directamente al usuario usando su nombre. Por ejemplo:
- "{nombre}, esta actividad es ideal para ti porque..."
- "¡Hola {nombre}! Te recomiendo esto ya que sueles entrenar por la mañana y..."
```

### 4. Sistema Fallback actualizado
Cuando la API de IA no está disponible, el sistema de respaldo también:
- Usa el nombre del usuario en las razones
- Considera las preferencias horarias
- Personaliza los mensajes con contexto temporal

## 📊 Ejemplos de Salida

### Recomendación con IA (óptima):
```json
{
  "success": true,
  "recommendations": [
    {
      "id": 5,
      "nombre": "Pilates",
      "descripcion": "Fortalecimiento del core",
      "aire_libre": false,
      "razon": "Laura, te recomiendo Pilates porque es perfecto para complementar tu práctica de yoga, se enfoca en fortalecer el core y tiene horarios disponibles por la mañana que es cuando más entrenas"
    }
  ],
  "used_ai": true,
  "provider": "gemini"
}
```

### Recomendación con Fallback:
```json
{
  "success": true,
  "recommendations": [
    {
      "id": 3,
      "nombre": "Meditación",
      "descripcion": "Sesión de mindfulness",
      "aire_libre": false,
      "razon": "Ana, similar a yoga que ya realizaste y se adapta a tu preferencia de entrenar en la tarde"
    }
  ],
  "used_ai": false,
  "provider": "fallback"
}
```

## 🎯 Beneficios para el Usuario

1. **Mayor personalización**: Las recomendaciones hablan directamente al usuario
2. **Contexto temporal**: Considera cuándo el usuario suele entrenar
3. **Relevancia mejorada**: Sugiere actividades compatibles con su rutina
4. **Motivación**: Mensajes más personales aumentan el engagement
5. **Practicidad**: Recomienda actividades en horarios convenientes

## 🚀 Uso del Endpoint

```bash
GET /api/ai-recommendations/get_recommendations/
```

**Parámetros:**
- `user_id` (opcional): ID del usuario. Si no se proporciona, usa el usuario autenticado

**Respuesta incluye:**
- `recommendations`: Array de actividades recomendadas con razones personalizadas
- `has_history`: Booleano indicando si el usuario tiene historial
- `total_reservations`: Número total de reservas del usuario
- `used_ai`: Si se usó IA o el sistema fallback
- `provider`: "gemini" o "fallback"

## 📝 Notas Técnicas

- La personalización funciona tanto con IA (Gemini) como sin ella (fallback)
- Se analizan las últimas 20 reservas del usuario para patrones
- Los horarios se clasifican en 3 franjas: mañana, tarde y noche
- El sistema solo recomienda actividades relevantes (no fuerza 3 recomendaciones)

## 🔮 Posibles Mejoras Futuras

1. Considerar la climatología en base a horarios preferidos
2. Sugerir nuevos horarios para ampliar variedad
3. Detectar patrones de progresión (intensidad creciente)
4. Recomendar compañeros que entrenan en horarios similares
5. Alertas de actividades nuevas en sus horarios preferidos
