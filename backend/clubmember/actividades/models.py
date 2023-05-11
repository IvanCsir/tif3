from django.db import models
from accounts.models import DatosUsuarios
from .choices import horarios
from datetime import date
from django.core.exceptions import ValidationError
from django.core.validators import RegexValidator

# Create your models here.
class Activity(models.Model):
    name = models.CharField(max_length=50)
    description = models.CharField(max_length=255)

    def __str__(self):
        return (self.name)

class DatosActivity(models.Model):
    id_act = models.ForeignKey(Activity, on_delete=models.CASCADE)
    day = models.DateField(default=date.today, null=True, blank=True)
    time = models.CharField(max_length=10, choices=horarios, default="1")
    capacity = models.IntegerField(default=0)

    class Meta:
        unique_together = ('id_act', 'time', 'day')

    

# class Reservation(models.Model):
#     id_datos_act = models.ForeignKey(DatosActivity, on_delete=models.CASCADE)
#     id_user = models.ForeignKey(DatosUsuarios, on_delete=models.CASCADE)
#     reservar = models.BooleanField(default=False)

#     def save(self, *args, **kwargs):
#         if self.reservar:
#             self.id_datos_act.capacity -= 1
#             self.id_datos_act.save()
#         super(Reservation, self).save(*args, **kwargs)