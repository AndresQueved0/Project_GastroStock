from django.shortcuts import render, redirect, get_object_or_404
from django.views.decorators.http import require_POST
from django.contrib.auth.decorators import login_required
from django.contrib.auth import authenticate, login as auth_login
from django.contrib import messages
from .models import CustomUser, Inventario, Categoria, Empleado, Mesa, Ubicacion, MenuItem, CategoriaMenu, Pedido, PedidoItem, Receta, IngredienteReceta, Puesto
from .forms import InventarioForm, CustomLoginForm, EmpleadoForm, MesaForm, MenuItemForm, RecetaForm, IngredienteRecetaFormSet
from django.views.generic import ListView
from django.urls import reverse
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
import json
from datetime import datetime
from django.db import transaction
from django.db.models import Q
from decimal import Decimal
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync


#Vista de login (Validacion de credenciales, redireccionamiento a dashboard segun el tipo de usuario)

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


#Vista de Admin dashboard (Llamado de datos alojados en la base de datos, filtro por ubicaciones, formularios de registro)

@login_required
def admin_dashboard(request):
    custom_user = CustomUser.objects.all()
    productos = Inventario.objects.all()
    empleados = Empleado.objects.all()
    mesas = Mesa.objects.all()
    ubicaciones = Ubicacion.objects.all()
    categorias_menu = CategoriaMenu.objects.prefetch_related('items').all()
    menu_items = MenuItem.objects.all()
    recetas = Receta.objects.all()
    initial_section = request.GET.get('section', 'inventario')
    
    # Filtrar mesas por ubicación
    ubicacion_id = request.GET.get('ubicacion', 'todas')
    if ubicacion_id != 'todas' and ubicacion_id.isdigit():
        mesas = mesas.filter(ubicacion_id=ubicacion_id)
    
    # Verificar si la solicitud es AJAX para renderizar solo las mesas
    if request.headers.get('x-requested-with') == 'XMLHttpRequest':
        return render(request, 'mesas.html', {'mesas': mesas})
    
    # Inicializar los formularios
    inventario_form = InventarioForm()
    mesa_form = MesaForm()
    empleado_form = EmpleadoForm()
    menu_item_form = MenuItemForm()
    
    if request.method == 'POST':
        # Determinar qué formulario se está enviando
        if 'form_type' in request.POST:
            if request.POST['form_type'] == 'mesa':
                mesa_form = MesaForm(request.POST)
                if mesa_form.is_valid():
                    mesa_form.save()
                    messages.success(request, 'Mesa registrada con éxito.', extra_tags='mesa_success')
                    return redirect(f"{reverse('admin_dashboard')}?section=mesas")
            
            elif request.POST['form_type'] == 'empleado':
                empleado_form = EmpleadoForm(request.POST, request.FILES)
                if empleado_form.is_valid():
                    empleado_form.save()
                    messages.success(request, 'Empleado registrado con éxito.', extra_tags='empleado_success')
                    return redirect(f"{reverse('admin_dashboard')}?section=empleados")
            
            elif request.POST['form_type'] == 'menu_item':
                menu_item_form = MenuItemForm(request.POST, request.FILES)
                if menu_item_form.is_valid():
                    menu_item_form.save()
                    messages.success(request, 'Elemento del menú agregado con éxito.', extra_tags='menu_success')
                    return redirect(f"{reverse('admin_dashboard')}?section=menu")
                
            elif request.POST['form_type'] == 'inventario':
                inventario_form = InventarioForm(request.POST, request.FILES)
                if inventario_form.is_valid():
                    inventario_form.save()
                    messages.success(request, 'Producto agregado con éxito.', extra_tags='producto_success')
                    return redirect(f"{reverse('admin_dashboard')}?section=inventario")
                
    context = {
        'custom_user' : custom_user,
        'productos': productos,
        'empleados': empleados,
        'mesas': mesas,
        'ubicaciones': ubicaciones,
        'categorias_menu': categorias_menu,
        'menu_items': menu_items,
        'recetas': recetas,
        'mesa_form': mesa_form,
        'empleado_form': empleado_form,
        'menu_item_form': menu_item_form,
        'inventario_form': inventario_form,
        'ubicacion_seleccionada': ubicacion_id,
        'initial_section': initial_section,
        'time': datetime.now().timestamp(),
    }
    
    return render(request, 'admin_dashboard.html', context)


#Registro de empleados en la vista de Admin Dashboard por medio del formulario EmpleadoForm

@login_required
@require_http_methods(["GET", "POST"])

