import React from 'react';
import ReactDOM from 'react-dom';
import {BrowserRouter,Routes, Route } from 'react-router-dom'

import reportWebVitals from './reportWebVitals';
//Components:
import Navbar from './components/Navbar/Navbar';
import ActivityList from './components/Activity/ActivityList';
import ActivityForm from './components/Activity/ActivityForm';
import PrivateRoute from './components/PrivateRoute';
import NotFound from './components/NotFound';

// import SignUp from './components/Users/Register';
import Login from './components/Users/Login';
import Register from './components/Users/Register';
import UserProfile from './components/Users/UserProfile';
import DatosActivityForm from './components/Activity/DatosActivityForm';

import 'bootstrap/dist/css/bootstrap.min.css'
import './index.css';
import DatosActivityList from './components/Activity/DatosActivityList';
import ReservaList from './components/Activity/ReservationList';
import Logout from './components/Users/Logout';
import MensajeList from './components/Activity/MensajeList';
import MensajeForm from './components/Activity/MensajeForm';
import AIRecommendations from './components/Activity/AIRecommendations';
import RecommendationsWidget from './components/Activity/RecommendationsWidget';
// const root = ReactDOM.createRoot(document.getElementById('root'));

document.title = 'Club Member';
ReactDOM.render(
  <BrowserRouter>
  <Navbar></Navbar>
  <RecommendationsWidget />
    <div className="container my-4">
      <Routes>
        <Route exact path="/" element={<Login />}/>
        {/* <Route path="/login" Component={Login}/> */}
        <Route path="/register" element={<Register />} />
        <Route path="/configurar-perfil" element={<UserProfile />} />
        <Route path="/logout" element={<Logout/>}/>
        <Route path="/activity/:id/datos" element={<PrivateRoute><DatosActivityForm /></PrivateRoute>}/>
        <Route path="/actividades" element={<PrivateRoute><ActivityList /></PrivateRoute>}/>
        <Route path="/recomendaciones-ia" element={<PrivateRoute><AIRecommendations /></PrivateRoute>}/>
        <Route path="/activityForm" element={<PrivateRoute><ActivityForm /></PrivateRoute>}/>
        <Route path="/updateActivity/:id" element={<PrivateRoute><ActivityForm /></PrivateRoute>}/>
        <Route path="/activity/lugares_disponibles/:id/" element={<PrivateRoute><DatosActivityList /></PrivateRoute>}/>
        <Route path="/usuario/:id_user/reservas/" element={<PrivateRoute><ReservaList /></PrivateRoute>}/>    
        <Route path="/mensaje/obtener_mensaje/" element={<PrivateRoute><MensajeList /></PrivateRoute>}/>
        <Route path="/mensaje/crear_mensaje/" element={<PrivateRoute><MensajeForm /></PrivateRoute>}/>
        
        {/* Ruta catch-all para 404 - debe ir al final */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  </BrowserRouter>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
