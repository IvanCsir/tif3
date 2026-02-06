from rest_framework import serializers
from .models import DatosActivity, Reserva, DatosUsuarios, Mensaje
from .choices import horarios
from django.contrib.auth.models import User


class DatosCreateActivitySeralizer(serializers.ModelSerializer):
    class Meta:
        model = DatosActivity
        fields = ('day','start_time', 'end_time','capacity', 'temperatura_max','temperatura_min', 'condiciones', "icon")

class UsuarioReservaSerializer(serializers.ModelSerializer):
    """Serializer para mostrar información básica del usuario en las reservas (solo para admin)"""
    class Meta:
        model = DatosUsuarios
        fields = ('id', 'nombre', 'apellido', 'email')

class ReservaDetalleSerializer(serializers.ModelSerializer):
    """Serializer para mostrar reservas con información del usuario (solo para admin)"""
    usuario = UsuarioReservaSerializer()
    
    class Meta:
        model = Reserva
        fields = ('id', 'usuario', 'fecha_reserva')

class DatosActivitySerializer(serializers.ModelSerializer):
    start_time = serializers.TimeField(format='%H:%M')
    end_time = serializers.TimeField(format='%H:%M')
    reservas = serializers.SerializerMethodField()
    #Creo un nuevo campo en el serializer
    # time_display = serializers.SerializerMethodField()

    #Tomamos un objeto de de la instancia de DatosActivity 
    #y utilizamos el atributo time de esta instancia
    # para buscar el valor correspondiente en el diccionario horarios.
    # def get_time_display(self, obj):
    #     horarios_dict = dict(horarios)
    #     return horarios_dict.get(obj.time)
    
    def get_reservas(self, obj):
        """Solo incluye reservas si el usuario es admin"""
        request = self.context.get('request')
        if request:
            # Obtener tipo_usuario de los parámetros GET o del contexto
            tipo_usuario = request.GET.get('tipo_usuario', None)
            if tipo_usuario == '1':
                reservas = Reserva.objects.filter(datos_activity=obj).select_related('usuario')
                return ReservaDetalleSerializer(reservas, many=True).data
        return None

    class Meta:
        model= DatosActivity
        fields= '__all__'

class ReservaSerializer(serializers.ModelSerializer):
    datos_activity = serializers.PrimaryKeyRelatedField(read_only=True)
    usuario = serializers.PrimaryKeyRelatedField(queryset=DatosUsuarios.objects.all())
    # datos_activity = DatosActivitySerializer()

    class Meta:
        model = Reserva
        fields = ('usuario', 'datos_activity', 'fecha_reserva')
        read_only_fields = ('usuario',)

class TraerReservaSerializer(serializers.ModelSerializer):
    datos_activity = serializers.PrimaryKeyRelatedField(read_only=True)
    usuario = serializers.PrimaryKeyRelatedField(queryset=User.objects.all())
    datos_activity = DatosActivitySerializer()
    #Agrego estos dos campos
    activity_name = serializers.SerializerMethodField()
    activity_lugar = serializers.SerializerMethodField()

    class Meta:
        model = Reserva
        fields = ('id', 'usuario', 'datos_activity', 'fecha_reserva', 'activity_name', "activity_lugar")
        read_only_fields = ('usuario',)

    def get_activity_name(self, obj):
        return obj.datos_activity.id_act.name
    
    def get_activity_lugar(self, obj):
        estado =  obj.datos_activity.id_act.aire_libre
        if estado == True:
            return "AIRE LIBRE"
        else:
            return "TECHADO"

class MensajeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Mensaje
        fields = '__all__'