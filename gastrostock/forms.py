from django import forms
from django.contrib.auth.forms import AuthenticationForm
from .models import CustomUser, Inventario, Empleado, Mesa, MenuItem, Receta, IngredienteReceta, Puesto
from django.utils import timezone
from django.contrib.auth import get_user_model

# Formulario de autenticación personalizado

class CustomLoginForm(AuthenticationForm):
    class Meta:
        model = CustomUser
        fields = ['username', 'password']

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['username'].widget.attrs.update({'class': 'form-control'})
        self.fields['password'].widget.attrs.update({'class': 'form-control'})

# Formulario de registro producto personalizado

class InventarioForm(forms.ModelForm):
    class Meta:
        model = Inventario
        fields = ['nombre_producto', 'descripcion', 'cantidad', 'unidad_medida', 
                'precio_unitario', 'categoria', 'fecha_expiracion', 'fecha_entrada']
        widgets = {
            'nombre_producto': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Ingrese el nombre del producto'
            }),
            'descripcion': forms.Textarea(attrs={
                'class': 'form-control',
                'rows': 3,
                'placeholder': 'Ingrese la descripción del producto'
            }),
            'cantidad': forms.NumberInput(attrs={
                'class': 'form-control',
                'placeholder': 'Ingrese la cantidad'
            }),
            'unidad_medida': forms.Select(attrs={
                'class': 'form-control'
            }),
            'precio_unitario': forms.NumberInput(attrs={
                'class': 'form-control',
                'placeholder': 'Ingrese el precio unitario'
            }),
            'categoria': forms.Select(attrs={
                'class': 'form-control'
            }),
            'fecha_expiracion': forms.DateInput(attrs={
                'class': 'form-control',
                'type': 'date'
            }),
            'fecha_entrada': forms.DateInput(attrs={
                'class': 'form-control',
                'type': 'date'
            }),
        }
        labels = {
            'nombre_producto': 'Nombre del Producto',
            'descripcion': 'Descripción',
            'cantidad': 'Cantidad',
            'unidad_medida': 'Unidad de Medida',
            'precio_unitario': 'Precio Unitario',
            'categoria': 'Categoría',
            'fecha_expiracion': 'Fecha de Expiración',
            'fecha_entrada': 'Fecha de Entrada'
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Establecer la fecha actual como valor inicial para fecha_entrada
        self.fields['fecha_entrada'].initial = timezone.now().date()
        
        # Agregar clases para validación
        for field in self.fields:
            if self.errors.get(field):
                self.fields[field].widget.attrs['class'] += ' is-invalid'

class EmpleadoForm(forms.ModelForm):
    class Meta:
        model = Empleado
        fields = ['nombre', 'apellido', 'puesto', 'telefono', 'fecha_contratacion', 'foto']
        widgets = {
            'nombre': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Ingrese el nombre'
            }),
            'apellido': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Ingrese el apellido'
            }),
            'puesto': forms.Select(attrs={
                'class': 'form-control',
                'placeholder': 'Selecciona el puesto'
            }),
            'telefono': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Ingrese el teléfono'
            }),
            'fecha_contratacion': forms.DateInput(attrs={
                'class': 'form-control',
                'type': 'date'
            }),
            'foto': forms.FileInput(attrs={
                'class': 'form-control'
            }),
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['fecha_contratacion'].initial = timezone.now().date()
        self.fields['puesto'].queryset = Puesto.objects.all().order_by('nombre')
        self.fields['puesto'].empty_label = "Seleccione un puesto"
        # Hacer el campo de foto opcional
        self.fields['foto'].required = False

    def clean_telefono(self):
        telefono = self.cleaned_data.get('telefono')
        if telefono:
            telefono = ''.join(filter(str.isdigit, telefono))
            if len(telefono) < 8 or len(telefono) > 15:
                raise forms.ValidationError('El número de teléfono debe tener entre 8 y 15 dígitos')
        return telefono

    def clean(self):
        cleaned_data = super().clean()
        # Si no se subió una nueva foto, mantener la existente
        if not cleaned_data.get('foto') and self.instance.foto:
            cleaned_data['foto'] = self.instance.foto
        return cleaned_data

class MesaForm(forms.ModelForm):
    class Meta:
        model = Mesa
        fields = ['nombre', 'estado', 'ubicacion']
        widgets = {
            'nombre': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Nombre de la mesa'}),
            'estado': forms.TextInput(attrs={'class': 'form-control', 'readonly': 'readonly'}),
            'ubicacion': forms.Select(attrs={'class': 'form-control custom-select'}),
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Establecer un valor predeterminado para el campo 'estado'
        self.fields['estado'].initial = 'disponible'  # Cambia 'Disponible' por el valor predeterminado que desees
        # Cambiar el texto del placeholder para el campo 'ubicacion'
        self.fields['ubicacion'].empty_label = 'Seleccione una ubicación'  # Cambia el texto según sea necesario
        


class MenuItemForm(forms.ModelForm):
    class Meta:
        model = MenuItem
        fields = ['nombre', 'descripcion', 'precio', 'categoria', 'imagen']
        widgets = {
            'descripcion': forms.Textarea(attrs={'rows': 3, 'class': 'form-control'}),
            'precio': forms.NumberInput(attrs={'step': '0.01', 'class': 'form-control'}),
            'nombre': forms.TextInput(attrs={'class': 'form-control'}),
            'categoria': forms.Select(attrs={'class': 'form-control'}),
            'imagen': forms.FileInput(attrs={'class': 'form-control'}),
        }

class RecetaForm(forms.ModelForm):
    class Meta:
        model = Receta
        fields = ['menu_item', 'nombre', 'descripcion']
        widgets = {
            'descripcion': forms.Textarea(attrs={'rows': 4}),
        }

class IngredienteRecetaForm(forms.ModelForm):
    class Meta:
        model = IngredienteReceta
        fields = ['inventario_item', 'cantidad']

IngredienteRecetaFormSet = forms.inlineformset_factory(
    Receta,
    IngredienteReceta,
    form=IngredienteRecetaForm,
    extra=1,
    can_delete=True
)