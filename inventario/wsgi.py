"""
WSGI config for inventario project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.1/howto/deployment/wsgi/
"""

import sys
import os
from django.core.wsgi import get_wsgi_application
from django.contrib.staticfiles.handlers import StaticFilesHandler

path = os.path.expanduser('~/GastroStock_Backend/inventario')
if path not in sys.path:
    sys.path.insert(0, path)
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'inventario.settings')

application = get_wsgi_application()
application = StaticFilesHandler(get_wsgi_application())