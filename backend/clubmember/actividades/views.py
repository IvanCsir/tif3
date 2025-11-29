import datetime
from django.http import HttpResponse
from django.shortcuts import render
from django.http.response import JsonResponse
from django.utils.decorators import method_decorator
from django.views import View
from django.views.decorators.csrf import csrf_exempt
from .models import Activity, DatosActivity, Reserva, Mensaje
from rest_framework.response import Response
import json
from rest_framework import viewsets, status
from rest_framework.decorators import action
from .serializers import DatosCreateActivitySeralizer, DatosActivitySerializer, ReservaSerializer, TraerReservaSerializer, MensajeSerializer
from datetime import date, datetime
from django.shortcuts import get_object_or_404
import requests
from django.db import transaction
from datetime import timedelta
from dateutil.relativedelta import relativedelta
from django.views.decorators.cache import cache_page    
from django.db.models import F
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from django.core.mail import send_mail
from accounts.models import DatosUsuarios
from urllib.parse import urlencode
from django.core.mail import EmailMessage
from icalendar import Calendar, Event
import os
import qrcode
from io import BytesIO
from django.db.models import OuterRef, Subquery
from django.conf import settings

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
        key = os.getenv('WEATHER_API_KEY')
        # print(key)
        # key="96b070579ce942a38168beec2bef6ca1"
        params = {
        "city": city,
        "country": country,
        "key": key,
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
                                datos_activity.icon = pronostico_dia['weather']['icon']
                                datos_activity.temperatura_max = round(pronostico_dia['app_max_temp'])
                                datos_activity.temperatura_min = round(pronostico_dia['app_min_temp'])
                                datos_activity.condiciones = pronostico_dia['weather']['description']
                                
                                datos_activity.save()
                                break
                else:
                    datos_activity.temperatura_max = None
                    datos_activity.temperatura_min = None
                    datos_activity.condiciones = None
                    datos_activity.icon = None

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

class ReservaView(viewsets.ViewSet):
    
    @action(detail=False, methods=['get'])
    def test_config(self, request):
        """Endpoint de prueba para verificar configuración"""
        using_sendgrid = bool(os.getenv('SENDGRID_API_KEY'))
        return Response({
            'email_provider': 'SendGrid' if using_sendgrid else 'Gmail',
            'email_host': settings.EMAIL_HOST,
            'email_port': settings.EMAIL_PORT,
            'email_use_tls': settings.EMAIL_USE_TLS,
            'email_use_ssl': settings.EMAIL_USE_SSL,
            'email_host_user': settings.EMAIL_HOST_USER[:5] + '***' if settings.EMAIL_HOST_USER else 'NO CONFIGURADO',
            'email_host_password': 'CONFIGURADO' if settings.EMAIL_HOST_PASSWORD else 'NO CONFIGURADO',
            'sendgrid_configured': using_sendgrid,
            'debug': settings.DEBUG,
        })
    
    @action(detail=True, methods=['post'])
    def reservar(self, request, id_act=None, id_datos_activity=None):
        print(f"=== INICIO RESERVA ===")
        print(f"Usuario autenticado: {request.user}")
        print(f"Datos recibidos: {request.data}")
        print(f"id_act: {id_act}, id_datos_activity: {id_datos_activity}")
        
        try:
            datos_activity = get_object_or_404(DatosActivity, id=id_datos_activity)
            print(f"✓ DatosActivity encontrado: {datos_activity}")
        except Exception as e:
            print(f"✗ Error obteniendo DatosActivity: {str(e)}")
            return Response({'message': f'Error: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = ReservaSerializer(data=request.data, context={'request': request})

        if serializer.is_valid():
            print(f"✓ Serializer válido")
            usuario_id = request.data.get('usuario')  # Obtener el ID del usuario del cuerpo de la solicitud
            print(f"Usuario ID recibido: {usuario_id}")
            
            try:
                usuario = DatosUsuarios.objects.get(pk=usuario_id)  # Obtener la instancia del usuario a partir del ID
                print(f"✓ Usuario encontrado: {usuario.email}")
            except DatosUsuarios.DoesNotExist:
                print(f"✗ Usuario no encontrado con ID: {usuario_id}")
                return Response({'message': 'Usuario no encontrado'}, status=status.HTTP_400_BAD_REQUEST)
            
            reserva_existente = Reserva.objects.filter(usuario=usuario, datos_activity=datos_activity).exists()
            if reserva_existente:
                print(f"✗ Reserva duplicada para usuario {usuario_id}")
                return Response({'message': 'Ya has realizado una reserva en esta actividad'}, status=status.HTTP_400_BAD_REQUEST)

            capacidad_actualizada = datos_activity.capacity - 1
            print(f"Capacidad actual: {datos_activity.capacity}, después de reserva: {capacidad_actualizada}")
            if capacidad_actualizada < 0:
                print(f"✗ Sin capacidad disponible")
                return Response({'message': 'No hay capacidad disponible para realizar la reserva'}, status=status.HTTP_400_BAD_REQUEST)

            with transaction.atomic():
                serializer.save(usuario=usuario, datos_activity=datos_activity)
                datos_activity.capacity = F('capacity') - 1
                datos_activity.save()
                print(f"✓ Reserva guardada en BD")
            
            # Obtener los atributos de datos_activity
            mail_dia = datos_activity.day #YYYY/MM/DD
            mail_start_time = datos_activity.start_time
            mail_end_time = datos_activity.end_time
            mail_actividad_nombre = datos_activity.id_act.name
            mail_actividad_lugar = datos_activity.id_act.aire_libre
            mensaje_lugar = ""

            if mail_actividad_lugar == True:
                mensaje_lugar = "al aire libre"
            else:
                mensaje_lugar = "bajo techo"
            
            # ==== PROCESO DE ENVÍO DE EMAIL ====
            # Todo este proceso está envuelto en try-except para que nunca falle la reserva
            try:
                # Verificar configuración de email antes de intentar enviar
                email_configured = settings.EMAIL_HOST_USER and settings.EMAIL_HOST_PASSWORD
                print(f"Email configurado: {email_configured}")
                
                if not email_configured:
                    print("⚠ Advertencia: EMAIL_HOST_USER o EMAIL_HOST_PASSWORD no están configurados")
                    print(f"EMAIL_HOST_USER: {settings.EMAIL_HOST_USER}")
                else:
                    # Crea un objeto Calendar
                    cal = Calendar()

                    # Crea un objeto Event
                    event = Event()

                    # Define las propiedades del Evento
                    event.add('summary', f'Reserva para {mail_actividad_nombre} {mensaje_lugar}')
                    event.add('location', 'Mendoza')
                    event.add('dtstart', datetime.combine(mail_dia, mail_start_time))
                    event.add('dtend', datetime.combine(mail_dia, mail_end_time))
                    print(f"✓ Evento del calendario creado")

                    # Agrega el Evento al Calendar
                    cal.add_component(event)

                    # Genera el contenido del archivo .ics en memoria
                    ics_content = cal.to_ical()
                    
                    # Nombre del archivo adjunto
                    attachment_filename = f'{mail_actividad_nombre}.ics'

                    # Envía el correo electrónico con el archivo adjunto en memoria
                    subject = 'Reserva exitosa'
                    message = f'Su reserva para la actividad {mail_actividad_nombre} {mensaje_lugar} se ha realizado exitosamente. \n\nDetalles de la reserva:\n'
                    message += f'Fecha: {mail_dia}\n'
                    message += f'Horario: {mail_start_time}hs - {mail_end_time}hs\n'
                    message += f'Puede agregar el evento a su calendario si así lo desea'

                    from_email = settings.DEFAULT_FROM_EMAIL or settings.EMAIL_HOST_USER
                    email = EmailMessage(subject, message, from_email, [usuario.email])
                    
                    # Adjuntar el archivo .ics directamente desde memoria (sin crear archivo temporal)
                    email.attach(attachment_filename, ics_content, 'text/calendar')
                    
                    email.send()
                    print(f"✓ Email enviado exitosamente a {usuario.email}")
                    
            except Exception as e:
                # Capturar CUALQUIER error del proceso de email
                print(f"✗ Error en proceso de email: {str(e)}")
                print(f"Tipo de error: {type(e).__name__}")
                import traceback
                print(f"Traceback completo: {traceback.format_exc()}")
                print(f"EMAIL_HOST_USER: {settings.EMAIL_HOST_USER}")
                print(f"EMAIL_HOST_PASSWORD configurado: {'Sí' if settings.EMAIL_HOST_PASSWORD else 'No'}")
                # El error de email NO debe impedir que la reserva se complete

            print(f"✓ Reserva completada exitosamente")
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        print(f"✗ Serializer inválido. Errores: {serializer.errors}")
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['GET'])
    def reservas_por_usuario(self, request, id_user=None):
        reservas = Reserva.objects.filter(usuario_id=id_user).prefetch_related('datos_activity')
        serializer = TraerReservaSerializer(reservas, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['delete'])
    def cancelar_reserva(self, request, id_reserva=None):
        try:
            reserva = get_object_or_404(Reserva, id=id_reserva)
            datos_activity = reserva.datos_activity
            
            with transaction.atomic():
                # Incrementar la capacidad disponible
                datos_activity.capacity = F('capacity') + 1
                datos_activity.save()
                # Eliminar la reserva
                reserva.delete()

            return Response({'message': 'Reserva cancelada exitosamente'}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


class MensajeView(viewsets.ViewSet):
    @action(detail=False, methods=['post'])
    def crear_mensaje(self, request):
        serializer = MensajeSerializer(data=request.data)
        if serializer.is_valid():
            mensaje = serializer.save()
            usuarios = DatosUsuarios.objects.all()
            for usuario in usuarios:
                if usuario.id != 1:  # Omitir creación adicional de mensajes para el usuario 1
                    Mensaje.objects.create(usuario=usuario, titulo=mensaje.titulo, contenido=mensaje.contenido)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['get'])
    def obtener_mensajes(self, request, usuario_id=None):
        mensajes = Mensaje.objects.filter(usuario_id=usuario_id)
        serializer = MensajeSerializer(mensajes, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['put'])
    def marcar_leidos(self, request, usuario_id =None):
        try:
            mensajes = Mensaje.objects.filter(usuario_id=usuario_id)
            mensajes.update(leido=True)
            return Response(status=status.HTTP_200_OK)
        except Mensaje.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)



