import React, { useState } from 'react';
import { Grid, Box, Typography, TextField, Button, Paper, Alert, MenuItem } from '@mui/material';
import axios from 'axios';

const MensajeForm = () => {
  const [titulo, setTitulo] = useState('');
  const [contenido, setContenido] = useState('');

  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertSeverity, setAlertSeverity] = useState('error');

  const handleSubmit = (e) => {
    e.preventDefault();

    const data = {
      titulo,
      contenido,
    };

    axios.post(`http://localhost:8000/api/activities/mensaje/crear_mensaje/`, data)
      .then((response) => {
        console.log(response.data);
        setAlertMessage('Mensaje enviado con éxito');
        setAlertSeverity('success');
        setAlertOpen(true);
        setTimeout(() => {
          window.location.reload(); // Refrescar la página después de 5 segundos
        }, 3000); // Retardo de 5000 milisegundos (5 segundos)
      })
      .catch((error) => {
        console.error(error);
        setAlertMessage('Error al enviar el mensaje');
          setAlertSeverity('error');
          setAlertOpen(true);
      });
  };

  return (
    <Grid
      container
      direction="column"
      alignItems="center"
      justifyContent="center"
      spacing={2}
      mt={3}
    >
      <Paper elevation={24} sx={{ p: 4 }}>
        <Box my={2}>
          <Typography
            variant="h5"
            sx={{ textTransform: "uppercase", fontWeight: "bold", mb: 2 }}
            align="center"
          >
            GENERAR MENSAJE
          </Typography>
        </Box>
        <Grid item container justifyContent="center">
          <Grid item>
            <TextField
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              name="titulo"
              label="Título"
              required
              color="info"
              autoFocus
            />
          </Grid>
        </Grid>
        <Grid item container justifyContent="center">
          <Grid item>
            <Box mt={2}>
              <TextField
                value={contenido}
                onChange={(e) => setContenido(e.target.value)}
                name="contenido"
                label="Contenido"
                required
                color="info"
              />
            </Box>
          </Grid>
        </Grid>
        <Grid item container justifyContent="center">
          <Grid item>
            <Box mt={2} sx={{ textAlign: "center" }}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                onClick={handleSubmit}
              >
                Enviar Mensaje
              </Button>
            </Box>
            <Box mt={2}>
              {alertOpen && (
                <Alert
                  severity={alertSeverity}
                  onClose={() => setAlertOpen(false)}
                >
                  {alertMessage}
                </Alert>
              )}
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Grid>
  );
};

export default MensajeForm;

// //Probando




