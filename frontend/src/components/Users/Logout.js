import React, { useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import API_BASE_URL from '../../config/api';


// Componente para manejar el Logout
export default function Logout() {
  const navigate = useNavigate();
  
  useEffect(() => {
    axios.post(`${API_BASE_URL}/api/authentication/logout/`)
      .then(response => {
        // Manejo de la respuesta exitosa
        localStorage.clear();
        
        // Redirigir al usuario a la página de inicio de sesión
        navigate("/");
      })
      .catch(error => {
        // Manejo de errores
        console.error('Error al cerrar sesión:', error);
        
        // Aún así limpiamos localStorage y redirigimos
        localStorage.clear();
        navigate("/");
      });
  }, [navigate]);

  return (
    <div className="container mt-5 text-center">
      <h3>Cerrando sesión...</h3>
    </div>
  );
};