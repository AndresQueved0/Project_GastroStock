# Generated by Django 5.1 on 2024-09-28 01:18

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('admin_panel', '0003_alter_pedido_estado'),
    ]

    operations = [
        migrations.AlterField(
            model_name='pedido',
            name='estado',
            field=models.CharField(choices=[('Pedido realizado', 'Pedido realizado'), ('Preparado', 'Preparado'), ('En mesa', 'En mesa'), ('Pagado', 'Pagado')], default='Pedido realizado', max_length=16),
        ),
    ]
