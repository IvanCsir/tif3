import React from 'react';
import ReactDOM from 'react-dom';
import {BrowserRouter, Route, Switch } from 'react-router-dom'

import reportWebVitals from './reportWebVitals';
//Components:
import Navbar from './components/Navbar/Navbar';
import ActivityList from './components/Activity/ActivityList';
import 'bootstrap/dist/css/bootstrap.min.css'
import './index.css';

// const root = ReactDOM.createRoot(document.getElementById('root'));
ReactDOM.render(
  <div>
    <Navbar />
    <div className="container my-4">
      <ActivityList />
    </div>
  </div>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
