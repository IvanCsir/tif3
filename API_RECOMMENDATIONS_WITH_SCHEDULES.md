# API de Recomendaciones con Horarios Disponibles

## 📋 Cambios Implementados

Se agregó la funcionalidad de mostrar los **horarios disponibles** directamente en cada card de recomendación, para que el usuario pueda ver inmediatamente cuándo puede realizar la actividad recomendada.

## 🔧 Nuevo Método: `_get_available_schedules()`

Este método obtiene los próximos horarios disponibles para una actividad específica:

```python
def _get_available_schedules(self, activity_id, limit=5):
    """Obtiene los próximos horarios disponibles para una actividad"""
    schedules = DatosActivity.objects.filter(
        id_act_id=activity_id,
        day__gte=datetime.now().date(),
        capacity__gt=0
    ).order_by('day', 'start_time')[:limit]
    
    # Retorna los próximos 5 horarios con capacidad disponible
```

**Características:**
- Filtra solo horarios futuros (`day__gte=datetime.now().date()`)
- Solo incluye slots con capacidad disponible (`capacity__gt=0`)
- Ordena por fecha y hora (`order_by('day', 'start_time')`)
- Limita resultados (por defecto 5 horarios)
- Formatea los días en español (Lun, Mar, Mié, etc.)

## 📊 Estructura de la Respuesta

### Endpoint
```
GET /api/ai-recommendations/get_recommendations/
```

### Ejemplo de Respuesta JSON

```json
{
  "success": true,
  "recommendations": [
    {
      "id": 5,
      "nombre": "Pilates",
      "descripcion": "Fortalecimiento del core y flexibilidad",
      "aire_libre": false,
      "razon": "María, veo que ya probaste Yoga, entonces te recomiendo esto porque además hay horarios en la mañana como prefieres",
      "horarios_disponibles": [
        {
          "id": 123,
          "dia": "2026-02-06",
          "dia_texto": "Jue 06/02",
          "hora_inicio": "09:00",
          "hora_fin": "10:00",
          "capacidad": 8
        },
        {
          "id": 124,
          "dia": "2026-02-07",
          "dia_texto": "Vie 07/02",
          "hora_inicio": "09:00",
          "hora_fin": "10:00",
          "capacidad": 10
        },
        {
          "id": 125,
          "dia": "2026-02-08",
          "dia_texto": "Sáb 08/02",
          "hora_inicio": "10:00",
          "hora_fin": "11:00",
          "capacidad": 6
        },
        {
          "id": 126,
          "dia": "2026-02-10",
          "dia_texto": "Lun 10/02",
          "hora_inicio": "09:00",
          "hora_fin": "10:00",
          "capacidad": 8
        },
        {
          "id": 127,
          "dia": "2026-02-11",
          "dia_texto": "Mar 11/02",
          "hora_inicio": "18:00",
          "hora_fin": "19:00",
          "capacidad": 5
        }
      ]
    },
    {
      "id": 8,
      "nombre": "Meditación",
      "descripcion": "Mindfulness y relajación",
      "aire_libre": false,
      "razon": "María, noto que te gustan actividades similares y vi que siempre reservas en la mañana, así que esto es perfecto",
      "horarios_disponibles": [
        {
          "id": 201,
          "dia": "2026-02-06",
          "dia_texto": "Jue 06/02",
          "hora_inicio": "08:00",
          "hora_fin": "08:45",
          "capacidad": 15
        },
        {
          "id": 202,
          "dia": "2026-02-07",
          "dia_texto": "Vie 07/02",
          "hora_inicio": "08:00",
          "hora_fin": "08:45",
          "capacidad": 15
        },
        {
          "id": 203,
          "dia": "2026-02-09",
          "dia_texto": "Dom 09/02",
          "hora_inicio": "10:00",
          "hora_fin": "10:45",
          "capacidad": 12
        }
      ]
    }
  ],
  "has_history": true,
  "total_reservations": 15,
  "used_ai": true,
  "provider": "gemini"
}
```

## 🎨 Campos de Horarios

Cada objeto en `horarios_disponibles` contiene:

| Campo | Tipo | Descripción | Ejemplo |
|-------|------|-------------|---------|
| `id` | int | ID del DatosActivity (para hacer reserva) | `123` |
| `dia` | string | Fecha en formato ISO | `"2026-02-06"` |
| `dia_texto` | string | Fecha formateada legible | `"Jue 06/02"` |
| `hora_inicio` | string | Hora de inicio (HH:MM) | `"09:00"` |
| `hora_fin` | string | Hora de fin (HH:MM) | `"10:00"` |
| `capacidad` | int | Cupos disponibles | `8` |

