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
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import MensajeList from '../Activity/MensajeList';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import SportsIcon from '@mui/icons-material/Sports';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import EventIcon from '@mui/icons-material/Event';
import SendIcon from '@mui/icons-material/Send';
import PersonIcon from '@mui/icons-material/Person';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';

const Navbar = () => {
  const [anchorElNav, setAnchorElNav] = useState(null);
  const [anchorElUser, setAnchorElUser] = useState(null);
  const [anchorElNotif, setAnchorElNotif] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Obtener datos de localStorage de forma segura
  const getTipoUsuario = () => {
    try {
      return localStorage.getItem('tipo_usuario');
    } catch (e) {
      return null;
    }
  };

  const getUsuarioId = () => {
    try {
      return localStorage.getItem('usuario_id');
    } catch (e) {
      return null;
    }
  };

  const getUsuarioNombre = () => {
    try {
      return localStorage.getItem('usuario_nombre') || '';
    } catch (e) {
      return '';
    }
  };

  const getUsuarioApellido = () => {
    try {
      return localStorage.getItem('usuario_apellido') || '';
    } catch (e) {
      return '';
    }
  };

  const tipoUsuario = getTipoUsuario();
  const usuarioId = getUsuarioId();
  const usuarioNombre = getUsuarioNombre();
  const usuarioApellido = getUsuarioApellido();

  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };

  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleOpenNotifMenu = (event) => {
    setAnchorElNotif(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleCloseNotifMenu = () => {
    setAnchorElNotif(null);
  };

  const handleLogout = () => {
    navigate('/logout');
    localStorage.removeItem('usuario_id');
  };

  const isAuthenticated = !!getUsuarioId();

  // No mostrar la navbar en rutas públicas como login, register y logout
  const publicRoutes = ['/', '/register', '/logout'];
  if (publicRoutes.includes(location.pathname) || !isAuthenticated) {
    return null;
  }

  const pages = ['Actividades', 'Recomendaciones IA', 'Mis Reservas'];
  const settings = [
    { label: 'Mi Perfil', route: '/configurar-perfil' }
  ];

  return (
    <AppBar 
      position="static" 
      sx={{ 
        background: 'linear-gradient(90deg, #1a237e 0%, #000000 100%)',
        boxShadow: '0 4px 20px 0 rgba(0,0,0,0.3)',
        transition: 'all 0.3s ease-in-out'
      }}
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ minHeight: { xs: 56, sm: 64 } }}>
          <EmojiEventsIcon 
            sx={{ 
              display: { xs: 'none', md: 'flex' }, 
              mr: 1,
              fontSize: 24,
              color: '#ffd700',
              filter: 'drop-shadow(0 2px 4px rgba(255,215,0,0.3))'
            }}
          />
          <Typography
            variant="h6"
            noWrap
            component={Link}
            to="/actividades"
            sx={{
              mr: 3,
              display: { xs: 'none', md: 'flex' },
              fontFamily: 'Roboto, sans-serif',
              fontWeight: 700,
              fontSize: '1.1rem',
              letterSpacing: '.15rem',
              color: 'white',
              textDecoration: 'none',
              textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
              transition: 'all 0.3s ease',
              '&:hover': {
                color: '#ffd700',
                transform: 'scale(1.05)',
              }
            }}
          >
            CLUB MEMBER
          </Typography>

          <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="inherit"
              sx={{
                transition: 'all 0.3s ease',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  transform: 'rotate(90deg)',
                }
              }}
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
                '& .MuiPaper-root': {
                  background: 'linear-gradient(135deg, #1a237e 0%, #000000 100%)',
                  color: 'white',
                  mt: 1,
                  boxShadow: '0 8px 32px 0 rgba(0,0,0,0.37)'
                }
              }}
            >
              {pages.map((page, index) => {
                let route = '/actividades';
                let icon = <SportsIcon sx={{ mr: 1 }} />;
                if (index === 1) {
                  route = '/recomendaciones-ia';
                  icon = <SmartToyIcon sx={{ mr: 1 }} />;
                }
                if (index === 2) {
                  route = `/usuario/${usuarioId}/reservas/`;
                  icon = <EventIcon sx={{ mr: 1 }} />;
                }
                
                return (
                  <MenuItem 
                    key={page} 
                    component={Link}
                    to={route}
                    onClick={handleCloseNavMenu}
                    sx={{
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 215, 0, 0.2)',
                        transform: 'translateX(10px)',
                      }
                    }}
                  >
                    {icon}
                    <Typography textAlign="center">{page}</Typography>
                  </MenuItem>
                );
              })}
            </Menu>
          </Box>

          <EmojiEventsIcon sx={{ display: { xs: 'flex', md: 'none' }, mr: 1, color: '#ffd700' }} />
          <Typography
            variant="h5"
            noWrap
            component={Link}
            to="/actividades"
            sx={{
              mr: 2,
              display: { xs: 'flex', md: 'none' },
              flexGrow: 1,
              fontFamily: 'Roboto, sans-serif',
              fontWeight: 700,
              fontSize: '1rem',
              letterSpacing: '.1rem',
              color: 'white',
              textDecoration: 'none',
            }}
          >
            CM
          </Typography>

          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, gap: 0.5 }}>
            {pages.map((page, index) => {
              let route = '/actividades';
              let icon = <SportsIcon sx={{ mr: 0.5, fontSize: 18 }} />;
              if (index === 1) {
                route = '/recomendaciones-ia';
                icon = <SmartToyIcon sx={{ mr: 0.5, fontSize: 18 }} />;
              }
              if (index === 2) {
                route = `/usuario/${usuarioId}/reservas/`;
                icon = <EventIcon sx={{ mr: 0.5, fontSize: 18 }} />;
              }
              
              return (
                <Button
                  key={index}
                  component={Link}
                  to={route}
                  onClick={handleCloseNavMenu}
                  startIcon={icon}
                  sx={{ 
                    my: 1, 
                    color: 'white', 
                    display: 'flex',
                    px: 2,
                    py: 0.8,
                    borderRadius: 2,
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: '-100%',
                      width: '100%',
                      height: '100%',
                      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                      transition: 'left 0.5s ease',
                    },
                    '&:hover': {
                      backgroundColor: 'rgba(255, 215, 0, 0.15)',
                      color: '#ffd700',
                      transform: 'translateY(-1px)',
                      boxShadow: '0 4px 12px rgba(255, 215, 0, 0.3)',
                    },
                    '&:hover::before': {
                      left: '100%',
                    }
                  }}
                >
                  {page}
                </Button>
              );
            })}
          </Box>

          {tipoUsuario === '1' && (
            <Box>
              <Button 
                startIcon={<SendIcon sx={{ fontSize: 18 }} />}
                sx={{ 
                  my: 1, 
                  color: 'white', 
                  display: 'flex',
                  px: 2,
                  py: 0.8,
                  borderRadius: 2,
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 215, 0, 0.15)',
                    color: '#ffd700',
                    transform: 'translateY(-1px)',
                    boxShadow: '0 4px 12px rgba(255, 215, 0, 0.3)',
                  }
                }} 
                to={"/mensaje/crear_mensaje/"} 
                component={Link}
              >
                Enviar mensaje
              </Button>
            </Box>
          )}

          <Box sx={{ flexGrow: 0, ml: 1 }}>
            <Tooltip title="Notificaciones" arrow>
              <Box sx={{
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'scale(1.1)',
                }
              }}>
                <MensajeList />
              </Box>
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
                <MensajeList />
              </MenuItem>
            </Menu>
          </Box>

          <Box sx={{ flexGrow: 0 }}>
            <Tooltip title={`${usuarioNombre} ${usuarioApellido}`} arrow>
              <IconButton 
                onClick={handleOpenUserMenu} 
                sx={{ 
                  p: 0,
                  ml: 1.5,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'scale(1.08) rotate(5deg)',
                  }
                }}
              >
                <AccountCircleIcon 
                  sx={{ 
                    color: '#ffd700', 
                    fontSize: 36,
                    filter: 'drop-shadow(0 2px 8px rgba(255,215,0,0.4))',
                    transition: 'all 0.3s ease',
                  }} 
                />
              </IconButton>
            </Tooltip>
            <Menu
              sx={{ 
                mt: '45px',
                '& .MuiPaper-root': {
                  background: 'linear-gradient(135deg, #1a237e 0%, #000000 100%)',
                  color: 'white',
                  minWidth: 220,
                  borderRadius: 2,
                  boxShadow: '0 8px 32px 0 rgba(0,0,0,0.37)',
                  backdropFilter: 'blur(4px)',
                }
              }}
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
              <Box sx={{ 
                px: 2.5, 
                py: 1.5, 
                borderBottom: '2px solid rgba(255, 215, 0, 0.3)',
                background: 'rgba(255, 215, 0, 0.1)'
              }}>
                <Typography variant="subtitle1" fontWeight="bold" sx={{ color: '#ffd700' }}>
                  {usuarioNombre} {usuarioApellido}
                </Typography>
              </Box>
              {settings.map((setting, index) => (
                <MenuItem 
                  key={index} 
                  component={Link}
                  to={setting.route}
                  onClick={handleCloseUserMenu}
                  sx={{
                    py: 1.5,
                    px: 2.5,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 215, 0, 0.2)',
                      transform: 'translateX(8px)',
                    }
                  }}
                >
                  <PersonIcon sx={{ mr: 1.5, fontSize: 20 }} />
                  <Typography>{setting.label}</Typography>
                </MenuItem>
              ))}
              <MenuItem 
                onClick={handleLogout}
                sx={{
                  py: 1.5,
                  px: 2.5,
                  transition: 'all 0.3s ease',
                  borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 82, 82, 0.2)',
                    transform: 'translateX(8px)',
                    color: '#ff5252'
                  }
                }}
              >
                <ExitToAppIcon sx={{ mr: 1.5, fontSize: 20 }} />
                <Typography>Logout</Typography>
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar;
