from django.db import models
from django.utils import timezone
from django.contrib.auth.models import AbstractUser
from django.core.exceptions import ValidationError
from django.conf import settings

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
    UNIDAD_CHOICES = (
        ('kg', 'Kilogramos'),
        ('lb', 'Libras'),
        ('pz', 'Piezas'),
        ('l', 'Litros'),
        ('ml', 'Mililitros'),
    )

    id = models.AutoField(primary_key=True)
    nombre_producto = models.CharField(max_length=255)
    descripcion = models.TextField(blank=True)
    cantidad = models.DecimalField(max_digits=3, decimal_places=1)
    unidad_medida = models.CharField(max_length=2, choices=UNIDAD_CHOICES, default='kg')
    precio_unitario = models.DecimalField(max_digits=10, decimal_places=0)
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
        return f'{self.nombre_producto} - {self.cantidad} {self.get_unidad_medida_display()}'

#MODELO QUE CONTENDRA LOS PUESTOS PARA EL FORMULARIO DE REGISTRO DE EMPLEADOS
class Puesto(models.Model):
    id = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=100, unique=True)
    descripcion = models.TextField(blank=True)
    
    def __str__(self):
        return self.nombre
    
    class Meta:
        ordering = ['nombre']

#MODELO QUE CONTENDRA LOS EMPLEADOS REGISTRADOS EN EL RESTAURANTE
class Empleado(models.Model):
    id = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=100)
    apellido = models.CharField(max_length=100)
    telefono = models.CharField(max_length=15)
    direccion = models.TextField(blank=True)
    puesto = models.ForeignKey(Puesto, on_delete=models.PROTECT)
    fecha_contratacion = models.DateField(default=timezone.now)
    fecha_terminacion = models.DateField(null=True, blank=True)
    foto = models.ImageField(upload_to='empleados_fotos/', null=True, blank=True)
    # Opcional: relación con el usuario del sistema si el empleado necesita acceso
    usuario = models.OneToOneField(
        CustomUser,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='empleado'
    )

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
    

#MODELO QUE ALMACENA LOS PEDIDOS EN GENERAL DEL RESTAURANTE

class Pedido(models.Model):
    ESTADO_CHOICES = [
        ('Pedido realizado', 'Pedido realizado'),
        ('Listo para entregar', 'Listo para entregar'),
        ('Pedido en mesa', 'Pedido en mesa'),
        ('Pagado', 'Pagado'),
    ]
    
    id = models.AutoField(primary_key=True)
    mesa = models.ForeignKey('Mesa', on_delete=models.CASCADE)
    fecha_pedido = models.DateTimeField(default=timezone.now)
    estado = models.CharField(max_length=50, choices=ESTADO_CHOICES, default='Pedido realizado')
    precio_total = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    metodo_pago = models.CharField(max_length=50, blank=True, null=True)

    def save(self, *args, **kwargs):
        # Si el estado cambia a 'Pagado', descontar del inventario
        if self.estado == 'Pagado':
            for item in self.items.all():
                if not item.inventario_descontado:
                    item.descontar_inventario()
        
        super().save(*args, **kwargs)

    def actualizar_precio_total(self):
        self.precio_total = sum(item.precio_unitario * item.cantidad for item in self.items.all())
        self.save()

    def precio_total_formateado(self):
        return self.formatear_precio(self.precio_total)

    @staticmethod
    def formatear_precio(precio):
        precio_entero = int(precio)
        precio_str = f"{precio_entero:,}".replace(",", ".")
        return f"${precio_str}"

    def __str__(self):
        return f"Pedido {self.id} - Mesa {self.mesa.nombre}"

    class Meta:
        ordering = ['-fecha_pedido']


#MODELO QUE ALMACENA LOS PLATOS QUE SE REALIZAN EN DICHOS PEDIDOS

class PedidoItem(models.Model):
    pedido = models.ForeignKey('Pedido', related_name='items', on_delete=models.CASCADE)
    item_menu = models.ForeignKey('MenuItem', on_delete=models.CASCADE)
    cantidad = models.PositiveIntegerField()
    precio_unitario = models.DecimalField(max_digits=10, decimal_places=2)
    inventario_descontado = models.BooleanField(default=False)

    def descontar_inventario(self):
        if not self.inventario_descontado:
            try:
                receta = self.item_menu.receta
                ingredientes = receta.ingredientes.all()
                
                # Verificar si hay suficiente inventario
                for ingrediente in ingredientes:
                    cantidad_necesaria = ingrediente.cantidad * self.cantidad
                    if ingrediente.inventario_item.cantidad < cantidad_necesaria:
                        raise ValidationError(
                            f"No hay suficiente {ingrediente.inventario_item.nombre_producto} "
                            f"en inventario. Necesario: {cantidad_necesaria}, "
                            f"Disponible: {ingrediente.inventario_item.cantidad}"
                        )

                # Descontar del inventario
                for ingrediente in ingredientes:
                    cantidad_total = ingrediente.cantidad * self.cantidad
                    inventario_item = ingrediente.inventario_item
                    inventario_item.cantidad -= cantidad_total
                    inventario_item.save()

                self.inventario_descontado = True
                self.save()
            
            except Receta.DoesNotExist:
                raise ValidationError(f"No existe receta para {self.item_menu.nombre}")

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        self.pedido.actualizar_precio_total()

    @property
    def precio_total(self):
        return self.cantidad * self.precio_unitario

    def precio_unitario_formateado(self):
        return Pedido.formatear_precio(self.precio_unitario)

    def precio_total_formateado(self):
        return Pedido.formatear_precio(self.precio_total)

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        self.pedido.actualizar_precio_total()

    def __str__(self):
        return f"{self.cantidad} x {self.item_menu.nombre}"

#MODELO QUE ALMACENA LAS RECETA DE LOS PALTOS EXISTENTES EN EL MENU

class Receta(models.Model):
    id = models.AutoField(primary_key=True)
    menu_item = models.OneToOneField('MenuItem', on_delete=models.CASCADE, related_name='receta')
    nombre = models.CharField(max_length=200)
    descripcion = models.TextField(blank=True)

    def __str__(self):
        return f"Receta para {self.menu_item.nombre}"

#MODELO QUE ALMACENA LOS INGREDIENTES QUE TIENE LA RECETA DE DICHOS PLATOS

class IngredienteReceta(models.Model):
    receta = models.ForeignKey(Receta, on_delete=models.CASCADE, related_name='ingredientes')
    inventario_item = models.ForeignKey('Inventario', on_delete=models.CASCADE)
    cantidad = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"{self.cantidad} de {self.inventario_item.nombre_producto} para {self.receta.nombre}"
