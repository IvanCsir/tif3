# Generated by Django 4.2 on 2023-06-15 20:20

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0005_delete_notificacion'),
        ('actividades', '0026_alter_mensaje_usuario'),
    ]

    operations = [
        migrations.AlterField(
            model_name='mensaje',
            name='usuario',
            field=models.ForeignKey(default=1, on_delete=django.db.models.deletion.CASCADE, to='accounts.datosusuarios'),
        ),
    ]
