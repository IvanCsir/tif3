from django.shortcuts import get_object_or_404
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from accounts.models import DatosUsuarios
from actividades.models import Reserva, Activity, DatosActivity
from datetime import datetime, timedelta
from django.db import transaction
from django.db.models import F
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
        specific_times = []  # Para horarios específicos
        time_ranges = []  # Para rangos horarios (ej: "08:00-09:00")
        
        for reserva in user_history:
            if reserva.get('hora_inicio'):
                hour = int(reserva['hora_inicio'].split(':')[0])
                
                if 6 <= hour < 12:
                    morning += 1
                elif 12 <= hour < 18:
                    afternoon += 1
                elif 18 <= hour < 24:
                    evening += 1
                
                # Guardar horario específico de inicio
                specific_times.append(reserva['hora_inicio'])
                
                # Guardar rango horario completo
                if reserva.get('hora_fin'):
                    time_range = f"{reserva['hora_inicio']}-{reserva['hora_fin']}"
                    time_ranges.append(time_range)
                    
                    # Calcular duración
                    start_hour, start_min = map(int, reserva['hora_inicio'].split(':'))
                    end_hour, end_min = map(int, reserva['hora_fin'].split(':'))
                    duration = (end_hour * 60 + end_min) - (start_hour * 60 + start_min)
                    durations.append(duration)
            
            if reserva.get('dia_semana'):
                week_days.append(reserva['dia_semana'])
        
        # Determinar preferencia de horario general
        time_pref = None
        time_counts = {'mañana': morning, 'tarde': afternoon, 'noche': evening}
        if time_counts:
            max_time = max(time_counts.items(), key=lambda x: x[1])
            if max_time[1] > 0:
                time_pref = max_time[0]
        
        # Determinar horario específico más frecuente
        favorite_time = None
        favorite_time_range = None
        if specific_times:
            time_counter = Counter(specific_times)
            most_common_time = time_counter.most_common(1)[0]
            # Solo considerar si aparece al menos 2 veces (30% del historial)
            if most_common_time[1] >= 2 or most_common_time[1] >= len(user_history) * 0.3:
                favorite_time = most_common_time[0]
        
        if time_ranges:
            range_counter = Counter(time_ranges)
            most_common_range = range_counter.most_common(1)[0]
            if most_common_range[1] >= 2 or most_common_range[1] >= len(user_history) * 0.3:
                favorite_time_range = most_common_range[0]
        
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
            'total_evening': evening,
            'favorite_time': favorite_time,  # ej: "08:00"
            'favorite_time_range': favorite_time_range  # ej: "08:00-09:00"
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

    def _check_activity_at_favorite_time(self, activity_id, favorite_time):
        """Verifica si una actividad tiene disponibilidad en el horario favorito del usuario"""
        if not favorite_time:
            return False
        
        # Buscar slots que comiencen en el horario favorito (con tolerancia de ±30 min)
        try:
            from datetime import datetime, time, timedelta
            
            # Convertir string a time object
            fav_hour, fav_min = map(int, favorite_time.split(':'))
            favorite_time_obj = time(fav_hour, fav_min)
            
            # Calcular rango de tolerancia (±30 minutos)
            temp_datetime = datetime.combine(datetime.today(), favorite_time_obj)
            time_min = (temp_datetime - timedelta(minutes=30)).time()
            time_max = (temp_datetime + timedelta(minutes=30)).time()
            
            # Buscar slots disponibles en ese rango horario
            has_slots = DatosActivity.objects.filter(
                id_act_id=activity_id,
                day__gte=datetime.now().date(),
                capacity__gt=0,
                start_time__gte=time_min,
                start_time__lte=time_max
            ).exists()
            
            return has_slots
        except:
            return False
    
    def _get_nearby_times_for_activity(self, activity_id, favorite_time):
        """Obtiene los horarios disponibles cercanos al horario favorito (dentro de 1-2 horas)"""
        if not favorite_time:
            return []
        
        try:
            from datetime import datetime, time, timedelta
            
            # Convertir string a time object
            fav_hour, fav_min = map(int, favorite_time.split(':'))
            favorite_time_obj = time(fav_hour, fav_min)
            
            # Buscar slots en un rango más amplio (±2 horas)
            temp_datetime = datetime.combine(datetime.today(), favorite_time_obj)
            time_min = (temp_datetime - timedelta(hours=2)).time()
            time_max = (temp_datetime + timedelta(hours=2)).time()
            
            # Buscar slots disponibles en ese rango
            slots = DatosActivity.objects.filter(
                id_act_id=activity_id,
                day__gte=datetime.now().date(),
                capacity__gt=0,
                start_time__gte=time_min,
                start_time__lte=time_max
            ).order_by('start_time')[:3]  # Máximo 3 horarios cercanos
            
            nearby_times = []
            for slot in slots:
                nearby_times.append(slot.start_time.strftime('%H:%M'))
            
            return nearby_times
        except:
            return []

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

    def _score_similarity(self, user_history, candidate, datos_usuario=None, time_prefs=None):
        """Calcula un puntaje de similitud basado en etiquetas, preferencias del usuario y horarios"""
        if not user_history:
            return 0

        score = 0
        
        # Etiquetas del candidato
        candidate_tags = self._extract_tags(candidate['nombre'] + ' ' + candidate['descripcion'])

        # Etiquetas del usuario (del historial)
        user_tags = []
        for h in user_history:
            user_tags.extend(list(self._extract_tags(h['nombre'] + ' ' + h['descripcion'])))

        user_tag_counts = {}
        for tag in user_tags:
            user_tag_counts[tag] = user_tag_counts.get(tag, 0) + 1

        # Puntuación base por historial (peso normal)
        for tag in candidate_tags:
            score += user_tag_counts.get(tag, 0) * 2  # peso por coincidencia de deporte similar

        # 🔥 BONUS FUERTE: Preferencias explícitas del usuario (preferencias_tipo)
        if datos_usuario and datos_usuario.preferencias_tipo:
            user_preferences = [p.strip().lower() for p in datos_usuario.preferencias_tipo.split(',')]
            
            # Mapear preferencias a tags
            pref_map = {
                'musculacion': ['fuerza-funcional', 'gimnasio'],
                'cardio': ['cardio'],
                'mente-cuerpo': ['mente-cuerpo'],
                'raqueta': ['raqueta'],
                'acuatico': ['acuatico'],
                'funcional': ['fuerza-funcional']
            }
            
            for pref in user_preferences:
                if pref in pref_map:
                    matched_tags = pref_map[pref]
                    for matched_tag in matched_tags:
                        if matched_tag in candidate_tags:
                            score += 10  # 🔥 BONUS MUY ALTO por coincidencia con preferencias explícitas
                            break

        # 🔥 BONUS FUERTE: Disponibilidad en horario favorito
        if time_prefs and time_prefs.get('favorite_time'):
            has_favorite_time = self._check_activity_at_favorite_time(candidate['id'], time_prefs['favorite_time'])
            if has_favorite_time:
                score += 8  # 🔥 BONUS ALTO por disponibilidad en horario favorito
            else:
                # Bonus menor si tiene horarios cercanos
                nearby_times = self._get_nearby_times_for_activity(candidate['id'], time_prefs['favorite_time'])
                if nearby_times:
                    score += 3  # Bonus moderado por horarios cercanos
        
        # 🔥 BONUS POR OBJETIVOS: Actividades alineadas con los objetivos del usuario
        if datos_usuario and datos_usuario.objetivos:
            objetivos_text = datos_usuario.objetivos.lower()
            candidate_text = (candidate['nombre'] + ' ' + candidate['descripcion']).lower()
            
            # Mapear objetivos a tipos de actividades recomendadas
            objetivo_keywords = {
                'perder peso': ['cardio', 'running', 'spinning', 'natacion', 'hiit'],
                'bajar de peso': ['cardio', 'running', 'spinning', 'natacion', 'hiit'],
                'adelgazar': ['cardio', 'running', 'spinning', 'natacion', 'hiit'],
                'ganar musculo': ['musculacion', 'gimnasio', 'pesas', 'fuerza', 'funcional', 'crossfit'],
                'masa muscular': ['musculacion', 'gimnasio', 'pesas', 'fuerza', 'funcional', 'crossfit'],
                'tonificar': ['pilates', 'funcional', 'gimnasio', 'pesas'],
                'resistencia': ['cardio', 'running', 'natacion', 'spinning', 'crossfit'],
                'flexibilidad': ['yoga', 'pilates', 'stretch', 'meditacion'],
                'relajar': ['yoga', 'meditacion', 'pilates', 'stretch'],
                'estres': ['yoga', 'meditacion', 'pilates', 'natacion'],
                'socializar': ['paddle', 'tenis', 'spinning', 'funcional'],
                'competir': ['paddle', 'tenis', 'running', 'crossfit']
            }
            
            for objetivo, keywords in objetivo_keywords.items():
                if objetivo in objetivos_text:
                    for keyword in keywords:
                        if keyword in candidate_text:
                            score += 10  # 🔥 BONUS MUY ALTO por alineación con objetivos
                            break
        
        # ❌ PENALIZACIÓN POR LIMITACIONES: Evitar actividades contraindicadas
        if datos_usuario and datos_usuario.limitaciones:
            limitaciones_text = datos_usuario.limitaciones.lower()
            candidate_text = (candidate['nombre'] + ' ' + candidate['descripcion']).lower()
            
            # Mapear limitaciones a actividades que deben evitarse
            limitacion_keywords = {
                'rodilla': ['running', 'correr', 'trote', 'salto', 'crossfit', 'hiit'],
                'espalda': ['crossfit', 'pesas', 'musculacion', 'peso'],
                'corazon': ['hiit', 'crossfit', 'intenso', 'alta intensidad'],
                'cardio': ['hiit', 'crossfit', 'running', 'intenso'],
                'lesion': ['intenso', 'crossfit', 'hiit', 'pesas', 'peso'],
                'embarazo': ['hiit', 'crossfit', 'pesas', 'intenso', 'salto'],
                'presion': ['hiit', 'crossfit', 'intenso', 'alta intensidad'],
                'articulaciones': ['running', 'correr', 'salto', 'hiit', 'crossfit'],
                'no puedo correr': ['running', 'correr', 'trote'],
                'no correr': ['running', 'correr', 'trote']
            }
            
            for limitacion, keywords in limitacion_keywords.items():
                if limitacion in limitaciones_text:
                    for keyword in keywords:
                        if keyword in candidate_text:
                            score -= 50  # ❌ PENALIZACIÓN MUY GRANDE - prácticamente descarta la actividad
                            break
                # Bonus menor si tiene horarios cercanos
                nearby_times = self._get_nearby_times_for_activity(candidate['id'], time_prefs['favorite_time'])
                if nearby_times:
                    score += 3  # Bonus moderado por horarios cercanos

        # Preferencia indoor/outdoor (peso bajo)
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
                perfil_text += f"🔥 Preferencias de actividad (PRIORITARIAS): {', '.join(prefs)}\n"
            if datos_usuario.preferencia_formato:
                perfil_text += f"Formato preferido: {datos_usuario.get_preferencia_formato_display()}\n"
            if datos_usuario.objetivos:
                perfil_text += f"🎯 OBJETIVOS (MUY IMPORTANTE): {datos_usuario.objetivos}\n"
            if datos_usuario.limitaciones:
                perfil_text += f"⚠️ LIMITACIONES/PRECAUCIONES (CRÍTICO - NO RECOMENDAR ACTIVIDADES CONTRAINDICADAS): {datos_usuario.limitaciones}\n"
            
            # Agregar información de preferencias horarias
            horarios_text = ""
            if time_prefs.get('favorite_time_range'):
                horarios_text += f"⭐ Horario FAVORITO: {time_prefs['favorite_time_range']} (reserva este horario frecuentemente)\n"
            elif time_prefs.get('favorite_time'):
                horarios_text += f"⭐ Horario FAVORITO: {time_prefs['favorite_time']} (hora de inicio más frecuente)\n"
            
            if time_prefs.get('time_preference'):
                horarios_text += f"Franja horaria preferida: {time_prefs['time_preference']}\n"
            if time_prefs.get('preferred_days'):
                dias_es = {'Monday': 'lunes', 'Tuesday': 'martes', 'Wednesday': 'miércoles', 
                          'Thursday': 'jueves', 'Friday': 'viernes', 'Saturday': 'sábado', 'Sunday': 'domingo'}
                dias_preferidos = [dias_es.get(day, day) for day in time_prefs['preferred_days']]
                horarios_text += f"Días que suele reservar: {', '.join(dias_preferidos)}\n"
            if time_prefs.get('avg_duration'):
                horarios_text += f"Duración promedio de actividades: {int(time_prefs['avg_duration'])} minutos\n"
            
            # Verificar qué actividades tienen disponibilidad en el horario favorito
            activities_with_favorite_time = []
            activities_with_nearby_times = {}  # {nombre_actividad: [horarios]}
            
            if time_prefs.get('favorite_time'):
                for activity in available_activities:
                    has_exact_time = self._check_activity_at_favorite_time(activity['id'], time_prefs['favorite_time'])
                    
                    if has_exact_time:
                        activities_with_favorite_time.append(activity['nombre'])
                    else:
                        # Buscar horarios cercanos
                        nearby_times = self._get_nearby_times_for_activity(activity['id'], time_prefs['favorite_time'])
                        if nearby_times:
                            activities_with_nearby_times[activity['nombre']] = nearby_times
                
                if activities_with_favorite_time:
                    horarios_text += f"\n✅ Actividades con disponibilidad en su horario favorito ({time_prefs['favorite_time']}): {', '.join(activities_with_favorite_time)}\n"
                
                if activities_with_nearby_times:
                    horarios_text += f"\n🕐 Actividades con horarios cercanos a su favorito:\n"
                    for act_name, times in list(activities_with_nearby_times.items())[:5]:  # Máximo 5 para no saturar
                        horarios_text += f"   - {act_name}: {', '.join(times)}\n"
            
            prompt = f"""Eres un experto en recomendaciones deportivas para un club. Respondes en español de forma clara y motivadora.

Usuario: {user_name}
{perfil_text if perfil_text else ""}
{horarios_text if horarios_text else ""}
Historial de actividades del usuario:
{history_text if history_text else "El usuario aún no ha realizado reservas."}

Actividades disponibles:
{activities_text}

🎯 OBJETIVO: Recomendar entre 1 y 3 actividades que sean ALTAMENTE RELEVANTES basándote en las preferencias explícitas, OBJETIVOS y LIMITACIONES del usuario, junto con su horario favorito.

📋 ORDEN DE PRIORIDAD (DE MAYOR A MENOR IMPORTANCIA):

0. ⚠️ LIMITACIONES/PRECAUCIONES (CRÍTICO - FILTRO OBLIGATORIO)
   - Si el usuario tiene limitaciones o precauciones de salud, es ABSOLUTAMENTE CRÍTICO respetarlas
   - NUNCA recomiendes actividades que puedan ser contraindicadas o peligrosas
   - Ejemplos:
     * Problemas de rodilla → EVITAR running, saltos, crossfit de alto impacto
     * Problemas de espalda → EVITAR levantamiento de peso pesado
     * Problemas cardíacos → EVITAR HIIT, ejercicios de alta intensidad
     * Embarazo → EVITAR ejercicios de alto impacto, pesas pesadas
   - SIEMPRE menciona en la recomendación que la actividad es segura considerando sus limitaciones

1. 🎯 OBJETIVOS DEL USUARIO (MUY IMPORTANTE)
   - Los objetivos del usuario (pérdida de peso, ganar músculo, mejorar resistencia, flexibilidad, reducir estrés, socializar, etc.) 
     deben guiar FUERTEMENTE tus recomendaciones
   - Alinea las actividades con lo que el usuario quiere lograr
   - SIEMPRE menciona explícitamente en la razón cómo la actividad ayuda con sus objetivos
   - Ejemplos:
     * "perder peso" → prioriza cardio, HIIT, spinning, natación
     * "ganar músculo" → prioriza musculación, crossfit, funcional
     * "reducir estrés" → prioriza yoga, meditación, pilates
     * "mejorar resistencia" → prioriza cardio, running, natación

2. 🔥 PREFERENCIAS DE TIPO DE ACTIVIDAD (MUY IMPORTANTE)
   - Si el usuario especificó preferencias (musculación, cardio, mente-cuerpo, raqueta, acuático, funcional), 
     DEBES recomendar SOLO actividades de esos tipos
   - Las preferencias explícitas del usuario son MANDATORIAS, no opcionales
   - NO recomiendes actividades fuera de sus preferencias a menos que NO haya ninguna opción disponible

3. 🔥 HORARIO FAVORITO (MUY IMPORTANTE)
   - Si el usuario tiene un horario favorito (marcado con ⭐), PRIORIZA actividades que tengan disponibilidad en ese horario
   - Las actividades con ✅ (disponibilidad exacta en horario favorito) deben ser recomendadas PRIMERO
   - Las actividades con 🕐 (horarios cercanos) son segunda opción
   - SIEMPRE menciona el horario específico en la explicación: "como siempre reservas a las 8:00..."

4. HISTORIAL Y EXPERIENCIA
   - Considera actividades similares a las que ya probó
   - Respeta nivel de experiencia y edad

5. FORMATO
   - Respeta formato preferido (individual vs grupal)

6. OTROS FACTORES
   - Días preferidos de la semana
   - Preferencia indoor/outdoor

REGLAS ESTRICTAS:
- ⚠️ CRÍTICO: Si hay LIMITACIONES, NUNCA recomiendes actividades contraindicadas - esto es prioritario sobre todo lo demás
- 🎯 SIEMPRE menciona explícitamente cómo la actividad ayuda con los OBJETIVOS del usuario
- ❌ NO recomiendes actividades que NO coincidan con las preferencias de tipo del usuario
- ❌ NO ignores el horario favorito si está especificado
- ✅ SIEMPRE menciona explícitamente el horario favorito en la explicación
- ✅ SIEMPRE conecta la recomendación con objetivos, preferencias y horarios
- ✅ Es mejor recomendar 1 actividad perfecta que 3 mediocres

Para cada recomendación, proporciona:
1. El ID de la actividad (número)
2. Una explicación NATURAL y conversacional (máximo 2-3 líneas) dirigida a {user_name}, como si fueras su entrenador personal
   - DEBE mencionar: objetivo del usuario + preferencias/horario
   - Si hay limitaciones: DEBE confirmar que es segura para ellos

IMPORTANTE: Usa los nombres REALES de las actividades del historial que aparecen arriba (como Yoga, Crossfit, Paddle, etc.) cuando hagas referencia a lo que ya hizo el usuario.

FORMATO DE LA EXPLICACIÓN: Habla de forma natural y cercana, conectando SIEMPRE con objetivos, limitaciones, preferencias y horario:

EJEMPLOS cuando tiene OBJETIVOS + PREFERENCIAS + HORARIO:
- "{user_name}, como buscas ganar músculo y prefieres musculación, esto es perfecto para tu objetivo y tiene disponibilidad a las 8:00 como siempre reservas"
- "{user_name}, veo que quieres perder peso y te gusta el cardio, esta actividad es ideal para quemar calorías y hay cupos a las 18:00 en tu horario favorito"
- "Para mejorar tu flexibilidad, {user_name}, esta actividad de mente-cuerpo es perfecta y tiene disponibilidad a las 9:00 cuando siempre entrenas"

EJEMPLOS cuando hay LIMITACIONES (CRÍTICO - siempre mencionar que es segura):
- "{user_name}, considerando tus problemas de rodilla, esta actividad es segura porque no tiene impacto y cumple con tus preferencias. Tiene horarios a las 8:00 como te gusta"
- "Como tienes limitaciones de espalda, {user_name}, te recomiendo esto porque trabaja sin carga pesada, es seguro para ti y hay cupos a las 18:00 en tu horario favorito"
- "{user_name}, esta actividad es ideal para tu objetivo de perder peso y es segura para tu condición cardíaca porque no es de alta intensidad. Disponible a las 9:00"

EJEMPLOS cuando tiene HORARIO pero actividad en horario cercano:
- "{user_name}, como buscas ganar resistencia y siempre reservas a las 8:00, esta actividad tiene disponibilidad a las 9:00 (cerca de tu horario) y es perfecta para tu objetivo"
- "Para tu objetivo de flexibilidad, {user_name}, esto es ideal y tiene cupos a las 17:00 y 19:00, cerca de las 18:00 cuando prefieres entrenar"

EJEMPLOS cuando se conecta con historial + objetivos:
- "Como ya probaste Yoga y quieres mejorar flexibilidad, {user_name}, Pilates es perfecto para tu objetivo y tiene disponibilidad a las 9:00 como te gusta"
- "Vi que hiciste Crossfit y buscas ganar músculo, {user_name}, esta actividad funcional es ideal para tu objetivo y hay horarios a las 18:00 cuando siempre entrenas"

RECUERDA: 
- SIEMPRE menciona el objetivo del usuario
- SI hay limitaciones: SIEMPRE confirma que es segura
- SIEMPRE menciona preferencias y horario favorito

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
            # Calcular score de similitud por deporte, preferencias del usuario y horarios
            scored = []
            for candidate in available_activities:
                score = self._score_similarity(user_history, candidate, datos_usuario, time_prefs)
                scored.append((score, candidate))

            # Ordenar por score descendente
            scored.sort(key=lambda x: x[0], reverse=True)
            
            # Definir umbral mínimo de relevancia
            # Con el nuevo sistema de scoring, requerimos al menos score de 3 para considerar relevante
            MIN_SCORE = 3  # Aumentado para priorizar actividades que coincidan con preferencias o horarios
            
            recommendations = []
            prefers_outdoor = sum(1 for h in user_history if h['aire_libre']) > (len(user_history) / 2)
            
            # Obtener información de horario para las razones
            horario_especifico = time_prefs.get('favorite_time_range') or time_prefs.get('favorite_time')
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
                    
                    # Verificar si tiene disponibilidad en el horario favorito o cercano
                    has_favorite_time = False
                    nearby_times = []
                    if time_prefs.get('favorite_time'):
                        has_favorite_time = self._check_activity_at_favorite_time(rec['id'], time_prefs['favorite_time'])
                        if not has_favorite_time:
                            nearby_times = self._get_nearby_times_for_activity(rec['id'], time_prefs['favorite_time'])
                    
                    if reason:
                        # Personalizar con nombre y horario específico
                        if has_favorite_time and horario_especifico:
                            rec['razon'] = f"{user_name}, como {reason.lower()}, te recomiendo esto porque además tiene disponibilidad en tu horario favorito de {horario_especifico}"
                        elif nearby_times and horario_especifico:
                            horarios_str = ' o '.join(nearby_times[:2])  # Máximo 2 horarios
                            rec['razon'] = f"{user_name}, como {reason.lower()} y siempre reservas a las {horario_especifico}, esta actividad tiene disponibilidad a las {horarios_str} que está cerca"
                        elif horario_texto:
                            rec['razon'] = f"{user_name}, veo que {reason.lower()}, entonces te recomiendo esto porque además hay horarios en {horario_texto} como prefieres"
                        else:
                            rec['razon'] = f"{user_name}, como {reason.lower()}, creo que esto te va a gustar"
                        # Agregar horarios disponibles
                        rec['horarios_disponibles'] = self._get_available_schedules(rec['id'], limit=5)
                        recommendations.append(rec)
                    elif candidate_tags and score >= 2:  # Solo si hay tags compartidos con buen score
                        if has_favorite_time and horario_especifico:
                            rec['razon'] = f"{user_name}, como siempre reservas a las {horario_especifico}, te sugiero esto porque tiene disponibilidad justo en tu horario favorito"
                        elif nearby_times and horario_especifico:
                            horarios_str = ' o '.join(nearby_times[:2])
                            rec['razon'] = f"{user_name}, como siempre reservas a las {horario_especifico}, esta actividad tiene disponibilidad a las {horarios_str} que está cerca de tu horario"
                        elif horario_texto:
                            rec['razon'] = f"{user_name}, noto que te gustan actividades similares y vi que siempre reservas en {horario_texto}, así que esto es perfecto"
                        else:
                            rec['razon'] = f"{user_name}, es similar a lo que ya practicas, entonces creo que te va a encantar"
                        # Agregar horarios disponibles
                        rec['horarios_disponibles'] = self._get_available_schedules(rec['id'], limit=5)
                        recommendations.append(rec)
                    elif score >= MIN_SCORE and rec['aire_libre'] == prefers_outdoor:
                        if prefers_outdoor:
                            if has_favorite_time and horario_especifico:
                                rec['razon'] = f"{user_name}, como veo que prefieres actividades al aire libre y siempre entrenas a las {horario_especifico}, esto es ideal porque tiene disponibilidad en ese horario"
                            elif nearby_times and horario_especifico:
                                horarios_str = ' o '.join(nearby_times[:2])
                                rec['razon'] = f"{user_name}, como prefieres actividades al aire libre y reservas a las {horario_especifico}, esto tiene disponibilidad a las {horarios_str} cerca de tu horario"
                            elif horario_texto:
                                rec['razon'] = f"{user_name}, como veo que prefieres actividades al aire libre y siempre entrenas en {horario_texto}, esto es ideal para ti"
                            else:
                                rec['razon'] = f"{user_name}, noto que te gusta entrenar al aire libre, así que te sugiero probar esto"
                        else:
                            if has_favorite_time and horario_especifico:
                                rec['razon'] = f"{user_name}, como siempre reservas a las {horario_especifico}, te recomiendo esto porque tiene disponibilidad en tu horario y es bajo techo como prefieres"
                            elif nearby_times and horario_especifico:
                                horarios_str = ' o '.join(nearby_times[:2])
                                rec['razon'] = f"{user_name}, como reservas a las {horario_especifico}, esto tiene cupos a las {horarios_str} cerca de tu horario y es bajo techo como te gusta"
                            elif horario_texto:
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
