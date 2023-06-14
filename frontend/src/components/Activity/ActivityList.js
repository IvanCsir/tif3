import React, { useEffect, useState,} from "react";
import { useNavigate } from "react-router-dom";
import { Typography, Box, IconButton } from "@mui/material";

import * as activityserver from './ActivityServer'
 //Componentes:
import ActivityItem from "./ActivityItem";
import AddCircleIcon from '@mui/icons-material/AddCircle';


const ActivityList = () => {
        //Atributo  //metodo
    const navigate = useNavigate()    
    const [activities, setActivities] = useState([])
    const tipoUsuario = localStorage.getItem('tipo_usuario');

    const listactivities = async () =>{
        try{
            const res = await activityserver.listActivities()
            const data = await res.json()
            setActivities(data.actividades)
        }catch(error){
            console.log(error)
        }   
    };

    useEffect(()=>{
        listactivities();
    }, []);

    const handleAddActivity = () => {
      navigate("/activityform");
    };

    const renderIcons = () => {
      if (tipoUsuario === "1") {
        return (
          <React.Fragment>
            <IconButton sx={{ width: '1em', height: '1em', ml: 1, marginTop: '-0.4rem' }} onClick={handleAddActivity}>
              <AddCircleIcon sx={{ fontSize: '2rem' }}>
                
              </AddCircleIcon>
            </IconButton>
          </React.Fragment>
        );
      }
      return null;
    };


    return (
      <div className="row">
        <Box sx={{ my: 2 }}>
          <Typography
            variant="h4"
            sx={{ textTransform: "uppercase", fontWeight: "bold" }}
            align="center"
          >
            actividades
            {renderIcons()}
          </Typography>
        </Box>
        {activities && activities.length > 0 ? (
          activities.map((activity) => (
            <ActivityItem
              key={activity.id}
              activity={activity}
              listactivities={listactivities}
            />
          ))
        ) : (
          <Typography variant="body1" align="center">
            No hay actividades disponibles.
          </Typography>
        )}
      </div>
    );
};

export default ActivityList;
