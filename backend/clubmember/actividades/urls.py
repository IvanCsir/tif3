from django.urls import path
from .views import ActivityView, DatosActivityView, ReservaView, MensajeView

urlpatterns = [
    path('activity',ActivityView.as_view()),
    path('activity/<int:id>',ActivityView.as_view()),
    path('activity/<int:id_act>/datos/', DatosActivityView.as_view({'post': 'crear_datos_activity'}), name='crear_datos_activity'),
    path('activity/<int:id_act>/datos_activity/', DatosActivityView.as_view({'get': 'lugares_disponibles'}), name='lugares_disponibles'),
    path('activity/<int:id_act>/reservar/<int:id_datos_activity>/', ReservaView.as_view({'post': 'reservar'}), name='reservar'),
    path('activity/<int:id_user>/reservas/', ReservaView.as_view({'get':'reservas_por_usuario'}), name="reservas_por_usuario"),
    path('activity/<int:id_act>/cancelar_reserva/<int:id_datos_activity>/', ReservaView.as_view({'delete': 'cancelar_reserva'}), name='cancelar_reserva'),
    path('mensaje/crear_mensaje/', MensajeView.as_view({'post': 'crear_mensaje'}), name='crear_mensaje'),
    path('mensaje/<int:usuario_id>/obtener_mensajes/', MensajeView.as_view({'get': 'obtener_mensajes'}), name='obtener_mensajes'),
    path('mensaje/<int:usuario_id>/marcar_leidos/', MensajeView.as_view({'put': 'marcar_leidos'}), name='marcar_leidos'),

]