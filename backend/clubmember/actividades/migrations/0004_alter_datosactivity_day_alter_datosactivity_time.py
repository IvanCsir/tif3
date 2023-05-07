# Generated by Django 4.2 on 2023-05-05 15:29

import datetime
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('actividades', '0003_rename_status_reservation_reservar'),
    ]

    operations = [
        migrations.AlterField(
            model_name='datosactivity',
            name='day',
            field=models.DateField(blank=True, default=datetime.date.today, null=True),
        ),
        migrations.AlterField(
            model_name='datosactivity',
            name='time',
            field=models.CharField(choices=[('1', '9.00hs - 10.00hs'), ('2', '10.00hs - 11.00hs'), ('3', '11.00hs - 12.00hs'), ('4', '12.00hs - 13.00hs'), ('5', '13.00hs - 14.00hs'), ('6', '14.00hs - 15.00hs'), ('7', '15.00hs - 16.00hs'), ('8', '16.00hs - 17.00hs'), ('9', '18.00hs - 19.00hs'), ('10', '20.00hs - 21.00hs'), ('11', '21.00hs - 22.00hs')], default='1', max_length=10),
        ),
    ]
