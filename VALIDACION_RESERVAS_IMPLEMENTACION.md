# Implementación de Validación de Reservas

## ✅ Backend Completado

Se agregaron al archivo `backend/clubmember/ai_recommendations/views.py`:

1. **Método `_check_activity_compatibility`**: Valida si una actividad es segura para el usuario
2. **Endpoint `validate_reservation`**: POST `/api/ai-recommendations/validate_reservation/`

---

## 📱 Cuándo Aparece el Modal de Confirmación

### Flujo de Usuario:

```
1. Usuario navega actividades
2. Usuario hace click en "Reservar" 
   ↓
3. 🔍 VALIDACIÓN AUTOMÁTICA (antes de confirmar)
   ↓
4. ¿Hay advertencias?
   ├─ NO → Reserva se hace directamente
   └─ SÍ → 🚨 MODAL APARECE AQUÍ
            "⚠️ Esta actividad podría no ser recomendable por tus problemas de rodilla.
             ¿Estás seguro que quieres continuar?"
             [Cancelar]  [Sí, reservar de todos modos]
```

**El modal aparece ANTES de confirmar la reserva**, no después.

---

## 🔧 Integración en Frontend

### Opción 1: Modificar el componente de reserva existente

Busca el archivo donde se hace la reserva (probablemente en `src/components/Activity/` o similar) y modifica el flujo:

```javascript
// Ejemplo: En tu componente de Actividad o Modal de Reserva

import api from '../../config/api';

const handleReservar = async (activityId, datosActivityId, userId) => {
  try {
    // PASO 1: Validar ANTES de reservar
    const validationResponse = await api.post('/ai-recommendations/validate_reservation/', {
      activity_id: activityId,
      user_id: userId
    });

    const { should_confirm, warnings, activity_name } = validationResponse.data;

    // PASO 2: Si hay advertencias, mostrar modal de confirmación
    if (should_confirm && warnings.length > 0) {
      const mensaje = warnings[0].message;
      
      // Mostrar modal/alert de confirmación
      const confirmado = window.confirm(
        `⚠️ Advertencia:\n\n${mensaje}\n\n¿Estás seguro que quieres reservar "${activity_name}"?`
      );

      if (!confirmado) {
        // Usuario canceló
        return;
      }
    }

    // PASO 3: Proceder con la reserva
    await api.post(`/activities/${activityId}/reservar/`, {
      usuario: userId,
      datos_activity: datosActivityId
    });

    alert('✓ Reserva confirmada exitosamente');
    // Actualizar UI, cerrar modal, etc.

  } catch (error) {
    console.error('Error al reservar:', error);
    alert('Error al procesar la reserva');
  }
};
```

### Opción 2: Modal personalizado con React (más elegante)

```javascript
import React, { useState } from 'react';
import api from '../../config/api';

const ReservaModal = ({ activity, datosActivity, user, onClose, onSuccess }) => {
  const [showWarning, setShowWarning] = useState(false);
  const [warnings, setWarnings] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleReservar = async () => {
    setIsLoading(true);
    
    try {
      // Validar primero
      const validation = await api.post('/ai-recommendations/validate_reservation/', {
        activity_id: activity.id,
        user_id: user.id
      });

      // Si hay advertencias, mostrarlas
      if (validation.data.should_confirm) {
        setWarnings(validation.data.warnings);
        setShowWarning(true);
        setIsLoading(false);
        return; // Esperar confirmación del usuario
      }

      // Si no hay advertencias, reservar directamente
      await confirmarReserva();

    } catch (error) {
      console.error('Error:', error);
      alert('Error al validar la reserva');
      setIsLoading(false);
    }
  };

  const confirmarReserva = async () => {
    try {
      await api.post(`/activities/${activity.id}/reservar/`, {
        usuario: user.id,
        datos_activity: datosActivity.id
      });

      alert('✓ Reserva confirmada');
      onSuccess();
      onClose();

    } catch (error) {
      console.error('Error al reservar:', error);
      alert('Error al confirmar la reserva');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal">
      <div className="modal-content">
        {!showWarning ? (
          // Vista normal de reserva
          <>
            <h2>Confirmar Reserva</h2>
            <p>Actividad: {activity.name}</p>
            <p>Fecha: {datosActivity.day}</p>
            <p>Horario: {datosActivity.start_time} - {datosActivity.end_time}</p>
            
            <button onClick={handleReservar} disabled={isLoading}>
              {isLoading ? 'Validando...' : 'Reservar'}
            </button>
            <button onClick={onClose}>Cancelar</button>
          </>
        ) : (
          // Vista de advertencia (EL MODAL SE TRANSFORMA AQUÍ)
          <>
            <h2 style={{color: '#ff6b6b'}}>⚠️ Advertencia</h2>
            
            {warnings.map((warning, idx) => (
              <div key={idx} className="warning-box">
                <p><strong>{warning.message}</strong></p>
              </div>
            ))}
            
            <p style={{marginTop: '20px'}}>
              Esta actividad podría no ser la más adecuada para ti según tu perfil de salud.
            </p>
            
            <p><strong>¿Estás seguro que quieres continuar?</strong></p>
            
            <div className="modal-actions">
              <button 
                onClick={() => {
                  setShowWarning(false);
                  onClose();
                }}
                className="btn-secondary"
              >
                No, elegir otra
              </button>
              
              <button 
                onClick={confirmarReserva}
                disabled={isLoading}
                className="btn-danger"
              >
                {isLoading ? 'Reservando...' : 'Sí, reservar de todos modos'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ReservaModal;
```

