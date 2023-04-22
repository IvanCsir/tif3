import React from "react";
import * as ActivityServer from './ActivityServer'

const ActivityItem = ({ activity }) => {
  // console.log(props.activity);

    const handleDelete= async (activityId)=>{
        await ActivityServer.deleteActivity(activityId)
    };

  return (
    <div className="col-md-4 mb-4">
      <div className="card card-body">
        <h3 className="card-title">{activity.name} </h3>
        <p className="card-text">
          Descripcion: <strong> {activity.description}</strong>{" "}
        </p>
        <h2 className="btn btn-primary">Reservar </h2>
        <button onClick={()=>activity.id && handleDelete(activity.id)} className="btn btn-danger my-2">
            Borrar actividad
        </button>
      </div>
    </div>
  );
};
export default ActivityItem;