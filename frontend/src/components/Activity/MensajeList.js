// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { Typography, List, ListItem, ListItemText } from '@mui/material';

// const MensajeList = () => {
//   const [mensajes, setMensajes] = useState([]);

//   useEffect(() => {
//     obtenerMensajes();
//   }, []);

//   const obtenerMensajes = async () => {
//     try {
//       const response = await axios.get('http://localhost:8000/api/activities/mensaje/obtener_mensajes/');
//       setMensajes(response.data);
//     } catch (error) {
//       console.error('Error al obtener los mensajes:', error);
//     }
//   };

//   return (
//     <div>
//       <Typography variant="h1">Lista de mensajes</Typography>
//       <List>
//         {mensajes.map(mensaje => (
//           <ListItem key={mensaje.id}>
//             <ListItemText primary={mensaje.titulo} secondary={mensaje.contenido} />
//           </ListItem>
//         ))}
//       </List>
//     </div>
//   );
// };

// export default MensajeList;

// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { Typography, List, ListItem, ListItemText, IconButton, Popover, Badge } from '@mui/material';
// import NotificationsIcon from '@mui/icons-material/Notifications';

// const MensajeList = () => {
//   const [mensajes, setMensajes] = useState([]);
//   const [anchorEl, setAnchorEl] = useState(null);
//   const [mensajesNoLeidos, setMensajesNoLeidos] = useState([]);
//   const id_usuario = parseInt(localStorage.getItem('usuario_id'));

//   useEffect(() => {
//     obtenerMensajes();
//   }, []);

//   useEffect(() => {
//     const mensajesGuardados = JSON.parse(localStorage.getItem('mensajes'));
//     if (mensajesGuardados) {
//       setMensajes(mensajesGuardados);
//       const mensajesNoLeidosGuardados = mensajesGuardados.filter((mensaje) => !mensaje.leido);
//       setMensajesNoLeidos(mensajesNoLeidosGuardados);
//       actualizarEstadoLocal(mensajesNoLeidosGuardados);
//     }
//   }, []);

//   const obtenerMensajes = async () => {
//     try {
//       const response = await axios.get(`http://localhost:8000/api/activities/mensaje/${id_usuario}/obtener_mensajes/`);
//       const mensajesOrdenados = response.data.sort((a, b) => new Date(b.fecha_creacion) - new Date(a.fecha_creacion));
//       const mensajesLimitados = mensajesOrdenados.slice(0, 5);
//       setMensajes(mensajesLimitados);
//       const mensajesNoLeidos = mensajesLimitados.filter((mensaje) => !mensaje.leido);
//       setMensajesNoLeidos(mensajesNoLeidos);
//       actualizarEstadoLocal(mensajesNoLeidos);
//     } catch (error) {
//       console.error('Error al obtener los mensajes:', error);
//     }
//   };

//   const actualizarEstadoLocal = (mensajesNoLeidos) => {
//     const mensajesActualizados = mensajes.map((mensaje) => {
//       if (mensajesNoLeidos.find((m) => m.id === mensaje.id)) {
//         return { ...mensaje, leido: false };
//       }
//       return mensaje;
//     });
//     localStorage.setItem('mensajes', JSON.stringify(mensajesActualizados));
//   };

//   const handleOpenPopover = (event) => {
//     setAnchorEl(event.currentTarget);
//   };

//   const handleClosePopover = () => {
//     setAnchorEl(null);
//   };

//   const handleMensajeMouseEnter = async (mensaje) => {
//     if (!mensaje.leido) {
//       try {
//         await axios.put(`http://localhost:8000/api/activities/mensaje/${id_usuario}/marcar_leidos/`);
//         const mensajesActualizados = mensajes.map((m) => {
//           if (m.id === mensaje.id) {
//             return { ...m, leido: true };
//           }
//           return m;
//         });
//         setMensajes(mensajesActualizados);
//         const mensajesNoLeidos = mensajesActualizados.filter((m) => !m.leido);
//         setMensajesNoLeidos(mensajesNoLeidos);
//         actualizarEstadoLocal(mensajesNoLeidos);
//       } catch (error) {
//         console.error('Error al marcar el mensaje como leído:', error);
//       }
//     }
//   };

//   const open = Boolean(anchorEl);
//   const popoverId = open ? 'popover-notificaciones' : undefined;

//   return (
//     <div>
//       <IconButton color="inherit" onClick={handleOpenPopover}>
//         <Badge badgeContent={mensajesNoLeidos.length} color={mensajesNoLeidos.length > 0 ? 'error' : 'default'}>
//           <NotificationsIcon />
//         </Badge>
//       </IconButton>
//       <Popover
//         id={popoverId}
//         open={open}
//         anchorEl={anchorEl}
//         onClose={handleClosePopover}
//         anchorOrigin={{
//           vertical: 'bottom',
//           horizontal: 'right',
//         }}
//         transformOrigin={{
//           vertical: 'top',
//           horizontal: 'right',
//         }}
//       >
//         <div style={{ padding: '16px' }}>
//           <Typography variant="h7" gutterBottom>
//             Mensajes
//           </Typography>
//           <List>
//             {mensajes.map((mensaje) => (
//               <ListItem key={mensaje.id} onMouseEnter={() => handleMensajeMouseEnter(mensaje)}>
//                 <ListItemText primary={mensaje.titulo} secondary={mensaje.contenido} />
//               </ListItem>
//             ))}
//           </List>
//         </div>
//       </Popover>
//     </div>
//   );
// };

// export default MensajeList;

// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { Typography, List, ListItem, ListItemText, IconButton, Popover, Badge } from '@mui/material';
// import NotificationsIcon from '@mui/icons-material/Notifications';



