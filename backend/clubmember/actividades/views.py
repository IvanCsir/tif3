from django.http import HttpResponse
from django.shortcuts import render
from django.http.response import JsonResponse
from django.utils.decorators import method_decorator
from django.views import View
from django.views.decorators.csrf import csrf_exempt
from .models import Activity
from rest_framework.response import Response
import json

# Create your views here.

class ActivityView(View):
    
    @method_decorator(csrf_exempt)
    def dispatch(self, request, *args, **kwargs):
        return super().dispatch(request, *args, **kwargs)

    def get(self, request, id=0):
        if (id>0):
            actividades= list(Activity.objects.filter(id=id).values())
            if len(actividades)>0:
                actividad = actividades[0]
                datos = {'message':"success", "actividad": actividad}
            else:
                datos = {'message':"Activity not found"}
            
            return HttpResponse(json.dumps(datos), content_type= "application/json")
        else:

            actividades = list(Activity.objects.values())
            if len(actividades)>0:
                datos = {'message':"success", "actividades": actividades}
            else: 
                datos = {'message':"Activities not found"}
            
            return HttpResponse(json.dumps(datos), content_type= "application/json")

       
            
    def post(self, request):
        datos = {'message': 'success'} 
        data = json.loads(request.body) #cargo el cuerpo de la solicitud

        name = data['name']
        description = data['description']

        Activity.objects.create(name=name,description = description)
        return JsonResponse(datos)

    def put(self, request, id):
        data = json.loads(request.body)
        actividades= list(Activity.objects.filter(id=id).values())

        if len(actividades)>0:
                activity= Activity.objects.get(id=id)
                activity.name = data['name']
                activity.description = data['description']
                activity.save()
                datos = {'message': 'success'} 
        else:
            datos = {'message':"Activity not found"}
        return JsonResponse(datos) 
    
        

    def delete(self, request, id):
        actividades= list(Activity.objects.filter(id=id).values())
        if len(actividades)>0:
            Activity.objects.filter(id=id).delete()
            datos = {'message': 'success'} 
            
        else:
            datos = {'message':"Activity not found"}

        return JsonResponse(datos) 
        