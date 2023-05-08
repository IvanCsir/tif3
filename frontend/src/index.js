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

// const root = ReactDOM.createRoot(document.getElementById('root'));
ReactDOM.render(
  <BrowserRouter>
  <Navbar></Navbar>
    <div className="container my-4">
      <Routes>
        <Route exact path="/" element={<Register />}/>
        <Route path="/login" Component={Login}/>
        <Route path="/register" element={<Register />} />
        <Route path="/activity/:id/datos" Component={DatosActivityForm}/>
        <Route path="/actividades" Component={ActivityList}/>
        <Route path="/activityForm" Component={ActivityForm}/>
        <Route path="/updateActivity/:id" Component={ActivityForm}/>        

      </Routes>
    </div>
  </BrowserRouter>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
