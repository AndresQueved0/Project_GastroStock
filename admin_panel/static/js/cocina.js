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
                this.textContent = `${data.nuevo_estado} - Pedido preparado`;
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
            content.style.marginLeft = "0";
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