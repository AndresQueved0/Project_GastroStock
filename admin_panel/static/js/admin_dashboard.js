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
        const deleteButtons = document.querySelectorAll('.delete-product');
        const deleteModal = new bootstrap.Modal(document.getElementById('deleteProductoConfirmModal'));
        let productIdToDelete = null;
    
        deleteButtons.forEach(button => {
            button.addEventListener('click', function(event) {
                event.preventDefault();
                productIdToDelete = this.getAttribute('data-id');
                deleteModal.show();
            });
        });
    
        document.getElementById('confirmDeleteProducto').addEventListener('click', function() {
            if (productIdToDelete) {
                deleteProduct(productIdToDelete);
            }
        });
    
        function deleteProduct(productoId) {
            fetch(`/admin-panel/borrar-producto/${productoId}/`, {
                method: 'POST',
                headers: {
                    'X-CSRFToken': getCookie('csrftoken'),
                    'Content-Type': 'application/json'
                },
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    const row = document.querySelector(`tr[data-product-id="${productoId}"]`);
                    if (row) {
                        row.remove();
                    }
                    // Cerrar el modal
                    deleteModal.hide();  // Aquí se cierra el modal
                    showAlert(data.type, data.message, 'Producto');
                } else {
                    console.error('Error al eliminar el producto:', data.message);
                    showAlert(data.type, data.message, 'Producto');
                }
            })
            .catch(error => {
                console.error('Error al procesar la solicitud:', error);
                showAlert('error', 'Error al procesar la solicitud de eliminación.', 'Producto');
            });
        }
    
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
    });
    

    document.addEventListener('DOMContentLoaded', function() {
        const deleteButtons = document.querySelectorAll('.delete-empleado');
        const deleteModal = new bootstrap.Modal(document.getElementById('deleteEmpleadoConfirmModal'));
        let empleadoIdToDelete = null;
    
        deleteButtons.forEach(button => {
            button.addEventListener('click', function(event) {
                event.preventDefault();
                empleadoIdToDelete = this.getAttribute('data-id');
                deleteModal.show();
            });
        });
    
        document.getElementById('confirmDeleteEmpleado').addEventListener('click', function() {
            if (empleadoIdToDelete) {
                deleteEmpleado(empleadoIdToDelete);
            }
        });
    
        function deleteEmpleado(empleadoId) {
            fetch(`/admin-panel/borrar-empleado/${empleadoId}/`, {
                method: 'POST',
                headers: {
                    'X-CSRFToken': getCookie('csrftoken'),
                    'Content-Type': 'application/json'
                },
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    const card = document.querySelector(`.card[data-empleado-id="${empleadoId}"]`);
                    if (card) {
                        card.remove();
                    }
                    showAlert(data.type, data.message, 'Empleado');
                } else {
                    console.error('Error al eliminar el empleado:', data.message);
                    showAlert(data.type, data.message, 'Empleado');
                }
            })
            .catch(error => {
                console.error('Error al procesar la solicitud:', error);
                showAlert('error', 'Error al procesar la solicitud de eliminación.', 'Empleado');
            });
        }
        
    
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
    });

    function showAlert(type, message, category = 'General') {
        const alertPlaceholder = document.getElementById(`alertPlaceholder${category}`);
        if (!alertPlaceholder) {
            console.error(`No se encontró el contenedor de alertas para la categoría ${category}`);
            return;
        }
        const wrapper = document.createElement('div');
        wrapper.innerHTML = [
            `<div class="alert alert-${type} alert-dismissible" role="alert">`,
            `   <div>${message}</div>`,
            '   <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>',
            '</div>'
        ].join('');
        alertPlaceholder.append(wrapper);
    
        // Opcional: hacer desaparecer la alerta después de 5 segundos
        setTimeout(() => {
            const alert = bootstrap.Alert.getOrCreateInstance(wrapper.firstChild);
            alert.close();
        }, 5000);
    }
    
    setTimeout(function() {
        var messageContainer = document.getElementById('message-container');
        if (messageContainer) {
            messageContainer.style.display = 'none';
        }
    }, 3000);

    document.addEventListener('DOMContentLoaded', function() {
        const ubicacionSelect = document.getElementById('ubicacion-select');
        ubicacionSelect.addEventListener('change', function() {
            const selectedUbicacion = this.value;
            const currentUrl = new URL(window.location.href);
            currentUrl.searchParams.set('ubicacion', selectedUbicacion);
            currentUrl.searchParams.set('section', 'mesas');
            window.location.href = currentUrl.toString();
        });
    });

    document.addEventListener('DOMContentLoaded', function() {
        const deleteButtons = document.querySelectorAll('.delete-menuitem');
        const deleteModal = new bootstrap.Modal(document.getElementById('deleteMenuitemConfirmModal'));
        let menuitemIdToDelete = null;
    
        deleteButtons.forEach(button => {
            button.addEventListener('click', function(event) {
                event.preventDefault();
                menuitemIdToDelete = this.getAttribute('data-id');
                deleteModal.show();
            });
        });
    
        document.getElementById('confirmDeleteMenuitem').addEventListener('click', function() {
            if (menuitemIdToDelete) {
                deleteMenuitem(menuitemIdToDelete);
            }
        });
    
        function deleteMenuitem(menuitemId) {
            fetch(`/admin-panel/borrar-menuitem/${menuitemId}/`, {
                method: 'POST',
                headers: {
                    'X-CSRFToken': getCookie('csrftoken'),
                    'Content-Type': 'application/json'
                },
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Eliminar la card del DOM
                    const card = document.querySelector(`.card[data-id="${menuitemId}"]`);
                    if (card) {
                        const columnElement = card.closest('.col-md-4');
                        if (columnElement) {
                            columnElement.remove();
                        }
                    }
                    showAlert('success', 'Plato eliminado con éxito', 'Éxito');
                } else {
                    console.error('Error al eliminar el Plato:', data.message);
                    showAlert('danger', data.message || 'Error al eliminar el plato', 'Error');
                }
            })
            .catch(error => {
                console.error('Error al procesar la solicitud:', error);
                showAlert('danger', 'Error al procesar la solicitud de eliminación.', 'Error');
            })
            .finally(() => {
                // Cerrar el modal después de procesar la respuesta
                deleteModal.hide();
                // Resetear el ID del item a eliminar
                menuitemIdToDelete = null;
            });
        }
    
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
    
        function showAlert(type, message, title) {
            const alertPlaceholder = document.getElementById('alertPlaceholderMenu');
            const wrapper = document.createElement('div');
            wrapper.innerHTML = [
                `<div class="alert alert-${type} alert-dismissible fade show" role="alert">`,
                `   <strong>${title}:</strong> ${message}`,
                '   <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>',
                '</div>'
            ].join('');
    
            alertPlaceholder.append(wrapper);
    
            // Automatically remove the alert after 5 seconds
            setTimeout(() => {
                const alert = bootstrap.Alert.getOrCreateInstance(wrapper.firstChild);
                alert.close();
            }, 5000);
        }
    });