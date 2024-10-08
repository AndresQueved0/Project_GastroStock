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