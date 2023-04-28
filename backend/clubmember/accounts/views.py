from django.shortcuts import render
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import permissions
from django.contrib.auth.models import User
from django.contrib import auth
from user_profiles.models import UserProfile
from django.views.decorators.csrf import ensure_csrf_cookie, csrf_protect, csrf_exempt, get_token,requires_csrf_token
from django.utils.decorators import method_decorator


# Create your views here.

class SignUpView(APIView):
    permission_classes = (permissions.AllowAny, )
    @method_decorator(csrf_exempt)
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
                    user_id = User.objects.get(id=user.id)

                    user_profile = UserProfile(user_id,nombre='', apellido= '', celular=0)
                    

                    return Response({'success': 'Usuario creado'})
        else:
                return Response({'error': 'Las contraseñas no son iguales'})

class LogInView(APIView):
    permission_classes =(permissions.AllowAny, )
    @method_decorator(csrf_exempt)
    def dispatch(self, request, *args, **kwargs):
        return super().dispatch(request, *args, **kwargs)
    
    def post(self, request, format=None):
        data = self.request.data

        username = data['username']
        password = data['password']

        user = auth.authenticate(username=username, password=password)

        if user is not None:
            auth.login(request, user)
            return Response({'success': 'Usuario autenticado'})
        else:
            return Response({'error': 'Error en la autenticación'})
        

class LogOutView(APIView):
    @method_decorator(csrf_exempt)
    def dispatch(self, request, *args, **kwargs):
        return super().dispatch(request, *args, **kwargs)
    
    def post(self,request,format=None):

        try:
            auth.logout(request)
            return Response({'success': 'Log Out'})
        except: 
            Response({'error': 'Error en el log out'})


# class GetCSRFToken(APIView): #Traigo el token almacenado en una cookie
#     permission_classes =(permissions.AllowAny, )

#     @method_decorator(csrf_exempt)
#     def dispatch(self, request, *args, **kwargs):
#         return super().dispatch(request, *args, **kwargs)

#     def get(self, request, format= None):
#         csrf_token = get_token(request)
#         return Response({'success': csrf_token})
        
        