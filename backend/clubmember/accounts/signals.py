from django.db.models.signals import post_migrate
from django.dispatch import receiver
from .models import TipoUsuarios

@receiver(post_migrate)
def create_default_tipo_usuarios(sender, **kwargs):
    if TipoUsuarios.objects.count() == 0:
        TipoUsuarios.objects.create(tipo_usuario='administrador')
        TipoUsuarios.objects.create(tipo_usuario='cliente')
