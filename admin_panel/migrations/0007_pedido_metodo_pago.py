# Generated by Django 5.1 on 2024-10-17 21:08

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('admin_panel', '0006_pedido_precio_total'),
    ]

    operations = [
        migrations.AddField(
            model_name='pedido',
            name='metodo_pago',
            field=models.CharField(blank=True, max_length=50, null=True),
        ),
    ]
