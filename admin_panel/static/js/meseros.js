


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
    const baseUrl = window.location.pathname;

    fetch(`${baseUrl}?ubicacion=${selectedUbicacion}`, {
        method: 'GET',
        headers: {
            'X-Requested-With': 'XMLHttpRequest'
        }
    })
    .then(response => response.text())
    .then(data => {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = data;

        // Find the mesasContainer in the fetched content
        const newMesasContainer = tempDiv.querySelector('#mesasContainer');

        if (newMesasContainer) {
            // Replace only the inner content of the existing mesasContainer
            const existingMesasContainer = document.getElementById('mesasContainer');
            existingMesasContainer.innerHTML = newMesasContainer.innerHTML;

            // Re-apply any necessary classes or styles
            existingMesasContainer.className = newMesasContainer.className;
        } else {
            console.error('Could not find #mesasContainer in the fetched content');
        }
    })
    .catch(error => console.error('Error al cargar mesas:', error));
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
const urlRegistrarPedido = generarTicketBtn.getAttribute('data-url-registrar-pedido');

function formatearPrecio(precio) {
    const precioEntero = Math.floor(precio);
    return `${precioEntero.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;
}

window.actualizarInfoMesa = function(id, nombre, ubicacion) {
    mesaSeleccionada = { id, nombre, ubicacion };
    mesaNumeroSpan.textContent = nombre;
    mesaUbicacionSpan.textContent = ubicacion;
};

document.querySelectorAll('.agregar-item').forEach(card => {
    card.addEventListener('click', function() {
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

    pedidoActual.forEach((item, index) => {
        const li = document.createElement('li');
        li.classList.add('mb-2');
        li.style.listStyleType = 'disc';
        li.style.paddingLeft = '0';

        const itemContent = document.createElement('div');
        itemContent.classList.add('d-flex', 'justify-content-between', 'align-items-center');
        
        const precioTotalItem = item.precio * item.cantidad;
        itemContent.innerHTML = `
            <span>${item.nombre} x${item.cantidad} - ${formatearPrecio(precioTotalItem)}</span>
            <button class="btn btn-danger border-danger btn-sm eliminar-item" data-index="${index}">X</button>
        `;

        li.appendChild(itemContent);
        listaPedidos.appendChild(li);

        totalPedido += precioTotalItem;
    });
    
    // Actualizar el total a pagar
    totalPagarSpan.textContent = formatearPrecio(totalPedido);

    // Agregar evento a los botones "X" para eliminar productos
    document.querySelectorAll('.eliminar-item').forEach(button => {
        button.addEventListener('click', function() {
            const index = this.dataset.index;
            eliminarItemDelPedido(index);
        });
    });
}

function eliminarItemDelPedido(index) {
    // Eliminar el producto de la lista del pedido
    pedidoActual.splice(index, 1);
    actualizarPedidoUI();  // Volver a actualizar la interfaz
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
                actualizarEstadoMesa(datosPedido.mesa_id);
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
    })
    .catch(error => {
        console.error('Error al registrar el pedido:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Error en la conexión al servidor.',
        });
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
                    // Remover las clases de estado anteriores
                    mesaElement.classList.remove('ocupada', 'libre');
                    
                    // Añadir la nueva clase de estado
                    mesaElement.classList.add(data.estado);
                    
                    // Actualizar la clase del footer de la tarjeta
                    const footer = mesaElement.querySelector('.card-footer');
                    if (footer) {
                        footer.classList.remove('bg-success', 'bg-danger');
                        footer.classList.add(data.estado === 'disponible' ? 'bg-success' : 'bg-danger');
                    }
    
                    // Cambiar el borde de la tarjeta según el estado
                    if (data.estado === 'ocupada') {
                        mesaElement.classList.add('border-danger'); // Añadir borde rojo
                    } else {
                        mesaElement.classList.remove('border-danger'); // Remover borde rojo
                    }
    
                    mesaElement.querySelector('.card-text').textContent = data.estado.charAt(0).toUpperCase() + data.estado.slice(1); // Actualiza el texto
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

function toggleSidebar() {
    const sidebar = document.getElementById("sidebar");
    const content = document.querySelector(".content-meseros");
    const toggleBtn = document.querySelector('.navbar-toggler');
    const titlePedido = document.querySelector('.title-pedido');
    const titleMesa = document.querySelector ('.title-mesa');
    const titlePedidos1 = document.querySelector('.title-pedidos1');
    const titlePedidos2 = document.querySelector('.title-pedidos2');
    const inputBox = document.querySelector('.inputBox');
    const cardPedidos = document.querySelectorAll('.card-pedido');
    const cardPedidos1 = document.querySelectorAll('.card-pedido1');
    const boxPedidos = document.querySelectorAll('.boxPedido');
    const boxPedidos1 = document.querySelectorAll('.boxPedido1');

    // Comprobar cada elemento individualmente
    if (!sidebar) console.error("No se encontró el elemento #sidebar");
    if (!content) console.error("No se encontró el elemento .content-meseros");
    if (!toggleBtn) console.error("No se encontró el elemento .navbar-toggler");
    if (!titlePedido) console.error("No se encontró el elemento .title-pedido");
    if (!titleMesa) console.error("No se encontró el elemento .title-mesa");
    if (!titlePedidos1) console.error("No se encontró el elemento .title-pedidos1");
    if (!titlePedidos2) console.error("No se encontró el elemento .title-pedidos2");
    if (!inputBox) console.error("No se encontró el elemento .inputBox");

    if (!sidebar || !content || !toggleBtn || !titlePedido || !titleMesa || !titlePedidos1 || !titlePedidos2 || !inputBox) {
        console.error("No se encontraron todos los elementos necesarios en el DOM.");
        return;
    }

    sidebar.classList.toggle("active");
    content.classList.toggle("sidebar-active");
    toggleBtn.classList.toggle("sidebar-active");
    titleMesa.classList.toggle("sidebar-active");
    titlePedidos1.classList.toggle("sidebar-active");
    titlePedidos2.classList.toggle("sidebar-active");
    titlePedido.classList.toggle("sidebar-active");
    inputBox.classList.toggle("sidebar-active");

    // Solo aplicar la clase si existen elementos con estas clases
    if (cardPedidos.length > 0) {
        cardPedidos.forEach(card => card.classList.toggle("sidebar-active"));
    }
    if (cardPedidos1.length > 0) {
        cardPedidos1.forEach(card => card.classList.toggle("sidebar-active"));
    }
    if (boxPedidos.length > 0) {
        boxPedidos.forEach(box => box.classList.toggle("sidebar-active"));
    }
    if (boxPedidos1.length > 0) {
        boxPedidos1.forEach(box => box.classList.toggle("sidebar-active"));
    }

    if (sidebar.classList.contains("active")) {
        toggleBtn.innerHTML = "✕";
        toggleBtn.style.fontSize = "25px";
        content.style.marginLeft = sidebar.offsetWidth + "px";
    } else {
        toggleBtn.innerHTML = '<span class="navbar-toggler-icon"></span>';
        toggleBtn.style.fontSize = "";
        content.style.marginLeft = "0";
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const toggleBtn = document.querySelector('.navbar-toggler');
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
        const sidebar = document.getElementById("sidebar");
        const content = document.querySelector(".content-meseros");
        const toggleBtn = document.querySelector('.navbar-toggler');
        const titleMesa = document.querySelector('.title-mesa');
        const titlePedidos1 = document.querySelector('.title-pedidos1');
        const titlePedidos2 = document.querySelector('.title-pedidos2');
        const titlePedido = document.querySelector('.title-pedido');
        const inputBox = document.querySelector('.inputBox');
        const cardPedidos = document.querySelectorAll('.card-pedido');
        const cardPedidos1 = document.querySelectorAll('.card-pedido1');
        const boxPedidos = document.querySelectorAll('.boxPedido');
        const boxPedidos1 = document.querySelectorAll('.boxPedido1');

        if (window.innerWidth > 768) {
            sidebar.classList.remove("active");
            content.classList.remove("sidebar-active");
            toggleBtn.classList.remove("sidebar-active");
            titleMesa.classList.remove("sidebar-active");
            titlePedidos1.classList.remove("sidebar-active");
            titlePedidos2.classList.remove("sidebar-active");
            titlePedido.classList.remove("sidebar-active");
            inputBox.classList.remove("sidebar-active");
            if (cardPedidos.length > 0) {
                cardPedidos.forEach(card => card.classList.remove("sidebar-active"));
            }
            if (cardPedidos1.length > 0) {
                cardPedidos1.forEach(card => card.classList.remove("sidebar-active"));
            }
            if (boxPedidos.length > 0) {
                boxPedidos.forEach(box => box.classList.remove("sidebar-active"));
            }
            if (boxPedidos1.length > 0) {
                boxPedidos1.forEach(box => box.classList.remove("sidebar-active"));
            }
            content.style.marginLeft = "0px";
        } else {
            content.style.marginLeft = sidebar.classList.contains("active") ? sidebar.offsetWidth + "px" : "0";
        }
    });
});

document.addEventListener('DOMContentLoaded', function() {
    const categoriaSelect = document.getElementById('categoriaSelect');
    const menuTabContent = document.getElementById('menuTabContent');

    categoriaSelect.addEventListener('change', function() {
        const selectedCategoryId = this.value;
        const categoryPanes = menuTabContent.getElementsByClassName('tab-pane');

        for (let pane of categoryPanes) {
            if (pane.id === selectedCategoryId) {
                pane.classList.add('show', 'active');
            } else {
                pane.classList.remove('show', 'active');
            }
        }
    });

    // Trigger change event on page load to show the initially selected category
    categoriaSelect.dispatchEvent(new Event('change'));
});