def registrar_empleado(request):
    if request.method == 'POST':
        form = EmpleadoForm(request.POST, request.FILES)
        if form.is_valid():
            try:
                form.save()
                
                # Respuesta JSON para solicitudes AJAX
                if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                    return JsonResponse({
                        'success': True,
                        'message': 'Empleado registrado con éxito.'
                    })
                else:
                    # Redirección para solicitudes normales
                    messages.success(request, 'Empleado registrado con éxito.', extra_tags='empleado_success')
                    return redirect('admin_dashboard')
            except Exception as e:
                return JsonResponse({
                    'success': False,
                    'message': 'Error interno: ' + str(e)
                }, status=500)
        else:
            # Respuesta con errores de validación del formulario
            return JsonResponse({
                'success': False,
                'message': 'Por favor, verifica los datos ingresados.',
                'errors': dict(form.errors.items())
            }, status=400)
    
    # Si es GET, se crea un nuevo formulario
    form = EmpleadoForm()
    return render(request, 'admin_dashboard.html', {
        'empleado_form': form,
    })



#Eliminar empleados de la vista de Admin Dashboard complementado por funciones en JavaScript

@require_http_methods(["POST"])

def borrar_empleado(request, empleado_id):
    try:
        empleado = get_object_or_404(Empleado, id=empleado_id)
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


#Editar informacion de los empleados en la vista Admin dashboard complementado por funciones en JavaScript

def editar_empleado(request, empleado_id):
    empleado = get_object_or_404(Empleado, id=empleado_id)
    
    if request.method == 'POST':
        form = EmpleadoForm(request.POST, request.FILES or None, instance=empleado)
        
        if form.is_valid():
            if not form.cleaned_data.get('foto') and empleado.foto:
                form.instance.foto = empleado.foto  # Mantener la foto existente si no se ha subido una nueva
            form.save()
            return JsonResponse({
                'success': True,
                'message': 'Empleado actualizado con éxito.'
            })
        else:
            # Devolver los errores en caso de fallo de validación
            return JsonResponse({
                'success': False,
                'message': 'Error al actualizar el empleado. Por favor, verifica los datos.',
                'errors': dict(form.errors.items())
            }, status=400)
    
    # Obtener datos para formulario de edición
    data = {
        "nombre": empleado.nombre,
        "apellido": empleado.apellido,
        "puesto": empleado.puesto.id,
        "puesto_nombre": empleado.puesto.nombre,
        "telefono": empleado.telefono,
        "fecha_contratacion": empleado.fecha_contratacion.strftime('%Y-%m-%d') if empleado.fecha_contratacion else "",
        "foto": empleado.foto.url if empleado.foto else "",
    }
    return JsonResponse(data)


#Agregar productos al inventario en la vista de Admin dashboard complementado con funciones por JavaScript

@login_required
@require_http_methods(["GET", "POST"])

def agregar_producto(request):
    if request.method == 'POST':
        form = InventarioForm(request.POST)
        if form.is_valid():
            inventario = form.save()  # Usa minúscula aquí
            
            # Verificar si es una petición AJAX
            if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                return JsonResponse({
                    'status': 'success',
                    'message': 'Producto registrado con éxito.'
                })
            else:
                messages.success(request, 'Producto registrado con éxito.', extra_tags='mesa_success')
                return redirect('admin_dashboard')
        else:
            # Manejar errores de validación
            if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                errors = {field: str(errors[0]) for field, errors in form.errors.items()}
                return JsonResponse({
                    'status': 'error',
                    'message': 'Por favor, verifica los datos ingresados.',
                    'errors': errors
                }, status=400)
            
    else:
        form = MesaForm()
    
    return render(request, 'admin_dashboard.html', {'form': form, 'inventario_form': form})  # Añade mesa_form al contexto


#Elimina los productos registrados en el inventario en la vista de Admin dashboard complementado con funciones en JavaScript

@login_required
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
    

#Registra platos en el menu en la vista de Admin Dashboard por medio del formulario MenuItemForm

@login_required

def registrar_producto_menu(request):
    if request.method == 'POST':
        form = MenuItemForm(request.POST, request.FILES)
        if form.is_valid():
            menuitem = form.save()
            if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                return JsonResponse({
                    'status': 'success',
                    'message': 'Producto registrado exitosamente.'
                })
            messages.success(request, 'Producto registrado exitosamente.')
            return redirect('admin_dashboard')
        else:
            if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                return JsonResponse({
                    'status': 'error',
                    'message': 'Por favor, corrija los errores en el formulario.',
                    'errors': form.errors
                }, status=400)
    else:
        form = MenuItemForm()
    
    return render(request, 'admin_dashboard.html', {'form': form, 'menuitem_form': form})

#Eliminar platos registrados en el menu en la vista de Admin Dasboard complementado con funciones en JavasScript

@login_required

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



#Listar datos de la base de datos - Panel meseros

