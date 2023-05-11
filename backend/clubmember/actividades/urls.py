from django.urls import path
from .views import ActivityView, DatosActivityView

urlpatterns = [
    path('activity',ActivityView.as_view()),
    path('activity/<int:id>',ActivityView.as_view()),
    path('activity/<int:id_act>/datos/', DatosActivityView.as_view({'post': 'crear_datos_activity'}), name='crear_datos_activity'),
    path('activity/<int:id_act>/datos_activity/', DatosActivityView.as_view({'get': 'lugares_disponibles'}), name='lugares_disponibles'),
]