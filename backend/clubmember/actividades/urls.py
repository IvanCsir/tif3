from django.urls import path
from .views import ActivityView #DatosActivityView

urlpatterns = [
    path('activity',ActivityView.as_view()),
    path('activity/<int:id>',ActivityView.as_view()),
    # path('activity/<int:id_act>/datos/', DatosActivityView, basename='crear_datos_activity'),
]