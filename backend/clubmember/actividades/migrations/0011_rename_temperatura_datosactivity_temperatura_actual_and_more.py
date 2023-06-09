# Generated by Django 4.2 on 2023-05-17 16:28

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('actividades', '0010_datosactivity_condiciones_datosactivity_temperatura'),
    ]

    operations = [
        migrations.RenameField(
            model_name='datosactivity',
            old_name='temperatura',
            new_name='temperatura_actual',
        ),
        migrations.AddField(
            model_name='datosactivity',
            name='temperatura_max',
            field=models.CharField(blank=True, max_length=50, null=True),
        ),
        migrations.AddField(
            model_name='datosactivity',
            name='temperatura_min',
            field=models.CharField(blank=True, max_length=50, null=True),
        ),
    ]
