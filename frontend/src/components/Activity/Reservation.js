import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../../config/api';
import {Button, Box, Grid, Alert} from "@mui/material";
import useReserva from '../../hooks/useReserva';
import WarningModal from './WarningModal';


const ReservarButton = ({ id_act, id_datos_activity }) => {
    const navigate = useNavigate();

    const [alertOpen, setAlertOpen] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [alertSeverity, setAlertSeverity] = useState('error');

    const id_usuario = parseInt(localStorage.getItem('usuario_id') || '0');
    
    // Hook de validación de reservas
    const {
        validateAndReserve,
        confirmReservation,
        cancelReservation,
        showWarning,
        warnings,
        activityName,
        isLoading
    } = useReserva();
    
    const handleReservarClick = async () => {
        if (!id_usuario) {
          setAlertMessage('Error: Usuario no autenticado');
          setAlertSeverity('error');
          setAlertOpen(true);
          return;
        }
        
        // Validar y reservar con el hook
        await validateAndReserve({
            activityId: id_act,
            datosActivityId: id_datos_activity,
            userId: id_usuario,
            onSuccess: () => {
                setAlertMessage('Reserva realizada con éxito');
                setAlertSeverity('success');
                setAlertOpen(true);
                setTimeout(() => {
                    navigate(0); // Recargar la ruta actual
                }, 2000);
            },
            onWarning: (warnings) => {
                // El modal se mostrará automáticamente
                console.log('Advertencias detectadas:', warnings);
            },
            onError: (error) => {
                const errorMessage = error.response?.data?.message || 
                                   error.response?.data?.detail || 
                                   'Usted ya reservó esta disponibilidad';
                setAlertMessage(errorMessage);
                setAlertSeverity('error');
                setAlertOpen(true);
                console.error(error);
            }
        });
    };
    
    const handleConfirmWithWarning = async () => {
        const result = await confirmReservation();
        
        if (result && result.success) {
            setAlertMessage('Reserva realizada con éxito');
            setAlertSeverity('success');
            setAlertOpen(true);
            setTimeout(() => {
                navigate(0); // Recargar la ruta actual
            }, 2000);
        }
    };

    return (
      <Grid item>
        <Button 
          variant="contained" 
          onClick={handleReservarClick}
          disabled={isLoading}
        >
          {isLoading ? 'Verificando...' : 'Reservar'}
        </Button>
        
        <Box mt={2}>
          {alertOpen && (
            <Alert severity={alertSeverity} onClose={() => setAlertOpen(false)}>
              {alertMessage}
            </Alert>
          )}
        </Box>
        
        {/* Modal de advertencia */}
        {showWarning && (
          <WarningModal
            warnings={warnings}
            activityName={activityName}
            onConfirm={handleConfirmWithWarning}
            onCancel={cancelReservation}
            isLoading={isLoading}
          />
        )}
      </Grid>
    );
    };

export default ReservarButton;