@login_required
def meseros_dashboard(request):
    verificar_mesas_disponibles()  # Asegúrate de que esta función está definida
    obtener_pedidos(request)  # Asegúrate de que esta función está definida

    # Obtener todas las mesas
    mesas = Mesa.objects.all()
    ubicaciones = Ubicacion.objects.all()
    categorias_menu = CategoriaMenu.objects.prefetch_related('items').all()
    listo_para_entregar = Pedido.objects.filter(estado='Listo para entregar').order_by('fecha_pedido')
    pedido_realizado = Pedido.objects.filter(estado='Pedido realizado').order_by('fecha_pedido')

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
        'listo_para_entregar': listo_para_entregar,
        'pedido_realizado': pedido_realizado,
        'time': datetime.now().timestamp()
    }

    return render(request, 'meseros_dashboard.html', context)


def obtener_detalles_pedido(request, pedido_id):
    try:
        pedido = Pedido.objects.get(id=pedido_id)
        items = pedido.items.all()
        items_data = [{
            'nombre': item.item_menu.nombre,
            'cantidad': item.cantidad,
            'precio': Pedido.formatear_precio(item.precio_unitario)  # Formatear el precio
        } for item in items]

        data = {
            'mesa': {
                'nombre': pedido.mesa.nombre,
                'ubicacion': str(pedido.mesa.ubicacion)  # Asegúrate de que la ubicación sea una cadena
            },
            'items': items_data,
            'precio_total': pedido.precio_total_formateado()
        }
        return JsonResponse(data)
    except Pedido.DoesNotExist:
        return JsonResponse({'error': 'Pedido no encontrado'}, status=404)

def verificar_mesas_disponibles():
    # Obtener todas las mesas
    mesas = Mesa.objects.all()

    # Verificar si hay pedidos activos para cada mesa
    for mesa in mesas:
        pedidos_realizados = Pedido.objects.filter(mesa=mesa).filter(
            Q(estado='Listo para entregar') | Q(estado='Pedido realizado')
        )

        # Si no hay pedidos activos, cambiar el estado de la mesa a "disponible"
        if not pedidos_realizados.exists():
            mesa.estado = 'disponible'
            mesa.save()

def obtener_pedidos(request):
    pedidos_preparados = Pedido.objects.filter(estado='Listo para entregar').order_by('fecha_pedido')
    listo_para_entregar= Pedido.objects.filter(estado='Listo para entregar').order_by('fecha_pedido')
    pedido_realizado = Pedido.objects.filter(estado='Pedido realizado').order_by('fecha_pedido')
    context = {
        'pedidos_preparados': pedidos_preparados,
        'listo_para_entregar': listo_para_entregar,
        'pedido_realizado': pedido_realizado,
    }

    return render(request, 'admin_panel/pedidos_list.html', context)

def obtener_estado_mesa(request, mesa_id):
    try:
        mesa = Mesa.objects.get(id=mesa_id)
        estado = mesa.estado  # Esto devuelve 'disponible' o 'ocupada'
        return JsonResponse({'estado': estado})
    except Mesa.DoesNotExist:
        return JsonResponse({'error': 'Mesa no encontrada'}, status=404)





@login_required
@require_http_methods(["GET", "POST"])

def registro_mesas(request):
    if request.method == 'POST':
        form = MesaForm(request.POST)
        if form.is_valid():
            mesa = form.save()  # Usa minúscula aquí
            
            # Verificar si es una petición AJAX
            if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                return JsonResponse({
                    'status': 'success',
                    'message': 'Mesa registrada con éxito.'
                })
            else:
                messages.success(request, 'Mesa registrada con éxito.', extra_tags='mesa_success')
                return redirect('admin_dashboard')
        else:
            # Manejar errores de validación
            if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                errors = {field: str(errors[0]) for field, errors in form.errors.items()}
                return JsonResponse({
                    'status': 'error',
                    'message': 'Por favor, verifica los datos ingresados.',
                    'errors': errors
                }, status=400)
            
    else:
        form = MesaForm()
    
    return render(request, 'admin_dashboard.html', {'form': form, 'mesa_form': form})  # Añade mesa_form al contexto



