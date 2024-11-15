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

function getURLParameter(name) {
    return new URLSearchParams(window.location.search).get(name);
}

// Función para mostrar una sección específica
function showSection(sectionId) {
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => {
        if (section.id === sectionId) {
            section.style.display = 'block';
        } else {
            section.style.display = 'none';
        }
    });
    localStorage.setItem('currentSection', sectionId);
}

// Mostrar siempre la sección "pedidos" al cargar la página
document.addEventListener('DOMContentLoaded', function() {
    showSection('pedidos');
});

// Definir getCookie en el ámbito global, fuera de cualquier otro código


// Todo el resto del código dentro del evento DOMContentLoaded
document.addEventListener('DOMContentLoaded', function() {
    // Función para actualizar la lista de pedidos
    const actualizarListaPedidos = function() {
        console.log('Iniciando recarga de contenido...');
        return fetch('obtener-pedidos/')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.text();
            })
            .then(html => {
                if (!html.trim()) {
                    throw new Error('La respuesta está vacía');
                }
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');
                const nuevosPedidosRealizados = doc.getElementById('pedidosRealizadosContainer');
                const nuevosPedidosPreparados = doc.getElementById('pedidosPreparadosContainer');

                if (nuevosPedidosPreparados && nuevosPedidosRealizados) {
                    const pedidosRealizadosElement = document.getElementById('pedidosRealizadosContainer');
                    const pedidosPreparadosElement = document.getElementById('pedidosPreparadosContainer');
                    
                    if (pedidosRealizadosElement && pedidosPreparadosElement) {
                        pedidosRealizadosElement.innerHTML = nuevosPedidosRealizados.innerHTML;
                        pedidosPreparadosElement.innerHTML = nuevosPedidosPreparados.innerHTML;
                        asignarEventosCambiarEstado();
                        console.log('Contenido recargado exitosamente');
                    } else {
                        throw new Error('No se encontraron los contenedores en el DOM actual');
                    }
                } else {
                    throw new Error('No se encontraron los contenedores en la respuesta');
                }
            })
            .catch(error => {
                console.error('Hubo un problema con la solicitud Fetch:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'No se pudo actualizar la lista de pedidos',
                    confirmButtonText: 'OK'
                });
            });
    };

    // Función para asignar eventos a los botones
    const asignarEventosCambiarEstado = function() {
        document.querySelectorAll('.cambiar-estado-btn').forEach(button => {
            button.addEventListener('click', function() {
                const pedidoId = this.getAttribute('data-pedido-id');
                const nuevoEstado = this.getAttribute('data-nuevo-estado');
                const csrftoken = getCookie('csrftoken'); // Usar la función getCookie que ahora está en el ámbito global

                fetch(`cambiar-estado-pedido/${pedidoId}/`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'X-CSRFToken': csrftoken
                    },
                    body: `nuevo_estado=${nuevoEstado}`
                })
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    return response.json();
                })
                .then(data => {
                    if (data.status === 'success') {
                        Swal.fire({
                            icon: 'success',
                            title: 'Estado cambiado',
                            text: 'El estado del pedido se cambió correctamente',
                            showConfirmButton: true,
                            confirmButtonText: 'OK',
                            customClass: {
                                confirmButton: 'btn btn-success'
                            },
                            buttonsStyling: false
                        }).then(() => {
                            return actualizarListaPedidos();
                        }).then(() => {
                            const pedidoCard = document.querySelector(`.card-pedido[data-pedido-id="${pedidoId}"]`);
                            if (pedidoCard) {
                                pedidoCard.style.order = '1';
                                this.textContent = `${data.nuevo_estado} - Listo para entregar`;
                                this.classList.remove('btn-success');
                                this.classList.add('btn-secondary');
                                this.disabled = true;
                            } else {
                                console.error(`No se encontró el elemento con data-pedido-id="${pedidoId}"`);
                            }
                        });
                    } else {
                        Swal.fire({
                            icon: 'error',
                            title: 'Error',
                            text: 'Hubo un error al cambiar el estado del pedido',
                            confirmButtonText: 'OK'
                        });
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'Hubo un problema al procesar la solicitud',
                        confirmButtonText: 'OK'
                    });
                });
            });
        });
    };

    // Inicializar los eventos cuando se carga la página
    asignarEventosCambiarEstado();
});

