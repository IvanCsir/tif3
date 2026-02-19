"""
Sistema de validación de reservas usando IA (Gemini)
Alternativa al sistema basado en diccionarios

USO:
from ai_recommendations.validation_ai import check_activity_compatibility_ai

result = check_activity_compatibility_ai(activity, datos_usuario)
"""

import os
import json
import requests


def check_activity_compatibility_ai(activity, datos_usuario):
    """
    Valida compatibilidad usando IA (Gemini) en lugar de diccionario.
    
    VENTAJAS:
    - Más inteligente y contextual
    - Detecta combinaciones complejas
    - Lenguaje natural
    
    DESVENTAJAS:
    - Más lento (~1-2 segundos)
    - Requiere API key
    - Cuesta dinero (mínimo)
    - No 100% predecible
    """
    
    # Si no hay limitaciones, compatible
    if not datos_usuario.limitaciones:
        return {
            'compatible': True,
            'warnings': [],
            'severity': 'none',
            'used_ai': False
        }
    
    api_key = os.getenv('GEMINI_API_KEY')
    
    # Fallback a diccionario si no hay API key
    if not api_key or api_key == 'tu-api-key-de-gemini-aqui':
        from ai_recommendations.views import AIRecommendationsView
        view = AIRecommendationsView()
        result = view._check_activity_compatibility(activity, datos_usuario)
        result['used_ai'] = False
        return result
    
    try:
        # Construir prompt para IA
        prompt = f"""Eres un médico deportivo experto. Analiza si la siguiente actividad es SEGURA para el usuario.

USUARIO:
Nombre: {datos_usuario.nombre}
Edad: {datos_usuario.edad if datos_usuario.edad else 'No especificada'}
Limitaciones/Condiciones de salud: {datos_usuario.limitaciones}

ACTIVIDAD:
Nombre: {activity.name}
Descripción: {activity.description}
Tipo: {'Al aire libre' if activity.aire_libre else 'Bajo techo'}

🎯 TAREA: Determina si esta actividad presenta RIESGOS SIGNIFICATIVOS para la salud del usuario.

CRITERIOS:
1. ¿La actividad podría agravar las limitaciones del usuario?
2. ¿Hay riesgo de lesión o complicación médica?
3. ¿Se recomienda consulta médica antes de participar?

⚠️ IMPORTANTE:
- Si hay CUALQUIER riesgo médico significativo → marcar como NO compatible
- Si la actividad es segura o de bajo riesgo → marcar como compatible
- Considera intensidad, impacto físico, exigencia cardiovascular

RESPONDE ÚNICAMENTE con un objeto JSON válido:

{{
  "compatible": true/false,
  "severity": "none"/"medium"/"high",
  "warnings": [
    {{
      "limitation": "nombre de la limitación",
      "message": "explicación clara del riesgo en español",
      "recommendation": "recomendación alternativa o precaución"
    }}
  ],
  "reasoning": "breve explicación de tu decisión"
}}

EJEMPLO cuando HAY RIESGO:
{{
  "compatible": false,
  "severity": "high",
  "warnings": [
    {{
      "limitation": "problemas de rodilla",
      "message": "Esta actividad involucra alto impacto articular que podría agravar tu condición de rodilla",
      "recommendation": "Considera actividades de bajo impacto como natación, yoga o ciclismo"
    }}
  ],
  "reasoning": "Running implica impacto repetitivo en las rodillas, contraindicado para problemas articulares"
}}

EJEMPLO cuando ES SEGURO:
{{
  "compatible": true,
  "severity": "none",
  "warnings": [],
  "reasoning": "Yoga es una actividad de bajo impacto, segura para personas con problemas de rodilla"
}}"""

        # Llamar a Gemini API
        url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"
        headers = {"Content-Type": "application/json"}
        payload = {
            "contents": [{
                "parts": [{"text": prompt}]
            }]
        }
        
        response = requests.post(
            f"{url}?key={api_key}",
            json=payload,
            headers=headers,
            timeout=10  # Timeout corto para no demorar mucho
        )
        
        if response.status_code != 200:
            print(f"Error en validación con IA: {response.status_code}")
            # Fallback a diccionario
            from ai_recommendations.views import AIRecommendationsView
            view = AIRecommendationsView()
            result = view._check_activity_compatibility(activity, datos_usuario)
            result['used_ai'] = False
            return result
        
        data = response.json()
        content = data.get('candidates', [{}])[0].get('content', {}).get('parts', [{}])[0].get('text', '')
        
        if not content:
            # Fallback
            from ai_recommendations.views import AIRecommendationsView
            view = AIRecommendationsView()
            result = view._check_activity_compatibility(activity, datos_usuario)
            result['used_ai'] = False
            return result
        
        # Limpiar JSON
        if "```json" in content:
            content = content.split("```json")[1].split("```")[0].strip()
        elif "```" in content:
            content = content.split("```")[1].split("```")[0].strip()
        
        content = content.strip()
        ai_result = json.loads(content)
        
        # Formatear respuesta
        warnings = []
        for warning in ai_result.get('warnings', []):
            warnings.append({
                'limitation': warning.get('limitation', ''),
                'activity_type': activity.name,
                'message': warning.get('message', ''),
                'recommendation': warning.get('recommendation', '')
            })
        
        return {
            'compatible': ai_result.get('compatible', True),
            'warnings': warnings,
            'severity': ai_result.get('severity', 'none'),
            'user_limitations': [datos_usuario.limitaciones],
            'used_ai': True,
            'ai_reasoning': ai_result.get('reasoning', '')
        }
        
    except Exception as e:
        print(f"Error en validación con IA: {str(e)}")
        # Fallback seguro a diccionario
        from ai_recommendations.views import AIRecommendationsView
        view = AIRecommendationsView()
        result = view._check_activity_compatibility(activity, datos_usuario)
        result['used_ai'] = False
        return result


