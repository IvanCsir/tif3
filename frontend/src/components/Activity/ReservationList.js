import React, { useState, useEffect } from "react";
import axios from "axios";
import API_BASE_URL from '../../config/api';
import {
  Typography,
  Paper,
  Grid,
  Box,
  Button,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";

function ReservaList() {
  const [reservas, setReservas] = useState([]);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertSeverity, setAlertSeverity] = useState('success');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [reservaToDelete, setReservaToDelete] = useState(null);
  const id_usuario = parseInt(localStorage.getItem('usuario_id') || '0');

  useEffect(() => {
    if (!id_usuario) {
      console.error('Usuario no autenticado');
      return;
    }
    
    axios.get(`${API_BASE_URL}/api/activities/activity/${id_usuario}/reservas/`)
      .then(response => {
        setReservas(response.data);
      })
      .catch(error => {
        console.log(error);
      });
  },[id_usuario]);;

  const handleOpenDialog = (reservaId) => {
    setReservaToDelete(reservaId);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setReservaToDelete(null);
  };

  const handleConfirmDelete = () => {
    if (reservaToDelete) {
      axios.delete(`${API_BASE_URL}/api/activities/reserva/${reservaToDelete}/cancelar/`)
        .then(response => {
          setAlertMessage('Reserva cancelada exitosamente');
          setAlertSeverity('success');
          setAlertOpen(true);
          setReservas(reservas.filter(reserva => reserva.id !== reservaToDelete));
          setTimeout(() => {
            setAlertOpen(false);
          }, 3000);
        })
        .catch(error => {
          setAlertMessage('Error al cancelar la reserva');
          setAlertSeverity('error');
          setAlertOpen(true);
          console.error(error);
          setTimeout(() => {
            setAlertOpen(false);
          }, 3000);
        });
    }
    handleCloseDialog();
  };

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
      {alertOpen && (
        <Box mt={2} display="flex" justifyContent="center">
          <Alert severity={alertSeverity} onClose={() => setAlertOpen(false)}>
            {alertMessage}
          </Alert>
        </Box>
      )}
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
                <Box mt={2} display="flex" justifyContent="center">
                  <Button 
                    variant="contained" 
                    color="error"
                    size="small"
                    onClick={() => handleOpenDialog(reserva.id)}
                  >
                    Eliminar Reserva
                  </Button>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>

      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          Confirmar cancelación
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            ¿Está seguro que desea cancelar esta reserva?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            No
          </Button>
          <Button onClick={handleConfirmDelete} color="error" autoFocus>
            Sí, eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default ReservaList;
