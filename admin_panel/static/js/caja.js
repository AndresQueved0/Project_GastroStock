document.addEventListener('DOMContentLoaded', function() {
    const sidebar = document.getElementById("sidebar");
    const content = document.querySelector(".content");
    const toggleBtn = document.querySelector('.toggle-btn');

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
            toggleBtn.innerHTML = "☰";
            content.style.marginLeft = "0";
        }
    }

    if (toggleBtn) {
        toggleBtn.addEventListener('click', toggleSidebar);
    } else {
        console.error("No se encontró el botón de alternar con la clase .toggle-btn en el DOM.");
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
            content.style.marginLeft = "0";
            toggleBtn.innerHTML = "☰";
        } else {
            content.style.marginLeft = sidebar.classList.contains("active") ? sidebar.offsetWidth + "px" : "0";
        }
    });
});

document.addEventListener('DOMContentLoaded', function() {
    const pagoModal = document.getElementById('pagoModal');
    const modalPedidoTitulo = document.getElementById('modalPedidoTitulo');
    const modalPedidoDetalles = document.getElementById('modalPedidoDetalles');
    const modalTotalPagar = document.getElementById('modalTotalPagar');
    const confirmarPagoBtn = document.getElementById('confirmarPago');

    pagoModal.addEventListener('show.bs.modal', function(event) {
        const button = event.relatedTarget;
        const pedidoId = button.getAttribute('data-pedido-id');

        // Hacer una solicitud AJAX para obtener los detalles del pedido
        fetch(`obtener-detalles-pedido/${pedidoId}/`)
            .then(response => response.json())
            .then(data => {
                // Actualizar el título del modal
                modalPedidoTitulo.textContent = `${data.mesa.nombre} - ${data.mesa.ubicacion}`;

                // Mostrar los detalles del pedido
                let detalleHTML = '';
                data.items.forEach(item => {
                    detalleHTML += `<li>${item.nombre} x${item.cantidad} - ${item.precio}</li>`;
                });
                modalPedidoDetalles.innerHTML = detalleHTML;

                // Actualizar el monto a pagar en el modal
                modalTotalPagar.textContent = data.precio_total;

                // Guardar el pedidoId en el botón de confirmar pago
                confirmarPagoBtn.setAttribute('data-pedido-id', pedidoId);
            })
            .catch(error => console.error('Error:', error));
    });

    confirmarPagoBtn.addEventListener('click', function() {
        const pedidoId = this.getAttribute('data-pedido-id');
        const metodoPago = document.getElementById('metodoPago').value;

        // Enviar la información del pago al servidor
        fetch('procesar-pago/', {  // Asegúrate de que la URL sea correcta
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            },
            body: JSON.stringify({
                pedido_id: pedidoId,
                metodo_pago: metodoPago
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Cerrar el modal y actualizar la UI según sea necesario
                bootstrap.Modal.getInstance(pagoModal).hide();
                // Actualizar el estado del pedido en la UI
                actualizarEstadoPedido(pedidoId, 'Pagado');
                
                // Mostrar alerta de éxito con botón personalizado
                Swal.fire({
                    icon: 'success',
                    title: 'Pago procesado',
                    text: 'El pago se procesó correctamente',
                    showConfirmButton: true,
                    confirmButtonText: 'OK',
                    customClass: {
                        confirmButton: 'btn btn-success'
                    },
                    buttonsStyling: false
                }).then(() => {
                    // Actualizar la UI sin recargar la página
                    actualizarListaPedidos();
                });
            } else {
                // Mostrar alerta de error
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Error al procesar el pago: ' + data.message,
                    showConfirmButton: true,
                    confirmButtonText: 'OK',
                    customClass: {
                        confirmButton: 'btn btn-danger'
                    },
                    buttonsStyling: false
                });
            }
        })
        .catch(error => {
            console.error('Error:', error);
            // Mostrar alerta de error
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Error al procesar el pago',
                showConfirmButton: true,
                confirmButtonText: 'OK',
                customClass: {
                    confirmButton: 'btn btn-danger'
                },
                buttonsStyling: false
            });
        });
    });

    // Función para actualizar los pedidos en la UI
    function actualizarListaPedidos() {
        fetch('obtener-pedidos/')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.text();
            })
            .then(html => {
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');
                const nuevosPedidosPreparados = doc.getElementById('pedidosPreparadosContainer');

                if (nuevosPedidosPreparados) {
                    document.getElementById('pedidosPreparadosContainer').innerHTML = nuevosPedidosPreparados.innerHTML;
                } else {
                    console.error('No se encontraron los nuevos contenedores de pedidos.');
                }
            })
            .catch(error => {
                console.error('Hubo un problema con la solicitud Fetch:', error);
            });
    }
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

// Función para actualizar el estado del pedido en la UI
function actualizarEstadoPedido(pedidoId, nuevoEstado) {
    const pedidoCard = document.querySelector(`.card-pedido1[data-pedido-id="${pedidoId}"]`);
    if (pedidoCard) {
        const estadoElement = pedidoCard.querySelector('.estado-pedido');
        if (estadoElement) {
            estadoElement.textContent = nuevoEstado;
        }
    }
}