# Generated by Django 4.2 on 2023-06-15 21:35

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0005_delete_notificacion'),
        ('actividades', '0028_mensaje_leido'),
    ]

    operations = [
        migrations.AlterField(
            model_name='mensaje',
            name='usuario',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='accounts.datosusuarios'),
        ),
    ]
