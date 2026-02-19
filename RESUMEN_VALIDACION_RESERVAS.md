# ✅ Implementación Completa - Sistema de Validación de Reservas

## 🎯 ¿Cuándo aparece el modal?

### Flujo exacto:

```
Usuario ve actividad → [Click "Reservar"] 
                            ↓
                    Validación automática
                            ↓
                   ¿Tiene limitaciones?
                            ↓
            ┌───────────────┴───────────────┐
            ↓                               ↓
          NO                              SÍ
            ↓                               ↓
    Reserva directa              ¿Es actividad peligrosa?
    ✅ Confirmado                        ↓
                            ┌────────────┴────────────┐
                            ↓                         ↓
                          SÍ                         NO
                            ↓                         ↓
                    🚨 MODAL APARECE           Reserva directa
                    "¿Estás seguro?"           ✅ Confirmado
                            ↓
                    [Cancelar] [Confirmar]
```

**Respuesta corta**: El modal aparece **inmediatamente después del click en "Reservar"**, ANTES de confirmar la reserva, SOLO si hay incompatibilidad.

---

## 📦 Archivos Creados

### Backend (✅ Completado):
1. ✅ Método `_check_activity_compatibility()` en [views.py](backend/clubmember/ai_recommendations/views.py)
2. ✅ Endpoint `validate_reservation` en [views.py](backend/clubmember/ai_recommendations/views.py)
3. ✅ URLs ya configuradas (automático con router)

### Frontend (📝 Para integrar):
1. 📝 [WarningModal.js](frontend/src/components/Activity/WarningModal.js) - Componente del modal
2. 📝 [WarningModal.css](frontend/src/styles/WarningModal.css) - Estilos
3. 📝 [useReserva.js](frontend/src/hooks/useReserva.js) - Hook personalizado
4. 📝 [ActivityReservaExample.js](frontend/src/components/Activity/ActivityReservaExample.js) - Ejemplos de uso

---

## 🚀 Cómo Integrar (3 opciones)

### Opción 1: Más Simple (window.confirm)
Solo agrega esto ANTES de tu reserva existente:

```javascript
const handleReservar = async () => {
  // 1. Validar primero
  const validation = await api.post('/ai-recommendations/validate_reservation/', {
    activity_id: activityId,
    user_id: userId
  });

  // 2. Si hay advertencias, mostrar confirmación
  if (validation.data.should_confirm) {
    const confirmado = window.confirm(
      `⚠️ ${validation.data.warnings[0].message}\n\n¿Continuar?`
    );
    if (!confirmado) return;
  }

  // 3. Tu código de reserva existente
  // ...
};
```

### Opción 2: Componente React (Recomendado)
Usa los componentes creados:

```javascript
import useReserva from '../../hooks/useReserva';
import WarningModal from './WarningModal';

const { showWarning, warnings, activityName, validateAndReserve, confirmReservation, cancelReservation } = useReserva();

// En tu botón:
<button onClick={() => validateAndReserve({ 
  activityId, datosActivityId, userId,
  onSuccess: () => alert('✓ Reserva confirmada')
})}>
  Reservar
</button>

// Antes del cierre del return:
{showWarning && (
  <WarningModal
    warnings={warnings}
    activityName={activityName}
    onConfirm={confirmReservation}
    onCancel={cancelReservation}
  />
)}
```

### Opción 3: Integración en código existente
Ver archivo completo: [ActivityReservaExample.js](frontend/src/components/Activity/ActivityReservaExample.js)

---

## 🧪 Cómo Probar

### 1. Crear usuario de prueba con limitaciones:

```bash
# Ir al admin de Django
http://localhost:8000/admin/accounts/datosusuarios/

# Editar un usuario y agregar en "Limitaciones":
"problemas de rodilla"
```

### 2. Intentar reservar actividad riesgosa:
- Running ❌ → Debe mostrar advertencia
- Crossfit ❌ → Debe mostrar advertencia  
- Yoga ✅ → Reserva directa (sin advertencia)
- Pilates ✅ → Reserva directa (sin advertencia)

### 3. Verificar endpoints:

