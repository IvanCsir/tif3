// import {Link} from 'react-router-dom'
// import {React} from 'react'


// const Navbar = ()=>{

//   const id_usuario = parseInt(localStorage.getItem('usuario_id'));
//   const isAuthenticated = !!id_usuario; // Me fijo si hay un usuario que haya iniciado sesión

//   if (!isAuthenticated) {
//     return null; //No renderizo la navbar
//   }


//   return (
//     <nav className="navbar navbar-expand-lg bg-body-tertiary navbar-dark bg-dark">
//       <div className="container-fluid">
//         <Link className="navbar-brand" to="/actividades">
//           Club Member
//         </Link>
//         <button
//           className="navbar-toggler"
//           type="button"
//           data-bs-toggle="collapse"
//           data-bs-target="#navbarNav"
//           aria-controls="navbarNav"
//           aria-expanded="false"
//           aria-label="Toggle navigation"
//         >
//           <span className="navbar-toggler-icon"></span>
//         </button>
//         <div className="collapse navbar-collapse" id="navbarNav">
//           <ul className="navbar-nav ml-auto">
//             <li className="nav-item">
//               <Link
//                 className="nav-link active"
//                 aria-current="page"
//                 to="/actividades"
//               >
//                 Actividades
//               </Link>
//             </li>
//             <li className="nav-item">
//               <Link
//                 className="nav-link active"
//                 aria-current="page"
//                 to={`/usuario/${id_usuario}/reservas/`}
//               >
//                 Mis Reservas
//               </Link>
//             </li>
//           </ul>
//         </div>
//         <span class="navbar-text">
//           <Link className="nav-link active" aria-current="page" to={`/logout`}>
//             Logout
//           </Link>
//         </span>
//       </div>
//     </nav>
//   );
// };

// export default Navbar;

// import * as React from 'react';
// import AppBar from '@mui/material/AppBar';
// import Box from '@mui/material/Box';
// import Toolbar from '@mui/material/Toolbar';
// import IconButton from '@mui/material/IconButton';
// import Typography from '@mui/material/Typography';
// import Menu from '@mui/material/Menu';
// import MenuIcon from '@mui/icons-material/Menu';
// import Container from '@mui/material/Container';
// import Button from '@mui/material/Button';
// import Tooltip from '@mui/material/Tooltip';
// import MenuItem from '@mui/material/MenuItem';
// import AdbIcon from '@mui/icons-material/Adb';
// import { Link, useNavigate } from 'react-router-dom';
// import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
// import AccountCircleIcon from '@mui/icons-material/AccountCircle';
// import { grey } from '@mui/material/colors';


// const Navbar = () => {
//   const [anchorElNav, setAnchorElNav] = React.useState(null);
//   const [anchorElUser, setAnchorElUser] = React.useState(null);
//   const navigate = useNavigate();
  

//   const handleOpenNavMenu = (event) => {
//     setAnchorElNav(event.currentTarget);
//   };
//   const handleOpenUserMenu = (event) => {
//     setAnchorElUser(event.currentTarget);
//   };

//   const handleCloseNavMenu = () => {
//     setAnchorElNav(null);
//   };

//   const handleCloseUserMenu = () => {
//     setAnchorElUser(null);
//   };

//   const isAuthenticated = !!localStorage.getItem('usuario_id');

//   if (!isAuthenticated) {
//     return null; // No renderizar la barra de navegación si no hay usuario autenticado
//   }

//   const pages = ['Actividades', 'Mis Reservas'];
//   const settings = [];

//   const handleLogout = () => {
//     navigate('/logout')
//     localStorage.removeItem('usuario_id');
//     // Agregar aquí el código adicional necesario para realizar la acción de logout, como redireccionar a la página de inicio de sesión.
//   };

//   return (
//     <AppBar position="static" sx={{ bgcolor: 'black' }}>
//       <Container maxWidth="xl">
//         <Toolbar disableGutters>
//           <EmojiEventsIcon sx={{ display: { xs: 'none', md: 'flex' }, mr: 1 }}></EmojiEventsIcon>
//           {/* <AdbIcon sx={{ display: { xs: 'none', md: 'flex' }, mr: 1 }} /> */}
//           <Typography
//             variant="h6"
//             noWrap
//             component={Link}
//             to="/actividades"
//             sx={{
//               mr: 2,
//               display: { xs: 'none', md: 'flex' },
//               fontFamily: 'monospace',
//               fontWeight: 700,
//               letterSpacing: '.3rem',
//               color: 'white',
//               textDecoration: 'none',
//             }}
//           >
//             CM
//           </Typography>

