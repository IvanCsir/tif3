import React, { useEffect, useState } from "react";
import * as ActivityServer from "./ActivityServer";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../Navbar/Navbar";
import { Container } from "@mui/material";

const ActivityForm = () => {
  const navigate = useNavigate(); //esto es para redireccionar a otra ruta
  const params = useParams(); //Me permite ver los parametros que estoy enviando
  // console.log(params);

  const initialState = { id: 0, name: "", description: "" };

  const [activity, setActivity] = useState(initialState);

  const handleInputChange = (e) => {
    // console.log(e.target.name)
    // console.log(e.target.value)
    setActivity({ ...activity, [e.target.name]: e.target.value });
    //con los tres punto tomo el estado actual como esté, luego entro a cada valor del atributo y con el value los modifico.
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Con el preventDefault evito la recarga de la pagina cuando le doy enter en el form
    try {
      let res;
      if(!params.id){
        res = await ActivityServer.registerActivity(activity);
        const data = await res.json();
        if (data.message === "Success") {
          setActivity(initialState);
        }
      }else{
        await ActivityServer.updateActivity(params.id, activity);
      }
      
      navigate("/actividades");
    } catch (error) {
      console.log(error);
    }
  };

  const getActivity = async (activityId) => {
    try {
      const res = await ActivityServer.getActivity(activityId);
      const data = await res.json();
      // console.log(data)
      const {name, description} = data.actividad;
      setActivity({name, description});
      // console.log(data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(()=>{
    if (params.id){
      getActivity(params.id);
    }
    // eslint-disable-next-line
  },[] )

  return (
    <div className="col-md-3 mx-auto">
    <h2 className="mb-3 text-center">Actividad</h2>
    <form onSubmit={handleSubmit}>
      <div className="mb-3">
        <label className="form-label">Nombre</label>
        {/* El onChange se pone para manejar el cambio del input */}
        <input
          type="text"
          name="name"
          value={activity.name}
          onChange={handleInputChange}
          maxLength="50"
          className="form-control"
          minLength="2"
          autoFocus
          required
        />
      </div>
      <div className="mb-3">
        <label className="form-label">Descripcion</label>
        <input
          type="text"
          name="description"
          value={activity.description}
          onChange={handleInputChange}
          maxLength="255"
          className="form-control"
          min="1900"
          max="2020"
          required
        />
      </div>
      <div className="d-grid gap-2">
        {params.id ? (
          <button type="submit" className="btn btn-block btn-primary">
            Actualizar
          </button>
        ) : (
          <button type="submit" className="btn btn-block btn-success">
            Registrar
          </button>
        )}
      </div>
    </form>
  </div>
);
};

export default ActivityForm;
