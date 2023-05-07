from rest_framework import serializers
from .models import DatosActivity

class DatosCreateActivitySeralizer(serializers.ModelSerializer):
    class Meta:
        model = DatosActivity
        fields = ('day', 'time', 'capacity')