// const MensajeList = () => {
//   const [mensajes, setMensajes] = useState([]);
//   const [anchorEl, setAnchorEl] = useState(null);
//   const [mensajesNoLeidos, setMensajesNoLeidos] = useState([]);
//   const id_usuario = parseInt(localStorage.getItem('usuario_id'));

//   useEffect(() => {
//     obtenerMensajes();
//   }, []);

//   useEffect(() => {
//     const mensajesGuardados = JSON.parse(localStorage.getItem('mensajes'));
//     if (mensajesGuardados) {
//       setMensajes(mensajesGuardados);
//       const mensajesNoLeidosGuardados = mensajesGuardados.filter((mensaje) => !mensaje.leido);
//       setMensajesNoLeidos(mensajesNoLeidosGuardados);
//       actualizarEstadoLocal(mensajesNoLeidosGuardados);
//     }
//   }, []);

//   const obtenerMensajes = async () => {
//     try {
//       const response = await axios.get(`http://localhost:8000/api/activities/mensaje/${id_usuario}/obtener_mensajes/`);
//       const mensajesOrdenados = response.data.sort((a, b) => new Date(b.fecha_creacion) - new Date(a.fecha_creacion));
//       const mensajesLimitados = mensajesOrdenados.slice(0, 5);
//       setMensajes(mensajesLimitados);
//       const mensajesNoLeidos = mensajesLimitados.filter((mensaje) => !mensaje.leido);
//       setMensajesNoLeidos(mensajesNoLeidos);
//       actualizarEstadoLocal(mensajesNoLeidos);
//     } catch (error) {
//       console.error('Error al obtener los mensajes:', error);
//     }
//   };

//   const actualizarEstadoLocal = (mensajesNoLeidos) => {
//     const mensajesActualizados = mensajes.map((mensaje) => {
//       if (mensajesNoLeidos.find((m) => m.id === mensaje.id)) {
//         return { ...mensaje, leido: false };
//       }
//       return mensaje;
//     });
//     localStorage.setItem('mensajes', JSON.stringify(mensajesActualizados));
//   };

//   const handleOpenPopover = (event) => {
//     setAnchorEl(event.currentTarget);
//   };

//   const handleClosePopover = () => {
//     setAnchorEl(null);
//   };

//   const handleMensajeMouseEnter = async (mensaje) => {
//     if (!mensaje.leido) {
//       try {
//         await axios.put(`http://localhost:8000/api/activities/mensaje/${id_usuario}/marcar_leidos/`);
//         const mensajesActualizados = mensajes.map((m) => {
//           if (m.id === mensaje.id) {
//             return { ...m, leido: true };
//           }
//           return m;
//         });
//         setMensajes(mensajesActualizados);
//         const mensajesNoLeidos = mensajesActualizados.filter((m) => !m.leido);
//         setMensajesNoLeidos(mensajesNoLeidos);
//         actualizarEstadoLocal(mensajesNoLeidos);
//       } catch (error) {
//         console.error('Error al marcar el mensaje como leído:', error);
//       }
//     }
//   };

//   const open = Boolean(anchorEl);
//   const popoverId = open ? 'popover-notificaciones' : undefined;

//   return (
//     <div>
//       <IconButton color="inherit" onClick={handleOpenPopover}>
//         <Badge badgeContent={mensajesNoLeidos.length} color={mensajesNoLeidos.length > 0 ? 'error' : 'default'}>
//           <NotificationsIcon />
//         </Badge>
//       </IconButton>
//       <Popover
//         id={popoverId}
//         open={open}
//         anchorEl={anchorEl}
//         onClose={handleClosePopover}
//         anchorOrigin={{
//           vertical: 'bottom',
//           horizontal: 'right',
//         }}
//         transformOrigin={{
//           vertical: 'top',
//           horizontal: 'right',
//         }}
//       >
//         <div style={{ padding: '16px' }}>
//           <Typography variant="h7" gutterBottom>
//             Mensajes
//           </Typography>
//           <List>
//             {mensajes.map((mensaje) => (
//               <ListItem
//                 key={mensaje.id}
//                 onMouseEnter={() => handleMensajeMouseEnter(mensaje)}
//                 className={mensaje.leido ? '' : 'list-item-bold list-item-hover'} // Aplica clases adicionales
//                 style={{ cursor: 'pointer' }}
//               >
//                 <ListItemText
//                   primary={mensaje.titulo}
//                   secondary={mensaje.contenido}
//                   style={{ color: mensaje.leido ? 'inherit' : 'black' }} // Estilo condicional para el color del título
//                 />
//               </ListItem>
//             ))}
//           </List>
//         </div>
//       </Popover>
//     </div>
//   );
// };

// export default MensajeList;

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
      const response = await axios.get(`http://localhost:8000/api/activities/mensaje/${id_usuario}/obtener_mensajes/`);
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
        await axios.put(`http://localhost:8000/api/activities/mensaje/${id_usuario}/marcar_leidos/`);
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
    <div>
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
            Mensajes
          </Typography>
          <List>
            {mensajes.map((mensaje) => (
              <ListItem
                key={mensaje.id}
                onMouseEnter={() => handleMensajeMouseEnter(mensaje)}
                className={
                  mensaje.leido ? "" : "list-item-bold list-item-hover"
                } // Clases del fondo del mensaje
                style={{ cursor: "pointer" }}
              >
                <ListItemText
                  primary={mensaje.titulo}
                  secondary={mensaje.contenido}
                  style={{ color: mensaje.leido ? 'inherit' : 'black',  whiteSpace: 'pre-line', }} // Estilo para el color del titulo del mensaje
                />
                
                 
              </ListItem>
            ))}
          </List>
        </div>
      </Popover>
    </div>
  );
};

export default MensajeList;




