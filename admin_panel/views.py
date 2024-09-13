from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib.auth import authenticate, login
from django.contrib import messages
from .models import Inventario, Categoria, Empleados
from .forms import InventarioForm, CustomLoginForm, EmpleadoForm
from django.urls import reverse
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods


#Listar datos de base de datos - Admin dashboard

@login_required
def admin_dashboard(request):
    productos = Inventario.objects.all()
    empleados = Empleados.objects.all()
    initial_section = request.GET.get('section', 'inventario')
    
    context = {
        'productos': productos,
        'empleados': empleados,
        'initial_section': initial_section,
    }
    return render(request, 'admin_panel/admin_dashboard.html', context)

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

def admin_login(request):
    if request.method == 'POST':
        form = CustomLoginForm(request, data=request.POST)
        if form.is_valid():
            username = form.cleaned_data.get('username')
            password = form.cleaned_data.get('password')
            user_type = form.cleaned_data.get('user_type')
            user = authenticate(request, username=username, password=password)
            if user is not None:
                if user.user_type == user_type:
                    login(request, user)
                    if user_type == 'admin':
                        return redirect('admin_dashboard')
                    elif user_type == 'meseros':
                        return redirect('meseros_dashboard')
                    elif user_type == 'cocina':
                        return redirect('cocina_dashboard')
                    elif user_type == 'caja':
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
    productos = Inventario.objects.filter(cantidad__gt=0)
    context = {
        'productos': productos,
    }
    return render(request, 'admin_panel/meseros_dashboard.html', context)

#Listar datos de la base de datos - Panel cocina

@login_required
def cocina_dashboard(request):
    productos = Inventario.objects.all()
    context = {
        'productos': productos,
    }
    return render(request, 'admin_panel/cocina_dashboard.html', context)

#Listar datos de la base de datos - Panel caja

@login_required
def caja_dashboard(request):
    productos = Inventario.objects.all()
    context = {
        'productos': productos,
    }
    return render(request, 'admin_panel/caja_dashboard.html', context)

