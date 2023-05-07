from django.db import models
from accounts.models import DatosUsuarios
from .choiches import horarios
from datetime import date

# Create your models here.
class Activity(models.Model):
    name = models.CharField(max_length=50)
    description = models.CharField(max_length=255)

    def __str__(self):
        return (self.name)

class DatosActivity(models.Model):
    id_act = models.ForeignKey(Activity, on_delete=models.CASCADE)
    day = models.DateField(default = date.today , null=True, blank=True)
    time = models.CharField(max_length=10, choices=horarios, default="1", unique=True )
    capacity = models.IntegerField(default=0)

    def __str__(self):
        return (self.id_act.name)

class Reservation(models.Model):
    id_datos_act = models.ForeignKey(DatosActivity, on_delete=models.CASCADE)
    id_user = models.ForeignKey(DatosUsuarios, on_delete=models.CASCADE)
    reservar = models.BooleanField(default=False)

    # def __str__(self):
    #     return(self.id_user.usuario)