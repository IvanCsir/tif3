# Generated by Django 4.0 on 2023-04-12 12:45

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('user_profiles', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='userprofile',
            name='celular',
            field=models.IntegerField(default=''),
        ),
    ]