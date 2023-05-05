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

# Create your views here.

class AuthenticationViewSet(viewsets.ViewSet):
    @action(methods=['post'], detail=False)
    def login(self, request):
        data = request.data
        user = authenticate(username=data['username'], password=data['password'])
        queryset = DatosUsuarios.objects.all()
        usuario = get_object_or_404(queryset, usuario=user.id)
        serializers = UsuarioSerializer(usuario)
        return Response(serializers.data, status=status.HTTP_200_OK)

    @action(methods=['post'], detail=False)
    def register(self, request):
        data = request.data
        user = User.objects.create_user(data['username'], data['email'], data['password'])
        data['usuario'] = user.id
        datosUsuario = UsuarioCreateSerializer(data=data)
        if datosUsuario.is_valid():
            datosUsuario.save()
            return Response(datosUsuario.data, status=status.HTTP_200_OK)
        return Response(status=status.HTTP_400_BAD_REQUEST)
    
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
