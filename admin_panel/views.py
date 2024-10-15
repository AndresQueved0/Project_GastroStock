from django.shortcuts import render, redirect, get_object_or_404
from django.views.decorators.http import require_POST
from django.contrib.auth.decorators import login_required
from django.contrib.auth import authenticate, login as auth_login
from django.contrib import messages
from .models import Inventario, Categoria, Empleados, Mesa, Ubicacion, MenuItem, CategoriaMenu, Pedido, PedidoItem
from .forms import InventarioForm, CustomLoginForm, EmpleadoForm, MesaForm, MenuItemForm

from django.urls import reverse
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
import json
from datetime import datetime
from django.db import transaction
from django.db.models import Q


#Listar datos de base de datos - Admin dashboard

@login_required
@login_required
def admin_dashboard(request):
    productos = Inventario.objects.all()
    empleados = Empleados.objects.all()
    mesas = Mesa.objects.all()
    ubicaciones = Ubicacion.objects.all()
    categorias_menu = CategoriaMenu.objects.all()
    menu_items = MenuItem.objects.all()

    ubicacion_id = request.GET.get('ubicacion')
    initial_section = request.GET.get('section', 'inventario')

    if request.method == 'POST':
        form = MenuItemForm(request.POST, request.FILES)
        if form.is_valid():
            form.save()
            return redirect('admin_dashboard')
    else:
        form = MenuItemForm()

    if ubicacion_id:
        mesas = mesas.filter(ubicacion_id=ubicacion_id)

    context = {
        'productos': productos,
        'empleados': empleados,
        'mesas': mesas,
        'ubicaciones': ubicaciones,
        'categorias_menu': categorias_menu,
        'menu_items': menu_items,
        'form': form,
        'ubicacion_seleccionada': ubicacion_id,
        'initial_section': initial_section,
    }
    return render(request, 'admin_dashboard.html', context)

#Registrar empleados - Admin dashboard

def registrar_empleado(request):
    if request.method == 'POST':
        form = EmpleadoForm(request.POST, request.FILES)
        if form.is_valid():
            form.save()
            messages.success(request, 'Empleado registrado con éxito.', extra_tags='empleado_success')
            current_section = request.POST.get('current_section', 'empleados')
            return redirect(f"{reverse('admin_dashboard')}?section={current_section}")
    else:
        form = EmpleadoForm()
    
    return render(request, 'admin_panel/registro_empleados.html', {'form': form})

#Borrar empleados - Admin dashboard

@require_http_methods(["POST"])
def borrar_empleado(request, empleado_id):
    try:
        empleado = get_object_or_404(Empleados, id=empleado_id)
        nombre_empleado = f"{empleado.nombre} {empleado.apellido}"  # Asumiendo que tienes campos 'nombre' y 'apellido'
        empleado.delete()
        return JsonResponse({
            'success': True,
            'message': f'El empleado "{nombre_empleado}" ha sido eliminado exitosamente.',
            'type': 'success'
        })
    except Exception as e:
        print(f"Error al eliminar empleado: {str(e)}")  # Log del error
        return JsonResponse({
            'success': False,
            'message': f'Error al eliminar el empleado: {str(e)}',
            'type': 'error'
        }, status=500)
    
#Editar empleados - Admin dashboard

def editar_empleado(request, empleado_id):
    empleado = get_object_or_404(Empleados, id=empleado_id)
    
    if request.method == 'POST':
        form = EmpleadoForm(request.POST, request.FILES, instance=empleado)
        
        if form.is_valid():
            form.save()
            messages.success(request, 'Empleado actualizado con éxito.', extra_tags='empleado_success')
            
            # Obtener la sección actual del formulario
            current_section = request.POST.get('current_section', 'empleados')
            
            # Redirigir a la vista con la sección actual en la URL
            return redirect(f"{reverse('admin_dashboard')}?section={current_section}")
    
    else:
        form = EmpleadoForm(instance=empleado)
    
    return render(request, 'admin_panel/editar_empleado.html', {'form': form, 'empleado': empleado})

#Agregar productos - Admin dashboard

@login_required
def agregar_producto(request):
    if request.method == 'POST':
        form = InventarioForm(request.POST)
        if form.is_valid():
            form.save()
            messages.success(request, 'Producto agregado exitosamente.', extra_tags='producto_success')
            return redirect(reverse('admin_dashboard'))
    else:
        form = InventarioForm()
    return render(request, 'admin_panel/agregar_producto.html', {'form': form})

