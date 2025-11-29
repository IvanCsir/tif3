"""
Comando para probar el envío de emails
Uso: python manage.py test_email tu_email@ejemplo.com
"""
from django.core.management.base import BaseCommand
from django.core.mail import send_mail, EmailMessage
from django.conf import settings
import sys


class Command(BaseCommand):
    help = 'Prueba el envío de correos electrónicos'

    def add_arguments(self, parser):
        parser.add_argument('email', type=str, help='Email de destino para la prueba')

    def handle(self, *args, **options):
        email_destino = options['email']
        
        self.stdout.write("=" * 60)
        self.stdout.write("PRUEBA DE CONFIGURACIÓN DE EMAIL")
        self.stdout.write("=" * 60)
        
        # Verificar configuración
        self.stdout.write(f"\n📧 Configuración actual:")
        self.stdout.write(f"  EMAIL_BACKEND: {settings.EMAIL_BACKEND}")
        self.stdout.write(f"  EMAIL_HOST: {settings.EMAIL_HOST}")
        self.stdout.write(f"  EMAIL_PORT: {settings.EMAIL_PORT}")
        self.stdout.write(f"  EMAIL_USE_TLS: {settings.EMAIL_USE_TLS}")
        self.stdout.write(f"  EMAIL_USE_SSL: {getattr(settings, 'EMAIL_USE_SSL', False)}")
        
        if settings.EMAIL_HOST_USER:
            self.stdout.write(f"  EMAIL_HOST_USER: {settings.EMAIL_HOST_USER[:5]}***")
        else:
            self.stdout.write(self.style.ERROR("  EMAIL_HOST_USER: NO CONFIGURADO"))
            
        if settings.EMAIL_HOST_PASSWORD:
            self.stdout.write(f"  EMAIL_HOST_PASSWORD: {'*' * 16} (configurado)")
        else:
            self.stdout.write(self.style.ERROR("  EMAIL_HOST_PASSWORD: NO CONFIGURADO"))
        
        if not settings.EMAIL_HOST_USER or not settings.EMAIL_HOST_PASSWORD:
            self.stdout.write(self.style.ERROR("\n✗ Configuración incompleta. Configura EMAIL_HOST_USER y EMAIL_HOST_PASSWORD"))
            sys.exit(1)
        
        # Intentar enviar email de prueba
        self.stdout.write(f"\n📨 Intentando enviar email de prueba a: {email_destino}")
        
        try:
            # Método 1: send_mail simple
            self.stdout.write("\n[1/2] Probando send_mail()...")
            send_mail(
                'Test Email desde Django',
                'Este es un email de prueba desde tu aplicación Django.',
                settings.EMAIL_HOST_USER,
                [email_destino],
                fail_silently=False,
            )
            self.stdout.write(self.style.SUCCESS("  ✓ send_mail() exitoso"))
            
            # Método 2: EmailMessage con adjunto
            self.stdout.write("\n[2/2] Probando EmailMessage() con adjunto...")
            email = EmailMessage(
                'Test Email con Adjunto',
                'Este es un email de prueba con un archivo adjunto.',
                settings.EMAIL_HOST_USER,
                [email_destino]
            )
            email.attach('test.txt', 'Contenido de prueba', 'text/plain')
            email.send()
            self.stdout.write(self.style.SUCCESS("  ✓ EmailMessage() con adjunto exitoso"))
            
            self.stdout.write(self.style.SUCCESS(f"\n✓✓✓ ÉXITO: Emails enviados correctamente a {email_destino}"))
            self.stdout.write("\nRevisa la bandeja de entrada (y spam) del destinatario.")
            
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"\n✗✗✗ ERROR al enviar email:"))
            self.stdout.write(self.style.ERROR(f"  Tipo: {type(e).__name__}"))
            self.stdout.write(self.style.ERROR(f"  Mensaje: {str(e)}"))
            
            # Errores comunes y soluciones
            error_str = str(e).lower()
            self.stdout.write("\n💡 Posibles causas:")
            
            if 'authentication' in error_str or 'username' in error_str or 'password' in error_str:
                self.stdout.write("  • Credenciales incorrectas")
                self.stdout.write("  • Asegúrate de usar una 'App Password' de Gmail, no tu contraseña normal")
                self.stdout.write("  • Verifica que EMAIL_HOST_USER y EMAIL_HOST_PASSWORD estén correctos")
                
            elif 'connection' in error_str or 'timeout' in error_str:
                self.stdout.write("  • Problema de conexión/red")
                self.stdout.write("  • Render podría estar bloqueando el puerto 587")
                self.stdout.write("  • Intenta usar EMAIL_PORT=465 con EMAIL_USE_SSL=True")
                
            elif 'tls' in error_str or 'ssl' in error_str:
                self.stdout.write("  • Problema con TLS/SSL")
                self.stdout.write("  • Verifica EMAIL_USE_TLS y EMAIL_USE_SSL")
                
            else:
                self.stdout.write("  • Error desconocido. Revisa el mensaje de error arriba")
            
            import traceback
            self.stdout.write("\n📋 Traceback completo:")
            self.stdout.write(traceback.format_exc())
            
            sys.exit(1)
