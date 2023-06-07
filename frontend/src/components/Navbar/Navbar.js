import {Link} from 'react-router-dom'
import {React} from 'react'


const Navbar = ()=>{

  const id_usuario = parseInt(localStorage.getItem('usuario_id'));
  const isAuthenticated = !!id_usuario; // Me fijo si hay un usuario que haya iniciado sesión

  if (!isAuthenticated) {
    return null; //No renderizo la navbar
  }


  return (
    <nav className="navbar navbar-expand-lg bg-body-tertiary navbar-dark bg-dark">
      <div className="container-fluid">
        <Link className="navbar-brand" to="/actividades">
          Club Member
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ml-auto">
            <li className="nav-item">
              <Link
                className="nav-link active"
                aria-current="page"
                to="/actividades"
              >
                Actividades
              </Link>
            </li>
            <li className="nav-item">
              <Link
                className="nav-link active"
                aria-current="page"
                to={`/usuario/${id_usuario}/reservas/`}
              >
                Mis Reservas
              </Link>
            </li>
          </ul>
        </div>
        <span class="navbar-text">
          <Link className="nav-link active" aria-current="page" to={`/logout`}>
            Logout
          </Link>
        </span>
      </div>
    </nav>
  );
};

export default Navbar;