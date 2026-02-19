import { useState } from 'react';
import { api } from '../config/api';
import axios from 'axios';
import API_BASE_URL from '../config/api';

/**
 * Hook personalizado para validar y gestionar reservas con advertencias
 * 
 * Uso:
 * const { validateAndReserve, showWarning, warnings, isLoading } = useReserva();
 * 
 * await validateAndReserve({
 *   activityId: 1,
 *   datosActivityId: 5,
 *   userId: 10,
 *   onSuccess: () => console.log('Reserva exitosa'),
 *   onWarning: () => console.log('Hay advertencias')
 * });
 */
const useReserva = () => {
  const [showWarning, setShowWarning] = useState(false);
  const [warnings, setWarnings] = useState([]);
  const [activityName, setActivityName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [pendingReservation, setPendingReservation] = useState(null);

  /**
   * Valida la compatibilidad de una actividad con el perfil del usuario
   */
  const validateReservation = async (activityId, userId) => {
    try {
      const response = await api.post('/ai-recommendations/validate_reservation/', {
        activity_id: activityId,
        user_id: userId
      });

      return response.data;
    } catch (error) {
      console.error('Error al validar reserva:', error);
      throw error;
    }
  };

  /**
   * Realiza la reserva en el backend
   */
  const makeReservation = async (activityId, datosActivityId, userId) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/activities/activity/${activityId}/reservar/${datosActivityId}/`,
        {
          usuario: userId
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error al hacer reserva:', error);
      throw error;
    }
  };

  /**
   * Valida y reserva con manejo automático de advertencias
   * 
   * @param {Object} params
   * @param {number} params.activityId - ID de la actividad
   * @param {number} params.datosActivityId - ID del DatosActivity (horario específico)
   * @param {number} params.userId - ID del usuario
   * @param {Function} params.onSuccess - Callback cuando la reserva es exitosa
   * @param {Function} params.onWarning - Callback cuando hay advertencias
   * @param {Function} params.onError - Callback cuando hay error
   */
  const validateAndReserve = async ({
    activityId,
    datosActivityId,
    userId,
    onSuccess,
    onWarning,
    onError
  }) => {
    setIsLoading(true);

    try {
      // PASO 1: Validar compatibilidad
      const validation = await validateReservation(activityId, userId);

      // PASO 2: ¿Hay advertencias?
      if (validation.should_confirm && validation.warnings.length > 0) {
        // Guardar información para confirmar después
        setPendingReservation({
          activityId,
          datosActivityId,
          userId,
          onSuccess,
          onError
        });
        
        setWarnings(validation.warnings);
        setActivityName(validation.activity_name);
        setShowWarning(true);

        if (onWarning) {
          onWarning(validation.warnings);
        }

        setIsLoading(false);
        return { success: false, needsConfirmation: true };
      }

      // PASO 3: No hay advertencias, reservar directamente
      await makeReservation(activityId, datosActivityId, userId);

      if (onSuccess) {
        onSuccess();
      }

      resetState();
      return { success: true, needsConfirmation: false };

    } catch (error) {
      if (onError) {
        onError(error);
      }
      
      setIsLoading(false);
      return { success: false, error };
    }
  };

  /**
   * Confirma la reserva después de ver la advertencia
   */
  const confirmReservation = async () => {
    if (!pendingReservation) {
      console.error('No hay reserva pendiente para confirmar');
      return;
    }

    setIsLoading(true);

    try {
      const { activityId, datosActivityId, userId, onSuccess, onError } = pendingReservation;

      await makeReservation(activityId, datosActivityId, userId);

      if (onSuccess) {
        onSuccess();
      }

      resetState();
      return { success: true };

    } catch (error) {
      if (pendingReservation.onError) {
        pendingReservation.onError(error);
      }

      setIsLoading(false);
      return { success: false, error };
    }
  };

  /**
   * Cancela la reserva pendiente
   */
  const cancelReservation = () => {
    resetState();
  };

  /**
   * Reinicia el estado del hook
   */
  const resetState = () => {
    setShowWarning(false);
    setWarnings([]);
    setActivityName('');
    setIsLoading(false);
    setPendingReservation(null);
  };

  return {
    // Estado
    showWarning,
    warnings,
    activityName,
    isLoading,

    // Funciones
    validateAndReserve,
    confirmReservation,
    cancelReservation,
    resetState
  };
};

export default useReserva;
