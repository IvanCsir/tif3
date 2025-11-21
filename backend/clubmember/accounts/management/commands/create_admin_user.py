from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
import os


class Command(BaseCommand):
    help = 'Crear superusuario automáticamente durante el deployment'

    def handle(self, *args, **options):
        self.stdout.write("=== Iniciando creación de superusuario ===")
        
        # Obtener credenciales del superusuario desde variables de entorno
        username = os.getenv('DJANGO_SUPERUSER_USERNAME', 'admin')
        email = os.getenv('DJANGO_SUPERUSER_EMAIL', 'admin@clubmember.com')
        password = os.getenv('DJANGO_SUPERUSER_PASSWORD', 'admin123')
        
        self.stdout.write(f"Username: {username}")
        self.stdout.write(f"Email: {email}")
        self.stdout.write("Password: [PROTEGIDO]")

        # Verificar si ya existe un superusuario
        existing_superusers = User.objects.filter(is_superuser=True)
        if existing_superusers.exists():
            self.stdout.write(
                self.style.WARNING(f'Ya existe(n) {existing_superusers.count()} superusuario(s) en el sistema.')
            )
            for user in existing_superusers:
                self.stdout.write(f"  - {user.username} ({user.email})")
            return

        # Verificar si existe un usuario con el mismo nombre
        if User.objects.filter(username=username).exists():
            self.stdout.write(
                self.style.WARNING(f'Ya existe un usuario con el nombre "{username}" pero no es superusuario.')
            )
            return

        # Crear el superusuario
        try:
            self.stdout.write("Creando superusuario...")
            user = User.objects.create_superuser(
                username=username,
                email=email,
                password=password
            )
            self.stdout.write(
                self.style.SUCCESS(f'✅ Superusuario "{username}" creado exitosamente con ID {user.id}.')
            )
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'❌ Error al crear superusuario: {str(e)}')
            )
            raise e