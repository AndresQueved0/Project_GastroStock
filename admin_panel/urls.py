from django.urls import path
from . import views

urlpatterns = [
    path('', views.admin_dashboard, name='admin_dashboard'),
    path('dashboard/', views.admin_dashboard, name='admin_dashboard'),
    path('login/', views.admin_login, name='admin_login'),
    path('agregar-producto/', views.agregar_producto, name='agregar_producto'),
    path('admin/', views.admin_dashboard, name='admin_dashboard'),
    path('meseros/', views.meseros_dashboard, name='meseros_dashboard'),
    path('cocina/', views.cocina_dashboard, name='cocina_dashboard'),
    path('caja/', views.caja_dashboard, name='caja_dashboard'),
    path('borrar-producto/<int:producto_id>/', views.borrar_producto, name='borrar_producto'),
    path('registrar-empleado/', views.registrar_empleado, name='registrar_empleado'),
    path('borrar-empleado/<int:empleado_id>/', views.borrar_empleado, name='borrar_empleado'),
    path('editar-empleado/<int:empleado_id>/', views.editar_empleado, name='editar_empleado'),
]