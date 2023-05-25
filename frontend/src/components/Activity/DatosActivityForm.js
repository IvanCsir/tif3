import React, { useState } from 'react';
import { useNavigate, useParams} from "react-router-dom";
import { Button, Grid, TextField, Alert} from "@mui/material";
import axios from 'axios';



function DatosActivityForm(props) {
  const { id } = useParams();
  const [day, setDay] = useState('');
  // const [time, setTime] = useState('');
  const [capacity, setCapacity] = useState('');
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertSeverity, setAlertSeverity] = useState('error');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  const navigate = useNavigate()
  

  const handleSubmit = (e) => {
    // e.preventDefault();

    const today = new Date().toISOString().split("T")[0]; // Obtener la fecha actual en formato YYYY-MM-DD
      if (day < today) {
        setAlertMessage('No se pueden seleccionar fechas pasadas.');
        setAlertSeverity('error');
        setAlertOpen(true);
      return;
    }

    const data = {
      day: day,
      start_time: startTime,
      end_time: endTime,
      capacity: capacity,

    };
    axios
      .post(`http://127.0.0.1:8000/api/activities/activity/${id}/datos/`, data, {
        headers: {
          'Content-Type': 'application/json',
        },
      })
      .then((response) => {
        console.log(response.data);
        navigate("/actividades")
      })
      .catch((error) => {
        // alert("En el día y horario asignados ya hay disponibilidad")
        // console.error(error);
        setAlertMessage('En el día y horario asignados ya hay disponibilidad');
        setAlertSeverity('error');
        setAlertOpen(true);
       
      });
  };
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
          value={day}
          onChange={(e) => setDay(e.target.value)}
          // label="Day"
          required
          color="primary"
          autoFocus
          type="date"
        />
      </Grid>
      <Grid item>
        <TextField
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
          // label="Hora de inicio"
          required
          color="primary"
          type="time"
          helperText="Hora de inicio"
          
        />
      </Grid>
      <Grid item>
        <TextField
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
          // label="Hora de finalización"
          required
          color="primary"
          type="time"
          helperText="Hora de finalización"

        />
      </Grid>
      <Grid item>
        <TextField
          value={capacity}
          onChange={(e) => setCapacity(Number(e.target.value))}
          label="Capacity"
          required
          color="primary"
          type="number"
        />
      </Grid>
      <Grid item>
        <Button
          variant="contained"
          color="primary"
          onClick={() => handleSubmit()}
          useNavigate
        >
          Agregar
        </Button>
      </Grid>
      <Grid item>
        {alertOpen && (
          <Alert severity={alertSeverity} onClose={() => setAlertOpen(false)}>
            {alertMessage}
          </Alert>
        )}
      </Grid>
    </Grid>
  );
}

export default DatosActivityForm;
