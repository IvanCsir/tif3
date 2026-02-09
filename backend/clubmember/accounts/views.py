from django.shortcuts import render
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import viewsets, status
from django.contrib.auth.models import User
from django.contrib import auth
from user_profiles.models import UserProfile
from .models import DatosUsuarios, TipoUsuarios
from django.contrib.auth import authenticate, get_user_model
from django.shortcuts import get_object_or_404
from .serializers import UsuarioCreateSerializer, UsuarioSerializer, UsuarioUpdateSerializer, TipoUsuarios, TipoUsuarioCreateSerializer, TipoUsuarioSerializer
from rest_framework.decorators import action
from django.contrib.auth import login, logout

# Create your views here.

class AuthenticationViewSet(viewsets.ViewSet):
    # @action(methods=['post'], detail=False)
    # def login(self, request):
    #     data = request.data
    #     user = authenticate(username=data['username'], password=data['password'])
    #     print(request.user)
    #     queryset = DatosUsuarios.objects.all()
    #     usuario = get_object_or_404(queryset, usuario=user.id)
    #     serializers = UsuarioSerializer(usuario)
    #     return Response(serializers.data, status=status.HTTP_200_OK)
    @action(methods=['post'], detail=False)
    def login(self, request):
        data = request.data
        user = authenticate(username=data['username'], password=data['password'])

        if user is not None:
            # Autenticar al usuario y crear una sesión
            login(request, user)
            queryset = DatosUsuarios.objects.all()
            usuario = get_object_or_404(queryset, usuario=user.id)
            serializers = UsuarioSerializer(usuario)
            print(request.user.id)
            return Response(serializers.data, status=status.HTTP_200_OK)
        else:
            return Response({'message': 'Credenciales inválidas'}, status=status.HTTP_401_UNAUTHORIZED)

    # @action(methods=['post'], detail=False)
    # def register(self, request):
    #     data = request.data
    #     user = User.objects.create_user(data['username'], data['email'], data['password'])
    #     data['usuario'] = user.id
    #     datosUsuario = UsuarioCreateSerializer(data=data)
    #     if datosUsuario.is_valid():
    #         datosUsuario.save()
    #         return Response(datosUsuario.data, status=status.HTTP_200_OK)
    #     return Response(status=status.HTTP_400_BAD_REQUEST)
    @action(methods=['post'], detail=False)
    def register(self, request):
        data = request.data
        user = User.objects.create_user(data['username'], data['email'], data['password'])
        
        # Verificar si ya existe algún administrador (tipo_id = 1)
        # Si no existe, el primer usuario será admin
        admin_exists = DatosUsuarios.objects.filter(tipo_id=1).exists()
        
        # Asignar tipo según si existe o no un admin
        if not admin_exists:
            tipo_id = 1  # Primer usuario = admin
        else:
            tipo_id = 2  # Usuario normal = cliente
        
        # Crear el DatosUsuarios con el tipo asignado
        datosUsuario = UsuarioCreateSerializer(data={**data, 'usuario': user.id, 'tipo': tipo_id})
        if datosUsuario.is_valid():
            datosUsuario.save(usuario=user)
            return Response(datosUsuario.data, status=status.HTTP_200_OK)
        return Response(status=status.HTTP_400_BAD_REQUEST)
    #Tratando de arreglar el error, cp del juan
    # @action(methods=['post'], detail=False)
    # def register(self, request):
    #     data = request.data
    #     user = User.objects.create_user(data['username'], data['email'], data['password'])
    #     data['usuario'] = user.id
    #     datosUsuario = UsuarioCreateSerializer(data=data)
    #     if datosUsuario.is_valid():
    #         datosUsuario.save()
    #         return Response(datosUsuario.data, status=status.HTTP_200_OK)
    #     return Response(status=status.HTTP_400_BAD_REQUEST)
    
    @action(methods=['post'], detail=False)
    def logout(self, request):
        # Cerrar sesión del usuario
        logout(request)
        
        return Response({'message': 'Sesión cerrada'}, status=status.HTTP_200_OK)
    
class TipoUsuariosViewSet(viewsets.ViewSet):
    def list(self, request):  # GET ALL
        queryset = TipoUsuarios.objects.all()
        serializer = TipoUsuarioSerializer(queryset, many=True)
        return Response(serializer.data)

    def retrieve(self, request, pk=None):  # GET ONE
        queryset = TipoUsuarios.objects.all()
        tipo_usuario = get_object_or_404(queryset, pk=pk)
        serializer = TipoUsuarioSerializer(tipo_usuario)
        return Response(serializer.data)

    def create(self, request):  # POST
        post_data = request.data
        serializer = TipoUsuarioCreateSerializer(data=post_data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.error_messages, status=status.HTTP_400_BAD_REQUEST)


class UsuarioPreferenciasViewSet(viewsets.ViewSet):
    """
    ViewSet para gestionar las preferencias de los usuarios
    """
    
    @action(detail=False, methods=['get'])
    def get_preferencias(self, request):
        """
        GET /api/usuarios/preferencias/get_preferencias/?user_id=X
        Obtiene las preferencias del usuario
        """
        user_id = request.query_params.get('user_id') or request.headers.get('X-User-Id')
        
        if not user_id:
            return Response({
                'success': False,
                'message': 'Se requiere user_id'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            datos_usuario = DatosUsuarios.objects.get(pk=user_id)
            serializer = UsuarioSerializer(datos_usuario)
            return Response({
                'success': True,
                'data': serializer.data
            }, status=status.HTTP_200_OK)
        except DatosUsuarios.DoesNotExist:
            return Response({
                'success': False,
                'message': 'Usuario no encontrado'
            }, status=status.HTTP_404_NOT_FOUND)
    
    @action(detail=False, methods=['post'])
    def update_preferencias(self, request):
        """
        POST /api/usuarios/preferencias/update_preferencias/
        Actualiza las preferencias del usuario
        Campos: user_id, edad, nivel_experiencia, preferencias_tipo, preferencia_formato, objetivos, limitaciones
        """
        user_id = request.data.get('user_id')
        
        if not user_id:
            return Response({
                'success': False,
                'message': 'Se requiere user_id'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            datos_usuario = DatosUsuarios.objects.get(pk=user_id)
            
            # Actualizar solo los campos que vienen en el request
            if 'edad' in request.data:
                datos_usuario.edad = request.data['edad']
            if 'nivel_experiencia' in request.data:
                datos_usuario.nivel_experiencia = request.data['nivel_experiencia']
            if 'preferencias_tipo' in request.data:
                datos_usuario.preferencias_tipo = request.data['preferencias_tipo']
            if 'preferencia_formato' in request.data:
                datos_usuario.preferencia_formato = request.data['preferencia_formato']
            if 'objetivos' in request.data:
                datos_usuario.objetivos = request.data['objetivos']
            if 'limitaciones' in request.data:
                datos_usuario.limitaciones = request.data['limitaciones']
            
            datos_usuario.save()
            
            serializer = UsuarioSerializer(datos_usuario)
            return Response({
                'success': True,
                'message': 'Preferencias actualizadas correctamente',
                'data': serializer.data
            }, status=status.HTTP_200_OK)
            
        except DatosUsuarios.DoesNotExist:
            return Response({
                'success': False,
                'message': 'Usuario no encontrado'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({
                'success': False,
                'message': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
