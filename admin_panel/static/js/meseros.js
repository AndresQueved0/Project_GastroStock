const urlObtenerPedidos = 'obtener-pedidos/';

document.addEventListener('DOMContentLoaded', function() {
    // Manejo de la selección de secciones
    const links = document.querySelectorAll('#myLink');
    const sections = document.querySelectorAll('section');

    function getURLParameter(name) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(name);
    }

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

    const sectionFromURL = getURLParameter('section');
    const initialSection = sectionFromURL || localStorage.getItem('currentSection');

    if (initialSection) {
        showSection(initialSection);
    } else {
        sections.forEach(section => section.style.display = 'none');
    }

    links.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const sectionToShow = this.getAttribute('data-content');
            showSection(sectionToShow);
        });
    });

    // Manejo del selector de ubicación
    const ubicacionSelect = document.getElementById('ubicacion-select');
    ubicacionSelect.addEventListener('change', function() {
        const selectedUbicacion = this.value;
        window.location.href = `?ubicacion=${selectedUbicacion}`;
    });

    // Manejo de pedidos en la vista del mesero
    let pedidoActual = [];
    let totalPedido = 0;
    let mesaSeleccionada = null;

    const listaPedidos = document.getElementById('lista-pedidos');
    const totalPagarSpan = document.getElementById('total-pagar');
    const generarTicketBtn = document.getElementById('generar-ticket');
    const mesaNumeroSpan = document.getElementById('mesa-numero');
    const mesaUbicacionSpan = document.getElementById('mesa-ubicacion');

    window.actualizarInfoMesa = function(id, nombre, ubicacion) {
        mesaSeleccionada = { id, nombre, ubicacion };
        mesaNumeroSpan.textContent = nombre;
        mesaUbicacionSpan.textContent = ubicacion;
    };

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

    generarTicketBtn.addEventListener('click', function() {
        if (pedidoActual.length === 0) {
            alert('Por favor, agregue items al pedido antes de generar el ticket.');
            return;
        }

        if (!mesaSeleccionada) {
            alert('Error: No se ha seleccionado una mesa.');
            return;
        }

        const datosPedido = {
            mesa_id: mesaSeleccionada.id,
            items_pedido: JSON.stringify(pedidoActual)
        };

        fetch(urlRegistrarPedido, {
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
                Swal.fire({
                    icon: 'success',
                    title: 'Pedido registrado',
                    text: 'El pedido se registró correctamente',
                    showConfirmButton: false,
                    timer: 2000
                }).then(() => {
                    // Llamar a las funciones para actualizar la UI después de que la alerta se cierre
                    actualizarEstadoMesa(datosPedido.mesaId); // Pasar el mesaId a la función
                    actualizarListaPedidos();
                });
                pedidoActual = [];
                actualizarPedidoUI();
                $('#pedidoModal').modal('hide');
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Error al registrar el pedido: ' + data.message,
                });
            }
        });
    });

    window.actualizarEstadoMesa = function(mesaId) {
        // Hacer una solicitud para obtener el estado actualizado de la mesa
        fetch(`obtener-estado-mesa/${mesaId}/`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                if (data.error) {
                    console.error(data.error);
                    return;
                }

                // Actualizar el estado de la mesa en la UI
                const mesaElement = document.querySelector(`[data-mesa-id="${mesaId}"]`);
                if (mesaElement) {
                    mesaElement.classList.remove('ocupada', 'libre'); // Remover clases anteriores
                    mesaElement.classList.add(data.estado); // Añadir la nueva clase
                    mesaElement.querySelector('.card-text').textContent = data.estado.charAt(0).toUpperCase() + data.estado.slice(1); // Actualiza el texto o cualquier otro elemento de la mesa
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
    };
    
    function actualizarListaPedidos() {
        // Recargar la parte de la página que contiene los pedidos
        fetch('obtener-pedidos/')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.text();
            })
            .then(html => {
                // Reemplazar el contenido del contenedor de pedidos con el nuevo HTML
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');
                const nuevosPedidosPreparados = doc.getElementById('pedidosPreparadosContainer');
                const nuevosPedidosRealizados = doc.getElementById('pedidosRealizadosContainer');
    
                if (nuevosPedidosPreparados && nuevosPedidosRealizados) {
                    document.getElementById('pedidosPreparadosContainer').innerHTML = nuevosPedidosPreparados.innerHTML;
                    document.getElementById('pedidosRealizadosContainer').innerHTML = nuevosPedidosRealizados.innerHTML;
                } else {
                    console.error('No se encontraron los nuevos contenedores de pedidos.');
                }
            })
            .catch(error => {
                console.error('Hubo un problema con la solicitud Fetch:', error);
            });
    }

    document.querySelectorAll('.cambiar-estado-btn').forEach(button => {
        button.addEventListener('click', function() {
            const pedidoId = this.getAttribute('data-pedido-id');
            const nuevoEstado = this.getAttribute('data-nuevo-estado');

            fetch(`cambiar-estado-pedido/${pedidoId}/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'X-CSRFToken': getCookie('csrftoken')
                },
                body: `nuevo_estado=${nuevoEstado}`
            })
            .then(response => response.text())
            .then(data => {
                if (data.status === 'success') {
                    const pedidoCard = document.querySelector(`.pedido-card[data-pedido-id="${pedidoId}"]`);
                    pedidoCard.style.order = '1';

                    this.textContent = `${data.nuevo_estado} - En mesa`;
                    this.classList.remove('btn-success');
                    this.classList.add('btn-secondary');
                    this.disabled = true;
                }
            })
            .catch(error => console.error('Error:', error));
        });
    });
});

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

document.addEventListener('DOMContentLoaded', function() {
    const sidebar = document.getElementById("sidebar");
    const content = document.querySelector(".content");
    const toggleBtn = document.querySelector('.navbar-toggler');

    function toggleSidebar() {
        if (!sidebar || !content) {
            console.error("No se encontraron los elementos #sidebar o .content en el DOM.");
            return;
        }

        sidebar.classList.toggle("active");
        content.classList.toggle("sidebar-active");

        if (sidebar.classList.contains("active")) {
            toggleBtn.innerHTML = "✕";
            content.style.marginLeft = sidebar.offsetWidth + "px";
        } else {
            toggleBtn.innerHTML = '<span class="navbar-toggler-icon"></span>';
            content.style.marginLeft = "40px";
        }
    }

    if (toggleBtn) {
        toggleBtn.addEventListener('click', toggleSidebar);
    } else {
        console.error("No se encontró el botón de alternar con la clase .navbar-toggler en el DOM.");
    }

    // Cerrar el sidebar cuando se hace clic en un enlace (en móviles y tablets)
    document.querySelectorAll('#sidebar a').forEach(link => {
        link.addEventListener('click', function() {
            if (window.innerWidth <= 768) {
                toggleSidebar();
            }
        });
    });

    // Ajustar el sidebar y el contenido al cambiar el tamaño de la ventana
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768) {
            sidebar.classList.remove("active");
            content.classList.remove("sidebar-active");
            content.style.marginLeft = "0"; // Ajustar el margen del contenido en pantallas grandes
        } else {
            content.style.marginLeft = sidebar.classList.contains("active") ? sidebar.offsetWidth + "px" : "0";
        }
    });
});