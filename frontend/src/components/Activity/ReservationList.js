import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Typography,
  Paper,
  Grid,
  Box,
} from "@mui/material";

function ReservaList() {
  const [reservas, setReservas] = useState([]);
  const id_usuario = parseInt(localStorage.getItem('usuario_id'));

  useEffect(() => {
    axios.get(`http://127.0.0.1:8000/api/activities/activity/${id_usuario}/reservas/`)
      .then(response => {
        setReservas(response.data);
      })
      .catch(error => {
        console.log(error);
      });
  },);

  const currentDate = new Date().setUTCHours(0, 0, 0, 0);
  // Ordena las reservas por fecha en orden ascendente
  const reservasOrdenadas = reservas.sort((reservaA, reservaB) => {
    const dateA = new Date(reservaA.datos_activity.day);
    const dateB = new Date(reservaB.datos_activity.day);
    return dateA - dateB;
  });

  // Filtra las reservas cuya fecha sea igual o posterior a la fecha actual
  const reservasFiltradasFecha = reservasOrdenadas.filter(reserva => {
    const reservaDate = new Date(reserva.datos_activity.day);
    return reservaDate >= currentDate;
  });

  const getIconPath = (iconName) => {
    return require(`./icons/${iconName}.png`);
  };
  
  return (
    <div>
      <Box sx={{ my: 2 }}>
        <Typography
          variant="h4"
          sx={{ textTransform: "uppercase", fontWeight: "bold" }}
          align="center"
        >
          Reservas
        </Typography>
      </Box>
      <Box mt={2}>
        <Grid container justifyContent="center" alignItems="center" spacing={2}>
          {reservasFiltradasFecha.map((reserva) => (
            <Grid item xs={12} sm={6} md={4} key={reserva.id}>
              <Paper className="card card-body card-highlight" elevation={3} sx={{ p: 2, margin: "10px" }}>
                <Typography
                  sx={{ textTransform: "uppercase", fontWeight: "bold" }}
                  align="center"
                >
                  {reserva.activity_name} - {reserva.activity_lugar}
                </Typography>
                
                <Typography> Día: {reserva.datos_activity.day}</Typography>
                
                <Typography>
                  {" "}
                  Horario: {reserva.datos_activity.start_time} -{" "}
                  {reserva.datos_activity.end_time}
                </Typography>
                {reserva.datos_activity.temperatura_max &&
                  reserva.datos_activity.temperatura_min &&
                  reserva.datos_activity.condiciones && (
                    <>
                      <Typography variant="body1" gutterBottom>
                      {reserva.datos_activity.condiciones} {<img src={getIconPath(reserva.datos_activity.icon)} alt={reserva.datos_activity.icon} style={{ width: '50px', height: '50px' }} />} - Min {reserva.datos_activity.temperatura_min}°C - Max {reserva.datos_activity.temperatura_max}°C 

                      </Typography>
                      <Typography variant="body1" gutterBottom>
                      </Typography>
                    </>
                  )}
                {/* <Typography>{reserva.fecha_reserva}</Typography> */}
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>
    </div>
  );
}

export default ReservaList;
