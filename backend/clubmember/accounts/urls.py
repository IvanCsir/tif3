from django.urls import path
from rest_framework import routers
from .views import AuthenticationViewSet, TipoUsuariosViewSet

router = routers.SimpleRouter()
router.register(r'tipo-usuarios', TipoUsuariosViewSet, basename='tipo-usuarios')
router.register(r'authentication', AuthenticationViewSet, basename='authentication')

urlpatterns = router.urls