function toggleSidebar() {
    const sidebar = document.getElementById("sidebar");
    const content = document.querySelector(".content-meseros");
    const toggleBtn = document.querySelector('.navbar-toggler');
    const titlePedido = document.querySelector('.title-pedido');
    const titlePedidos1 = document.querySelector('.title-pedidos1');
    const cardPedidos1 = document.querySelectorAll('.card-pedido1');
    const boxPedidos1 = document.querySelectorAll('.boxPedido1');

    // Comprobar cada elemento individualmente
    if (!sidebar) console.error("No se encontró el elemento #sidebar");
    if (!content) console.error("No se encontró el elemento .content-meseros");
    if (!toggleBtn) console.error("No se encontró el elemento .navbar-toggler");
    if (!titlePedido) console.error("No se encontró el elemento .title-pedido");
    if (!titlePedidos1) console.error("No se encontró el elemento .title-pedidos1");
    if (!cardPedidos1) console.error("No se encontró el elemento .card-pedido1");
    if (!boxPedidos1) console.error("No se encontró el elemento .boxPedido1");

    if (!sidebar || !content || !toggleBtn || !titlePedido || !titlePedidos1 || !cardPedidos1 || !boxPedidos1) {
        console.error("No se encontraron todos los elementos necesarios en el DOM.");
        return;
    }

    sidebar.classList.toggle("active");
    content.classList.toggle("sidebar-active");
    toggleBtn.classList.toggle("sidebar-active");
    titlePedidos1.classList.toggle("sidebar-active");
    titlePedido.classList.toggle("sidebar-active");

    // Solo aplicar la clase si existen elementos con estas clases
    if (cardPedidos1.length > 0) {
        cardPedidos1.forEach(card => card.classList.toggle("sidebar-active"));
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
        const titlePedidos1 = document.querySelector('.title-pedidos1');
        const titlePedido = document.querySelector('.title-pedido');
        const cardPedidos1 = document.querySelectorAll('.card-pedido1');
        const boxPedidos1 = document.querySelectorAll('.boxPedido1'); // Agregado

        if (window.innerWidth > 768) {
            sidebar.classList.remove("active");
            content.classList.remove("sidebar-active");
            toggleBtn.classList.remove("sidebar-active");
            titlePedidos1.classList.remove("sidebar-active");
            titlePedido.classList.remove("sidebar-active");

            if (cardPedidos1.length > 0) {
                cardPedidos1.forEach(card => card.classList.remove("sidebar-active"));
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

function iniciarActualizacionAutomatica() {
    const intervaloActualizacion = 5000; // 1 second

    function recargarContenido() {
        console.log('Iniciando recarga de contenido...');
        fetch(window.location.href)
            .then(response => response.text())
            .then(html => {
                const parser = new DOMParser();
                const newDoc = parser.parseFromString(html, 'text/html');
                
                // Update only specific parts of the page instead of the entire body
                actualizarElementoSiExiste('pedidosPreparadosContainer', newDoc);
                actualizarElementoSiExiste('pedidosRealizadosContainer', newDoc);
                actualizarElementoSiExiste('mesasContainer', newDoc);

                console.log('Contenido recargado exitosamente');
                
                // Re-attach event listeners
                asignarEventosCambiarEstado();
            })
            .catch(error => console.error('Error al recargar el contenido:', error));
    }

    setInterval(recargarContenido, intervaloActualizacion);
    console.log('Actualización automática iniciada');
}

function actualizarElementoSiExiste(id, newDoc) {
    const oldElement = document.getElementById(id);
    const newElement = newDoc.getElementById(id);
    if (oldElement && newElement) {
        oldElement.innerHTML = newElement.innerHTML;
    }
}

function asignarEventosCambiarEstado() {
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
                .then(response => response.json())
                .then(data => {
                    if (data.status === 'success') {
                        // Mostrar alerta de éxito con botón personalizado
                        Swal.fire({
                            icon: 'success',
                            title: 'Estado cambiado',
                            text: 'El estado del pedido se cambió correctamente',
                            showConfirmButton: true,
                            confirmButtonText: 'OK',
                            customClass: {
                                confirmButton: 'btn btn-success'
                            },
                            buttonsStyling: false
                        }).then(() => {
                            // Actualizar la lista de pedidos sin recargar la página
                            actualizarListaPedidos().then(() => {
                                const pedidoCard = document.querySelector(`.card-pedido[data-pedido-id="${pedidoId}"]`);
                                if (pedidoCard) {
                                    pedidoCard.style.order = '1';

                                    this.textContent = `${data.nuevo_estado} - Listo para entregar`;
                                    this.classList.remove('btn-success');
                                    this.classList.add('btn-secondary');
                                    this.disabled = true;
                                } else {
                                    console.error(`No se encontró el elemento con data-pedido-id="${pedidoId}"`);
                                }
                            });
                        });
                    } else {
                        console.error('Error en la respuesta del servidor:', data);
                    }
                })
                .catch(error => console.error('Error:', error));
            });
        });
    }

// Other functions...

// Initialize when the DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOMContentLoaded event fired');
    iniciarActualizacionAutomatica();
    asignarEventosCambiarEstado();
});