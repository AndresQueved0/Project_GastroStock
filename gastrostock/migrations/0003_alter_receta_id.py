# Generated by Django 5.1 on 2024-11-14 14:47

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('gastrostock', '0002_empleado_puesto_delete_empleados_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='receta',
            name='id',
            field=models.AutoField(primary_key=True, serialize=False),
        ),
    ]