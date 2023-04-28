import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Login() {

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const handleUsernameChange = (event) => {
    setUsername(event.target.value);
  }

  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
  }

  const handleSubmit = (event) => {
    event.preventDefault();
    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: username, password: password })
    };
    fetch("http://localhost:8000/accounts/login", requestOptions)
      .then(response => response.json())
      .then(data => {
        if ('success' in data) {
          console.log(data)
          navigate("/actividades")
        } else {
          setErrorMessage(data['error']);
        }
      });
  }

  return (
  <div className="col-md-3 mx-auto">
        <h2 className="mb-3 text-center">Login</h2>
        <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Usuario</label>
          {/* El onChange se pone para manejar el cambio del input */}
          <input
            type="text"
            name="username"
            value={username}
            onChange={handleUsernameChange}
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
            onChange={handlePasswordChange}
            maxLength="255"
            className="form-control"
            min="1900"
            max="2020"
            required
          />
        </div>
        <div className="d-grid gap-2">
            <button className="btn btn-block btn-success" type="submit">Iniciar Sesión</button>
        </div>
        </form>

    </div>
)}

export default Login;
