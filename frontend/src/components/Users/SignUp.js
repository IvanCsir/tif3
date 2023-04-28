import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function SignUp() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rePassword, setRePassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate()

  const handleSignUp = (e) => {
    e.preventDefault();

    if (password !== rePassword) {
      setError("Las contraseñas no son iguales");
      return;
    }

    fetch("http://localhost:8000/accounts/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password, re_password: rePassword }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
          alert("Ocurrió un error al crear el usuario")
        } else {
          setSuccess(data.success);
          setUsername("");
          setPassword("");
          setRePassword("");
          navigate("/login")
        }
      });
      
  };


  return (
    
    <div className="col-md-3 mx-auto">
        <h2 className="mb-3 text-center">Registro</h2>
        <form onSubmit={handleSignUp}>
        <div className="mb-3">
          <label className="form-label">Usuario</label>
          {/* El onChange se pone para manejar el cambio del input */}
          <input
            type="text"
            name="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            maxLength="50"
            className="form-control"
            minLength="2"
            autoFocus
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Password</label>
          <input
            type="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            maxLength="255"
            className="form-control"
            min="1900"
            max="2020"
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Confirm Password</label>
          <input
            type="password"
            name="re-password"
            value={rePassword}
            onChange={(e) => setRePassword(e.target.value)}
            maxLength="255"
            className="form-control"
            min="1900"
            max="2020"
            required
          />
        </div>
        <div className="d-grid gap-2">
            <button className="btn btn-block btn-success" type="submit">Sign Up</button>
        </div>
        </form>

    </div>
  );
}
export default SignUp;