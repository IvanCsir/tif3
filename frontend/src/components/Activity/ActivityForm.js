import React, { useEffect, useState } from "react";
import * as ActivityServer from "./ActivityServer";
import { useNavigate, useParams } from "react-router-dom";
import { Button, Grid, TextField, Checkbox, FormControlLabel } from "@mui/material";


const ActivityForm = () => {
  const navigate = useNavigate(); //esto es para redireccionar a otra ruta
  const params = useParams(); //Me permite ver los parametros que estoy enviando
  // console.log(params);

  const initialState = { id: 0, name: "", description: "", aire_libre:false};

  const [activity, setActivity] = useState(initialState);
  const handleAireLibreChange = (e) => {
    setActivity({ ...activity, aire_libre: e.target.checked });
  };
  

  const handleInputChange = (e) => {
    // console.log(e.target.name)
    // console.log(e.target.value)
    setActivity({ ...activity, [e.target.name]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });
    //con los tres punto tomo el estado actual como esté, luego entro a cada valor del atributo y con el value los modifico.
  };
  // const handleInputChange = (e) => {
  //   const { name, value, type, checked } = e.target;
  //   const newValue = type === 'checkbox' ? checked : value;
  
  //   setActivity({ ...activity, [name]: newValue });
  // };

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
    <Grid
      container
      direction="column"
      alignItems="center"
      justifyContent="center"
      spacing={2}
      mt={3}
    >
      <Grid item>
        <TextField
          value={activity.name}
          onChange={handleInputChange}
          name="name"
          label="Nombre"
          required
          color="info"
          autoFocus
        />
      </Grid>
      <Grid item>
        <TextField
          value={activity.description}
          onChange={handleInputChange}
          name="description"
          label="Descripción"
          required
          color="info"
        />
      </Grid>
      <Grid item>
        <FormControlLabel
          control={
            <Checkbox
              checked={activity.aire_libre}
              onChange={handleAireLibreChange}
              name="AireLibre"
              color="primary"
            />
          }
          label="Aire libre"
        />
      </Grid>
      <Grid item>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          onClick={handleSubmit}
        >
          {params.id ? "Actualizar" : "Registrar"}
        </Button>
      </Grid>
    </Grid>
  );
};

export default ActivityForm;
