# Generated by Django 5.1 on 2024-11-07 23:01

import django.contrib.auth.models
import django.contrib.auth.validators
import django.db.models.deletion
import django.utils.timezone
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('auth', '0012_alter_user_first_name_max_length'),
    ]

    operations = [
        migrations.CreateModel(
            name='Categoria',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('nombre', models.CharField(max_length=100, unique=True)),
            ],
        ),
        migrations.CreateModel(
            name='CategoriaMenu',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('nombre', models.CharField(max_length=100)),
            ],
        ),
        migrations.CreateModel(
            name='Empleados',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('nombre', models.CharField(max_length=100)),
                ('apellido', models.CharField(max_length=100)),
                ('telefono', models.CharField(max_length=15)),
                ('direccion', models.TextField(blank=True)),
                ('puesto', models.CharField(max_length=100)),
                ('fecha_contratacion', models.DateField(default=django.utils.timezone.now)),
                ('fecha_terminacion', models.DateField(blank=True, null=True)),
                ('foto', models.ImageField(blank=True, null=True, upload_to='empleados_fotos/')),
            ],
            options={
                'ordering': ['nombre', 'apellido'],
            },
        ),
        migrations.CreateModel(
            name='Mesa',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('nombre', models.CharField(max_length=50, unique=True)),
                ('estado', models.CharField(choices=[('disponible', 'Disponible'), ('ocupada', 'Ocupada')], default='disponible', max_length=10)),
            ],
        ),
        migrations.CreateModel(
            name='Ubicacion',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('nombre', models.CharField(max_length=100, unique=True)),
            ],
        ),
        migrations.CreateModel(
            name='CustomUser',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('password', models.CharField(max_length=128, verbose_name='password')),
                ('last_login', models.DateTimeField(blank=True, null=True, verbose_name='last login')),
                ('is_superuser', models.BooleanField(default=False, help_text='Designates that this user has all permissions without explicitly assigning them.', verbose_name='superuser status')),
                ('username', models.CharField(error_messages={'unique': 'A user with that username already exists.'}, help_text='Required. 150 characters or fewer. Letters, digits and @/./+/-/_ only.', max_length=150, unique=True, validators=[django.contrib.auth.validators.UnicodeUsernameValidator()], verbose_name='username')),
                ('first_name', models.CharField(blank=True, max_length=150, verbose_name='first name')),
                ('last_name', models.CharField(blank=True, max_length=150, verbose_name='last name')),
                ('email', models.EmailField(blank=True, max_length=254, verbose_name='email address')),
                ('is_staff', models.BooleanField(default=False, help_text='Designates whether the user can log into this admin site.', verbose_name='staff status')),
                ('is_active', models.BooleanField(default=True, help_text='Designates whether this user should be treated as active. Unselect this instead of deleting accounts.', verbose_name='active')),
                ('date_joined', models.DateTimeField(default=django.utils.timezone.now, verbose_name='date joined')),
                ('user_type', models.CharField(choices=[('admin', 'Admin'), ('meseros', 'Meseros'), ('cocina', 'Cocina'), ('caja', 'Caja')], default='meseros', max_length=10)),
                ('groups', models.ManyToManyField(blank=True, help_text='The groups this user belongs to. A user will get all permissions granted to each of their groups.', related_name='user_set', related_query_name='user', to='auth.group', verbose_name='groups')),
                ('user_permissions', models.ManyToManyField(blank=True, help_text='Specific permissions for this user.', related_name='user_set', related_query_name='user', to='auth.permission', verbose_name='user permissions')),
            ],
            options={
                'verbose_name': 'user',
                'verbose_name_plural': 'users',
                'abstract': False,
            },
            managers=[
                ('objects', django.contrib.auth.models.UserManager()),
            ],
        ),
        migrations.CreateModel(
            name='Inventario',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('nombre_producto', models.CharField(max_length=255)),
                ('descripcion', models.TextField(blank=True)),
                ('cantidad', models.PositiveIntegerField()),
                ('unidad_medida', models.CharField(choices=[('kg', 'Kilogramos'), ('lb', 'Libras'), ('pz', 'Piezas'), ('l', 'Litros'), ('ml', 'Mililitros')], default='kg', max_length=2)),
                ('precio_unitario', models.DecimalField(decimal_places=2, max_digits=10)),
                ('fecha_expiracion', models.DateField(blank=True, null=True)),
                ('fecha_entrada', models.DateField(default=django.utils.timezone.now)),
                ('fecha_salida', models.DateField(blank=True, null=True)),
                ('categoria', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='gastrostock.categoria')),
            ],
            options={
                'ordering': ['-fecha_entrada'],
            },
        ),
        migrations.CreateModel(
            name='MenuItem',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('nombre', models.CharField(max_length=200)),
                ('descripcion', models.TextField(blank=True)),
                ('precio', models.DecimalField(decimal_places=2, max_digits=10)),
                ('imagen', models.ImageField(blank=True, null=True, upload_to='menu_items/')),
                ('categoria', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='items', to='gastrostock.categoriamenu')),
            ],
        ),
        migrations.CreateModel(
            name='Pedido',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('fecha_pedido', models.DateTimeField(default=django.utils.timezone.now)),
                ('estado', models.CharField(choices=[('Pedido realizado', 'Pedido realizado'), ('Listo para entregar', 'Listo para entregar'), ('Pedido en mesa', 'Pedido en mesa'), ('Pagado', 'Pagado')], default='Pedido realizado', max_length=50)),
                ('precio_total', models.DecimalField(decimal_places=2, default=0, max_digits=10)),
                ('metodo_pago', models.CharField(blank=True, max_length=50, null=True)),
                ('mesa', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='gastrostock.mesa')),
            ],
            options={
                'ordering': ['-fecha_pedido'],
            },
        ),
        migrations.CreateModel(
            name='PedidoItem',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('cantidad', models.PositiveIntegerField()),
                ('precio_unitario', models.DecimalField(decimal_places=2, max_digits=10)),
                ('inventario_descontado', models.BooleanField(default=False)),
                ('item_menu', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='gastrostock.menuitem')),
                ('pedido', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='items', to='gastrostock.pedido')),
            ],
        ),
        migrations.CreateModel(
            name='Receta',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('nombre', models.CharField(max_length=200)),
                ('descripcion', models.TextField(blank=True)),
                ('menu_item', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='receta', to='gastrostock.menuitem')),
            ],
        ),
        migrations.CreateModel(
            name='IngredienteReceta',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('cantidad', models.DecimalField(decimal_places=2, max_digits=10)),
                ('inventario_item', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='gastrostock.inventario')),
                ('receta', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='ingredientes', to='gastrostock.receta')),
            ],
        ),
        migrations.AddField(
            model_name='mesa',
            name='ubicacion',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='gastrostock.ubicacion'),
        ),
        migrations.AddIndex(
            model_name='inventario',
            index=models.Index(fields=['nombre_producto'], name='gastrostock_nombre__d20d3c_idx'),
        ),
        migrations.AddIndex(
            model_name='inventario',
            index=models.Index(fields=['fecha_entrada'], name='gastrostock_fecha_e_cf9aab_idx'),
        ),
    ]
