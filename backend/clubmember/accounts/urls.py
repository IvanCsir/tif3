from django.urls import path
from .views import SignUpView, LogInView, LogOutView

urlpatterns = [
    # path('authenticated', CheckAuthenticatedView.as_view()),
    path('login', LogInView.as_view()),
    path('logout', LogOutView.as_view()),
    path('register',SignUpView.as_view()),
    # path('csrf_cookie', GetCSRFToken.as_view())
]