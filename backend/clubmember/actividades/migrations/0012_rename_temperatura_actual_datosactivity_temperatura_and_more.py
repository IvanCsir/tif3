# Generated by Django 4.2 on 2023-05-17 17:56

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('actividades', '0011_rename_temperatura_datosactivity_temperatura_actual_and_more'),
    ]

    operations = [
        migrations.RenameField(
            model_name='datosactivity',
            old_name='temperatura_actual',
            new_name='temperatura',
        ),
        migrations.RemoveField(
            model_name='datosactivity',
            name='temperatura_max',
        ),
        migrations.RemoveField(
            model_name='datosactivity',
            name='temperatura_min',
        ),
    ]
