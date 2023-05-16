from django.http import HttpResponse
from django.shortcuts import render
from django.http.response import JsonResponse
from django.utils.decorators import method_decorator
from django.views import View
from django.views.decorators.csrf import csrf_exempt
from .models import Activity, DatosActivity
from rest_framework.response import Response
import json
from rest_framework import viewsets, status
from rest_framework.decorators import action
from .serializers import DatosCreateActivitySeralizer, DatosActivitySerializer
from datetime import date
from django.shortcuts import get_object_or_404


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
                print(actividad)

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
        aire_libre = data['aire_libre']  # Nuevo campo para indicar si es al aire libre

        Activity.objects.create(name=name,description = description, aire_libre = aire_libre)
        return JsonResponse(datos)

    def put(self, request, id):
        data = json.loads(request.body)
        actividades= list(Activity.objects.filter(id=id).values())

        if len(actividades)>0:
                activity= Activity.objects.get(id=id)
                activity.name = data['name']
                activity.description = data['description']
                # activity.aire_libre = data['aire_libre']
                activity.aire_libre = data.get('aire_libre', False)
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
     
class DatosActivityView(viewsets.ViewSet):
    @action(detail=True, methods=['post'])
    def crear_datos_activity(self, request, id_act=None):
        activity = get_object_or_404(Activity, id=id_act)
        data = request.data.copy()
        data['id_act'] = activity.id
        serializer = DatosCreateActivitySeralizer(data=data)
        if serializer.is_valid():
            serializer.save(id_act=activity)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['get'])
    def lugares_disponibles(self, request, id_act=None):
        queryset = DatosActivity.objects.filter(id_act=id_act)
        serializer = DatosActivitySerializer(queryset, many=True)
        return Response(serializer.data)
    
    

class Reservation(viewsets.ViewSet):
    
    pass
