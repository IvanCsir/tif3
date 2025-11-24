import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
  const isAuthenticated = !!localStorage.getItem('usuario_id');
  
  return isAuthenticated ? children : <Navigate to="/" replace />;
};

export default PrivateRoute;
