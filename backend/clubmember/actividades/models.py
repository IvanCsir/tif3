from django.db import models
from accounts.models import DatosUsuarios
from .choices import horarios
from datetime import date
from django.core.exceptions import ValidationError
from django.core.validators import RegexValidator
from django.contrib.auth.models import User

# Create your models here.
class Activity(models.Model):
    name = models.CharField(max_length=50)
    description = models.CharField(max_length=255)
    aire_libre = models.BooleanField(default=False)


    def __str__(self):
        return (self.name)

class DatosActivity(models.Model):
    id_act = models.ForeignKey(Activity, on_delete=models.CASCADE)
    day = models.DateField(default=date.today, null=True, blank=True)
    start_time = models.TimeField(default='00:00')
    end_time = models.TimeField(default='00:01')
    capacity = models.IntegerField(default=0)
    temperatura_max = models.CharField(max_length=50, null=True, blank=True)
    temperatura_min = models.CharField(max_length=50, null = True, blank=True)
    condiciones = models.CharField(max_length=255, null=True, blank=True)
    icon = models.CharField(max_length=8, null=True, blank=True)

    class Meta:
        unique_together = ('id_act', 'day', 'start_time', 'end_time')

    


class Reserva(models.Model):
    usuario = models.ForeignKey(DatosUsuarios, on_delete=models.CASCADE)
    datos_activity = models.ForeignKey(DatosActivity, on_delete=models.CASCADE)
    fecha_reserva = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('usuario', 'datos_activity')

class Mensaje(models.Model):
    usuario = models.ForeignKey(DatosUsuarios, on_delete=models.CASCADE, default=1)
    titulo = models.CharField(max_length=100)
    contenido = models.TextField()
    leido = models.BooleanField(default=False)
    fecha_creacion = models.DateTimeField(auto_now_add=True)

