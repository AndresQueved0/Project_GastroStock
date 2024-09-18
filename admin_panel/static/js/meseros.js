document.addEventListener('DOMContentLoaded', function() {
    const links = document.querySelectorAll('#myLink');
    const sections = document.querySelectorAll('section');

    // Función para obtener el valor del parámetro de la URL
    function getURLParameter(name) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(name);
    }

    // Función para mostrar una sección específica
    function showSection(sectionId) {
        sections.forEach(section => {
            if (section.id === sectionId) {
                section.style.display = 'block';
            } else {
                section.style.display = 'none';
            }
        });
        localStorage.setItem('currentSection', sectionId);
    }

    // Obtener la sección desde la URL o desde el localStorage
    const sectionFromURL = getURLParameter('section');
    const initialSection = sectionFromURL || localStorage.getItem('currentSection');

    // Si hay una sección inicial, mostrarla
    if (initialSection) {
        showSection(initialSection);
    } else {
        // Si no hay sección inicial, no mostrar ninguna sección
        sections.forEach(section => section.style.display = 'none');
    }

    // Actualizar el campo oculto en los formularios
    const currentSectionInputs = document.querySelectorAll('input[name="current_section"]');
    currentSectionInputs.forEach(input => {
        input.value = initialSection;
    });

    // Manejar la navegación por los enlaces
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const sectionToShow = this.getAttribute('data-content');
            showSection(sectionToShow);
        });
    });
});

document.addEventListener('DOMContentLoaded', function() {
    const ubicacionSelect = document.getElementById('ubicacion-select');
    ubicacionSelect.addEventListener('change', function() {
        const selectedUbicacion = this.value;
        window.location.href = `?ubicacion=${selectedUbicacion}`;
    });
});

document.addEventListener('DOMContentLoaded', function() {
    const pedidoModal = document.getElementById('pedidoModal');
    const listaPedidos = document.getElementById('lista-pedidos');
    const totalPagar = document.getElementById('total-pagar');
    let pedidoActual = [];

    pedidoModal.addEventListener('show.bs.modal', function (event) {
        const button = event.relatedTarget;
        const mesaNombre = button.getAttribute('data-mesa-nombre');
        const mesaUbicacion = button.getAttribute('data-mesa-ubicacion');
        
        document.getElementById('mesa-numero').textContent = mesaNombre;
        document.getElementById('mesa-ubicacion').textContent = mesaUbicacion;
        
        // Reiniciar el pedido actual
        pedidoActual = [];
        actualizarPedidoUI();
    });

    pedidoModal.addEventListener('click', function(e) {
        if (e.target.classList.contains('agregar-item')) {
            const id = e.target.getAttribute('data-id');
            const nombre = e.target.getAttribute('data-nombre');
            const precio = parseFloat(e.target.getAttribute('data-precio'));

            agregarItemAlPedido(id, nombre, precio);
        }
    });

    function agregarItemAlPedido(id, nombre, precio) {
        const itemExistente = pedidoActual.find(item => item.id === id);
        if (itemExistente) {
            itemExistente.cantidad++;
        } else {
            pedidoActual.push({ id, nombre, precio, cantidad: 1 });
        }
        actualizarPedidoUI();
    }

    function actualizarPedidoUI() {
        listaPedidos.innerHTML = '';
        let total = 0;
        pedidoActual.forEach(item => {
            const li = document.createElement('li');
            li.textContent = `${item.nombre} x${item.cantidad} - $${(item.precio * item.cantidad).toFixed(2)}`;
            listaPedidos.appendChild(li);
            total += item.precio * item.cantidad;
        });
        totalPagar.textContent = total.toFixed(2);
    }

    document.getElementById('generar-ticket').addEventListener('click', function() {
        // Aquí iría la lógica para generar el ticket
        console.log('Generando ticket para:', pedidoActual);
        // Limpiamos el pedido actual después de generar el ticket
        pedidoActual = [];
        actualizarPedidoUI();
    });
});