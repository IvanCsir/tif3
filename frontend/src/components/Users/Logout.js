import axios from 'axios';


// ...

// Controlador de eventos para el botón o enlace de "Logout"
export default function Logout () {
  axios.post(`${API_BASE_URL}/api/authentication/logout/`)
    .then(response => {
      // Manejo de la respuesta exitosa
      
      // Por ejemplo, redirigir al usuario a la página de inicio de sesión
      window.location.href = "/";
      
      // O mostrar un mensaje de confirmación de logout
      localStorage.clear();
      
    })
    .catch(error => {
      // Manejo de errores
      
      // Por ejemplo, mostrar un mensaje de error
      console.error('Error al cerrar sesión:', error);
      
      // Realizar cualquier manejo de errores adicional necesario
      // ...
    });
};