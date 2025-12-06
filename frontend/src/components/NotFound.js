import React from 'react';
import { Link } from 'react-router-dom';
import { Box, Typography, Button, Container } from '@mui/material';

const NotFound = () => {
  return (
    <Container>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          textAlign: 'center',
        }}
      >
        <Typography variant="h1" sx={{ fontSize: '6rem', fontWeight: 'bold', color: 'primary.main' }}>
          404
        </Typography>
        <Typography variant="h4" sx={{ mb: 2 }}>
          Página no encontrada
        </Typography>
        <Typography variant="body1" sx={{ mb: 4, color: 'text.secondary' }}>
          Lo sentimos, la página que buscas no existe o ha sido movida.
        </Typography>
        <Button
          component={Link}
          to="/actividades"
          variant="contained"
          color="primary"
          size="large"
        >
          Volver a Actividades
        </Button>
      </Box>
    </Container>
  );
};

export default NotFound;
