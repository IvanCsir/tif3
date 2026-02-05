from django.shortcuts import get_object_or_404
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from accounts.models import DatosUsuarios
from actividades.models import Reserva, Activity, DatosActivity
from datetime import datetime, timedelta
import os
import re
import json
import requests


class AIRecommendationsView(viewsets.ViewSet):
    """
    Vista para generar recomendaciones de actividades usando IA
    basándose en el historial de reservas del usuario
    """
    permission_classes = [AllowAny]

    def _get_user_history(self, usuario):
        """Obtiene el historial de reservas del usuario"""
        reservas = Reserva.objects.filter(usuario=usuario).select_related(
            'datos_activity__id_act'
        ).order_by('-fecha_reserva')[:20]  # Últimas 20 reservas
        
        history = []
        for reserva in reservas:
            activity = reserva.datos_activity.id_act
            history.append({
                'nombre': activity.name,
                'descripcion': activity.description,
                'aire_libre': activity.aire_libre,
                'id': activity.id,
                'fecha': reserva.fecha_reserva.strftime('%Y-%m-%d')
            })
        
        return history

    def _get_available_activities(self):
        """Obtiene todas las actividades disponibles"""
        activities = Activity.objects.all()
        available = []
        
        for activity in activities:
            # Verificar si hay slots futuros disponibles
            future_slots = DatosActivity.objects.filter(
                id_act=activity,
                day__gte=datetime.now().date(),
                capacity__gt=0
            ).exists()
            
            if future_slots:
                available.append({
                    'id': activity.id,
                    'nombre': activity.name,
                    'descripcion': activity.description,
                    'aire_libre': activity.aire_libre
                })
        
        return available

    def _extract_tags(self, text):
        """Extrae etiquetas simples basadas en palabras clave para detectar actividades similares"""
        text = text.lower()
        tag_map = {
            'mente-cuerpo': ['yoga', 'meditacion', 'mindfulness', 'pilates', 'stretch', 'relax'],
            'fuerza-funcional': ['crossfit', 'funcional', 'hiit', 'pesas', 'fuerza', 'musculacion'],
            'raqueta': ['tenis', 'paddle', 'padel', 'squash'],
            'cardio': ['running', 'correr', 'trote', 'spinning', 'bike', 'ciclismo'],
            'acuatico': ['natacion', 'swim', 'acuatico'],
            'gimnasio': ['gimnasio', 'gym', 'musculacion']
        }

        tags = set()
        for tag, keywords in tag_map.items():
            for kw in keywords:
                if kw in text:
                    tags.add(tag)
                    break
        return tags

    def _score_similarity(self, user_history, candidate):
        """Calcula un puntaje de similitud basado en etiquetas y preferencia indoor/outdoor"""
        if not user_history:
            return 0

        # Etiquetas del candidato
        candidate_tags = self._extract_tags(candidate['nombre'] + ' ' + candidate['descripcion'])

        # Etiquetas del usuario
        user_tags = []
        for h in user_history:
            user_tags.extend(list(self._extract_tags(h['nombre'] + ' ' + h['descripcion'])))

        user_tag_counts = {}
        for tag in user_tags:
            user_tag_counts[tag] = user_tag_counts.get(tag, 0) + 1

        score = 0
        for tag in candidate_tags:
            score += user_tag_counts.get(tag, 0) * 2  # peso fuerte por coincidencia de deporte similar

        # Preferencia indoor/outdoor
        outdoor_count = sum(1 for h in user_history if h['aire_libre'])
        indoor_count = len(user_history) - outdoor_count
        prefers_outdoor = outdoor_count > indoor_count
        if candidate['aire_libre'] == prefers_outdoor:
            score += 1

        return score

    def _reason_from_similarity(self, user_history, candidate_tags):
        """Construye una razón citando una actividad previa similar, si existe"""
        for h in user_history:
            tags_h = self._extract_tags(h['nombre'] + ' ' + h['descripcion'])
            if candidate_tags & tags_h:
                return f"Similar a {h['nombre']} que ya realizaste"
        return None

    def _generate_recommendations(self, user_history, available_activities, user_name):
        """Genera recomendaciones usando Gemini API via REST; devuelve (result, used_ai: bool, ai_error: str|None)"""
        api_key = os.getenv('GEMINI_API_KEY')
        
        if not api_key or api_key == 'tu-api-key-de-gemini-aqui':
            # Fallback: recomendaciones basadas en reglas simples
            return self._fallback_recommendations(user_history, available_activities), False, 'API key ausente'
        
        try:
            # Construir el prompt
            history_text = "\n".join([
                f"- {h['nombre']} ({h['descripcion']}) - {'Al aire libre' if h['aire_libre'] else 'Bajo techo'}"
                for h in user_history[:10]  # Últimas 10 para no saturar el prompt
            ])
            
            activities_text = "\n".join([
                f"{a['id']}. {a['nombre']}: {a['descripcion']} ({'Al aire libre' if a['aire_libre'] else 'Bajo techo'})"
                for a in available_activities
            ])
            
            prompt = f"""Eres un experto en recomendaciones deportivas para un club. Respondes en español de forma clara y motivadora.

Usuario: {user_name}

Historial de actividades del usuario:
{history_text if history_text else "El usuario aún no ha realizado reservas."}

Actividades disponibles:
{activities_text}

Basándote en el historial del usuario, recomienda entre 1 y 3 actividades que sean REALMENTE relevantes.

REGLAS IMPORTANTES:
- Solo recomienda actividades que tengan relación lógica con el historial del usuario
- Si una actividad tiene yoga, recomienda actividades mente-cuerpo (meditación, pilates, stretching)
- Si tiene deportes de raqueta (tenis, paddle), recomienda otros deportes de raqueta o similares
- Si tiene gimnasio/crossfit, recomienda entrenamiento funcional, musculación, HIIT
- NO recomiendes actividades completamente diferentes sin justificación clara
- Es mejor recomendar 1 o 2 actividades muy relevantes que forzar 3 con una irrelevante
- Si no hay suficientes actividades relevantes, devuelve solo las que tengan sentido

Para cada recomendación, proporciona:
1. El ID de la actividad (número)
2. Una explicación breve (máximo 2 líneas) de por qué se recomienda

IMPORTANTE: Responde ÚNICAMENTE con un objeto JSON válido, sin texto adicional ni markdown.

Formato de respuesta:
{{
  "recomendaciones": [
    {{"id": 1, "razon": "explicación aquí"}},
    {{"id": 2, "razon": "explicación aquí"}}
  ]
}}"""

            # Llamar a la API de Gemini via REST
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
                timeout=30
            )
            
            if response.status_code != 200:
                error_msg = f"API error {response.status_code}: {response.text}"
                print(f"Error al generar recomendaciones con IA: {error_msg}")
                return self._fallback_recommendations(user_history, available_activities), False, error_msg
            
            data = response.json()
            content = data.get('candidates', [{}])[0].get('content', {}).get('parts', [{}])[0].get('text', '')
            
            if not content:
                return self._fallback_recommendations(user_history, available_activities), False, "Respuesta vacía de la API"
            
            # Intentar extraer JSON si está envuelto en markdown
            if "```json" in content:
                content = content.split("```json")[1].split("```")[0].strip()
            elif "```" in content:
                content = content.split("```")[1].split("```")[0].strip()
            
            # Limpiar caracteres extraños al inicio/final
            content = content.strip()
            if content.startswith('```'):
                content = content[3:].strip()
            if content.endswith('```'):
                content = content[:-3].strip()
            
            recommendations_data = json.loads(content)
            
            # Construir respuesta con datos completos
            # No limitar a 3, respetar lo que la IA decidió recomendar
            result = []
            for rec in recommendations_data.get('recomendaciones', []):
                activity_id = rec.get('id')
                activity = next((a for a in available_activities if a['id'] == activity_id), None)
                if activity:
                    result.append({
                        'id': activity['id'],
                        'nombre': activity['nombre'],
                        'descripcion': activity['descripcion'],
                        'aire_libre': activity['aire_libre'],
                        'razon': rec.get('razon', '')
                    })
            
            return result, True, None
            
        except Exception as e:
            print(f"Error al generar recomendaciones con IA: {str(e)}")
            # Fallback en caso de error
            return self._fallback_recommendations(user_history, available_activities), False, str(e)

    def _fallback_recommendations(self, user_history, available_activities):
        """Recomendaciones basadas en reglas cuando la IA no está disponible"""
        if not available_activities:
            return []
        
        if user_history:
            # Calcular score de similitud por deporte y preferencia indoor/outdoor
            scored = []
            for candidate in available_activities:
                score = self._score_similarity(user_history, candidate)
                scored.append((score, candidate))

            # Ordenar por score descendente
            scored.sort(key=lambda x: x[0], reverse=True)
            
            # Definir umbral mínimo de relevancia
            # Score > 0 significa que hay alguna similitud (tags o preferencia indoor/outdoor)
            MIN_SCORE = 1  # Al menos debe tener una coincidencia significativa
            
            recommendations = []
            prefers_outdoor = sum(1 for h in user_history if h['aire_libre']) > (len(user_history) / 2)
            
            for score, rec in scored:
                if len(recommendations) >= 3:
                    break
                    
                # Solo agregar si el score supera el umbral mínimo
                if score >= MIN_SCORE:
                    candidate_tags = self._extract_tags(rec['nombre'] + ' ' + rec['descripcion'])
                    reason = self._reason_from_similarity(user_history, candidate_tags)
                    
                    if reason:
                        rec['razon'] = reason
                        recommendations.append(rec)
                    elif candidate_tags and score >= 2:  # Solo si hay tags compartidos con buen score
                        rec['razon'] = "Similar a actividades que ya practicas"
                        recommendations.append(rec)
                    elif score >= MIN_SCORE and rec['aire_libre'] == prefers_outdoor:
                        rec['razon'] = f"Basado en tu preferencia por actividades {'al aire libre' if prefers_outdoor else 'bajo techo'}"
                        recommendations.append(rec)
            
            # No forzar a completar 3 recomendaciones si no hay suficiente relevancia
        else:
            # Si no hay historial de reservas, no generar recomendaciones
            recommendations = []

        return recommendations

    @action(detail=False, methods=['get'])
    def get_recommendations(self, request):
        """
        Endpoint: GET /api/ai-recommendations/get_recommendations/
        Obtiene recomendaciones personalizadas para el usuario autenticado
        """
        try:
            # Obtener el usuario: priorizar user_id del parámetro, luego usuario autenticado
            user_id_param = request.query_params.get('user_id') or request.headers.get('X-User-Id')
            user = request.user if request.user.is_authenticated else None

            if user_id_param:
                # Si se proporciona user_id, usarlo (tiene prioridad)
                try:
                    # Primero intentar con el id primario de DatosUsuarios
                    datos_usuario = DatosUsuarios.objects.get(pk=user_id_param)
                except DatosUsuarios.DoesNotExist:
                    try:
                        # Luego intentar con el FK al usuario auth
                        datos_usuario = DatosUsuarios.objects.get(usuario_id=user_id_param)
                    except DatosUsuarios.DoesNotExist:
                        return Response({
                            'success': False,
                            'message': f'Usuario con ID {user_id_param} no encontrado',
                            'recommendations': []
                        }, status=status.HTTP_404_NOT_FOUND)
            elif user:
                # Si no hay user_id pero hay sesión autenticada
                datos_usuario = get_object_or_404(DatosUsuarios, usuario=user)
            else:
                return Response({
                    'success': False,
                    'message': 'Se requiere user_id o sesión activa',
                    'recommendations': []
                }, status=status.HTTP_401_UNAUTHORIZED)
            
            # Obtener historial y actividades disponibles
            user_history = self._get_user_history(datos_usuario)
            available_activities = self._get_available_activities()
            
            # Verificar que el usuario tenga historial de reservas
            if not user_history:
                return Response({
                    'success': False,
                    'message': 'No tienes reservas previas. Realiza algunas actividades primero para obtener recomendaciones personalizadas.',
                    'recommendations': [],
                    'has_history': False,
                    'total_reservations': 0
                }, status=status.HTTP_200_OK)
            
            if not available_activities:
                return Response({
                    'success': False,
                    'message': 'No hay actividades disponibles en este momento',
                    'recommendations': []
                }, status=status.HTTP_200_OK)
            
            # Generar recomendaciones
            recommendations, used_ai, ai_error = self._generate_recommendations(
                user_history,
                available_activities,
                f"{datos_usuario.nombre} {datos_usuario.apellido}"
            )
            
            return Response({
                'success': True,
                'recommendations': recommendations,
                'has_history': len(user_history) > 0,
                'total_reservations': len(user_history),
                'used_ai': used_ai,
                'provider': 'gemini' if used_ai else 'fallback',
                'ai_error': ai_error
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e),
                'recommendations': []
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
