from django.urls import include, path
from django.conf import settings
from django.conf.urls.static import static
from gastrostock import views as admin_panel_views
from django.views.generic import RedirectView

urlpatterns = [
    path('', RedirectView.as_view(url='/login/', permanent=True)),  # Redirección a login
    path('GastroStock/', include('gastrostock.urls')),
    path('login/', admin_panel_views.login_view, name='login'),
]

if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)