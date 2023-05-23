
import * as React from "react";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import Link from "@mui/material/Link";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import axios from "axios";
import { useNavigate } from "react-router";
// import reportWebVitals from './reportWebVitals';
const theme = createTheme();

export default function Login() {
  const navigate = useNavigate();
  const handleSubmit = (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    // eslint-disable-next-line no-console

    axios
      .post(
        "http://localhost:8000/api/authentication/login/",
        {
          username: data.get("usuario"),
          password: data.get("password"),
        },
        { headers: { "Content-Type": "application/json" } }
      )
      .then(function (response) {
        if (response.status === 200) {
          localStorage.setItem('usuario_nombre', response.data.usuario)
          localStorage.setItem('usuario_id', response.data.id)
          localStorage.setItem('tipo_usuario', response.data.tipo)
          const tipoUsuario = localStorage.getItem('tipo_usuario');

          if (tipoUsuario === "1") {
            navigate('/activityForm');
          } else {
            navigate('actividades')
            window.location.reload();
          }
        }
      })
      .catch(function (error) {
        alert("Credenciales incorrectas / Ocurrio un error")
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
          <Avatar sx={{ m: 1, bgcolor: "success.main" }}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            Sign in
          </Typography>
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
              label="Password"
              type="password"
              id="password"
              color="info"

            />
            <FormControlLabel
              control={<Checkbox value="remember" color="secondary" />}
              label="Remember me"
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              color="success"
            >
              Sign In
            </Button>
            <Grid container>
              <Grid item xs>
                <Link href="http://localhost:8000/api/accounts/password_reset/" variant="body2" style={{ color: 'white' }}>
                  Forgot password?
                </Link>
              </Grid>
              <Grid item>
                <Button onClick={() => navigate("/register")} style={{ color: 'white' }}>
                  Registrarme
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Box>

      </Container>
    </ThemeProvider>
  );
}
