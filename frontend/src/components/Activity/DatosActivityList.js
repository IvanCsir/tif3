import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Typography, Paper, Grid, Box} from "@mui/material";

function DatosActivityList() {
  const { id } = useParams();
  const [datos, setDatos] = useState([]);
  const [nombreActividad, setNombreActividad] = useState('');

  useEffect(() => {
    fetch(`http://127.0.0.1:8000/api/activities/activity/${id}/datos_activity/`)
      .then((response) => response.json())
      .then((data) => {data.sort((a, b) => {
        const dateA = new Date(a.day);
        const dateB = new Date(b.day);
        if (dateA < dateB) {
          return -1;
        } else if (dateA > dateB) {
          return 1;
        } else {
          // Si las fechas son iguales, comparar por hora
          const timeA = parseInt(a.time.replace(":", ""));
          const timeB = parseInt(b.time.replace(":", ""));
          if (timeA < timeB) {
            return -1;
          } else if (timeA > timeB) {
            return 1;
          } else {
            return 0;
          }
        }
      });
      setDatos(data);
      });
    fetch(`http://127.0.0.1:8000/api/activities/activity/${id}`)
    .then((response) => response.json())
    .then((data) => {setNombreActividad(data.actividad.name)});
  }, [id]);  

return (
  <div>
    <Box sx={{ my: 2 }}>
      <Typography
        variant="h4"
        sx={{ textTransform: "uppercase", fontWeight: "bold" }}
        align="center"
      >
        {nombreActividad}
      </Typography>
    </Box>
    <Grid container justifyContent="center" alignItems="center" spacing={2}>
      {datos.map((dato) => (
        <Grid item xs={12} md={6} lg={4} key={dato.id}>
          <Paper elevation={3} sx={{ p: 2, margin: "10px" }}>
            <Typography variant="h5" gutterBottom>
              {dato.day}
            </Typography>
            <Typography variant="body1" gutterBottom>
              Horario: {dato.time_display}
            </Typography>
            <Typography variant="body1" gutterBottom>
              Capacidad: {dato.capacity}
            </Typography>
          </Paper>
        </Grid>
      ))}
    </Grid>
  </div>
);
  
}
export default DatosActivityList;