#Borrar productos - Admin dashboard

@require_http_methods(["POST"])
def borrar_producto(request, producto_id):
    try:
        producto = get_object_or_404(Inventario, id=producto_id)
        nombre_producto = producto.nombre_producto
        producto.delete()
        return JsonResponse({
            'success': True,
            'message': f'El producto "{nombre_producto}" ha sido eliminado exitosamente.',
            'type': 'success'
        })
    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': f'Error al eliminar el producto: {str(e)}',
            'type': 'error'
        })

#Tipo de usuarios - Login

def login_view(request):
    if request.method == 'POST':
        form = CustomLoginForm(request, data=request.POST)
        if form.is_valid():
            username = form.cleaned_data.get('username')
            password = form.cleaned_data.get('password')
            user = authenticate(request, username=username, password=password)
            if user is not None:
                    auth_login(request, user)
                    if user.user_type == 'admin':
                        return redirect('admin_dashboard')
                    elif user.user_type == 'meseros':
                        return redirect('meseros_dashboard')
                    elif user.user_type == 'cocina':
                        return redirect('cocina_dashboard')
                    elif user.user_type == 'caja':
                        return redirect('caja_dashboard')
            else:
                    messages.error(request, "Tipo de usuario incorrecto para estas credenciales.", extra_tags='login_error')
        else:
                messages.error(request, "Usuario o contraseña incorrectos.", extra_tags='login_error')
    else:
        form = CustomLoginForm()
    return render(request, 'login.html', {'form': form})

#Listar datos de la base de datos - Panel meseros

@login_required
def meseros_dashboard(request):
    verificar_mesas_disponibles()  # Asegúrate de que esta función está definida
    obtener_pedidos(request)  # Asegúrate de que esta función está definida

    # Obtener todas las mesas
    mesas = Mesa.objects.all()
    ubicaciones = Ubicacion.objects.all()
    categorias_menu = CategoriaMenu.objects.prefetch_related('items').all()
    pedidos_preparados = Pedido.objects.filter(estado='Preparado').order_by('fecha_pedido')
    pedidos_realizados = Pedido.objects.filter(estado='Pedido realizado').order_by('fecha_pedido')

    # Filtrar mesas por ubicación si se proporciona
    ubicacion_id = request.GET.get('ubicacion', 'todas')  # Establecer 'todas' como valor predeterminado
    if ubicacion_id != 'todas' and ubicacion_id:
        mesas = mesas.filter(ubicacion_id=ubicacion_id)

    # Verifica si la solicitud es AJAX usando la cabecera HTTP
    if request.headers.get('x-requested-with') == 'XMLHttpRequest':
        # Renderiza la plantilla parcial solo con mesas
        return render(request, 'mesas.html', {'mesas': mesas})

    context = {
        'mesas': mesas,
        'ubicaciones': ubicaciones,
        'categorias_menu': categorias_menu,
        'pedidos_preparados': pedidos_preparados,
        'pedidos_realizados': pedidos_realizados,
        'time': datetime.now().timestamp()
    }

    return render(request, 'meseros_dashboard.html', context)

def verificar_mesas_disponibles():
    # Obtener todas las mesas
    mesas = Mesa.objects.all()

    # Verificar si hay pedidos activos para cada mesa
    for mesa in mesas:
        pedidos_realizados = Pedido.objects.filter(mesa=mesa).filter(
            Q(estado='Preparado') | Q(estado='Pedido realizado')
        )

        # Si no hay pedidos activos, cambiar el estado de la mesa a "disponible"
        if not pedidos_realizados.exists():
            mesa.estado = 'disponible'
            mesa.save()

def obtener_pedidos(request):
    pedidos_preparados = Pedido.objects.filter(estado='Preparado').order_by('fecha_pedido')
    pedidos_realizados = Pedido.objects.filter(estado='Pedido realizado').order_by('fecha_pedido')
    return render(request, 'meseros_dashboard.html', {
        'pedidos_preparados': pedidos_preparados,
        'pedidos_realizados': pedidos_realizados
    })

def obtener_estado_mesa(request, mesa_id):
    try:
        mesa = Mesa.objects.get(id=mesa_id)
        estado = mesa.estado  # Esto devuelve 'disponible' o 'ocupada'
        return JsonResponse({'estado': estado})
    except Mesa.DoesNotExist:
        return JsonResponse({'error': 'Mesa no encontrada'}, status=404)

