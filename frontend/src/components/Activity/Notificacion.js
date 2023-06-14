import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Notificacion = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchNotifications();
    updateUnreadCount();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await axios.get('/api/notificaciones/', {
        headers: {
          Authorization: `Token ${localStorage.getItem('token')}`,
        },
      });
      setNotifications(response.data);
    } catch (error) {
      console.error('Error al obtener las notificaciones:', error);
    }
  };

  const updateUnreadCount = () => {
    const count = notifications.filter(notification => !notification.leida).length;
    setUnreadCount(count);
  };

  const markNotificationAsRead = async (notificationId) => {
    try {
      await axios.patch(`/api/notificaciones/${notificationId}/`, { leida: true }, {
        headers: {
          Authorization: `Token ${localStorage.getItem('token')}`,
        },
      });
      fetchNotifications();
      updateUnreadCount();
    } catch (error) {
      console.error('Error al marcar la notificación como leída:', error);
    }
  };

  return (
    <div>
      <h1>Notificaciones</h1>
      <p>Notificaciones no leídas: {unreadCount}</p>
      <ul>
        {notifications.map(notification => (
          <li key={notification.id}>
            <strong>{notification.titulo}</strong>
            <p>{notification.mensaje}</p>
            {!notification.leida && (
              <button onClick={() => markNotificationAsRead(notification.id)}>
                Marcar como leída
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Notificacion;
