import React, { useState } from 'react';
import axios from 'axios';
import API_BASE_URL from '../../config/api';
import {Button, Box, Grid, Alert} from "@mui/material";
import { useNavigate } from 'react-router-dom';


const ReservarButton = ({ id_act, id_datos_activity }) => {

    const navigate = useNavigate();
    const [alertOpen, setAlertOpen] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [alertSeverity, setAlertSeverity] = useState('error');

    const id_usuario = parseInt(localStorage.getItem('usuario_id'));
    const handleReservarClick = () =>  {
        const usuarioId = id_usuario; // ID del usuario que realizará la reserva

        const data = {
        usuario: usuarioId,
        };

        axios.post(`${API_BASE_URL}/api/activities/activity/${id_act}/reservar/${id_datos_activity}/`, data)
        .then(response => {
            // Manejar la respuesta exitosa
            setAlertMessage('Reserva realizada con éxito');
            setAlertSeverity('success');
            setAlertOpen(true);
            setTimeout(() => {
                navigate('/actividades'); // Redirigir a la lista de actividades
              }, 2000);
              console.log(response.data);
              console.log(id_usuario);
        }
        )
        
        .catch(error => {
            
            setAlertMessage('Usted ya reservó esta disponibilidad');
            setAlertSeverity('error');
            setAlertOpen(true);
            console.error(error);
        });
    };

    return (
      <Grid item>
        <Button variant="contained" onClick={handleReservarClick}>
          Reservar
        </Button>
        <Box mt={2}>
          {alertOpen && (
            <Alert severity={alertSeverity} onClose={() => setAlertOpen(false)}>
              {alertMessage}
            </Alert>
          )}
        </Box>
      </Grid>
    );
    };

export default ReservarButton;
