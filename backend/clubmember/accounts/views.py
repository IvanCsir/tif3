from django.shortcuts import render
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import permissions
from django.contrib.auth.models import User
from user_profiles.models import UserProfile
from django.views.decorators.csrf import ensure_csrf_cookie, csrf_protect, csrf_exempt, get_token
from django.utils.decorators import method_decorator
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from django.http import HttpResponse

# Create your views here.
@method_decorator(csrf_protect, name='dispatch')
# @method_decorator(ensure_csrf_cookie, name='dispatch')

# @csrf_exempt
# @csrf_protect
class SignUpView(APIView):
    permissions_classes = (permissions.AllowAny, )

    def post(self, request, format=None):
        if request.method == 'POST':
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
                        user.save()
                        user.objects.get(username=username)

                        user_profile = UserProfile(user.id ,nombre='', apellido= '', celular='')
                        user_profile.save()

                        return Response({'success': 'Usuario creado'})
        else:
                return Response({'error': 'Las contraseñas no son iguales'})

@method_decorator(ensure_csrf_cookie, name='dispatch')
# @ensure_csrf_cookie
class GetCSRFToken(APIView): #Traigo el token almacenado en una cookie
    permission_classes =(permissions.AllowAny, )
    
    def get(self, request, format= None):
        # csrf_token = get_token(request)
        csrf_token = request.COOKIES.get('csrftoken')
        print(csrf_token)
        return Response({'success': csrf_token})
        
        # return HttpResponse(csrf_token)