def check_activity_compatibility_hybrid(activity, datos_usuario):
    """
    ENFOQUE HÍBRIDO (RECOMENDADO):
    1. Primero consulta diccionario (rápido)
    2. Si diccionario dice "compatible" pero hay limitaciones → pregunta a IA (segunda opinión)
    3. Si diccionario dice "incompatible" → acepta resultado (no necesita IA)
    
    VENTAJAS:
    - Rápido en casos obvios (95%)
    - Inteligente en casos ambiguos (5%)
    - Mejor de ambos mundos
    """
    
    # PASO 1: Validación rápida con diccionario
    from ai_recommendations.views import AIRecommendationsView
    view = AIRecommendationsView()
    dict_result = view._check_activity_compatibility(activity, datos_usuario)
    
    # Si diccionario detectó riesgo claro → usar ese resultado
    if not dict_result['compatible']:
        dict_result['used_ai'] = False
        dict_result['validation_method'] = 'dictionary'
        return dict_result
    
    # Si no hay limitaciones → compatible
    if not datos_usuario.limitaciones:
        dict_result['used_ai'] = False
        dict_result['validation_method'] = 'dictionary'
        return dict_result
    
    # PASO 2: Caso ambiguo → consultar IA como segunda opinión
    # (Usuario tiene limitaciones pero diccionario no detectó match exacto)
    
    # Solo usar IA si hay API key y tiempo disponible
    api_key = os.getenv('GEMINI_API_KEY')
    if not api_key or api_key == 'tu-api-key-de-gemini-aqui':
        dict_result['used_ai'] = False
        dict_result['validation_method'] = 'dictionary'
        return dict_result
    
    print(f"🤖 Validación ambigua, consultando IA para {activity.name}...")
    ai_result = check_activity_compatibility_ai(activity, datos_usuario)
    ai_result['validation_method'] = 'hybrid'
    
    return ai_result
