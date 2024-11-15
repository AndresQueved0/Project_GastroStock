from django.core.management.base import BaseCommand
from ...models import Puesto

class Command(BaseCommand):
    help = 'Crea los puestos iniciales en la base de datos'

    def handle(self, *args, **kwargs):
        puestos = [
            'Mesero',
            'Cocinero',
            'Cajero',
        ]
        
        for nombre_puesto in puestos:
            Puesto.objects.get_or_create(
                nombre=nombre_puesto,
                defaults={'descripcion': f'Puesto de {nombre_puesto}'}
            )
            self.stdout.write(
                self.style.SUCCESS(f'Puesto "{nombre_puesto}" creado exitosamente')
            )