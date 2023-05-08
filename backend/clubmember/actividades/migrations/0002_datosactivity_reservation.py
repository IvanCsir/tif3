# Generated by Django 4.2 on 2023-05-05 13:53

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0001_initial'),
        ('actividades', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='DatosActivity',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('day', models.DateField(blank=True, null=True)),
                ('time', models.TimeField(blank=True, null=True)),
                ('capacity', models.IntegerField(default=0)),
                ('id_act', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='actividades.activity')),
            ],
        ),
        migrations.CreateModel(
            name='Reservation',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('status', models.BooleanField(default=False)),
                ('id_datos_act', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='actividades.datosactivity')),
                ('id_user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='accounts.datosusuarios')),
            ],
        ),
    ]