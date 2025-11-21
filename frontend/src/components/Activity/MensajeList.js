import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Typography, List, ListItem, ListItemText, IconButton, Popover, Badge } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';


const MensajeList = () => {
  const [mensajes, setMensajes] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [mensajesNoLeidos, setMensajesNoLeidos] = useState([]);
  const id_usuario = parseInt(localStorage.getItem('usuario_id'));


  useEffect(() => {
    obtenerMensajes();

    //Intervalo para establecer cuánto se demora en llamar a la funcion obtenerMensajes
    const interval = setInterval(obtenerMensajes, 30000);

    // Limpiar el intervalo cuando el componente se desmonta
    return () => {
      clearInterval(interval);
    };
  }, []);

  const obtenerMensajes = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/activities/mensaje/${id_usuario}/obtener_mensajes/`);
      const mensajesOrdenados = response.data.sort((a, b) => new Date(b.fecha_creacion) - new Date(a.fecha_creacion));
      const mensajesLimitados = mensajesOrdenados.slice(0, 4);
      setMensajes(mensajesLimitados);
      const mensajesNoLeidos = mensajesLimitados.filter((mensaje) => !mensaje.leido);
      setMensajesNoLeidos(mensajesNoLeidos);
      actualizarEstadoLocal(mensajesNoLeidos);
    } catch (error) {
      console.error('Error al obtener los mensajes:', error);
    }
  };

  const actualizarEstadoLocal = (mensajesNoLeidos) => {
    const mensajesActualizados = mensajes.map((mensaje) => {
      if (mensajesNoLeidos.find((m) => m.id === mensaje.id)) {
        return { ...mensaje, leido: false };
      }
      return mensaje;
    });
    localStorage.setItem('mensajes', JSON.stringify(mensajesActualizados));
  };

  const handleOpenPopover = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClosePopover = () => {
    setAnchorEl(null);
  };

  const handleMensajeMouseEnter = async (mensaje) => {
    if (!mensaje.leido) {
      try {
        await axios.put(`${API_BASE_URL}/api/activities/mensaje/${id_usuario}/marcar_leidos/`);
        const mensajesActualizados = mensajes.map((m) => {
          if (m.id === mensaje.id) {
            return { ...m, leido: true };
          }
          return m;
        });
        setMensajes(mensajesActualizados);
        const mensajesNoLeidos = mensajesActualizados.filter((m) => !m.leido);
        setMensajesNoLeidos(mensajesNoLeidos);
        actualizarEstadoLocal(mensajesNoLeidos);
      } catch (error) {
        console.error('Error al marcar el mensaje como leído:', error);
      }
    }
  };

  const open = Boolean(anchorEl);
  const popoverId = open ? 'popover-notificaciones' : undefined;

  return (
    <div style={{ width: "30%" }}>
      <IconButton color="inherit" onClick={handleOpenPopover}>
        <Badge
          badgeContent={mensajesNoLeidos.length}
          color={mensajesNoLeidos.length > 0 ? "error" : "default"}
        >
          <NotificationsIcon />
        </Badge>
      </IconButton>
      <Popover
        id={popoverId}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClosePopover}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        <div style={{ padding: "16px" }}>
          <Typography variant="h7" gutterBottom>
            Notificaciones
          </Typography>
          <List>
            {mensajes.map((mensaje) => {
              const [fecha, tiempo] = mensaje.fecha_creacion.split("T");
              const horaMinutos = tiempo.slice(0, 5);

              return (
                <ListItem
                  key={mensaje.id}
                  onMouseEnter={() => handleMensajeMouseEnter(mensaje)}
                  className={
                    mensaje.leido ? "" : "list-item-bold list-item-hover"
                  }
                  style={{ cursor: "pointer" }}
                >
                  <ListItemText
                    primary={mensaje.titulo}
                    secondary={
                      <React.Fragment>
                        <div
                          style={{ display: "flex", flexDirection: "column" }}
                        >
                          <Typography
                            className="message-content"
                            component="div"
                            style={{
                              whiteSpace: "pre-wrap",
                              wordWrap: "break-word",
                              overflowWrap: "break-word",
                              maxHeight: "3em",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              hyphens: "auto",
                            }}
                          >
                            {mensaje.contenido}
                          </Typography>
                          <span
                            style={{ fontSize: "0.8rem" }}
                          >{`${fecha} - ${horaMinutos}`}</span>
                        </div>
                      </React.Fragment>
                    }
                    style={{
                      color: mensaje.leido ? "inherit" : "black",
                    }}
                  />
                </ListItem>
              );
            })}
          </List>
        </div>
      </Popover>
    </div>
  );
};

export default MensajeList;

