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
            datos_activity = reserva.datos_activity
            history.append({
                'nombre': activity.name,
                'descripcion': activity.description,
                'aire_libre': activity.aire_libre,
                'id': activity.id,
                'fecha': reserva.fecha_reserva.strftime('%Y-%m-%d'),
                'hora_inicio': datos_activity.start_time.strftime('%H:%M'),
                'hora_fin': datos_activity.end_time.strftime('%H:%M'),
                'dia_semana': datos_activity.day.strftime('%A') if datos_activity.day else None
            })
        
        return history

    def _analyze_user_time_preferences(self, user_history):
        """Analiza las preferencias horarias del usuario basándose en su historial"""
        if not user_history:
            return {}
        
        from collections import Counter
        
        # Clasificar horarios
        morning = 0  # 6:00 - 11:59
        afternoon = 0  # 12:00 - 17:59
        evening = 0  # 18:00 - 23:59
        
        week_days = []
        durations = []
        
        for reserva in user_history:
            if reserva.get('hora_inicio'):
                hour = int(reserva['hora_inicio'].split(':')[0])
                
                if 6 <= hour < 12:
                    morning += 1
                elif 12 <= hour < 18:
                    afternoon += 1
                elif 18 <= hour < 24:
                    evening += 1
                
                # Calcular duración
                if reserva.get('hora_fin'):
                    start_hour, start_min = map(int, reserva['hora_inicio'].split(':'))
                    end_hour, end_min = map(int, reserva['hora_fin'].split(':'))
                    duration = (end_hour * 60 + end_min) - (start_hour * 60 + start_min)
                    durations.append(duration)
            
            if reserva.get('dia_semana'):
                week_days.append(reserva['dia_semana'])
        
        # Determinar preferencia de horario
        time_pref = None
        time_counts = {'mañana': morning, 'tarde': afternoon, 'noche': evening}
        if time_counts:
            max_time = max(time_counts.items(), key=lambda x: x[1])
            if max_time[1] > 0:
                time_pref = max_time[0]
        
        # Determinar días preferidos
        day_counter = Counter(week_days)
        top_days = [day for day, count in day_counter.most_common(2)]
        
        # Duración promedio
        avg_duration = sum(durations) / len(durations) if durations else None
        
        return {
            'time_preference': time_pref,
            'time_distribution': time_counts,
            'preferred_days': top_days,
            'avg_duration': avg_duration,
            'total_morning': morning,
            'total_afternoon': afternoon,
            'total_evening': evening
        }

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

    def _get_available_schedules(self, activity_id, limit=5):
        """Obtiene los próximos horarios disponibles para una actividad"""
        from datetime import datetime
        
        schedules = DatosActivity.objects.filter(
            id_act_id=activity_id,
            day__gte=datetime.now().date(),
            capacity__gt=0
        ).order_by('day', 'start_time')[:limit]
        
        result = []
        for schedule in schedules:
            dias_es = {
                'Monday': 'Lun', 'Tuesday': 'Mar', 'Wednesday': 'Mié',
                'Thursday': 'Jue', 'Friday': 'Vie', 'Saturday': 'Sáb', 'Sunday': 'Dom'
            }
            dia_nombre = dias_es.get(schedule.day.strftime('%A'), schedule.day.strftime('%A'))
            
            result.append({
                'id': schedule.id,
                'dia': schedule.day.strftime('%Y-%m-%d'),
                'dia_texto': f"{dia_nombre} {schedule.day.strftime('%d/%m')}",
                'hora_inicio': schedule.start_time.strftime('%H:%M'),
                'hora_fin': schedule.end_time.strftime('%H:%M'),
                'capacidad': schedule.capacity
            })
        
        return result

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
                return f"ya probaste {h['nombre']}"
        return None

    def _generate_recommendations(self, user_history, available_activities, datos_usuario):
        """Genera recomendaciones usando Gemini API via REST; devuelve (result, used_ai: bool, ai_error: str|None)"""
        api_key = os.getenv('GEMINI_API_KEY')
        
        if not api_key or api_key == 'tu-api-key-de-gemini-aqui':
            # Fallback: recomendaciones basadas en reglas simples
            return self._fallback_recommendations(user_history, available_activities, datos_usuario), False, 'API key ausente'
        
        try:
            user_name = datos_usuario.nombre
            
            # Analizar preferencias horarias
            time_prefs = self._analyze_user_time_preferences(user_history)
            
            # Construir el prompt
            history_text = "\n".join([
                f"- {h['nombre']} ({h['descripcion']}) - {'Al aire libre' if h['aire_libre'] else 'Bajo techo'} - Horario: {h.get('hora_inicio', 'N/A')}"
                for h in user_history[:10]  # Últimas 10 para no saturar el prompt
            ])
            
            activities_text = "\n".join([
                f"{a['id']}. {a['nombre']}: {a['descripcion']} ({'Al aire libre' if a['aire_libre'] else 'Bajo techo'})"
                for a in available_activities
            ])
            
            # Construir información del perfil del usuario
            perfil_text = ""
            if datos_usuario.edad:
                perfil_text += f"Edad: {datos_usuario.edad} años\n"
            if datos_usuario.nivel_experiencia:
                perfil_text += f"Nivel de experiencia: {datos_usuario.get_nivel_experiencia_display()}\n"
            if datos_usuario.preferencias_tipo:
                prefs = [p.strip() for p in datos_usuario.preferencias_tipo.split(',')]
                perfil_text += f"Preferencias de actividad: {', '.join(prefs)}\n"
            if datos_usuario.preferencia_formato:
                perfil_text += f"Formato preferido: {datos_usuario.get_preferencia_formato_display()}\n"
            if datos_usuario.objetivos:
                perfil_text += f"Objetivos: {datos_usuario.objetivos}\n"
            if datos_usuario.limitaciones:
                perfil_text += f"⚠️ Limitaciones/Precauciones: {datos_usuario.limitaciones}\n"
            
            # Agregar información de preferencias horarias
            horarios_text = ""
            if time_prefs.get('time_preference'):
                horarios_text += f"Horario preferido: {time_prefs['time_preference']}\n"
            if time_prefs.get('preferred_days'):
                dias_es = {'Monday': 'lunes', 'Tuesday': 'martes', 'Wednesday': 'miércoles', 
                          'Thursday': 'jueves', 'Friday': 'viernes', 'Saturday': 'sábado', 'Sunday': 'domingo'}
                dias_preferidos = [dias_es.get(day, day) for day in time_prefs['preferred_days']]
                horarios_text += f"Días que suele reservar: {', '.join(dias_preferidos)}\n"
            if time_prefs.get('avg_duration'):
                horarios_text += f"Duración promedio de actividades: {int(time_prefs['avg_duration'])} minutos\n"
            
            prompt = f"""Eres un experto en recomendaciones deportivas para un club. Respondes en español de forma clara y motivadora.

Usuario: {user_name}
{perfil_text if perfil_text else ""}
{horarios_text if horarios_text else ""}
Historial de actividades del usuario:
{history_text if history_text else "El usuario aún no ha realizado reservas."}

Actividades disponibles:
{activities_text}

Basándote en el perfil, historial, preferencias y PATRONES HORARIOS del usuario, recomienda entre 1 y 3 actividades que sean REALMENTE relevantes.

REGLAS IMPORTANTES:
- PRIORIZA las preferencias de tipo de actividad del usuario (musculación, cardio, mente-cuerpo, raqueta, acuático, funcional)
- Respeta el formato preferido (individual vs grupal) si está especificado
- Considera la edad y nivel de experiencia para ajustar la intensidad
- Si hay limitaciones físicas, EVITA actividades que puedan ser contraindicadas
- Alinea las recomendaciones con los objetivos del usuario
- IMPORTANTE: Considera los horarios habituales del usuario (mañana/tarde/noche) y menciónalos en la recomendación si es relevante
- Si el usuario suele reservar en ciertos días de la semana, menciona que hay disponibilidad en esos días
- Solo recomienda actividades que tengan relación lógica con el historial y preferencias
- Si una actividad tiene yoga, recomienda actividades mente-cuerpo (meditación, pilates, stretching)
- Si tiene deportes de raqueta (tenis, paddle), recomienda otros deportes de raqueta o similares
- Si tiene gimnasio/crossfit, recomienda entrenamiento funcional, musculación, HIIT
- NO recomiendes actividades completamente diferentes sin justificación clara
- Es mejor recomendar 1 o 2 actividades muy relevantes que forzar 3 con una irrelevante
- Si no hay suficientes actividades relevantes, devuelve solo las que tengan sentido

Para cada recomendación, proporciona:
1. El ID de la actividad (número)
2. Una explicación NATURAL y conversacional (máximo 2-3 líneas) dirigida a {user_name}, como si fueras su entrenador personal

IMPORTANTE: Usa los nombres REALES de las actividades del historial que aparecen arriba (como Yoga, Crossfit, Paddle, etc.) cuando hagas referencia a lo que ya hizo el usuario.

FORMATO DE LA EXPLICACIÓN: Habla de forma natural y cercana. Ejemplos de estilo:
- "{user_name}, veo que siempre entrenas por la mañana, entonces esta actividad es perfecta porque..."
- "Como ya probaste Yoga, {user_name}, creo que Pilates te va a encantar porque trabaja el core de forma similar"
- "Vi que hiciste mucho Crossfit, así que te sugiero esto para complementar tu entrenamiento funcional"
- "{user_name}, noto que te gusta el Paddle, entonces este otro deporte de raqueta te puede interesar"
- "Como buscas mejorar resistencia y ya probaste Running, {user_name}, esta actividad es ideal"

IMPORTANTE: Responde ÚNICAMENTE con un objeto JSON válido, sin texto adicional ni markdown.

Formato de respuesta:
{{
  "recomendaciones": [
    {{"id": 1, "razon": "explicación personalizada aquí"}},
    {{"id": 2, "razon": "explicación personalizada aquí"}}
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
                return self._fallback_recommendations(user_history, available_activities, datos_usuario), False, error_msg
            
            data = response.json()
            content = data.get('candidates', [{}])[0].get('content', {}).get('parts', [{}])[0].get('text', '')
            
            if not content:
                return self._fallback_recommendations(user_history, available_activities, datos_usuario), False, "Respuesta vacía de la API"
            
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
                    # Obtener horarios disponibles
                    schedules = self._get_available_schedules(activity['id'], limit=5)
                    
                    result.append({
                        'id': activity['id'],
                        'nombre': activity['nombre'],
                        'descripcion': activity['descripcion'],
                        'aire_libre': activity['aire_libre'],
                        'razon': rec.get('razon', ''),
                        'horarios_disponibles': schedules
                    })
            
            return result, True, None
            
        except Exception as e:
            print(f"Error al generar recomendaciones con IA: {str(e)}")
            # Fallback en caso de error
            return self._fallback_recommendations(user_history, available_activities, datos_usuario), False, str(e)

    def _fallback_recommendations(self, user_history, available_activities, datos_usuario):
        """Recomendaciones basadas en reglas cuando la IA no está disponible"""
        if not available_activities:
            return []
        
        user_name = datos_usuario.nombre
        time_prefs = self._analyze_user_time_preferences(user_history)
        
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
            
            # Obtener horario preferido para las razones
            horario_texto = ""
            if time_prefs.get('time_preference'):
                horario_map = {'mañana': 'la mañana', 'tarde': 'la tarde', 'noche': 'la noche'}
                horario_texto = horario_map.get(time_prefs['time_preference'], '')
            
            for score, rec in scored:
                if len(recommendations) >= 3:
                    break
                    
                # Solo agregar si el score supera el umbral mínimo
                if score >= MIN_SCORE:
                    candidate_tags = self._extract_tags(rec['nombre'] + ' ' + rec['descripcion'])
                    reason = self._reason_from_similarity(user_history, candidate_tags)
                    
                    if reason:
                        # Personalizar con nombre y horario de forma natural
                        if horario_texto:
                            rec['razon'] = f"{user_name}, veo que {reason.lower()}, entonces te recomiendo esto porque además hay horarios en {horario_texto} como prefieres"
                        else:
                            rec['razon'] = f"{user_name}, como {reason.lower()}, creo que esto te va a gustar"
                        # Agregar horarios disponibles
                        rec['horarios_disponibles'] = self._get_available_schedules(rec['id'], limit=5)
                        recommendations.append(rec)
                    elif candidate_tags and score >= 2:  # Solo si hay tags compartidos con buen score
                        if horario_texto:
                            rec['razon'] = f"{user_name}, noto que te gustan actividades similares y vi que siempre reservas en {horario_texto}, así que esto es perfecto"
                        else:
                            rec['razon'] = f"{user_name}, es similar a lo que ya practicas, entonces creo que te va a encantar"
                        # Agregar horarios disponibles
                        rec['horarios_disponibles'] = self._get_available_schedules(rec['id'], limit=5)
                        recommendations.append(rec)
                    elif score >= MIN_SCORE and rec['aire_libre'] == prefers_outdoor:
                        if prefers_outdoor:
                            if horario_texto:
                                rec['razon'] = f"{user_name}, como veo que prefieres actividades al aire libre y siempre entrenas en {horario_texto}, esto es ideal para ti"
                            else:
                                rec['razon'] = f"{user_name}, noto que te gusta entrenar al aire libre, así que te sugiero probar esto"
                        else:
                            if horario_texto:
                                rec['razon'] = f"{user_name}, vi que prefieres entrenar bajo techo y hay disponibilidad en {horario_texto} como te gusta"
                            else:
                                rec['razon'] = f"{user_name}, como prefieres actividades bajo techo, esto te puede interesar"
                        # Agregar horarios disponibles
                        rec['horarios_disponibles'] = self._get_available_schedules(rec['id'], limit=5)
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
                datos_usuario
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
