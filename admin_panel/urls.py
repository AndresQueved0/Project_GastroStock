from django.urls import path
from . import views

urlpatterns = [
    path('', views.admin_dashboard, name='admin_dashboard'),
    path('login/', views.login_view, name='login'),
    path('admin/', views.admin_dashboard, name='admin_dashboard'),
    path('meseros/', views.meseros_dashboard, name='meseros_dashboard'),
    path('cocina/', views.cocina_dashboard, name='cocina_dashboard'),
    path('caja/', views.caja_dashboard, name='caja_dashboard'),
    path('agregar-producto/', views.agregar_producto, name='agregar_producto'),
    path('borrar-producto/<int:producto_id>/', views.borrar_producto, name='borrar_producto'),
    path('registrar-empleado/', views.registrar_empleado, name='registrar_empleado'),
    path('borrar-empleado/<int:empleado_id>/', views.borrar_empleado, name='borrar_empleado'),
    path('editar-empleado/<int:empleado_id>/', views.editar_empleado, name='editar_empleado'),
    path('registro-mesas/', views.registro_mesas, name='registro_mesas'),
    path('registrar-producto-menu/', views.registrar_producto_menu, name='registrar_producto_menu'),
    path('borrar-menuitem/<int:menuitem_id>/', views.borrar_menuitem, name='borrar_menuitem'),
    path('registrar-pedido/', views.registrar_pedido, name='registrar_pedido'),
    path('cocina/cambiar-estado-pedido/<int:pedido_id>/', views.cambiar_estado_pedido, name='cambiar_estado_pedido'),
    path('meseros/cambiar-estado-pedido/<int:pedido_id>/', views.cambiar_estado_pedido, name='cambiar_estado_pedido'),
]