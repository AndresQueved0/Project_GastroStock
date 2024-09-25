from django import forms
from django.contrib.auth.forms import AuthenticationForm
from .models import CustomUser, Inventario, Empleados, Mesa, MenuItem
from django.utils import timezone

# Formulario de autenticación personalizado

class CustomLoginForm(AuthenticationForm):
    user_type = forms.ChoiceField(
        choices=CustomUser.USER_TYPE_CHOICES, 
        required=True, 
        label='Tipo de Usuario',
        widget=forms.Select(attrs={'class': 'form-select'})
    )

    class Meta:
        model = CustomUser
        fields = ['username', 'password', 'user_type']

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['username'].widget.attrs.update({'class': 'form-control'})
        self.fields['password'].widget.attrs.update({'class': 'form-control'})

# Formulario de registro producto personalizado

class InventarioForm(forms.ModelForm):
    class Meta:
        model = Inventario
        fields = ['nombre_producto', 'descripcion', 'cantidad', 'precio_unitario', 'categoria', 'fecha_expiracion', 'fecha_entrada']
        widgets = {
            'nombre_producto': forms.TextInput(attrs={'class': 'form-control'}),
            'descripcion': forms.Textarea(attrs={'class': 'form-control', 'rows': 3}),
            'cantidad': forms.NumberInput(attrs={'class': 'form-control'}),
            'precio_unitario': forms.NumberInput(attrs={'class': 'form-control'}),
            'categoria': forms.Select(attrs={'class': 'form-control'}),
            'fecha_expiracion': forms.DateInput(attrs={'class': 'form-control', 'type': 'date'}),
            'fecha_entrada': forms.DateInput(attrs={'class': 'form-control', 'type': 'date'}),
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Establecer la fecha actual como valor inicial para fecha_entrada
        self.fields['fecha_entrada'].initial = timezone.now().date()



class EmpleadoForm(forms.ModelForm):
    class Meta:
        model = Empleados
        fields = ['nombre', 'apellido', 'puesto', 'telefono', 'fecha_contratacion', 'foto']
        widgets = {
            'nombre': forms.TextInput(attrs={'class': 'form-control'}),
            'apellido': forms.TextInput(attrs={'class': 'form-control'}),
            'puesto': forms.TextInput(attrs={'class': 'form-control'}),
            'telefono': forms.TextInput(attrs={'class': 'form-control'}),
            'fecha_contratacion': forms.DateInput(attrs={'class': 'form-control', 'type': 'date'}),
            'foto': forms.FileInput(attrs={'class': 'form-control'}),
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['fecha_contratacion'].initial = timezone.now().date()

class MesaForm(forms.ModelForm):
    class Meta:
        model = Mesa
        fields = ['nombre', 'estado', 'ubicacion']
        widgets = {
            'nombre': forms.TextInput(attrs={'class': 'form-control'}),
            'estado': forms.TextInput(attrs={'class': 'form-control'}),
            'ubicacion': forms.Select(attrs={'class': 'form-control'}),
        }

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