import React from "react";
import * as ActivityServer from './ActivityServer';
import {useNavigate} from 'react-router-dom';
import {IconButton} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import {Grid} from "@mui/material";
import EditIcon from '@mui/icons-material/Edit';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';


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
            <IconButton
              sx={{ "&:hover": { color: "red" } }}
              onClick={() => activity.id && handleDelete(activity.id)}
            >
              <DeleteIcon />
            </IconButton>
            <IconButton
              sx={{ "&:hover": { color: "green" } }}
              onClick={() => navigate(`/updateActivity/${activity.id}`)}
            >
              <EditIcon />
            </IconButton>
            <IconButton onClick={() => navigate(`/activity/${activity.id}/datos`)}>
              <HourglassEmptyIcon></HourglassEmptyIcon>
            </IconButton>
          </React.Fragment>
        );
      }
      return null;
    };

  return (
    <div className="col-md-4 mb-4">  
      <div className="card card-body">
        <Grid container alignItems="right">
          <Grid item xs={8}>
            <h3 className="card-title">{activity.name}</h3>
            <h2> {activity.aire_libre}</h2>
          </Grid>
          <Grid item xs={4}>
            {renderIcons()}
          </Grid>
          {/* <Grid item xs={1}>
              <IconButton
                sx={{ "&:hover": { color: "red" } }}
                onClick={() => activity.id && handleDelete(activity.id)}
              >
                <DeleteIcon />
              </IconButton>
            </Grid>
            <Grid item xs={1}>
              <IconButton
                sx={{ "&:hover": { color: "green" } }}
                onClick={() => navigate(`/updateActivity/${activity.id}`)}
              >
                <EditIcon />
              </IconButton>
            </Grid>
            <Grid item xs={1}>
              <IconButton onClick={() => navigate(`/activity/${activity.id}/datos`)}>

                <HourglassEmptyIcon></HourglassEmptyIcon>

              </IconButton>

            </Grid> */}
          <Grid item>
            {activity.aire_libre ? (
              // Se muestra si activity.aire_libre es true
              <p>
                <strong>Lugar:</strong> Aire libre
              </p>
            ) : (
              // Se muestra si activity.aire_libre es false
              <p>
                {" "}
                <strong>Lugar:</strong> Techado{" "}
              </p>
            )}
          </Grid>
        </Grid>
        <h1>{activity.aire_libre}</h1>
        <p className="card-text">
          <strong> Descripcion: </strong> {activity.description}
        </p>
        <h2
          className="btn btn-primary"
          onClick={() =>
            navigate(`/activity/lugares_disponibles/${activity.id}/`)
          }
        >
          Ver horarios{" "}
        </h2>
      </div>
    </div>
  );
};


// return (
//   <Card sx={{ minWidth: 275, marginBottom: 4 }} alignItems="right">
//     <CardHeader
//       title={
//         <Grid container justifyContent="space-between" alignItems="center">
//           <Typography variant="h6" component="div">
//             {activity.name}
//           </Typography>
//           <div>
//             <IconButton
//               sx={{ "&:hover": { color: "red" } }}
//               onClick={() => activity.id && handleDelete(activity.id)}
//             >
//               <DeleteIcon />
//             </IconButton>
//             <IconButton
//               sx={{ "&:hover": { color: "green" } }}
//               onClick={() => navigate(`/updateActivity/${activity.id}`)}
//             >
//               <EditIcon />
//             </IconButton>
//             <IconButton onClick={() => navigate(`/activity/${activity.id}/datos`)}>
//               <HourglassEmptyIcon />
//             </IconButton>
//           </div>
//         </Grid>
//       }
//     />
//     <CardContent>
//       <Typography variant="body2" color="text.secondary">
//         Descripcion: <strong> {activity.description}</strong>
//       </Typography>
//     </CardContent>
//     <CardActions>
//       <Grid container justifyContent="center" alignItems="center">
//         <IconButton onClick={()=> navigate(`/activity/lugares_disponibles/${activity.id}/`)}>
//           <HourglassEmptyIcon />
//         </IconButton>
//         <Typography variant="body2" component="div" sx={{ marginLeft: '5px' }}>
//           Ver horarios
//         </Typography>
//       </Grid>
//     </CardActions>
//   </Card>
// );
// };



export default ActivityItem;