import React from 'react';
import ReactDOM from 'react-dom';
import {BrowserRouter,Routes, Route } from 'react-router-dom'

import reportWebVitals from './reportWebVitals';
//Components:
import Navbar from './components/Navbar/Navbar';
import ActivityList from './components/Activity/ActivityList';
import ActivityForm from './components/Activity/ActivityForm';

// import SignUp from './components/Users/Register';
import Login from './components/Users/Login';
import Register from './components/Users/Register';
import DatosActivityForm from './components/Activity/DatosActivityForm';

import 'bootstrap/dist/css/bootstrap.min.css'
import './index.css';
import DatosActivityList from './components/Activity/DatosActivityList';
import ReservaList from './components/Activity/ReservationList';
import Logout from './components/Users/Logout';
import MensajeList from './components/Activity/MensajeList';
import MensajeForm from './components/Activity/MensajeForm';
// const root = ReactDOM.createRoot(document.getElementById('root'));

document.title = 'Club Member';
ReactDOM.render(
  <BrowserRouter>
    <div className="container my-4">
      <Routes>
        <Route exact path="/" element={<Login />}/>
        {/* <Route path="/login" element={<Login/>}/> */}
        <Route path="/register" element={<Register />} />
        <Route path="/logout" element={<Logout/>}/>
        <Route path="/activity/:id/datos" element={<><Navbar/><DatosActivityForm/></>}/>
        <Route path="/actividades" element={<><Navbar/><ActivityList/></>}/>
        <Route path="/activityForm" element={<><Navbar/><ActivityForm/></>}/>
        <Route path="/updateActivity/:id" element={<><Navbar/><ActivityForm/></>}/>
        <Route path="/activity/lugares_disponibles/:id/" element={<><Navbar/><DatosActivityList/></>}/>
        <Route path="/usuario/:id_user/reservas/" element={<><Navbar/><ReservaList/></>}/>    
        <Route path="/mensaje/obtener_mensaje/" element={<><Navbar/><MensajeList/></>}/>
        <Route path="/mensaje/crear_mensaje/" element={<><Navbar/><MensajeForm/></>}/>



      </Routes>
    </div>
  </BrowserRouter>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
