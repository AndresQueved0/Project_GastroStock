from django.urls import path, include
from . import views


urlpatterns = [
    path('', views.admin_dashboard, name='admin_dashboard'),
    path('login/', views.login_view, name='login'),
    path('admin/', views.admin_dashboard, name='admin_dashboard'),
    path('meseros/', views.meseros_dashboard, name='meseros_dashboard'),
    path('cocina/', views.cocina_dashboard, name='cocina_dashboard'),
    path('caja/', views.caja_dashboard, name='caja_dashboard'),
    path('agregar-producto/', views.agregar_producto, name='agregar_producto'),
    path('admin/borrar-producto/<int:producto_id>/', views.borrar_producto, name='borrar_producto'),
    path('admin/registrar-empleado/', views.registrar_empleado, name='registrar_empleado'),
    path('admin/borrar-empleado/<int:empleado_id>/', views.borrar_empleado, name='borrar_empleado'),
    path('admin/editar-empleado/<int:empleado_id>/', views.editar_empleado, name='editar_empleado'),
    path('registro-mesas/', views.registro_mesas, name='registro_mesas'),
    path('registrar-producto-menu/', views.registrar_producto_menu, name='registrar_producto_menu'),
    path('borrar-menuitem/<int:menuitem_id>/', views.borrar_menuitem, name='borrar_menuitem'),
    path('meseros/registrar-pedido/', views.registrar_pedido, name='registrar_pedido'),
    path('cocina/cambiar-estado-pedido/<int:pedido_id>/', views.cambiar_estado_pedido, name='cambiar_estado_pedido'),
    path('meseros/cambiar-estado-pedido/<int:pedido_id>/', views.cambiar_estado_pedido, name='cambiar_estado_pedido'),
    path('meseros/obtener-pedidos/', views.obtener_pedidos, name='obtener_pedidos'),
    path('meseros/obtener-estado-mesa/<int:mesa_id>/', views.obtener_estado_mesa, name='obtener_estado_mesa'),
    path('caja/obtener-detalles-pedido/<int:pedido_id>/', views.obtener_detalles_pedido, name='obtener_detalles_pedido'),
    path('caja/procesar-pago/', views.procesar_pago, name='procesar_pago'),  # Añadir esta línea
    path('caja/obtener-pedidos/', views.obtener_pedidos, name='obtener_pedidos'),  # Añadir esta línea
    path('cocina/obtener-pedidos/', views.obtener_pedidos, name='obtener_pedidos'),
    path('centro-de-ayuda/', views.help_view, name='help_view'),
    path('', views.RecetaListView.as_view(), name='receta_lista'),
    path('crear_receta/', views.receta_crear, name='receta_crear'),
    path('<int:pk>/editar/', views.receta_editar, name='receta_editar'),
    path('<int:pk>/eliminar/', views.receta_eliminar, name='receta_eliminar'),
]