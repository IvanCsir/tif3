import React from "react";
import * as ActivityServer from './ActivityServer';
import {useNavigate} from 'react-router-dom';
import {IconButton, Tooltip} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import {Grid} from "@mui/material";
import EditIcon from '@mui/icons-material/Edit';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import {Typography, Button, Card} from "@mui/material";

const ActivityItem = ({ activity, listactivities}) => {
  // console.log(props.activity);
    const navigate = useNavigate();
    const tipoUsuario = localStorage.getItem('tipo_usuario');


    const handleDelete= async (activityId)=>{
        await ActivityServer.deleteActivity(activityId)
        listactivities()
    };

    const renderIcons = () => {
      if (tipoUsuario === '1') {
        return (
          <React.Fragment>
            <Tooltip title="Eliminar actividad">
              <IconButton
                sx={{ "&:hover": { color: "red" } }}
                onClick={() => activity.id && handleDelete(activity.id)}
              >
                <DeleteIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Editar nombre">
              <IconButton
                sx={{ "&:hover": { color: "green" } }}
                onClick={() => navigate(`/updateActivity/${activity.id}`)}
              >
                <EditIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Cargar horarios">
              <IconButton onClick={() => navigate(`/activity/${activity.id}/datos`)}>
                <HourglassEmptyIcon></HourglassEmptyIcon>
              </IconButton>
            </Tooltip>
          </React.Fragment>
        );
      }
      return null;
    };

//   return (
//     <div className="col-md-4 mb-4">  
//       <div className="card card-body">
//         <Grid container alignItems="right">
//           <Grid item xs={8}>
//             <h3 className="card-title">{activity.name}</h3>
//             <h2> {activity.aire_libre}</h2>
//           </Grid>
//           <Grid item xs={4}>
//             {renderIcons()}
//           </Grid>
//           <Grid item>
//             {activity.aire_libre ? (
//               // Se muestra si activity.aire_libre es true
//               <p>
//                 <strong>Lugar:</strong> Aire libre
//               </p>
//             ) : (
//               // Se muestra si activity.aire_libre es false
//               <p>
//                 {" "}
//                 <strong>Lugar:</strong> Techado{" "}
//               </p>
//             )}
//           </Grid>
//         </Grid>
//         <h1>{activity.aire_libre}</h1>
//         <p className="card-text">
//           <strong> Descripcion: </strong> {activity.description}
//         </p>
//         <h2
//           className="btn btn-primary"
//           onClick={() =>
//             navigate(`/activity/lugares_disponibles/${activity.id}/`)
//           }
//         >
//           Ver horarios{" "}
//         </h2>
//       </div>
//     </div>
//   );
// };
return (
  <Grid item xs={4} className="col-md-4 mb-4">
    <Card className="card card-body card-highlight" elevation={24}>
      <Grid container alignItems="center">
        <Grid item xs={8}>
        <Typography
              variant="h6"
              component="h6"
              className="card-title"
              style={{
                fontWeight: 'bold',
                textTransform: 'uppercase',
                fontFamily: 'Montserrat, sans-serif',
              }}
            >
              {activity.name}
            </Typography>
          
          <Typography variant="h2">{activity.aire_libre}</Typography>
        </Grid>
        <Grid item xs={4}>
          {renderIcons()}
        </Grid>
        <Grid item>
          {activity.aire_libre ? (
            // Se muestra si activity.aire_libre es true
            <Typography variant="body1">
              <strong>Lugar:</strong> Aire libre
            </Typography>
          ) : (
            // Se muestra si activity.aire_libre es false
            <Typography variant="body1">
              <strong>Lugar:</strong> Techado
            </Typography>
          )}
        </Grid>
      </Grid>
      <Typography variant="h1">{activity.aire_libre}</Typography>
      <Typography variant="body1" className="card-text">
        <strong>Descripción:</strong> {activity.description}
      </Typography>
      <Button
        variant="contained"
        color="primary"
        onClick={() =>
          navigate(`/activity/lugares_disponibles/${activity.id}/`)
        }
      >
        Ver horarios
      </Button>
    </Card>
  </Grid>
);
};

export default ActivityItem;

// import React from "react";
// import { useNavigate } from "react-router-dom";
// import { Grid, IconButton } from "@mui/material";
// import DeleteIcon from "@mui/icons-material/Delete";
// import EditIcon from "@mui/icons-material/Edit";
// import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";

// import * as ActivityServer from './ActivityServer';


// const ActivityItem = ({ activity, listactivities }) => {
//   const navigate = useNavigate();
//   const tipoUsuario = localStorage.getItem("tipo_usuario");

//   const handleDelete = async (activityId) => {
//     await ActivityServer.deleteActivity(activityId);
//     listactivities();
//   };

//   const renderIcons = () => {
//     if (tipoUsuario === "1") {
//       return (
//         <>
//           <IconButton
//             sx={{ "&:hover": { color: "red" } }}
//             onClick={() => activity.id && handleDelete(activity.id)}
//           >
//             <DeleteIcon />
//           </IconButton>
//           <IconButton
//             sx={{ "&:hover": { color: "green" } }}
//             onClick={() => navigate(`/updateActivity/${activity.id}`)}
//           >
//             <EditIcon />
//           </IconButton>
//           <IconButton
//             onClick={() => navigate(`/activity/${activity.id}/datos`)}
//           >
//             <HourglassEmptyIcon />
//           </IconButton>
//         </>
//       );
//     }
//     return null;
//   };

//   return (
//     <div className="col-md-4 mb-4">
//       <div className="card card-body">
//         <Grid container alignItems="center" justifyContent="space-between">
//           <Grid item xs={8}>
//             <h3 className="card-title">{activity.name}</h3>
//             <h2> {activity.aire_libre}</h2>
//             {activity.aire_libre ? (
//               <p>
//                 <strong>Lugar:</strong> Aire libre
//               </p>
//             ) : (
//               <p>
//                 <strong>Lugar:</strong> Techado
//               </p>
//             )}
//           </Grid>
//           <Grid item xs={4}>
//             {renderIcons()}
//           </Grid>
//         </Grid>
//         <p className="card-text">
//           <strong>Descripción:</strong> {activity.description}
//         </p>
//         <h2
//           className="btn btn-primary"
//           onClick={() =>
//             navigate(`/activity/lugares_disponibles/${activity.id}/`)
//           }
//         >
//           Ver horarios
//         </h2>
//       </div>
//     </div>
//   );
// };

// export default ActivityItem;
