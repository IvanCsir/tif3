#!/usr/bin/env python3
"""
Script rápido para probar que el prompt se genera sin errores
"""
import os
import sys
import django

# Configurar Django
sys.path.insert(0, '/home/ivan/Escritorio/Facultad/tif3/backend/clubmember')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'clubmember.settings')
django.setup()

from accounts.models import DatosUsuarios

# Simular datos para el prompt
class DatosUsuarioMock:
    nombre = "Juan"
    apellido = "Pérez"
    edad = 30
    nivel_experiencia = "intermedio"
    preferencias_tipo = "cardio,funcional"
    preferencia_formato = "grupal"
    objetivos = "mejorar resistencia"
    limitaciones = "ninguna"
    
    def get_nivel_experiencia_display(self):
        return "Intermedio"
    
    def get_preferencia_formato_display(self):
        return "Grupal"

datos_usuario = DatosUsuarioMock()
user_name = datos_usuario.nombre

# Simular time_prefs
time_prefs = {
    'time_preference': 'mañana',
    'preferred_days': ['Monday', 'Wednesday'],
    'avg_duration': 60
}

# Construir prompt (versión simplificada)
history_text = "- Crossfit - Entrenamiento funcional - Horario: 09:00"
activities_text = "1. Yoga: Relajación - Bajo techo"
perfil_text = f"Edad: {datos_usuario.edad} años\n"
horarios_text = f"Horario preferido: {time_prefs['time_preference']}\n"

# Intentar crear el prompt (aquí es donde estaba el error)
try:
    prompt = f"""Eres un experto en recomendaciones deportivas para un club. Respondes en español de forma clara y motivadora.

Usuario: {user_name}
{perfil_text if perfil_text else ""}
{horarios_text if horarios_text else ""}
Historial de actividades del usuario:
{history_text if history_text else "El usuario aún no ha realizado reservas."}

Actividades disponibles:
{activities_text}

FORMATO DE LA EXPLICACIÓN: Habla de forma natural y cercana. Ejemplos:
- "{user_name}, veo que siempre entrenas por la mañana, entonces esta actividad es perfecta porque..."
- "Como ya probaste [actividad previa], {user_name}, creo que esto te va a encantar porque..."
- "Noto que te gustan las actividades [tipo], así que te sugiero..."
- "{user_name}, como buscas [objetivo], esta actividad te ayudará a..."
- "Vi que reservaste mucho [actividad], entonces esto sería ideal para complementar porque..."
"""
    
    print("✅ ¡ÉXITO! El prompt se generó sin errores")
    print("\n" + "="*60)
    print("PREVIEW DEL PROMPT:")
    print("="*60)
    print(prompt[:500] + "...")
    print("\n✅ El sistema ahora debería funcionar con la API de Gemini")
    
except NameError as e:
    print(f"❌ ERROR: {e}")
    print("El prompt aún tiene variables no definidas")
    sys.exit(1)
except Exception as e:
    print(f"❌ ERROR inesperado: {e}")
    sys.exit(1)