//           <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
//             <IconButton
//               size="large"
//               aria-label="account of current user"
//               aria-controls="menu-appbar"
//               aria-haspopup="true"
//               onClick={handleOpenNavMenu}
//               color="inherit"
//             >
//               <MenuIcon />
//             </IconButton>
//             <Menu
//               id="menu-appbar"
//               anchorEl={anchorElNav}
//               anchorOrigin={{
//                 vertical: 'bottom',
//                 horizontal: 'left',
//               }}
//               keepMounted
//               transformOrigin={{
//                 vertical: 'top',
//                 horizontal: 'left',
//               }}
//               open={Boolean(anchorElNav)}
//               onClose={handleCloseNavMenu}
//               sx={{
//                 display: { xs: 'block', md: 'none' },
//               }}
//             >
//               {pages.map((page) => (
//                 <MenuItem key={page} onClick={handleCloseNavMenu}>
//                   <Typography textAlign="center">{page}</Typography>
//                 </MenuItem>
//               ))}
//             </Menu>
//           </Box>
//           <AdbIcon sx={{ display: { xs: 'flex', md: 'none' }, mr: 1 }} />
//           <Typography
//             variant="h5"
//             noWrap
//             component={Link}
//             to="/"
//             sx={{
//               mr: 2,
//               display: { xs: 'flex', md: 'none' },
//               flexGrow: 1,
//               fontFamily: 'monospace',
//               fontWeight: 700,
//               letterSpacing: '.3rem',
//               color: 'white',
//               textDecoration: 'none',
//             }}
//           >
//             LOGO
//           </Typography>
//           <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
//             {pages.map((page, index) => (
//               <Button
//                 key={index}
//                 component={Link}
//                 to={index === 0 ? '/actividades' : `/usuario/${localStorage.getItem('usuario_id')}/reservas/`}
//                 onClick={handleCloseNavMenu}
//                 sx={{ my: 2, color: 'white', display: 'block' }}
//               >
//                 {page}
//               </Button>
//             ))}
//           </Box>

//           <Box sx={{ flexGrow: 0 }}>
//             <Tooltip title="Open settings">
//               <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
//                 {/* <Avatar alt="Remy Sharp" src="/static/images/avatar/2.jpg" /> */}
//                 <AccountCircleIcon sx={{ color: grey[500], fontSize: 40, }}></AccountCircleIcon>
//               </IconButton>
//             </Tooltip>
//             <Menu
//               sx={{ mt: '45px' }}
//               id="menu-appbar"
//               anchorEl={anchorElUser}
//               anchorOrigin={{
//                 vertical: 'top',
//                 horizontal: 'right',
//               }}
//               keepMounted
//               transformOrigin={{
//                 vertical: 'top',
//                 horizontal: 'right',
//               }}
//               open={Boolean(anchorElUser)}
//               onClose={handleCloseUserMenu}
//             >
//               {settings.map((setting, index) => (
//                 <MenuItem key={index} onClick={handleCloseUserMenu}>
//                   <Typography textAlign="center">{setting}</Typography>
//                 </MenuItem>
//               ))}
//               <MenuItem onClick={handleLogout}>
//                 <Typography textAlign="center">Logout</Typography>
//               </MenuItem>
//             </Menu>
//           </Box>
//         </Toolbar>
//       </Container>
//     </AppBar>
//   );
// };

// export default Navbar;

/////////////////////////////////

import React, { useState } from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import AdbIcon from '@mui/icons-material/Adb';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { grey } from '@mui/material/colors';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import MensajeList from '../Activity/MensajeList'; // Importa el componente MensajeList
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';

