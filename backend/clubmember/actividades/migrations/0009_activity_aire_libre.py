# Generated by Django 4.2 on 2023-05-16 16:00

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('actividades', '0008_delete_reservation'),
    ]

    operations = [
        migrations.AddField(
            model_name='activity',
            name='aire_libre',
            field=models.BooleanField(default=False),
        ),
    ]
