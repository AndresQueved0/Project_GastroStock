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

                this.textContent = `${data.nuevo_estado} - Listo para entregar`;
                this.classList.remove('btn-success');
                this.classList.add('btn-secondary');
                this.disabled = true;
            }
        })
        .catch(error => console.error('Error:', error));
    });
    function toggleSidebar() {
        const sidebar = document.getElementById("sidebar");
        const content = document.querySelector(".content-meseros");
        const toggleBtn = document.querySelector('.navbar-toggler');
        const titlePedido = document.querySelector('.title-pedido');
        const titlePedidos1 = document.querySelector('.title-pedidos1');
        const cardPedidos1 = document.querySelectorAll('.card-pedido1');
        const boxPedidos1 = document.querySelectorAll('.boxPedido1');
  // Agregado
    
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
});