@transaction.atomic
def registrar_pedido(request):
    data = json.loads(request.body)
    mesa_id = data.get('mesa_id')
    items_pedido = json.loads(data.get('items_pedido'))
    precio_total_pedido = Decimal(data.get('precio_total', '0'))  # Convertir a Decimal

    try:
        mesa = Mesa.objects.get(id=mesa_id)

        # Cambiar el estado de la mesa a "ocupada"
        mesa.estado = 'ocupada'
        mesa.save()

        pedido = Pedido.objects.create(
            mesa=mesa,
            precio_total=precio_total_pedido  # Usar el precio total proporcionado por el cliente
        )

        for item in items_pedido:
            menu_item = MenuItem.objects.get(id=item['id'])
            PedidoItem.objects.create(
                pedido=pedido,
                item_menu=menu_item,
                cantidad=item['cantidad'],
                precio_unitario=menu_item.precio
            )

        # Verificar si el precio total calculado en el servidor coincide con el del cliente
        pedido.actualizar_precio_total()
        if abs(pedido.precio_total - precio_total_pedido) > Decimal('0.01'):  # Permitir una pequeña diferencia por redondeo
            # Loguear la discrepancia pero mantener el precio del cliente
            print(f"Discrepancia en precio total para pedido {pedido.id}: Cliente {precio_total_pedido}, Servidor {pedido.precio_total}")

        return JsonResponse({
            'status': 'success',
            'message': 'Pedido registrado correctamente',
            'pedido_id': pedido.id,
            'mesa': pedido.mesa.nombre,
            'fecha_pedido': pedido.fecha_pedido.strftime("%d/%m/%Y %H:%M:%S"),
            'estado': pedido.get_estado_display(),
            'precio_total': pedido.precio_total_formateado()
        })
    except Exception as e:
        return JsonResponse({
            'status': 'error',
            'message': str(e)
        }, status=400)
    
@login_required
@require_POST
def cambiar_estado_pedido(request, pedido_id):
    nuevo_estado = request.POST.get('nuevo_estado')
    try:
        pedido = get_object_or_404(Pedido, id=pedido_id)
        pedido.estado = nuevo_estado
        pedido.save()

        return JsonResponse({'status': 'success', 'nuevo_estado': nuevo_estado})
    except Pedido.DoesNotExist:
        return JsonResponse({'status': 'error', 'message': 'Pedido no encontrado'}, status=404)
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=500)


@login_required
def cocina_dashboard(request):
    obtener_pedidos(request)
    productos = Inventario.objects.all()
    pedido_realizado = Pedido.objects.filter(estado='Pedido realizado').order_by('fecha_pedido')

    context = {
        'productos': productos,
        'pedido_realizado': pedido_realizado,
    }
    return render(request, 'cocina_dashboard.html', context)

#Listar datos de la base de datos - Panel caja

@login_required
def caja_dashboard(request):
    pedido_en_mesa = Pedido.objects.filter(estado='Pedido en mesa').order_by('fecha_pedido')

    context = {
        'pedido_en_mesa': pedido_en_mesa,
    }
    return render(request, 'caja_dashboard.html', context)

@login_required
def procesar_pago(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            pedido_id = data.get('pedido_id')
            metodo_pago = data.get('metodo_pago')

            pedido = Pedido.objects.get(id=pedido_id)
            pedido.estado = 'Pagado'
            pedido.metodo_pago = metodo_pago  # Asumiendo que tienes un campo para el método de pago
            pedido.save()

            return JsonResponse({'success': True, 'message': 'Pago procesado correctamente'})
        except Pedido.DoesNotExist:
            return JsonResponse({'success': False, 'message': 'Pedido no encontrado'}, status=404)
        except Exception as e:
            return JsonResponse({'success': False, 'message': str(e)}, status=400)
    else:
        return JsonResponse({'success': False, 'message': 'Método no permitido'}, status=405)

@login_required
def help_view(request):
    return render(request, 'landing_page.html')

class RecetaListView(ListView):
    model = Receta
    template_name = 'recetas/receta_list.html'
    context_object_name = 'recetas'

def receta_crear(request):
    if request.method == 'POST':
        form = RecetaForm(request.POST)
        formset = IngredienteRecetaFormSet(request.POST)  # Definir formset aquí también
        if form.is_valid():
            receta = form.save()
            formset = IngredienteRecetaFormSet(request.POST, instance=receta)
            if formset.is_valid():
                formset.save()
                messages.success(request, 'Receta creada exitosamente!')
                return redirect('receta_lista')
    else:
        form = RecetaForm()
        formset = IngredienteRecetaFormSet()

    return render(request, 'admin_panel/receta_form.html', {
        'form': form,
        'formset': formset,
    })

def receta_editar(request, pk):
    receta = get_object_or_404(Receta, pk=pk)
    if request.method == 'POST':
        form = RecetaForm(request.POST, instance=receta)
        if form.is_valid():
            receta = form.save()
            formset = IngredienteRecetaFormSet(request.POST, instance=receta)
            if formset.is_valid():
                formset.save()
                messages.success(request, 'Receta actualizada exitosamente!')
                return redirect('receta_lista')
    else:
        form = RecetaForm(instance=receta)
        formset = IngredienteRecetaFormSet(instance=receta)
    
    return render(request, 'admin_panel/receta_form.html', {
        'form': form,
        'formset': formset,
        'receta': receta
    })

def receta_eliminar(request, pk):
    receta = get_object_or_404(Receta, pk=pk)
    if request.method == 'POST':
        receta.delete()
        messages.success(request, 'Receta eliminada exitosamente!')
        return redirect('receta_lista')
    return render(request, 'admin_panel/receta_confirm_delete.html', {'receta': receta})