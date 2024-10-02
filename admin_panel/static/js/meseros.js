document.addEventListener('DOMContentLoaded', function () {
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
    const initialSection = sectionFromURL || localStorage.getItem('currentSection') || 'mesas';

    // Mostrar la sección inicial
    showSection(initialSection);

    // Manejar la navegación por los enlaces
    links.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const sectionToShow = this.getAttribute('data-content');
            showSection(sectionToShow);
        });
    });

    const ubicacionSelect = document.getElementById('ubicacion-select');
    ubicacionSelect.addEventListener('change', function () {
        const selectedUbicacion = this.value;
        window.location.href = `?ubicacion=${selectedUbicacion}`;
    });

    let pedidoActual = [];
    let totalPedido = 0;
    let mesaSeleccionada = null;

    const listaPedidos = document.getElementById('lista-pedidos');
    const totalPagarSpan = document.getElementById('total-pagar');
    const generarTicketBtn = document.getElementById('generar-ticket');
    const mesaNumeroSpan = document.getElementById('mesa-numero');
    const mesaUbicacionSpan = document.getElementById('mesa-ubicacion');

    // Función para actualizar la información de la mesa en el modal
    window.actualizarInfoMesa = function (id, nombre, ubicacion) {
        mesaSeleccionada = { id, nombre, ubicacion };
        mesaNumeroSpan.textContent = nombre;
        mesaUbicacionSpan.textContent = ubicacion;
    };

    // Agregar item al pedido
    document.querySelectorAll('.agregar-item').forEach(button => {
        button.addEventListener('click', function () {
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
    generarTicketBtn.addEventListener('click', function () {
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
            items_pedido: JSON.stringify(pedidoActual)
        };

        console.log("Enviando datos del pedido:", datosPedido);

        // Enviar el pedido al servidor
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
                console.log("Datos recibidos:", data);
                if (data.status === 'success') {
                    alert('Pedido registrado correctamente');
                    // Limpiar el pedido actual
                    pedidoActual = [];
                    actualizarPedidoUI();
                    $('#pedidoModal').modal('hide');
                    // Actualizar la lista de pedidos
                    actualizarInformacionEnTiempoReal();
                } else {
                    alert('Error al registrar el pedido: ' + data.message);
                }
            })
            .catch(error => {
                console.error('Error al procesar la solicitud:', error);
                alert('Error al procesar la solicitud');
            });
    });

    document.querySelectorAll('.cambiar-estado-btn').forEach(button => {
        button.addEventListener('click', function() {
            const pedidoId = this.getAttribute('data-pedido-id');
            console.log(pedidoId);  // Verifica si el pedidoId es correcto
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
                    // Mover el pedido al final de la lista
                    const pedidoCard = document.querySelector(`.pedido-card[data-pedido-id="${pedidoId}"]`);
                    pedidoCard.style.order = '1';
                    
                    // Actualizar el texto del botón
                    this.textContent = `${data.nuevo_estado} - Pedido en mesa`;
                    this.classList.remove('btn-success');
                    this.classList.add('btn-secondary');
                    this.disabled = true;
                }
            })
            .catch(error => console.error('Error:', error));
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

    function actualizarInformacionEnTiempoReal() {
        fetch('obtener-actualizaciones-meseros/', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken'),
                'Cache-Control': 'no-cache',
            },
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            console.log('Datos actualizados recibidos:', data);
            
            // Actualiza los pedidos en la interfaz
            actualizarPedidosEnUI(data.pedidos_preparados, data.pedidos_realizados);
        })
        .catch(error => console.error('Error al obtener actualizaciones:', error));
    }
    
    function actualizarPedidosEnUI(pedidos, tipo) {
        const containerId = tipo === 'preparados' ? 'pedidosContainerPreparados' : 'pedidosContainerRealizados';
        const container = document.getElementById(containerId);
        
        console.log(`Container ID: ${containerId}`, container); // Para verificar si el contenedor se encontró
    
        if (container) { // Asegúrate de que el contenedor existe
            container.innerHTML = ''; // Limpiar el contenedor
    
            if (pedidos && Array.isArray(pedidos) && pedidos.length > 0) {
                pedidos.forEach(pedido => {
                    const pedidoElement = crearPedidoElement(pedido);
                    container.appendChild(pedidoElement);
                });
            } else {
                const noPedidos = document.createElement('p');
                noPedidos.textContent = 'No hay pedidos registrados en este momento.';
                container.appendChild(noPedidos);
            }
        } else {
            console.error(`No se encontró el contenedor: ${containerId}`);
        }
    }
    
    function crearPedidoElement(pedido) {
        const div = document.createElement('div');
    
        // Verifica que 'items' exista y sea un arreglo
        if (Array.isArray(pedido.items) && pedido.items.length > 0) {
            const itemsList = pedido.items.map(item => {
                return `<li><strong>${item.cantidad}</strong> ${item.item_menu.nombre}</li>`;
            }).join('');
            
            div.innerHTML = `
                <div class="card border-success ms-4">
                    <div class="card-header">
                        <h5 class="card-title text-center m-2"><strong>Pedido ${pedido.mesa ? pedido.mesa.nombre : 'desconocida'}</strong></h5>
                    </div>
                    <div class="card-body">
                        <ul class="list-unstyled ms-4">${itemsList}</ul>
                        <p class="mb-0 ms-4"><strong>Pedido realizado:</strong> ${new Date(pedido.fecha_pedido).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                    <div class="card-footer bg-white text-center">
                        <button class="btn btn-success btn-sm w-100 cambiar-estado-btn fw-bold" data-pedido-id="${pedido.id}" data-nuevo-estado="En mesa">
                            ${pedido.estado} - Marcar en mesa
                        </button>
                    </div>
                </div>
            `;
        } else {
            div.innerHTML = `<p>No hay items en este pedido.</p>`;
        }
    
        return div;
    }
    
    
    // Llama a la función cada 5 segundos
    setInterval(actualizarInformacionEnTiempoReal, 5000);
    
    
});

