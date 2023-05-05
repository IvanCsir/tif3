from .models import TipoUsuarios, DatosUsuarios
from rest_framework import serializers



class TipoUsuarioSerializer(serializers.ModelSerializer):
    class Meta():
        model = TipoUsuarios
        fields = '__all__'

class TipoUsuarioCreateSerializer(serializers.ModelSerializer):
    class Meta():
        model = TipoUsuarios
        fields = ('tipo_usuario',)

class UsuarioSerializer(serializers.ModelSerializer):
    class Meta():
        model = DatosUsuarios
        fields = '__all__'

class UsuarioCreateSerializer(serializers.ModelSerializer):
    class Meta():
        model = DatosUsuarios
        fields = ('usuario', 'nombre','apellido', 'email', 'tipo',)

class UsuarioUpdateSerializer(serializers.ModelSerializer):
    class Meta():
        model = DatosUsuarios
        fields = ('nombre','apellido', 'email', 'tipo',)