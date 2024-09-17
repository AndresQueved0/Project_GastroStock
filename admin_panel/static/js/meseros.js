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