#Eliminar plato del menu

def borrar_menuitem(request, menuitem_id):
    try:
        menuitem = get_object_or_404(MenuItem, id=menuitem_id)
        nombre_menuitem = f"{menuitem.nombre}"  # Asumiendo que tienes campos 'nombre' y 'apellido'
        menuitem.delete()
        return JsonResponse({
            'success': True,
            'message': f'El plato "{nombre_menuitem}" ha sido eliminado exitosamente.',
            'type': 'success'
        })
    except Exception as e:
        print(f"Error al eliminar plato: {str(e)}")  # Log del error
        return JsonResponse({
            'success': False,
            'message': f'Error al eliminar el plato: {str(e)}',
            'type': 'error'
        }, status=500)

@login_required
def registro_mesas(request):
    if request.method == 'POST':
        form = MesaForm(request.POST)
        if form.is_valid():
            form.save()
        messages.success(request, 'Mesa registrada con éxito.', extra_tags='mesa_success')
        return redirect('admin_dashboard')
    else:
        form = MesaForm()
    return render(request, 'admin_panel/registro_mesas.html', {'form': form})

@login_required
def registrar_producto_menu(request):
    if request.method == 'POST':
        form = MenuItemForm(request.POST, request.FILES)
        if form.is_valid():
            form.save()
            messages.success(request, 'Producto registrado exitosamente.')
            return redirect('admin_dashboard')
    else:
        form = MenuItemForm()
    
    return render(request, 'admin_panel/registrar_producto_menu.html', {'form': form})

@transaction.atomic
def registrar_pedido(request):
    data = json.loads(request.body)
    mesa_id = data.get('mesa_id')
    items_pedido = json.loads(data.get('items_pedido'))
    
    try:
        mesa = Mesa.objects.get(id=mesa_id)
        
        mesa.estado = 'ocupada'
        mesa.save()
        
        pedido = Pedido.objects.create(mesa=mesa)
        
        items_detalle = []
        total_pedido = 0
        for item in items_pedido:
            menu_item = MenuItem.objects.get(id=item['id'])
            pedido_item = PedidoItem.objects.create(
                pedido=pedido,
                item_menu=menu_item,
                cantidad=item['cantidad'],
                precio_unitario=menu_item.precio
            )
            subtotal = pedido_item.precio_total
            total_pedido += subtotal
            items_detalle.append({
                'nombre': menu_item.nombre,
                'cantidad': item['cantidad'],
                'precio_unitario': menu_item.precio_formateado(),
                'precio_total': Pedido.formatear_precio(subtotal)
            })
        
        return JsonResponse({
            'status': 'success',
            'message': 'Pedido registrado correctamente',
            'pedido_id': pedido.id,
            'mesa': pedido.mesa.nombre,
            'fecha_pedido': pedido.fecha_pedido.strftime("%d/%m/%Y %H:%M:%S"),
            'estado': pedido.get_estado_display(),
            'items': items_detalle,
            'total_pedido': Pedido.formatear_precio(total_pedido)
        })
    except Exception as e:
        return JsonResponse({
            'status': 'error',
            'message': str(e)
        }, status=400)

@login_required
@require_POST
def cambiar_estado_pedido(request, pedido_id):
    pedido = get_object_or_404(Pedido, id=pedido_id)
    nuevo_estado = request.POST.get('nuevo_estado')
    
    if nuevo_estado in dict(Pedido.ESTADO_CHOICES):
        pedido.estado = nuevo_estado
        pedido.save()

        verificar_mesas_disponibles()

        return JsonResponse({'status': 'success', 'nuevo_estado': nuevo_estado})
    else:
        return JsonResponse({'status': 'error', 'message': 'Estado inválido'}, status=400)

    
@login_required
def cocina_dashboard(request):
    productos = Inventario.objects.all()
    pedidos = Pedido.objects.filter(estado='Pedido realizado').order_by('fecha_pedido')

    context = {
        'productos': productos,
        'pedidos': pedidos,
    }
    return render(request, 'cocina_dashboard.html', context)

#Listar datos de la base de datos - Panel caja

@login_required
def caja_dashboard(request):
    productos = Inventario.objects.all()
    pedidos_en_mesa = Pedido.objects.filter(estado='En mesa').order_by('fecha_pedido')

    context = {
        'productos': productos,
        'pedidos_en_mesa': pedidos_en_mesa,
    }
    return render(request, 'caja_dashboard.html', context)