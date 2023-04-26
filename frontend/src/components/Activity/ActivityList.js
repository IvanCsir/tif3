import React, { useEffect, useState } from "react";
import * as activityserver from './ActivityServer'
 //Componentes:
import ActivityItem from "./ActivityItem";


const ActivityList = () => {
        //Atributo  //metodo     
    const [activities, setActivities] = useState([])

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


    return (
      <div className="row">
        {activities.map((activity) => (
          <ActivityItem key={activity.id} activity={activity} listactivities={listactivities} />
        ))}
      </div>
    );
};

export default ActivityList;
