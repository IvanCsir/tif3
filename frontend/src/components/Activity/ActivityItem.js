import React from "react";
import * as ActivityServer from './ActivityServer';
import {useNavigate} from 'react-router-dom';


import { IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { Grid} from "@mui/material";
import EditIcon from '@mui/icons-material/Edit';

const ActivityItem = ({ activity, listactivities}) => {
  // console.log(props.activity);
    const navigate = useNavigate();

    const handleDelete= async (activityId)=>{
        await ActivityServer.deleteActivity(activityId)
        listactivities()
    };

  return (
    <div className="col-md-4 mb-4">
      <div className="card card-body">
        <Grid container alignItems="right">
          <Grid item xs={9}>
            <h3 className="card-title">{activity.name}</h3>
          </Grid>
          <Grid item xs={1}>
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
        </Grid>

        <p className="card-text">
          Descripcion: <strong> {activity.description}</strong>{" "}
        </p>
        <h2 className="btn btn-primary">Reservar </h2>
      </div>
    </div>
  );
};
export default ActivityItem;