---

## 🎯 Respuesta del Backend

El endpoint `/api/ai-recommendations/validate_reservation/` retorna:

```json
{
  "success": true,
  "activity_name": "Crossfit",
  "compatible": false,
  "should_confirm": true,
  "warnings": [
    {
      "limitation": "problemas de rodilla",
      "activity_type": "crossfit",
      "message": "Esta actividad podría no ser recomendable por tus problemas de rodilla"
    }
  ],
  "severity": "high",
  "user_limitations": ["problemas de rodilla"]
}
```

---

## 📝 Casos de Uso

### ✅ Caso 1: Usuario SIN limitaciones
- Click en "Reservar" → Reserva se hace automáticamente
- No ve ningún modal de advertencia

### ⚠️ Caso 2: Usuario con problemas de rodilla intenta reservar Running
- Click en "Reservar" → Se valida automáticamente
- **MODAL APARECE**: "Esta actividad podría no ser recomendable por tus problemas de rodilla"
- Usuario puede cancelar o confirmar

### ⚠️ Caso 3: Usuario con problemas de espalda intenta reservar Pilates
- Click en "Reservar" → Se valida automáticamente
- Pilates es seguro → No hay advertencias
- Reserva se hace directamente

---

## 🚀 Próximos Pasos

1. **Identifica dónde se hace la reserva en tu frontend**
   - Busca el componente que llama al endpoint `/activities/{id}/reservar/`

2. **Agrega la validación ANTES de la reserva**
   - Llama a `/ai-recommendations/validate_reservation/`
   - Espera la respuesta
   - Si `should_confirm: true`, muestra modal

3. **Prueba con diferentes perfiles**
   - Usuario sin limitaciones → reserva directa
   - Usuario con problemas de rodilla → advertencia en running/crossfit
   - Usuario con problemas de espalda → advertencia en pesas/crossfit

---

## 💡 Mejoras Opcionales

1. **Mostrar actividades alternativas** en el modal:
   ```javascript
   "Esta actividad no es recomendable para ti.
    Te sugerimos probar: Yoga, Pilates o Natación"
   ```

2. **Log de advertencias ignoradas** (para estadísticas):
   ```javascript
   if (confirmado) {
     await api.post('/reservas/log-warning-ignored/', {
       user_id: userId,
       activity_id: activityId,
       warning: warnings[0].message
     });
   }
   ```

3. **Consulta médica recomendada**:
   ```javascript
   "⚠️ Advertencia: Esta actividad involucra alto impacto.
    Recomendamos consultar con un profesional antes de continuar."
   ```

---

## 🧪 Testing

Para probar la funcionalidad:

```bash
# 1. Crear un usuario con limitaciones en el Admin de Django
# 2. Ir a: /admin/accounts/datosusuarios/
# 3. Editar un usuario y agregar en "limitaciones": "problemas de rodilla"
# 4. Intentar reservar "Running" o "Crossfit" desde el frontend
# 5. Verificar que aparece el modal de advertencia
```

---

## 📞 ¿Dudas?

- El modal aparece **inmediatamente después del click en "Reservar"**
- Es **antes** de confirmar la reserva, no después
- El usuario **puede ignorar la advertencia** y reservar de todos modos
- Es una medida de **seguridad proactiva**, no un bloqueo total
