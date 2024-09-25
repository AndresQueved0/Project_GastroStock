from django.db import models
from django.utils import timezone
from django.contrib.auth.models import AbstractUser

# Usuario personalizado
class CustomUser(AbstractUser):
    USER_TYPE_CHOICES = (
        ('admin', 'Admin'),
        ('meseros', 'Meseros'),
        ('cocina', 'Cocina'),
        ('caja', 'Caja'),
    )
    user_type = models.CharField(max_length=10, choices=USER_TYPE_CHOICES, default='meseros')

    def __str__(self):
        return f"{self.username} - {self.get_user_type_display()}"

# Categoría
class Categoria(models.Model):
    id = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.nombre

# Inventario
class InventarioManager(models.Manager):
    def productos_disponibles(self):
        return self.filter(cantidad__gt=0)

    def productos_por_categoria(self, categoria):
        return self.filter(categoria=categoria)

    def productos_cercanos_a_expiracion(self, dias=7):
        fecha_limite = timezone.now().date() + timezone.timedelta(days=dias)
        return self.filter(fecha_expiracion__lte=fecha_limite)

class Inventario(models.Model):
    id = models.AutoField(primary_key=True)
    nombre_producto = models.CharField(max_length=255)
    descripcion = models.TextField(blank=True)
    cantidad = models.PositiveIntegerField()
    precio_unitario = models.DecimalField(max_digits=10, decimal_places=2)
    categoria = models.ForeignKey(Categoria, on_delete=models.CASCADE)
    fecha_expiracion = models.DateField(null=True, blank=True)
    fecha_entrada = models.DateField(default=timezone.now)
    fecha_salida = models.DateField(null=True, blank=True)

    objects = InventarioManager()

    class Meta:
        ordering = ['-fecha_entrada']
        indexes = [
            models.Index(fields=['nombre_producto']),
            models.Index(fields=['fecha_entrada']),
        ]

    def __str__(self):
        return f'{self.nombre_producto} - Cantidad: {self.cantidad}'

# Empleados
class Empleados(models.Model):
    id = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=100)
    apellido = models.CharField(max_length=100)
    telefono = models.CharField(max_length=15)
    direccion = models.TextField(blank=True)
    puesto = models.CharField(max_length=100)
    fecha_contratacion = models.DateField(default=timezone.now)
    fecha_terminacion = models.DateField(null=True, blank=True)
    foto = models.ImageField(upload_to='empleados_fotos/', null=True, blank=True)

    class Meta:
        ordering = ['nombre', 'apellido']

    def __str__(self):
        return f'{self.nombre} {self.apellido} - {self.puesto}'

# Ubicación
class Ubicacion(models.Model):
    id = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.nombre

# Mesa
class Mesa(models.Model):
    ESTADO_CHOICES = [
        ('disponible', 'Disponible'),
        ('ocupada', 'Ocupada'),
    ]
    id = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=50, unique=True)
    estado = models.CharField(max_length=10, choices=ESTADO_CHOICES, default='disponible')
    ubicacion = models.ForeignKey(Ubicacion, on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.nombre} - {self.get_estado_display()}"

    def ocupar(self):
        self.estado = 'ocupada'
        self.save()

    def liberar(self):
        self.estado = 'disponible'
        self.save()

# Categoría del menú
class CategoriaMenu(models.Model):
    id = models.AutoField(primary_key=True)  # Agregando id explícito
    nombre = models.CharField(max_length=100)

    def __str__(self):
        return self.nombre

# Item del menú
class MenuItem(models.Model):
    id = models.AutoField(primary_key=True)  # Agregando id explícito
    nombre = models.CharField(max_length=200)
    descripcion = models.TextField(blank=True)
    precio = models.DecimalField(max_digits=10, decimal_places=2)
    categoria = models.ForeignKey(CategoriaMenu, on_delete=models.CASCADE, related_name='items')
    imagen = models.ImageField(upload_to='menu_items/', blank=True, null=True)

    def __str__(self):
        return self.nombre

    def precio_formateado(self):
        precio_entero = int(self.precio)  # Convierte el precio a entero, eliminando los decimales
        precio_str = f"{precio_entero:,}".replace(",", ".")  # Formatea con puntos como separadores de miles
        return f"${precio_str}"
    

#pedidos
class Pedido(models.Model):
    ESTADO_CHOICES = [
        ('activo', 'Activo'),
        ('pagado', 'Pagado'),
    ]

    id = models.AutoField(primary_key=True)
    mesa = models.ForeignKey('Mesa', on_delete=models.CASCADE)
    item_menu = models.ForeignKey('MenuItem', on_delete=models.CASCADE)
    cantidad = models.PositiveIntegerField()
    precio_unitario = models.DecimalField(max_digits=10, decimal_places=2)
    fecha_pedido = models.DateTimeField(default=timezone.now)
    precio_total = models.DecimalField(max_digits=10, decimal_places=2)
    estado = models.CharField(max_length=10, choices=ESTADO_CHOICES, default='activo')

    def save(self, *args, **kwargs):
        # Calcula el precio total antes de guardar
        self.precio_total = self.cantidad * self.precio_unitario
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Pedido {self.id} - Mesa {self.mesa.nombre} - {self.item_menu.nombre}"

    class Meta:
        ordering = ['-fecha_pedido']