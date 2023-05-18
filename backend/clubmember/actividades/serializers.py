from rest_framework import serializers
from .models import DatosActivity
from .choices import horarios

class DatosCreateActivitySeralizer(serializers.ModelSerializer):
    class Meta:
        model = DatosActivity
        fields = ('day', 'time','capacity', 'temperatura_max','temperatura_min', 'condiciones')

class DatosActivitySerializer(serializers.ModelSerializer):
    #Creo un nuevo campo en el serializer
    time_display = serializers.SerializerMethodField()

    #Tomamos un objeto de de la instancia de DatosActivity 
    #y utilizamos el atributo time de esta instancia
    # para buscar el valor correspondiente en el diccionario horarios.
    def get_time_display(self, obj):
        horarios_dict = dict(horarios)
        return horarios_dict.get(obj.time)

    class Meta:
        model= DatosActivity
        fields= '__all__'
