
import * as React from "react";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import Link from "@mui/material/Link";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import { Alert} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import axios from "axios";
import API_BASE_URL from '../../config/api';
import { useNavigate } from "react-router";
import { useState } from "react";
import Logo from "./Logo/Logo3.png"

const theme = createTheme();


export default function Login() {
  const navigate = useNavigate();
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertSeverity, setAlertSeverity] = useState('error');
  const handleSubmit = (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    // eslint-disable-next-line no-console

    axios
      .post(
        `${API_BASE_URL}/api/authentication/login/`,
        {
          username: data.get("usuario"),
          password: data.get("password"),
        },
        { headers: { "Content-Type": "application/json" } }
      )
      .then(function (response) {
        if (response.status === 200) {
          localStorage.setItem('usuario_nombre', response.data.nombre)
          localStorage.setItem('usuario_apellido', response.data.apellido)
          localStorage.setItem('usuario_id', response.data.id)
          localStorage.setItem('tipo_usuario', response.data.tipo)
          const tipoUsuario = localStorage.getItem('tipo_usuario');

          if (tipoUsuario === "1") {
            navigate('/activityForm');
          } else {
            navigate('/actividades')
          }
        }
      })
      .catch(function (error) {
        setAlertMessage('Error en el nombre de usuario o contraseña, intente nuevamente');
          setAlertSeverity('error');
          setAlertOpen(true);
      });
  };

  return (
    <ThemeProvider theme={theme}>
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <Box        
          sx={{
            marginTop: 8,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",

          }}
        >
          {/* <Avatar sx={{ m: 1, bgcolor: "success.main" }}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            Sign in
          </Typography> */}
          <img src={Logo} alt="Lock" width="200" height="100" />
          <Box
            component="form"
            onSubmit={handleSubmit}
            noValidate
            sx={{ mt: 1 }}
          >
            <TextField
              margin="normal"
              required
              fullWidth
              id="usuario"
              label="Usuario"
              name="usuario"
              color="info"
              autoFocus
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Contraseña"
              type="password"
              id="password"
              color="info"

            />
            <FormControlLabel
              control={<Checkbox value="remember" color="secondary" />}
              label="Recordarme"
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              color="success"
            >
              Iniciar Sesion
            </Button>
            <Grid container>
              <Grid item xs>
                <Link href={`${API_BASE_URL}/api/accounts/password_reset/`} variant="body2" style={{ color: 'white' }}>
                  Olvidó la contraseña?
                </Link>
              </Grid>
              <Grid item>
                <Button onClick={() => navigate("/register")} style={{ color: 'white' }}>
                  Registrarme
                </Button>
              </Grid>
            </Grid>
          </Box>
          <Box mt={2}>
          {alertOpen && (
            <Alert severity={alertSeverity} onClose={() => setAlertOpen(false)}>
              {alertMessage}
            </Alert>
          )}
        </Box>
        </Box>

      </Container>
    </ThemeProvider>
  );
}
