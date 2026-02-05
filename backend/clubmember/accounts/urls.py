from django.urls import path
from rest_framework import routers
from .views import AuthenticationViewSet, TipoUsuariosViewSet, UsuarioPreferenciasViewSet

router = routers.SimpleRouter()
router.register(r'tipo-usuarios', TipoUsuariosViewSet, basename='tipo-usuarios')
router.register(r'authentication', AuthenticationViewSet, basename='authentication')
router.register(r'usuarios/preferencias', UsuarioPreferenciasViewSet, basename='usuario-preferencias')

urlpatterns = router.urls