const Navbar = () => {
  const [anchorElNav, setAnchorElNav] = useState(null);
  const [anchorElUser, setAnchorElUser] = useState(null);
  const [anchorElNotif, setAnchorElNotif] = useState(null); // Nuevo estado para el menú de notificaciones
  const navigate = useNavigate();
  const location = useLocation();

  const tipoUsuario = localStorage.getItem('tipo_usuario');
  const renderIcons = () => {
    if (tipoUsuario === '1') {
      return (
        <React.Fragment>
            <Typography style={{ fontSize: '14px' }}>Enviar mensaje</Typography>
        </React.Fragment>
      );
    }
    return null;
  };

  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };

  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleOpenNotifMenu = (event) => { // Función para abrir el menú de notificaciones
    setAnchorElNotif(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleCloseNotifMenu = () => { // Función para cerrar el menú de notificaciones
    setAnchorElNotif(null);
  };

  const handleLogout = () => {
    navigate('/logout');
    localStorage.removeItem('usuario_id');
  };

  const isAuthenticated = !!localStorage.getItem('usuario_id');

  // No mostrar la navbar en rutas públicas como login, register y logout
  const publicRoutes = ['/', '/register', '/logout'];
  if (publicRoutes.includes(location.pathname) || !isAuthenticated) {
    return null;
  }

  const pages = ['Actividades', 'Mis Reservas'];
  const settings = [];

  return (
    <AppBar position="static" sx={{ bgcolor: 'black' }}>
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          {/* <AdbIcon sx={{ display: { xs: 'none', md: 'flex' }, mr: 1 }} /> */}
          <EmojiEventsIcon sx={{ display: { xs: 'none', md: 'flex' }, mr: 1 }}></EmojiEventsIcon>
          <Typography
            variant="h6"
            noWrap
            component={Link}
            to="/actividades"
            sx={{
              mr: 2,
              display: { xs: 'none', md: 'flex' },
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.3rem',
              color: 'white',
              textDecoration: 'none',
            }}
          >
            CM
          </Typography>

          <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{
                display: { xs: 'block', md: 'none' },
              }}
            >
              {pages.map((page, index) => (
                <MenuItem 
                  key={page} 
                  component={Link}
                  to={index === 0 ? '/actividades' : `/usuario/${localStorage.getItem('usuario_id')}/reservas/`}
                  onClick={handleCloseNavMenu}
                >
                  <Typography textAlign="center">{page}</Typography>
                </MenuItem>

              ))}
              
            </Menu>
          </Box>

          <Typography
            variant="h5"
            noWrap
            component={Link}
            to="/"
            sx={{
              mr: 2,
              display: { xs: 'flex', md: 'none' },
              flexGrow: 1,
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.3rem',
              color: 'white',
              textDecoration: 'none',
            }}
          >
            LOGO
          </Typography>

          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
            {pages.map((page, index) => (
              <Button
                key={index}
                component={Link}
                to={index === 0 ? '/actividades' : `/usuario/${localStorage.getItem('usuario_id')}/reservas/`}
                onClick={handleCloseNavMenu}
                sx={{ my: 2, color: 'white', display: 'block' }}
              >
                {page}
              </Button>
            ))}
          </Box>
          <Box >
            <Button sx={{ my: 2, color: 'white', display: 'block' }} to={"/mensaje/crear_mensaje/" } component={Link}>
              {renderIcons()}
            </Button>
            

          </Box>
          <Box sx={{ flexGrow: 0 }}>
            <Tooltip title="Notificaciones">
              {/* <IconButton
                onClick={handleOpenNotifMenu}
                color="inherit"
                sx={{ p: 0, ml: 1 }}
              >
                <NotificationsIcon />
              </IconButton> */}
              <MensajeList></MensajeList>
            </Tooltip>
            <Menu
              id="menu-appbar"
              anchorEl={anchorElNotif}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorElNotif)}
              onClose={handleCloseNotifMenu}
            >
              <MenuItem onClick={handleCloseNotifMenu}>
                <MensajeList /> {/* Renderiza el componente MensajeList en el menú de notificaciones */}
              </MenuItem>
            </Menu>
          </Box>

          <Box sx={{ flexGrow: 0 }}>
            <Tooltip title={`${localStorage.getItem('usuario_nombre')} ${localStorage.getItem('usuario_apellido')}`}>
              <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                <AccountCircleIcon sx={{ color: grey[500], fontSize: 40 }} />
              </IconButton>
            </Tooltip>
            <Menu
              sx={{ mt: '45px' }}
              id="menu-appbar"
              anchorEl={anchorElUser}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorElUser)}
              onClose={handleCloseUserMenu}
            >
              <Box sx={{ px: 2, py: 1, borderBottom: '1px solid #e0e0e0' }}>
                <Typography variant="subtitle1" fontWeight="bold">
                  {localStorage.getItem('usuario_nombre')} {localStorage.getItem('usuario_apellido')}
                </Typography>
              </Box>
              {settings.map((setting, index) => (
                <MenuItem key={index} onClick={handleCloseUserMenu}>
                  <Typography textAlign="center">{setting}</Typography>
                </MenuItem>
              ))}
              <MenuItem onClick={handleLogout}>
                <Typography textAlign="center">Logout</Typography>
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar;
