from django.db import models
from django.conf import settings

# Create your models

class TipoUsuarios(models.Model):
    tipo_usuario = models.CharField(max_length=101)


class DatosUsuarios(models.Model):
    NIVEL_EXPERIENCIA_CHOICES = [
        ('principiante', 'Principiante'),
        ('intermedio', 'Intermedio'),
        ('avanzado', 'Avanzado'),
    ]
    
    FORMATO_CHOICES = [
        ('individual', 'Individual'),
        ('grupal', 'Grupal'),
        ('sin_preferencia', 'Sin preferencia'),
    ]
    
    usuario = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    nombre = models.CharField(max_length=100)
    apellido = models.CharField(max_length=100)
    email = models.CharField(max_length=100)
    tipo = models.ForeignKey(TipoUsuarios, on_delete=models.CASCADE)
    
    # Datos personales
    edad = models.IntegerField(null=True, blank=True)
    nivel_experiencia = models.CharField(
        max_length=20,
        choices=NIVEL_EXPERIENCIA_CHOICES,
        null=True,
        blank=True
    )
    
    # Preferencias de actividad (separadas por comas: "musculacion,cardio,raqueta")
    preferencias_tipo = models.CharField(
        max_length=255,
        null=True,
        blank=True,
        help_text="Tipos de actividades preferidas: musculacion, cardio, mente-cuerpo, raqueta, acuatico, funcional"
    )
    
    # Formato preferido
    preferencia_formato = models.CharField(
        max_length=20,
        choices=FORMATO_CHOICES,
        null=True,
        blank=True
    )
    
    # Objetivos y limitaciones
    objetivos = models.CharField(
        max_length=255,
        null=True,
        blank=True,
        help_text="Ej: pérdida de peso, ganar músculo, mejorar resistencia, socializar"
    )
    
    limitaciones = models.CharField(
        max_length=255,
        null=True,
        blank=True,
        help_text="Ej: problemas de rodilla, alergia al frío, no puede correr"
    )

    def __str__(self):
        return(self.nombre + " " + self.apellido)
    
    @property
    def preferencias_tipo_list(self):
        """Devuelve las preferencias de tipo como lista"""
        if self.preferencias_tipo:
            return [p.strip() for p in self.preferencias_tipo.split(',')]
        return []