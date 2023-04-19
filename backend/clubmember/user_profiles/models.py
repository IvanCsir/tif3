from django.db import models
from django.contrib.auth.models import User

# Create your models here.
class UserProfile(models.Model):
    User = models.OneToOneField(User, on_delete=models.CASCADE)
    nombre = models.CharField(max_length=255, default = '')
    apellido = models.CharField(max_length=255, default = '')
    celular = models.IntegerField( default = 0)
    
    def __str__(self):
        return self.first_name
