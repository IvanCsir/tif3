// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";

// function SignUp() {
//   const [username, setUsername] = useState("");
//   const [password, setPassword] = useState("");
//   const [rePassword, setRePassword] = useState("");
//   const [error, setError] = useState("");
//   const [success, setSuccess] = useState("");
//   const navigate = useNavigate()

//   const handleSignUp = (e) => {
//     e.preventDefault();

//     if (password !== rePassword) {
//       setError("Las contraseñas no son iguales");
//       return;
//     }

//     fetch("http://localhost:8000/accounts/register", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ username, password, re_password: rePassword }),
//     })
//       .then((response) => response.json())
//       .then((data) => {
//         if (data.error) {
//           setError(data.error);
//           alert("Ocurrió un error al crear el usuario")
//         } else {
//           setSuccess(data.success);
//           setUsername("");
//           setPassword("");
//           setRePassword("");
//           navigate("/login")
//         }
//       });
      
//   };


//   return (
    
//     <div className="col-md-3 mx-auto">
//         <h2 className="mb-3 text-center">Registro</h2>
//         <form onSubmit={handleSignUp}>
//         <div className="mb-3">
//           <label className="form-label">Usuario</label>
//           {/* El onChange se pone para manejar el cambio del input */}
//           <input
//             type="text"
//             name="username"
//             value={username}
//             onChange={(e) => setUsername(e.target.value)}
//             maxLength="50"
//             className="form-control"
//             minLength="2"
//             autoFocus
//             required
//           />
//         </div>
//         <div className="mb-3">
//           <label className="form-label">Password</label>
//           <input
//             type="password"
//             name="password"
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//             maxLength="255"
//             className="form-control"
//             min="1900"
//             max="2020"
//             required
//           />
//         </div>
//         <div className="mb-3">
//           <label className="form-label">Confirm Password</label>
//           <input
//             type="password"
//             name="re-password"
//             value={rePassword}
//             onChange={(e) => setRePassword(e.target.value)}
//             maxLength="255"
//             className="form-control"
//             min="1900"
//             max="2020"
//             required
//           />
//         </div>
//         <div className="d-grid gap-2">
//             <button className="btn btn-block btn-success" type="submit">Sign Up</button>
//         </div>
//         </form>

//     </div>
//   );
// }
// export default SignUp;

import { Button, Grid, TextField } from "@mui/material";
import axios from "axios";
import React from "react";
import { useNavigate } from "react-router";

const Register = () => {
  const [nombre, setNombre] = React.useState("");
  const [apellido, setApellido] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [nombreUsuario, setnombreUsuario] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setconfirmPassword] = React.useState("");
  const navigate = useNavigate();

  const crearUsuario = () => {
    if (password === confirmPassword) {
      const body = {
        username: nombreUsuario,
        email: email,
        password: password,
        nombre: nombre,
        apellido: apellido,
        tipo: 2,

      };
      console.log(body)
      axios
        .post("http://localhost:8000/api/authentication/register/", body, {
          headers: { "Content-Type": "application/json" },
        })
        .then((response) => {
          alert("Usuario creado con exito");
          navigate("/");
        })
        .catch((error) => {
          alert("Ocurrio un error al crear el usuario");
        });
    } else {
      alert("Las contrasenas no coinciden");
    }
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
      <Grid item>
        <TextField
          value={nombreUsuario}
          onChange={(e) => setnombreUsuario(e.target.value)}
          label="Nombre usuario"
          required
          color="info"
          autoFocus
        />
      </Grid>
      <Grid item>
        <TextField
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          label="Email"
          color="info"
          required
        />
      </Grid>
      <Grid item>
        <TextField
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          label="Nombre"
          color="info"
          required
        />
      </Grid>
      <Grid item>
        <TextField
          value={apellido}
          onChange={(e) => setApellido(e.target.value)}
          label="Apellido"
          required
          color="info"

        />
      </Grid>
      <Grid item>
        <TextField
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          label="Contraseña"
          type="password"
          required
          color="info"

        />
      </Grid>
      <Grid item>
        <TextField
          value={confirmPassword}
          onChange={(e) => setconfirmPassword(e.target.value)}
          label="Confirmar contraseña"
          type="password"
          required
          color="info"

        />
      </Grid>
      <Grid item>
        <Button variant="contained" color="success" onClick={() => crearUsuario()}>
          Registrarme
        </Button>
      </Grid>
    </Grid>
  );
};

export default Register;