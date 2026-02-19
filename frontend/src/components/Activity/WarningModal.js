import React from 'react';
import '../../styles/WarningModal.css';

/**
 * Modal de advertencia para reservas con limitaciones de salud
 * 
 * @param {Object} props
 * @param {Array} props.warnings - Lista de advertencias recibidas del backend
 * @param {string} props.activityName - Nombre de la actividad
 * @param {Function} props.onConfirm - Callback cuando el usuario confirma la reserva
 * @param {Function} props.onCancel - Callback cuando el usuario cancela
 * @param {boolean} props.isLoading - Si está procesando la reserva
 */
const WarningModal = ({ warnings, activityName, onConfirm, onCancel, isLoading = false }) => {
  if (!warnings || warnings.length === 0) {
    return null;
  }

  return (
    <div className="warning-modal-overlay" onClick={onCancel}>
      <div className="warning-modal-content" onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div className="warning-modal-header">
          <span className="warning-icon">⚠️</span>
          <h2>Advertencia de Salud</h2>
        </div>

        {/* Advertencias */}
        {warnings.map((warning, index) => (
          <div key={index} className="warning-box">
            <p>{warning.message}</p>
          </div>
        ))}

        {/* Mensaje explicativo */}
        <div className="warning-message">
          <p>
            La actividad <strong>"{activityName}"</strong> podría no ser la más 
            adecuada según tu perfil de salud.
          </p>
          <p>
            Recomendamos consultar con un profesional antes de participar en 
            actividades de alto impacto con limitaciones físicas.
          </p>
        </div>

        {/* Pregunta de confirmación */}
        <p className="warning-question">
          ¿Estás seguro que quieres continuar con la reserva?
        </p>

        {/* Botones de acción */}
        <div className="warning-actions">
          <button
            className="btn-cancel-warning"
            onClick={onCancel}
            disabled={isLoading}
          >
            No, elegir otra
          </button>
          
          <button
            className="btn-confirm-warning"
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? 'Reservando...' : 'Sí, reservar igual'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default WarningModal;
