import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../../styles/RecommendationsWidget.css';

const RecommendationsWidget = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Rutas públicas donde no se debe mostrar el widget
  const rutasPublicas = ['/', '/register', '/logout', '/recomendaciones-ia'];

  // No mostrar el widget si está en una ruta pública
  if (rutasPublicas.includes(location.pathname)) {
    return null;
  }

  // No mostrar el widget si no hay usuario autenticado
  const usuarioId = localStorage.getItem('usuario_id');
  if (!usuarioId) {
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
