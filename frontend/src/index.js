import React from 'react';
import ReactDOM from 'react-dom';
import {BrowserRouter,Routes, Route } from 'react-router-dom'

import reportWebVitals from './reportWebVitals';
//Components:
import Navbar from './components/Navbar/Navbar';
import ActivityList from './components/Activity/ActivityList';
import ActivityForm from './components/Activity/ActivityForm';


import 'bootstrap/dist/css/bootstrap.min.css'
import './index.css';

// const root = ReactDOM.createRoot(document.getElementById('root'));
ReactDOM.render(
  <BrowserRouter>
    <Navbar />
    <div className="container my-4">
      <Routes>
        <Route exact path="/" Component={ActivityList}/>
        <Route path="/activityForm" Component={ActivityForm}/>        
 
      </Routes>
    </div>
  </BrowserRouter>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
