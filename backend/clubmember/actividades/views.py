import datetime
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
from datetime import date, datetime
from django.shortcuts import get_object_or_404
import requests
from django.db import transaction
from datetime import timedelta
from dateutil.relativedelta import relativedelta
from django.views.decorators.cache import cache_page    

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

    def obtener_pronostico(self,day, city, country):
        url = "https://api.weatherbit.io/v2.0/forecast/daily"
        params = {
        "city": city,
        "country": country,
        "key": "3ad769e4b44845d499ba94cc7d0eaf87",
        "lang": "es",
    }

        response = requests.get(url, params=params)
        if response.status_code == 200:
            datos_clima = response.json()
            return datos_clima
        else:
            msg = {'error': 'no se pudo obtener el clima'}
            return msg

## Este es el original, que hace la llamada a la API por más de que la actividad no sea al aire_linre
    # def obtener_datos_climaticos(self, datos_activity_list):
    #     city = "Mendoza"
    #     country = "Argentina"
    #     datos_clima = self.obtener_pronostico(datetime.now().date(), city, country)
        
    #     if datos_clima:
    #         with transaction.atomic():
    #             for datos_activity in datos_activity_list:
    #                 if datos_activity.id_act.aire_libre:  # Verificar si es actividad al aire libre
    #                     day = datos_activity.day

    #                     # Busco el pronóstico correspondiente al día específico
    #                     for pronostico_dia in datos_clima['data']:
    #                         fecha_pronostico = datetime.strptime(pronostico_dia['datetime'], '%Y-%m-%d').date()
    #                         if fecha_pronostico == day:
    #                             datos_activity.temperatura_max = round(pronostico_dia['app_max_temp'])
    #                             datos_activity.temperatura_min = round(pronostico_dia['app_min_temp'])
    #                             datos_activity.condiciones = pronostico_dia['weather']['description']
    #                             datos_activity.save()
    #                             break
    #                 else:
    #                     datos_activity.temperatura_max = None
    #                     datos_activity.temperatura_min = None
    #                     datos_activity.condiciones = None
    #                     datos_activity.save()
    #     return datos_activity_list

## Este es para que no haga la llamada a la API si la actividad no es al aire libre:
    def obtener_datos_climaticos(self, datos_activity_list):
        city = "Mendoza"
        country = "Argentina"
        with transaction.atomic(): ## Si no se hacen todas las transacciones, se revierte la transaccion
            for datos_activity in datos_activity_list:
                if datos_activity.id_act.aire_libre:  # Verificar si es actividad al aire libre
                    day = datos_activity.day

                    datos_clima = self.obtener_pronostico(day, city, country)
                    if datos_clima:
                        # Busco el pronóstico correspondiente del día específico
                        for pronostico_dia in datos_clima['data']:
                            fecha_pronostico = datetime.strptime(pronostico_dia['datetime'], '%Y-%m-%d').date()
                            if fecha_pronostico == day:
                                datos_activity.temperatura_max = round(pronostico_dia['app_max_temp'])
                                datos_activity.temperatura_min = round(pronostico_dia['app_min_temp'])
                                datos_activity.condiciones = pronostico_dia['weather']['description']
                                datos_activity.save()
                                break
                else:
                    datos_activity.temperatura_max = None
                    datos_activity.temperatura_min = None
                    datos_activity.condiciones = None
                    datos_activity.save()

        return datos_activity_list


    # @action(detail=True, methods=['post'])
    # def crear_datos_activity(self, request, id_act=None):
    #     activity = get_object_or_404(Activity, id=id_act)
    #     data = request.data.copy()
    #     data['id_act'] = activity.id
    #     serializer = DatosCreateActivitySeralizer(data=data)
    #     if serializer.is_valid():
    #         serializer.save(id_act=activity)
    #         return Response(serializer.data, status=status.HTTP_201_CREATED)
    #     return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def crear_datos_activity(self, request, id_act=None):
        activity = get_object_or_404(Activity, id=id_act)
        data = request.data.copy()
        recurrence = int(data.pop('recurrence', 1))  # Obtener el valor de recurrence y eliminarlo del diccionario de datos

        serializer = DatosCreateActivitySeralizer(data=data)
        if serializer.is_valid():
            initial_instance = serializer.save(id_act=activity)
            
            # Crear instancias adicionales según la cantidad de repeticiones
            for i in range(1, recurrence):
                instance = DatosActivity.objects.create(
                    id_act=activity,
                    day=initial_instance.day + timedelta(weeks=i),  # Agregar una semana por cada repetición
                    time=initial_instance.time,
                    capacity=initial_instance.capacity,
                    temperatura_max=initial_instance.temperatura_max,
                    temperatura_min=initial_instance.temperatura_min,
                    condiciones=initial_instance.condiciones
                )

            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    
    # @action(detail=True, methods=['get'])
    # def lugares_disponibles(self, request, id_act=None):
    #     queryset = DatosActivity.objects.filter(id_act=id_act)
    #     serializer = DatosActivitySerializer(queryset, many=True)
    #     return Response(serializer.data)
    
## Esta vista es para traer los datos activity
    @action(detail=True, methods=['get'])
    def lugares_disponibles(self, request, id_act=None):
        queryset = DatosActivity.objects.filter(id_act=id_act)
        #Convierto la query en una lista para tenes una lista de objetos de datos_activity
        datos_activity_list = list(queryset)
        datos_activity_list = self.obtener_datos_climaticos(datos_activity_list)
        serializer = DatosActivitySerializer(datos_activity_list, many=True)
        return Response(serializer.data)


class Reservation(viewsets.ViewSet):
    
    pass
