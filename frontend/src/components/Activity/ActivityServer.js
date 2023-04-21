const API_URL = "http://127.0.0.1:8000/activities/activity"

export const listActivities = async()=> {
    return await fetch(API_URL); //Para hacer la solicitud http
};