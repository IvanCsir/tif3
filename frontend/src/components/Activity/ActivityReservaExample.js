import React from 'react';
import useReserva from '../../hooks/useReserva';
import WarningModal from './WarningModal';

/**
 * Ejemplo de cómo usar el sistema de validación de reservas
 * 
 * Este componente muestra cómo integrar la validación automática
 * en tu componente de reserva existente
 */
const ActivityReservaExample = ({ activity, datosActivity, currentUser }) => {
  
  // Hook personalizado que maneja toda la lógica de validación
  const {
    showWarning,
    warnings,
    activityName,
    isLoading,
    validateAndReserve,
    confirmReservation,
    cancelReservation
  } = useReserva();

  /**
   * Manejador del botón "Reservar"
   * Se llama automáticamente cuando el usuario hace click
   */
  const handleReservar = async () => {
    const result = await validateAndReserve({
      activityId: activity.id,
      datosActivityId: datosActivity.id,
      userId: currentUser.id,
      
      // Callback cuando la reserva es exitosa
      onSuccess: () => {
        alert('✓ Reserva confirmada exitosamente');
        // Actualizar UI, cerrar modal, recargar datos, etc.
      },
      
      // Callback cuando hay advertencias (opcional, el modal se muestra automáticamente)
      onWarning: (warnings) => {
        console.log('Advertencias detectadas:', warnings);
      },
      
      // Callback cuando hay error
      onError: (error) => {
        alert('Error al procesar la reserva: ' + error.message);
      }
    });

    if (!result.needsConfirmation && result.success) {
      console.log('Reserva realizada sin advertencias');
    }
  };

  return (
    <div className="activity-card">
      <h3>{activity.name}</h3>
      <p>{activity.description}</p>
      
      <div className="schedule-info">
        <p>📅 {datosActivity.day}</p>
        <p>🕐 {datosActivity.start_time} - {datosActivity.end_time}</p>
        <p>👥 Cupos disponibles: {datosActivity.capacity}</p>
      </div>

      {/* Botón de reserva normal */}
      <button 
        onClick={handleReservar} 
        disabled={isLoading || datosActivity.capacity === 0}
        className="btn-reservar"
      >
        {isLoading ? 'Validando...' : 'Reservar'}
      </button>

      {/* Modal de advertencia (solo aparece si hay warnings) */}
      {showWarning && (
        <WarningModal
          warnings={warnings}
          activityName={activityName}
          onConfirm={confirmReservation}
          onCancel={cancelReservation}
          isLoading={isLoading}
        />
      )}
    </div>
  );
};

export default ActivityReservaExample;


/**
 * ============================================
 * EJEMPLO 2: Integración en componente existente
 * ============================================
 * 
 * Si ya tienes un componente de reserva, solo necesitas:
 * 
 * 1. Importar el hook:
 *    import useReserva from '../../hooks/useReserva';
 * 
 * 2. Usar el hook en tu componente:
 *    const { validateAndReserve, ... } = useReserva();
 * 
 * 3. Reemplazar tu función handleReservar existente:
 * 
 *    const handleReservar = async () => {
 *      await validateAndReserve({
 *        activityId: activity.id,
 *        datosActivityId: datosActivity.id,
 *        userId: currentUser.id,
 *        onSuccess: () => {
 *          // Tu código existente de éxito
 *        }
 *      });
 *    };
 * 
 * 4. Agregar el modal antes del cierre del return:
 * 
 *    {showWarning && (
 *      <WarningModal
 *        warnings={warnings}
 *        activityName={activityName}
 *        onConfirm={confirmReservation}
 *        onCancel={cancelReservation}
 *        isLoading={isLoading}
 *      />
 *    )}
 * 
 * ¡Eso es todo! El sistema maneja automáticamente:
 * - Validación previa a la reserva
 * - Mostrar/ocultar el modal de advertencia
 * - Confirmar o cancelar la reserva
 * - Estados de carga
 */


/**
 * ============================================
 * EJEMPLO 3: Uso simple con window.confirm
 * ============================================
 * 
 * Si prefieres algo más simple sin componentes adicionales:
 */

const SimpleReservaExample = ({ activity, datosActivity, currentUser }) => {
  const [isLoading, setIsLoading] = React.useState(false);

  const handleReservar = async () => {
    setIsLoading(true);

    try {
      // Validar primero
      const validation = await fetch('/api/ai-recommendations/validate_reservation/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          activity_id: activity.id,
          user_id: currentUser.id
        })
      }).then(r => r.json());

      // Si hay advertencias, mostrar confirmación
      if (validation.should_confirm && validation.warnings.length > 0) {
        const mensaje = validation.warnings[0].message;
        const confirmado = window.confirm(
          `⚠️ ADVERTENCIA\n\n${mensaje}\n\n¿Deseas continuar con la reserva?`
        );

        if (!confirmado) {
          setIsLoading(false);
          return;
        }
      }

      // Reservar
      await fetch(`/api/activities/${activity.id}/reservar/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usuario: currentUser.id,
          datos_activity: datosActivity.id
        })
      });

      alert('✓ Reserva confirmada');

    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button onClick={handleReservar} disabled={isLoading}>
      {isLoading ? 'Procesando...' : 'Reservar'}
    </button>
  );
};
