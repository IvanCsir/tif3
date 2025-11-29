"""
Comando para diagnosticar problemas de conectividad SMTP
Uso: python manage.py diagnose_smtp
"""
from django.core.management.base import BaseCommand
from django.conf import settings
import socket
import smtplib


class Command(BaseCommand):
    help = 'Diagnostica problemas de conectividad SMTP'

    def handle(self, *args, **options):
        self.stdout.write("=" * 60)
        self.stdout.write("DIAGNÓSTICO DE CONECTIVIDAD SMTP")
        self.stdout.write("=" * 60)
        
        host = settings.EMAIL_HOST
        port = settings.EMAIL_PORT
        
        self.stdout.write(f"\n🔍 Probando conexión a {host}:{port}")
        
        # Test 1: Socket básico
        self.stdout.write("\n[1/3] Test de socket básico...")
        try:
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.settimeout(10)
            result = sock.connect_ex((host, port))
            sock.close()
            
            if result == 0:
                self.stdout.write(self.style.SUCCESS(f"  ✓ Puerto {port} está abierto"))
            else:
                self.stdout.write(self.style.ERROR(f"  ✗ Puerto {port} está cerrado o bloqueado"))
                self.stdout.write(self.style.WARNING("    Render podría estar bloqueando conexiones SMTP"))
                return
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"  ✗ Error de socket: {str(e)}"))
            return
        
        # Test 2: Conexión SMTP
        self.stdout.write("\n[2/3] Test de conexión SMTP...")
        try:
            server = smtplib.SMTP(host, port, timeout=10)
            self.stdout.write(self.style.SUCCESS("  ✓ Conexión SMTP establecida"))
            
            # Test 3: STARTTLS
            self.stdout.write("\n[3/3] Test de STARTTLS...")
            if settings.EMAIL_USE_TLS:
                server.starttls()
                self.stdout.write(self.style.SUCCESS("  ✓ STARTTLS exitoso"))
            
            # Test de login
            if settings.EMAIL_HOST_USER and settings.EMAIL_HOST_PASSWORD:
                self.stdout.write("\n[4/4] Test de autenticación...")
                try:
                    server.login(settings.EMAIL_HOST_USER, settings.EMAIL_HOST_PASSWORD)
                    self.stdout.write(self.style.SUCCESS("  ✓ Autenticación exitosa"))
                except smtplib.SMTPAuthenticationError as e:
                    self.stdout.write(self.style.ERROR(f"  ✗ Error de autenticación: {str(e)}"))
                    self.stdout.write(self.style.WARNING("    Verifica tu EMAIL_HOST_USER y EMAIL_HOST_PASSWORD"))
                    self.stdout.write(self.style.WARNING("    Asegúrate de usar una 'App Password' de Gmail"))
            
            server.quit()
            self.stdout.write(self.style.SUCCESS("\n✓✓✓ Todos los tests pasaron exitosamente"))
            
        except socket.timeout:
            self.stdout.write(self.style.ERROR("  ✗ Timeout - La conexión tardó demasiado"))
            self.stdout.write(self.style.WARNING("    Render podría estar limitando conexiones SMTP"))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"  ✗ Error: {str(e)}"))
            
        # Recomendaciones
        self.stdout.write("\n" + "=" * 60)
        self.stdout.write("💡 RECOMENDACIONES")
        self.stdout.write("=" * 60)
        self.stdout.write("\nSi los tests fallan en Render:")
        self.stdout.write("  1. Render puede bloquear puertos SMTP (587, 465, 25)")
        self.stdout.write("  2. Considera usar servicios como SendGrid, Mailgun o Amazon SES")
        self.stdout.write("  3. O configurar un relay SMTP que use puerto 2525")
        self.stdout.write("\nAlternativa con Gmail:")
        self.stdout.write("  • Intenta EMAIL_PORT=465 con EMAIL_USE_SSL=True")
        self.stdout.write("  • Asegúrate de tener verificación en 2 pasos activa")
        self.stdout.write("  • Usa una App Password (no tu contraseña normal)")
