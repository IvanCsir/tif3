from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AIRecommendationsView

router = DefaultRouter()
router.register(r'ai-recommendations', AIRecommendationsView, basename='ai-recommendations')

urlpatterns = [
    path('', include(router.urls)),
]
