import React, { useState } from 'react';
import { Grid, Box, Typography, TextField, FormControlLabel, Checkbox, Button } from '@mui/material';
import axios from 'axios';

const MensajeForm = () => {
  const [titulo, setTitulo] = useState('');
  const [contenido, setContenido] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    const usuarioId = localStorage.getItem('usuario_id');
    const data = {
      titulo,
      contenido,
    };

    axios.post(`http://localhost:8000/api/activities/mensaje/crear_mensaje/`, data)
      .then((response) => {
        console.log(response.data);
        // Aquí puedes manejar la respuesta exitosa como desees
      })
      .catch((error) => {
        console.error(error);
        // Aquí puedes manejar los errores como desees
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
      <Box my={2}>
        <Typography
          variant="h4"
          sx={{ textTransform: 'uppercase', fontWeight: 'bold' }}
          align="center"
        >
          GENERAR MENSAJE
        </Typography>
      </Box>
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
      <Grid item>
        <TextField
          value={contenido}
          onChange={(e) => setContenido(e.target.value)}
          name="contenido"
          label="Contenido"
          required
          color="info"
        />
      </Grid>
      <Grid item>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          onClick={handleSubmit}
        >
          Enviar Mensaje
        </Button>
      </Grid>
    </Grid>
  );
};

export default MensajeForm;
