import React, { useState } from "react";
import * as ActivityServer from './ActivityServer';
import {useNavigate} from 'react-router-dom';


const ActivityForm= () => {

  const navigate = useNavigate(); //esto es para redireccionar a otra ruta
  const initialState = {id:0, name:"", description: ""}

  const [activity, setActivity]= useState(initialState);

  const handleInputChange = (e) => {
    // console.log(e.target.name)
    // console.log(e.target.value)
    setActivity({...activity,[e.target.name]:e.target.value})
    //con los tres punto tomo el estado actual como esté, luego entro a cada valor del atributo y con el value los modifico.
  };

  const handleSubmit = async (e) =>{
    e.preventDefault();
    // Con el preventDefault evito la recarga de la pagina cuando le doy enter en el form
    try{
      let res;
      res= await ActivityServer.registerActivity(activity);

      const data= await res.json();
      console.log(data)
      
      if (data.message === "Success"){
        setActivity(initialState); 
      }
      navigate("/");

    }
    catch(error){
      console.log(error)
    }
  };

    return (<div className="col-md-3 mx-auto">
    <h2 className="mb-3 text-center">Actividad</h2>
    <form onSubmit={handleSubmit}>
      <div className="mb-3">
        <label className="form-label">Nombre</label>
        {/* El onChange se pone para manejar el cambio del input */}
        <input type="text" name="name" value={activity.name} onChange={handleInputChange} maxLength="50" className="form-control" minLength="2" autoFocus required />
      </div>
      <div className="mb-3">
        <label className="form-label">Descripcion</label>
        <input type="text" name="description" value={activity.description} onChange={handleInputChange} maxLength="255" className="form-control" min="1900" max="2020" required />
      </div>
      <div className="d-grid gap-2">
          <button type="submit" className="btn btn-block btn-success">
            Register
          </button>
      </div>
    </form>
  </div>)
};

export default ActivityForm;