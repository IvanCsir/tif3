import API_BASE_URL from '../../config/api';

const API_URL = `${API_BASE_URL}/api/activities/activity`;

export const listActivities = async()=> {
    return await fetch(API_URL); //Para hacer la solicitud http
};

export const getActivity = async(activityId)=> {
    return await fetch(`${API_URL}${"/"}${activityId}`); 
};  




export const registerActivity= async(newActivity)=> {
    return await fetch(API_URL, {
        method:'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body:JSON.stringify({        //para poder convertir un objeto a json
            "name":String(newActivity.name).trim(), //Elimino los espacios en blanco
            "description":String(newActivity.description).trim(),
            "aire_libre": newActivity.aire_libre,

        })    
            
    })
};

export const updateActivity= async(activityId, updatedActivity)=> {
    return await fetch(`${API_URL}${"/"}${activityId}`, {
        method:'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body:JSON.stringify({        //para poder convertir un objeto a json
            "name":String(updatedActivity.name).trim(),
            "description":String(updatedActivity.description).trim(),
            "aire_libre": updatedActivity.aire_libre,
        })    
            
    })
};


export const deleteActivity= async(activityId)=> {
    return await fetch(`${API_URL}${"/"}${activityId}`, {
        method:'DELETE'   
            
    })
};