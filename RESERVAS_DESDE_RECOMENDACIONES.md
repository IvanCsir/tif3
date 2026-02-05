# Reservas desde Recomendaciones de AI

## Resumen de Cambios

Se ha implementado la funcionalidad para reservar actividades directamente desde las recomendaciones de AI sin necesidad de navegar a otra página, reutilizando el endpoint de reserva existente.

## Cambios en el Backend

### Endpoint Utilizado: `reservar` (Existente)

**Archivo**: `backend/clubmember/actividades/views.py`

**Ruta**: `POST /api/activities/activity/{id_act}/reservar/{id_datos_activity}/`

**Descripción**: Utiliza el endpoint de reserva existente que incluye toda la lógica de validación, transacciones y envío de emails.

**Parámetros URL**:
- `id_act`: ID de la actividad (Activity)
- `id_datos_activity`: ID del slot de horario (DatosActivity)

**Request Body**:
```json
{
  "usuario": 456  // ID del usuario (DatosUsuarios)
}
```

**Características del Endpoint**:
- ✅ Valida que no exista una reserva duplicada
- ✅ Verifica capacidad disponible
- ✅ Usa transacciones atómicas para garantizar consistencia
- ✅ Actualiza la capacidad automáticamente
- ✅ Envía email de confirmación con archivo .ics
- ✅ Manejo robusto de errores
- ✅ Toda la lógica está centralizada (no hay duplicación de código)

## Cambios en el Frontend

### 1. Componente Actualizado: `AIRecommendations.js`

**Archivo**: `frontend/src/components/Activity/AIRecommendations.js`

### 2. Nuevas Funcionalidades

#### Botón de Reserva en cada Horario
- Cada horario disponible ahora tiene un botón "Reservar"
- El botón muestra un indicador de carga mientras procesa la reserva
- Se deshabilita automáticamente si no hay capacidad
- Usa el endpoint de reserva existente para mantener consistencia

#### Estado de Carga
- Indicador visual mientras se procesa la reserva
- Previene múltiples clics accidentales

#### Notificaciones (Snackbar)
- Notificación de éxito al reservar correctamente
- Notificación de error si algo falla
- Mensajes claros y específicos

#### Actualización Automática
- Después de reservar exitosamente, se actualizan las recomendaciones
- Refleja la nueva capacidad disponible en tiempo real

### 3. UI/UX Mejorada

```
┌─────────────────────────────────────────┐
│  📅 Yoga                    [Al aire libre]│
│  Clase de yoga relajante                │
│                                         │
│  💡 ¿Por qué te lo recomendamos?       │
│  Como siempre reservas a las 8:00...   │
│                                         │
│  📅 Próximos horarios:                 │
│  ┌─────────────────────────────────┐  │
│  │ Lun 10/02                       │  │
│  │ ⏰ 08:00 - 09:00  👥 10  [Reservar]│  │
│  └─────────────────────────────────┘  │
│  ┌─────────────────────────────────┐  │
│  │ Mié 12/02                       │  │
│  │ ⏰ 08:00 - 09:00  👥 8   [Reservar]│  │
│  └─────────────────────────────────┘  │
│                                         │
│  [Ver todos los horarios]              │
└─────────────────────────────────────────┘
```

## Flujo de Usuario

1. **Usuario ve las recomendaciones**
   - Accede a la sección de Recomendaciones
   - Ve actividades personalizadas con horarios disponibles

2. **Usuario selecciona un horario**
   - Hace clic en el botón "Reservar" del horario deseado
   - El botón muestra un indicador de carga

3. **Sistema procesa la reserva**
   - Backend valida los datos
   - Verifica disponibilidad
   - Crea la reserva
   - Actualiza la capacidad

4. **Usuario recibe confirmación**
   - Snackbar muestra mensaje de éxito/error
   - Las recomendaciones se actualizan automáticamente
   - Capacidad actualizada visible inmediatamente

## Validaciones Implementadas

### Backend
- ✅ Usuario existe
- ✅ Horario existe
- ✅ No hay reserva duplicada
- ✅ Hay capacidad disponible
- ✅ Transacción atómica

### Frontend
- ✅ Usuario autenticado
- ✅ Un solo clic por reserva (deshabilita botón)
- ✅ No permite reservar si capacidad = 0
- ✅ Manejo de errores de red

## Endpoints Relacionados

1. **GET** `/api/ai-recommendations/get_recommendations/` - Obtiene recomendaciones personalizadas
2. **POST** `/api/activities/activity/{id_act}/reservar/{id_datos_activity}/` - Crea reserva (endpoint existente reutilizado)

## Ventajas de Reutilizar el Endpoint Existente

1. **Mantenibilidad**: Un solo lugar para la lógica de reservas
2. **Consistencia**: Mismo comportamiento en toda la aplicación
3. **Email confirmación**: Incluye envío automático de email con archivo .ics
4. **No duplicación**: Evita código redundante
5. **Validaciones centralizadas**: Todas las reglas de negocio en un lugar

## Beneficios

1. **Mejor UX**: Usuario puede reservar sin cambiar de página
2. **Más rápido**: Reducción de clics y navegación
3. **Contextual**: Reserva en el contexto de la recomendación
4. **Feedback inmediato**: Notificaciones claras del resultado
5. **Actualización automática**: Ve los cambios en tiempo real

## Compatibilidad

- ✅ Compatible con el sistema de reservas existente
- ✅ No afecta otras funcionalidades
- ✅ Usa las mismas validaciones que el sistema principal
- ✅ Respeta las reglas de negocio establecidas

## Testing Sugerido

### Backend
```bash
# POST - Crear reserva exitosa (usando endpoint existente)
curl -X POST http://localhost:8000/api/activities/activity/1/reservar/123/ \
  -H "Content-Type: application/json" \
  -d '{"usuario": 456}'

# POST - Intento de reserva duplicada (debe fallar)
curl -X POST http://localhost:8000/api/activities/activity/1/reservar/123/ \
  -H "Content-Type: application/json" \
  -d '{"usuario": 456}'

# POST - Reserva sin capacidad (debe fallar)
curl -X POST http://localhost:8000/api/activities/activity/1/reservar/999/ \
  -H "Content-Type: application/json" \
  -d '{"usuario": 456}'
```

### Frontend
1. Abrir sección de Recomendaciones
2. Hacer clic en "Reservar" en un horario disponible
3. Verificar notificación de éxito
4. Verificar que la capacidad se actualiza
5. Intentar reservar el mismo horario de nuevo (debe fallar)
6. Verificar notificación de error apropiada

## Próximos Pasos (Opcional)

- [ ] Agregar confirmación antes de reservar (modal de diálogo)
- [ ] Mostrar historial de reservas en la misma página
- [ ] Permitir cancelar reservas desde recomendaciones
- [ ] Agregar filtros de horarios (mañana/tarde/noche)
- [ ] Sincronización con calendario personal

## Notas Técnicas

- El frontend usa el endpoint existente `/api/activities/activity/{id_act}/reservar/{id_datos_activity}/`
- Se pasa el `activity_id` junto con el `datos_activity_id` desde las recomendaciones
- Reutiliza toda la lógica existente de validación, transacciones y envío de emails
- No hay duplicación de código - mejor mantenibilidad
- Las recomendaciones incluyen el `id` de la actividad en cada objeto de recomendación
