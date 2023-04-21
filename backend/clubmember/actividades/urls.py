from django.urls import path
from .views import *

urlpatterns = [
    path('activity',ActivityView.as_view()),
    path('activity/<int:id>',ActivityView.as_view())
]