from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone

#Administrador de usuarios personalizado

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

#Productos

class Categoria(models.Model):
    nombre = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.nombre

class InventarioManager(models.Manager):
    def productos_disponibles(self):
        """
        Devuelve todos los productos cuya cantidad sea mayor a 0.
        """
        return self.filter(cantidad__gt=0)

    def productos_por_categoria(self, categoria):
        """
        Devuelve todos los productos en una categoría específica.
        """
        return self.filter(categoria=categoria)

    def productos_cercanos_a_expiracion(self, dias=7):
        """
        Devuelve todos los productos que expiran dentro de los próximos 'dias' días.
        """
        fecha_limite = timezone.now().date() + timezone.timedelta(days=dias)
        return self.filter(fecha_expiracion__lte=fecha_limite)

class Inventario(models.Model):
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

class Empleados(models.Model):
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