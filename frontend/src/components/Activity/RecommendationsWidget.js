import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../../styles/RecommendationsWidget.css';

const RecommendationsWidget = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const usuarioId = localStorage.getItem('usuario_id');

  // No mostrar el widget si no hay usuario autenticado o si ya está en la página de recomendaciones
  if (!usuarioId || location.pathname === '/recomendaciones-ia') {
    return null;
  }

  const handleClick = () => {
    navigate('/recomendaciones-ia');
  };

  return (
    <div className="recommendations-widget" onClick={handleClick}>
      <div className="widget-content">
        <span className="widget-icon">✨</span>
        <span className="widget-text">Mirá tus recomendaciones de actividades con IA</span>
      </div>
    </div>
  );
};

export default RecommendationsWidget;
