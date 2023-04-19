from django.shortcuts import render
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import permissions
from django.contrib.auth.models import User
from user_profiles.models import UserProfile
from django.views.decorators.csrf import ensure_csrf_cookie, csrf_protect, csrf_exempt, get_token,requires_csrf_token
from django.utils.decorators import method_decorator
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from django.http import HttpResponse

# Create your views here.

class SignUpView(APIView):
    permission_classes = (permissions.AllowAny, )
    @method_decorator(requires_csrf_token)
    def dispatch(self, request, *args, **kwargs):
        return super().dispatch(request, *args, **kwargs)

    def post(self, request, format=None):
    
        data = self.request.data
        username = data['username']
        password = data['password']
        re_password = data['re_password']

        if password == re_password:
            if User.objects.filter(username=username).exists():
                return Response({'error': 'el usuario ya existe'})
            else:
                
                if len(password)<6:
                    return Response({'error': 'La contraseña debe tener más de 6 caracteres'})
                else:
                    user = User.objects.create_user(username=username, password=password)
                   

                    user_profile = UserProfile(user.id,nombre='', apellido= '', celular=0)
                    

                    return Response({'success': 'Usuario creado'})
        else:
                return Response({'error': 'Las contraseñas no son iguales'})

@method_decorator(ensure_csrf_cookie, name='dispatch')
# @ensure_csrf_cookie
class GetCSRFToken(APIView): #Traigo el token almacenado en una cookie
    permission_classes =(permissions.AllowAny, )

    @method_decorator(ensure_csrf_cookie)
    def dispatch(self, request, *args, **kwargs):
        return super().dispatch(request, *args, **kwargs)


    def get(self, request, format= None):
        
        return Response({'success': 'CSRF cookie set'})
        
        