## 💡 Beneficios

### 1. **Experiencia de Usuario Mejorada** ✨
- El usuario ve inmediatamente cuándo puede hacer la actividad
- No necesita navegar a otra página para ver horarios
- Decisión más rápida para reservar

### 2. **Contexto Completo** 📅
- La recomendación incluye toda la información necesaria
- El usuario puede evaluar si los horarios se ajustan a su agenda
- Reducción de fricción en el flujo de reserva

### 3. **Call-to-Action Más Efectivo** 🎯
- Con horarios visibles, es más probable que el usuario reserve
- Sensación de urgencia si hay pocos cupos disponibles
- Mayor conversión de recomendación a reserva

## 🖼️ Sugerencia de UI para el Frontend

```jsx
{recommendation.horarios_disponibles.map(horario => (
  <div key={horario.id} className="schedule-item">
    <div className="schedule-date">
      {horario.dia_texto}
    </div>
    <div className="schedule-time">
      {horario.hora_inicio} - {horario.hora_fin}
    </div>
    <div className="schedule-capacity">
      {horario.capacidad} cupos
    </div>
    <button onClick={() => reservar(horario.id)}>
      Reservar
    </button>
  </div>
))}
```

## 🔄 Compatibilidad

- ✅ Funciona con IA (Gemini)
- ✅ Funciona con sistema fallback (sin IA)
- ✅ Mantiene compatibilidad con respuestas anteriores
- ✅ No rompe código existente del frontend

## 🚀 Cómo Usar en el Frontend

### Ejemplo React/JavaScript

```javascript
// Obtener recomendaciones
const response = await fetch('/api/ai-recommendations/get_recommendations/');
const data = await response.json();

// Renderizar cada recomendación con sus horarios
data.recommendations.forEach(rec => {
  console.log(`Actividad: ${rec.nombre}`);
  console.log(`Razón: ${rec.razon}`);
  console.log('Próximos horarios:');
  
  rec.horarios_disponibles.forEach(horario => {
    console.log(`  - ${horario.dia_texto} de ${horario.hora_inicio} a ${horario.hora_fin} (${horario.capacidad} cupos)`);
  });
});
```

### Ejemplo de Card en React

```jsx
function RecommendationCard({ recommendation }) {
  return (
    <div className="recommendation-card">
      <h3>{recommendation.nombre}</h3>
      <p className="description">{recommendation.descripcion}</p>
      <div className="ai-reason">
        💡 {recommendation.razon}
      </div>
      
      <div className="schedules-section">
        <h4>Próximos horarios disponibles:</h4>
        <div className="schedules-grid">
          {recommendation.horarios_disponibles.length > 0 ? (
            recommendation.horarios_disponibles.map(horario => (
              <div key={horario.id} className="schedule-card">
                <div className="schedule-date">{horario.dia_texto}</div>
                <div className="schedule-time">
                  {horario.hora_inicio} - {horario.hora_fin}
                </div>
                <div className="schedule-capacity">
                  {horario.capacidad} cupos disponibles
                </div>
                <button 
                  onClick={() => handleReserve(horario.id)}
                  className="btn-reserve"
                >
                  Reservar
                </button>
              </div>
            ))
          ) : (
            <p>No hay horarios disponibles en este momento</p>
          )}
        </div>
      </div>
    </div>
  );
}
```

## 📝 Notas Técnicas

- Los horarios se limitan a 5 por actividad (configurable en `limit` parameter)
- Solo se incluyen horarios con `capacity > 0`
- Los horarios ya pasados no se muestran
- El formato de día incluye abreviación en español (Lun, Mar, Mié, etc.)
- El `id` del horario corresponde al `DatosActivity.id` para hacer la reserva

## 🔮 Mejoras Futuras Sugeridas

1. **Filtrar por horarios preferidos del usuario**
   - Mostrar primero los que coincidan con su patrón horario
   
2. **Indicador de popularidad**
   - Mostrar si un horario se está llenando rápido
   
3. **Personalización de cantidad**
   - Permitir al usuario elegir cuántos horarios ver
   
4. **Integración directa con reserva**
   - Botón para reservar directamente desde la recomendación