```bash
# Test del endpoint de validación
curl -X POST http://localhost:8000/api/ai-recommendations/validate_reservation/ \
  -H "Content-Type: application/json" \
  -d '{
    "activity_id": 1,
    "user_id": 5
  }'

# Respuesta esperada si hay advertencia:
{
  "success": true,
  "activity_name": "Crossfit",
  "compatible": false,
  "should_confirm": true,
  "warnings": [
    {
      "limitation": "problemas de rodilla",
      "message": "Esta actividad podría no ser recomendable por tus problemas de rodilla"
    }
  ],
  "severity": "high"
}
```

---

## 📋 Checklist de Integración

- [x] Backend implementado
- [x] Endpoint creado y funcionando
- [x] Componentes de frontend creados
- [ ] Importar componentes en tu app
- [ ] Agregar hook al componente de reserva
- [ ] Importar estilos CSS
- [ ] Probar con usuario con limitaciones
- [ ] Probar con usuario sin limitaciones
- [ ] Verificar que reservas se completan correctamente

---

## 🔒 Casos de Uso Reales

### Caso 1: Usuario normal (sin limitaciones)
```
Click "Reservar" → ✅ Reserva inmediata
```
**No ve ningún modal**

### Caso 2: Usuario con problemas de rodilla + Running
```
Click "Reservar" → 🔍 Validación → 🚨 MODAL
"Esta actividad podría no ser recomendable por tus problemas de rodilla"
[No, elegir otra] [Sí, reservar igual]
```

### Caso 3: Usuario con problemas de espalda + Crossfit
```
Click "Reservar" → 🔍 Validación → 🚨 MODAL
"Esta actividad podría no ser recomendable por tus problemas de espalda"
```

### Caso 4: Usuario con problemas de rodilla + Yoga
```
Click "Reservar" → 🔍 Validación → ✅ Reserva inmediata
```
**No hay modal porque Yoga es seguro**

---

## 💡 Ventajas del Sistema

1. ✅ **Proactivo**: Advierte ANTES de reservar, no después
2. ✅ **No bloqueante**: El usuario puede decidir continuar
3. ✅ **Transparente**: Explica exactamente por qué hay advertencia
4. ✅ **Reutilizable**: Hook y componentes fáciles de usar
5. ✅ **Configurable**: Fácil agregar más limitaciones/keywords
6. ✅ **Mejora UX**: Evita reservas inadecuadas
7. ✅ **Reduce riesgos**: Legal y médicamente responsable

---

## 🛠️ Personalización

### Agregar más limitaciones:

Editar en [views.py](backend/clubmember/ai_recommendations/views.py#L288):

```python
limitacion_keywords = {
    'rodilla': {
        'keywords': ['running', 'correr', 'trote', 'salto'],
        'message': 'problemas de rodilla'
    },
    'asma': {  # ← NUEVA
        'keywords': ['cardio', 'running', 'intenso', 'hiit'],
        'message': 'asma'
    },
    # ... más limitaciones
}
```

### Cambiar severidad del mensaje:

En [WarningModal.js](frontend/src/components/Activity/WarningModal.js), personaliza el texto:

```javascript
<p>
  ⚠️ IMPORTANTE: Esta actividad presenta riesgos para tu condición.
  Te recomendamos consultar con tu médico antes de continuar.
</p>
```

---

## 📞 Soporte

Si tienes dudas sobre:
- ✅ **Backend**: Todo está implementado y listo
- 📝 **Frontend**: Usa los componentes y ejemplos creados
- 🐛 **Bugs**: Revisa la consola del navegador y logs del servidor
- 🎨 **Estilos**: Edita [WarningModal.css](frontend/src/styles/WarningModal.css)

---

## 🎬 Próximos Pasos

1. **Integra el hook** en tu componente de reserva existente
2. **Importa el modal** y los estilos
3. **Prueba** con diferentes perfiles de usuario
4. **Ajusta** el estilo según tu diseño
5. **(Opcional)** Agrega logging de advertencias ignoradas
6. **(Opcional)** Sugiere actividades alternativas en el modal

**¡Todo listo para usar!** 🚀
