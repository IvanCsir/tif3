from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
import os


class Command(BaseCommand):
    help = 'Crear superusuario automáticamente durante el deployment'

    def handle(self, *args, **options):
        # Obtener credenciales del superusuario desde variables de entorno
        username = os.getenv('DJANGO_SUPERUSER_USERNAME', 'admin')
        email = os.getenv('DJANGO_SUPERUSER_EMAIL', 'admin@clubmember.com')
        password = os.getenv('DJANGO_SUPERUSER_PASSWORD', 'admin123')

        # Verificar si ya existe un superusuario
        if User.objects.filter(is_superuser=True).exists():
            self.stdout.write(
                self.style.WARNING('Ya existe un superusuario en el sistema.')
            )
            return

        # Crear el superusuario
        try:
            User.objects.create_superuser(
                username=username,
                email=email,
                password=password
            )
            self.stdout.write(
                self.style.SUCCESS(f'Superusuario "{username}" creado exitosamente.')
            )
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Error al crear superusuario: {e}')
            )