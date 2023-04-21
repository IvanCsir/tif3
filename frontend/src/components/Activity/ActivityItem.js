import React from "react";

const ActivityItem = ({activity})=>{
    // console.log(props.activity);

    return ( 
    <div className="col-md-4 mb-4">
        <div className="card card-body">
            <h3 className="card-title">{activity.name} </h3>
            <p className="card-text">Descripcion: <strong> {activity.description}</strong> </p>
            <h2 
            className="btn btn-primary">Reservar </h2>
        </div> 

    </div>)
};

export default ActivityItem;