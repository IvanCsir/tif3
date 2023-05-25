
import React, { useState } from 'react';
import { useNavigate, useParams} from "react-router-dom";
import { Button, Grid, TextField, Select, MenuItem, Alert} from "@mui/material";
import axios from 'axios';



function DatosActivityForm(props) {
  const { id } = useParams();
  const [day, setDay] = useState('');
  const [time, setTime] = useState('');
  const [capacity, setCapacity] = useState('');
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertSeverity, setAlertSeverity] = useState('error');

  const navigate = useNavigate()
  // opciones del desplegable
  const times = [
    { label: '9.00hs - 10.00hs', value: '1' },
    { label: '10.00hs - 11.00hs', value: '2' },
    { label: '11.00hs - 12.00hs', value: '3' },
    { label: '12.00hs - 13.00hs', value: '4' },
    { label: '13.00hs - 14.00hs', value: '5' },
    { label: '14.00hs - 15.00hs', value: '6' },
    { label: '15.00hs - 16.00hs', value: '7' },
    { label: '16.00hs - 17.00hs', value: '8' },
    { label: '17.00hs - 18.00hs', value: '9' },
    { label: '18.00hs - 19.00hs', value: '10' },
    { label: '19.00hs - 20.00hs', value: '11' },
    { label: '20.00hs - 21.00hs', value: '12' },
    { label: '21.00hs - 22.00hs', value: '13' },

  ];

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
      time: time,
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
        <Select value={time} onChange={(e) => setTime(e.target.value)} displayEmpty>
          <MenuItem value="" disabled>
            Time
          </MenuItem>
          {times.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
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
