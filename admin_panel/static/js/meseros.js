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
    let pedidoActual = [];
    let totalPedido = 0;
    let mesaSeleccionada = null;

    const listaPedidos = document.getElementById('lista-pedidos');
    const totalPagarSpan = document.getElementById('total-pagar');
    const generarTicketBtn = document.getElementById('generar-ticket');
    const mesaNumeroSpan = document.getElementById('mesa-numero');
    const mesaUbicacionSpan = document.getElementById('mesa-ubicacion');

    // Función para actualizar la información de la mesa en el modal
    window.actualizarInfoMesa = function(id, nombre, ubicacion) {
        mesaSeleccionada = { id, nombre, ubicacion };
        mesaNumeroSpan.textContent = nombre;
        mesaUbicacionSpan.textContent = ubicacion;
    };

    // Agregar item al pedido
    document.querySelectorAll('.agregar-item').forEach(button => {
        button.addEventListener('click', function() {
            const id = this.dataset.id;
            const nombre = this.dataset.nombre;
            const precio = parseFloat(this.dataset.precio);

            let itemExistente = pedidoActual.find(item => item.id === id);
            if (itemExistente) {
                itemExistente.cantidad += 1;
            } else {
                pedidoActual.push({ id, nombre, precio, cantidad: 1 });
            }

            actualizarPedidoUI();
        });
    });

    function actualizarPedidoUI() {
        listaPedidos.innerHTML = '';
        totalPedido = 0;

        pedidoActual.forEach(item => {
            const li = document.createElement('li');
            li.textContent = `${item.nombre} x${item.cantidad} - $${(item.precio * item.cantidad).toFixed(2)}`;
            listaPedidos.appendChild(li);
            totalPedido += item.precio * item.cantidad;
        });

        totalPagarSpan.textContent = totalPedido.toFixed(2);
    }

    // Manejar el envío del pedido
    generarTicketBtn.addEventListener('click', function() {
        if (pedidoActual.length === 0) {
            alert('Por favor, agregue items al pedido antes de generar el ticket.');
            return;
        }

        if (!mesaSeleccionada) {
            alert('Error: No se ha seleccionado una mesa.');
            return;
        }

        // Preparar los datos del pedido
        const datosPedido = {
            mesa_id: mesaSeleccionada.id,
            items_pedido: JSON.stringify(pedidoActual),
            total_pedido: totalPedido.toFixed(2)
        };

        // Enviar el pedido al servidor
        fetch('{% url "registrar_pedido" %}', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            },
            body: JSON.stringify(datosPedido)
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                alert('Pedido registrado correctamente');
                // Limpiar el pedido actual
                pedidoActual = [];
                actualizarPedidoUI();
                $('#pedidoModal').modal('hide');
            } else {
                alert('Error al registrar el pedido: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error al procesar la solicitud');
        });
    });

    // Función para obtener el token CSRF
    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }

    // Limpiar el pedido cuando se cierra el modal
    $('#pedidoModal').on('hidden.bs.modal', function () {
        pedidoActual = [];
        actualizarPedidoUI();
        mesaSeleccionada = null;
    });
});