// Este es el original sin pasarlo por chat GPT
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Typography, Paper, Grid, Box, FormControl, Select, MenuItem, InputLabel, Avatar} from "@mui/material";
import ReservarButton from "./Reservation"
import { green } from '@mui/material/colors';




// Importa más iconos si es necesario




function DatosActivityList() {
  const { id } = useParams();
  const [datos, setDatos] = useState([]);
  const [nombreActividad, setNombreActividad] = useState('');
  const [lugar, setLugar] = useState('');
  const [selectedDay, setSelectedDay] = useState('');
  const [selectedStartTime, setSelectedStartTime] = useState('');
  const [selectedEndTime, setSelectedEndTime] = useState('');
  const [selectedTimeRange, setSelectedTimeRange] = useState('all');
  // const uniqueDates = [...new Set(datos.map((dato) => dato.day))];

  const getIconPath = (iconName) => {
    return require(`./icons/${iconName}.png`);
  };

  useEffect(() => {
    fetch(`http://127.0.0.1:8000/api/activities/activity/${id}/datos_activity/`)
      .then((response) => response.json())
      .then((data) => {
          data.sort((a, b) => {
          const dateA = new Date(a.day);
          const dateB = new Date(b.day);
          if (dateA < dateB) {
            return -1;
          } else if (dateA > dateB) {
            return 1;
          } else {
            // Si las fechas son iguales, comparar por hora
            const timeA = parseInt(a.start_time.replace(':', ''));
            const timeB = parseInt(b.end_time.replace(':', ''));
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
      .then((data) => {
        setNombreActividad(data.actividad.name);
        setLugar(data.actividad.aire_libre);
      });
  }, [id]);

  const currentDate = new Date().setUTCHours(0, 0, 0, 0); // Obtener la fecha actual
  const currentTime = new Date().toLocaleTimeString("es-AR", { timeZone: "America/Argentina/Buenos_Aires", hour12: false });

  // Filtrar las fechas que no hayan pasado
  const filteredDatos = datos.filter((dato) => {
    const activityDate = new Date(dato.day).setUTCHours(0, 0, 0, 0);

    // Filtra por día si se ha seleccionado un día
    if (selectedDay && dato.day !== selectedDay) {
      return false;
    }

    // Filtra por horario de inicio y finalización si se han seleccionado
    if (selectedStartTime && dato.start_time < selectedStartTime) {
      return false;
    }

    if (selectedEndTime && dato.end_time > selectedEndTime) {
      return false;
    }

    return activityDate > currentDate || (activityDate === currentDate && dato.start_time > currentTime); 
  });


  const handleDayChange = (event) => {
    const selectedValue = event.target.value;
    setSelectedDay(selectedValue === 'all' ? '' : selectedValue);
  };

  const handleTimeRangeChange = (event) => {
    const selectedValue = event.target.value;
    setSelectedStartTime('');
    setSelectedEndTime('');
    setSelectedTimeRange(selectedValue);

    if (selectedValue === 'all') {
      setSelectedStartTime('');
      setSelectedEndTime('');
    } else if (selectedValue === 'morning') {
      setSelectedStartTime('07:00');
      setSelectedEndTime('13:00');
    } else if (selectedValue === 'afternoon') {
      setSelectedStartTime('13:00');
      setSelectedEndTime('19:00');
    } else if (selectedValue === 'evening') {
      setSelectedStartTime('19:00');
      setSelectedEndTime('22:00');
    }
  };

  //En esta función lo que hago es obtener el nombre del día de la fecha para luego mostrar en el form control
  const formatDate = (fecha) => {
    const options = { weekday: 'long' };
    const date = new Date(fecha + 'T00:00:00-03:00'); // Agregar la zona horaria de Argentina
    const formattedDate = new Intl.DateTimeFormat('es-AR', options).format(date);
  
    return formattedDate;
  };

  //Lo que hago acá es que en el form control id=select-day-label no me salga
  // varias veces la misma fecha si hay varios datos activity y que no me muestre
  //fechas pasadas en el form control
  const uniqueDates = [...new Set(datos
    .filter((dato) => {
      const activityDate = new Date(dato.day).setUTCHours(0, 0, 0, 0);
      return activityDate > currentDate || (activityDate === currentDate && dato.start_time > currentTime);
    })
    .map((dato) => dato.day)
  )];
  
  
  return (
    <div>
      <Box sx={{ my: 2 }}>
        <Typography
          variant="h4"
          sx={{ textTransform: "uppercase", fontWeight: "bold" }}
          align="center"
        >
          {nombreActividad} - {lugar ? "aire libre" : "techado"}
        </Typography>
      </Box>
      <Box mt={1}>
        <Grid container justifyContent="center" alignItems="center" spacing={2}>
          <Grid item xs={12} sx={{ textAlign: "center" }}>
            <FormControl sx={{ minWidth: 150, my: 1 }}>
              <InputLabel id="select-day-label">Fecha</InputLabel>
              <Select
                labelId="select-day-label"
                value={selectedDay}
                onChange={handleDayChange}
                label="Día"
              >
                <MenuItem value="all">Todos</MenuItem>
                {uniqueDates.map((date) => (
                  <MenuItem key={date} value={date}>
                    {date}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 150, my: 1 }}>
              <InputLabel id="select-time-range-label">
                Franja Horaria
              </InputLabel>
              <Select
                labelId="select-time-range-label"
                value={selectedTimeRange}
                onChange={handleTimeRangeChange}
                label="Franja Horaria"
              >
                <MenuItem value="all">Todos</MenuItem>
                <MenuItem value="morning">Mañana</MenuItem>
                <MenuItem value="afternoon">Tarde</MenuItem>
                <MenuItem value="evening">Noche</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Box>
      <Grid container justifyContent="center" alignItems="center" spacing={2}>
        {filteredDatos.length > 0 ? (
          filteredDatos.map((dato) => (
            <Grid item xs={12} md={6} lg={4} key={dato.id}>
              <Paper elevation={24} sx={{ p: 2, margin: "5px" }}>
                {/* <Typography
                  variant="h5"
                  gutterBottom
                  sx={{ textTransform: "capitalize" }}
                >
                  {formatDate(dato.day)} ({dato.day}) {<Avatar sx={{ bgcolor: green[400] }}> {dato.capacity}</Avatar>}
                </Typography> */}
                <Typography
                  variant="h5"
                  gutterBottom
                  sx={{
                    textTransform: "capitalize",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <span>
                    {formatDate(dato.day)} ({dato.day})
                  </span>
                  <span
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      marginLeft: "auto",
                      fontSize: "0.9rem",
                      color: "#888",
                      alignItems: "center",
                    }}
                  >
                    <Avatar sx={{ bgcolor: green[400], marginRight: "0.5rem" }}>
                      {dato.capacity}
                    </Avatar>
                    <span>Disponibles</span>
                  </span>
                </Typography>
                <Typography variant="body1" gutterBottom>
                  Horario: {dato.start_time} - {dato.end_time}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  Lugares disponibles: {dato.capacity}
                </Typography>

                {dato.temperatura_max &&
                  dato.temperatura_min &&
                  dato.condiciones && (
                    <>
                      <Typography variant="body1" gutterBottom>
                        {dato.condiciones}{" "}
                        {
                          <img
                            src={getIconPath(dato.icon)}
                            alt={dato.icon}
                            style={{ width: "50px", height: "50px" }}
                          />
                        }{" "}
                        - Min {dato.temperatura_min}°C - Max{" "}
                        {dato.temperatura_max}°C
                      </Typography>
                      <Typography variant="body1" gutterBottom></Typography>
                    </>
                  )}

                <ReservarButton
                  id_act={id}
                  id_datos_activity={dato.id}
                ></ReservarButton>
              </Paper>
            </Grid>
          ))
        ) : (
          <Box mt={2}>
            <Typography variant="body1" align="center">
              No se encontraron actividades.
            </Typography>
          </Box>
        )}
      </Grid>
    </div>
  );
}

export default DatosActivityList;




// function DatosActivityList() {
//   const { id } = useParams();
//   const [datos, setDatos] = useState([]);
//   const [nombreActividad, setNombreActividad] = useState('');
//   const [lugar, setLugar] = useState('');
//   const [selectedDay, setSelectedDay] = useState('');
//   const [selectedTimeRange, setSelectedTimeRange] = useState('');

  
//   useEffect(() => {
//     fetch(`http://127.0.0.1:8000/api/activities/activity/${id}/datos_activity/`)
//       .then((response) => response.json())
//       .then((data) => {
//         data.sort((a, b) => {
//           const dateA = new Date(a.day);
//           const dateB = new Date(b.day);
//           if (dateA < dateB) {
//             return -1;
//           } else if (dateA > dateB) {
//             return 1;
//           } else {
//             // Si las fechas son iguales, comparar por hora
//             const timeA = parseInt(a.start_time.replace(":", ""));
//             const timeB = parseInt(b.end_time.replace(":", ""));
//             if (timeA < timeB) {
//               return -1;
//             } else if (timeA > timeB) {
//               return 1;
//             } else {
//               return 0;
//             }
//           }
//         });
//         setDatos(data);
//       });
//     fetch(`http://127.0.0.1:8000/api/activities/activity/${id}`)
//       .then((response) => response.json())
//       .then((data) => {
//         setNombreActividad(data.actividad.name);
//         setLugar(data.actividad.aire_libre);
//       });
//   }, [id]);

//   const currentDate = new Date().setUTCHours(0, 0, 0, 0); // Obtener la fecha actual
//   const currentTime = new Date().toLocaleTimeString("es-AR", { timeZone: "America/Argentina/Buenos_Aires", hour12: false });
  
//   // Filtrar las fechas que no hayan pasado
//   const filteredDatos = datos.filter((dato) => {
//     const activityDate = new Date(dato.day).setUTCHours(0, 0, 0, 0);
//     // console.log(dato.day);
//     // console.log("Dia actual " + currentDate)
//     // console.log("Dia de la actividad " + activityDate)
//     return activityDate > currentDate || (activityDate === currentDate && dato.start_time > currentTime); 
//   });

//   return (
//     <div>
//       <Box sx={{ my: 2 }}>
//         <Typography
//           variant="h4"
//           sx={{ textTransform: "uppercase", fontWeight: "bold" }}
//           align="center"
//         >
//           {nombreActividad} - {lugar ? "aire libre" : "techado"}
//         </Typography>
//       </Box>
//       <Grid container justifyContent="center" alignItems="center" spacing={2}>
//         {filteredDatos.map((dato) => (
//           <Grid item xs={12} md={6} lg={4} key={dato.id}>
//             <Paper elevation={3} sx={{ p: 2, margin: "10px" }}>
//               <Typography variant="h5" gutterBottom>
//                 {dato.day}
//               </Typography>
//               <Typography variant="body1" gutterBottom>
//                 Horario: {dato.start_time} - {dato.end_time}
//               </Typography>
//               <Typography variant="body1" gutterBottom>
//                 Lugares disponibles: {dato.capacity}
//               </Typography>
//               {dato.temperatura_max &&
//                 dato.temperatura_min &&
//                 dato.condiciones && (
//                   <>
//                     <Typography variant="body1" gutterBottom>
//                       Temperatura máxima: {dato.temperatura_max} °C
//                     </Typography>
//                     <Typography variant="body1" gutterBottom>
//                       Temperatura mínima: {dato.temperatura_min} °C
//                     </Typography>
//                     <Typography variant="body1" gutterBottom>
//                       Condiciones: {dato.condiciones}
//                     </Typography>
//                   </>
//                 )}
//             </Paper>
//           </Grid>
//         ))}
//       </Grid>
//     </div>
//   );
// }

// export default DatosActivityList;
