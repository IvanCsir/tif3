import {Link} from 'react-router-dom'
import {React} from 'react'


const Navbar = ()=>{


    return (
      <nav className="navbar navbar-expand-lg bg-body-tertiary navbar-dark bg-dark">
        <div className="container-fluid">
          <Link className="navbar-brand" to="">
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
            <ul className="navbar-nav">
              <li className="nav-item">
                <Link
                  className="nav-link active"
                  aria-current="page"
                  to="/actividades"
                >
                  Actividades
                </Link>
              </li>
              {/* <li className="nav-item">
                <Link className="nav-link" to="/">
                  Features
                </Link>
              </li> */}
              {/* <li className="nav-item">
                <Link className="nav-link" to="/">
                  Pricing
                </Link>
              </li> */}
              <li className="nav-item">
                <Link className="nav-link" to="/activityform">Agregar Actividad</Link>
              </li>

              {/* {tipoUsuario === "1" ? ( // Condición para mostrar el Link
                <li className="nav-item">
                  <Link className="nav-link" to="/activityform">
                    Agregar Actividad
                  </Link>
                </li>
              ) : null} */}
            </ul>
          </div>
        </div>
      </nav>
    );
};

export default Navbar;