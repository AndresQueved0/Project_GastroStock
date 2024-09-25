import os
import sys
import shutil

# Añade la ruta del proyecto al sys.path
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(project_root)

# Configura la variable de entorno DJANGO_SETTINGS_MODULE
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "inventario.settings")  # Cambia 'inventario' por el nombre de tu proyecto si es diferente

import django
django.setup()

from django.conf import settings

def clean_static():
    # Eliminar el directorio STATIC_ROOT
    if hasattr(settings, 'STATIC_ROOT') and os.path.exists(settings.STATIC_ROOT):
        shutil.rmtree(settings.STATIC_ROOT)
        print(f"Eliminado {settings.STATIC_ROOT}")

    # Eliminar archivos .pyc en las carpetas de aplicaciones
    for app in settings.INSTALLED_APPS:
        app_name = app.split('.')[-1]
        app_path = os.path.join(settings.BASE_DIR, app_name)
        if os.path.isdir(app_path):
            for root, dirs, files in os.walk(app_path):
                for file in files:
                    if file.endswith('.pyc'):
                        os.remove(os.path.join(root, file))
                        print(f"Eliminado {os.path.join(root, file)}")

    print("Limpieza completada.")

if __name__ == "__main__":
    clean_static()