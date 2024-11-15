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
        fetch(`borrar-producto/${productoId}/`, {
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

function deleteEmpleado(empleadoId, csrfToken) {
    Swal.fire({
        title: '¿Estás seguro?',
        text: '¿Deseas eliminar este empleado?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            fetch(`borrar-empleado/${empleadoId}/`, {
                method: 'POST',
                headers: {
                    'X-CSRFToken': csrfToken,
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
                    Swal.fire({
                        icon: 'success',
                        title: 'Empleado eliminado',
                        text: data.message,
                        timer: 3000,
                        timerProgressBar: true,
                        confirmButtonColor: '#39a900'
                    });
                    updateEmpleadosView();
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: data.message,
                        confirmButtonColor: '#d33'
                    });
                }
            })
            .catch(error => {
                console.error('Error al procesar la solicitud:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Error al procesar la solicitud de eliminación.',
                    confirmButtonColor: '#d33'
                });
            });
        }
    });
}

function updateEmpleadosView() {
    const empleadosContainer = document.getElementById('empleadosContainer');
    fetch('')
        .then(response => response.json())
        .then(data => {
            empleadosContainer.innerHTML = '';
            data.forEach(empleado => {
                const card = createEmpleadoCard(empleado);
                empleadosContainer.appendChild(card);
            });
        })
        .catch(error => {
            console.error('Error al actualizar la vista:', error);
        });
}

function createEmpleadoCard(empleado) {
    const cardDiv = document.createElement('div');
    cardDiv.classList.add('col-md-6', 'col-lg-3', 'mt-4');

    const card = document.createElement('div');
    card.classList.add('card', 'card-empleado');
    card.dataset.empleadoId = empleado.id;

    const fotoDiv = document.createElement('div');
    fotoDiv.classList.add('d-flex', 'justify-content-center', 'align-items-center', 'empleado-foto');

    const img = document.createElement('img');
    img.classList.add('empleado-img');
    if (empleado.foto) {
        img.src = empleado.foto.url;
        img.alt = `${empleado.nombre} ${empleado.apellido}`;
    } else {
        img.src = '/static/img/default-profile.png';
        img.alt = 'Foto por defecto';
    }
    fotoDiv.appendChild(img);

    const cardBody = document.createElement('div');
    cardBody.classList.add('card-body');

    const cardTitle = document.createElement('h5');
    cardTitle.classList.add('card-title-empleado');
    cardTitle.innerHTML = `<strong>${empleado.nombre} ${empleado.apellido}</strong>`;
    cardBody.appendChild(cardTitle);

    const pPuesto = document.createElement('p');
    pPuesto.classList.add('card-text', 'm-0');
    pPuesto.innerHTML = `<strong>Puesto:</strong> ${empleado.puesto}`;
    cardBody.appendChild(pPuesto);

    const pTelefono = document.createElement('p');
    pTelefono.classList.add('card-text', 'm-0');
    pTelefono.innerHTML = `<strong>Teléfono:</strong> ${empleado.telefono}`;
    cardBody.appendChild(pTelefono);

    const pFechaContratacion = document.createElement('p');
    pFechaContratacion.classList.add('card-text', 'm-0');
    pFechaContratacion.innerHTML = `<strong>Contratación:</strong> ${new Date(empleado.fecha_contratacion).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })}`;
    cardBody.appendChild(pFechaContratacion);

    const cardFooter = document.createElement('div');
    cardFooter.classList.add('card-footer', 'border-none', 'text-end');

    const deleteButton = document.createElement('button');
    deleteButton.classList.add('btn', 'btn-danger', 'delete-empleado');
    deleteButton.dataset.id = empleado.id;
    deleteButton.textContent = 'Eliminar';
    cardFooter.appendChild(deleteButton);

    const editButton = document.createElement('button');
    editButton.classList.add('btn', 'btn-success', 'btn-editar');
    editButton.dataset.id = empleado.id;
    editButton.dataset.bsToggle = 'modal';
    editButton.dataset.bsTarget = '#empleadoModal';
    editButton.textContent = 'Editar';
    cardFooter.appendChild(editButton);

    card.appendChild(fotoDiv);
    card.appendChild(cardBody);
    card.appendChild(cardFooter);
    cardDiv.appendChild(card);

    return cardDiv;
}

document.addEventListener('DOMContentLoaded', function() {
    const deleteButtons = document.querySelectorAll('.delete-empleado');
    const csrfToken = document.querySelector('input[name="csrfmiddlewaretoken"]').value;

    deleteButtons.forEach(button => {
        button.addEventListener('click', function(event) {
            event.preventDefault();
            const empleadoIdToDelete = this.getAttribute('data-id');
            deleteEmpleado(empleadoIdToDelete, csrfToken);
        });
    });
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
            fetch(`borrar-menuitem/${menuitemId}/`, {
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
        
        function showAlert(type, message, title) {
            const alertPlaceholder = document.getElementById('alertPlaceholderProducto');
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

    

    function showSuccessAlert(message) {
        Swal.fire({
            title: '¡Éxito!',
            text: message,
            icon: 'success',
            confirmButtonText: 'OK',
            confirmButtonColor: '#39A900',
            timer: 2000,
            timerProgressBar: true
        });
    }
    
    // Función para mostrar alertas de error
    function showErrorAlert(message) {
        Swal.fire({
            title: '¡Error!',
            text: message,
            icon: 'error',
            confirmButtonText: 'OK',
            confirmButtonColor: '#dc3545'
        });
    }
    
    // Manejar el envío del formulario
    

    document.addEventListener('DOMContentLoaded', function() {
        const mesaForm = document.querySelector('#mesaModal form');
        if (mesaForm) {
            mesaForm.addEventListener('submit', async function(e) {
                e.preventDefault();
                
                try {
                    const formData = new FormData(this);
                    const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
    
                    const response = await fetch(this.action, {
                        method: 'POST',
                        body: formData,
                        headers: {
                            'X-Requested-With': 'XMLHttpRequest',
                            'X-CSRFToken': csrfToken  // Aquí agregas el token CSRF
                        }
                    });
                    
                    const data = await response.json();
                    
                    // Cerrar el modal
                    const mesaModal = bootstrap.Modal.getInstance(document.getElementById('mesaModal'));
                    mesaModal.hide();
                    
                    if (data.status === 'success') {
                        Swal.fire({
                            icon: 'success',
                            title: 'Éxito',
                            text: data.message,
                            timer: 3000,
                            confirmButtonColor: '#39a900',
                            timerProgressBar: true
                        }).then(() => {
                            location.reload();
                        });
                    } else {
                        Swal.fire({
                            icon: 'error',
                            title: 'Error',
                            text: data.message
                        });
                    }
                } catch (error) {
                    console.error('Error:', error);
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'Ha ocurrido un error al procesar la solicitud.'
                    });
                }
            });
        }
    });
    
    // Limpiar el formulario cuando se cierre el modal
    document.getElementById('mesaModal')?.addEventListener('hidden.bs.modal', function() {
        const form = this.querySelector('form');
        if (form) {
            form.reset();
            form.querySelectorAll('.is-invalid').forEach(el => {
                el.classList.remove('is-invalid');
            });
        }
    });


    document.addEventListener('DOMContentLoaded', function() {
        const menuItemForm = document.querySelector('#menuItemForm');
        const imagenInput = menuItemForm?.querySelector('input[type="file"]');
        const imagePreview = document.querySelector('#menuImagePreview');
        const previewImage = imagePreview?.querySelector('img');
        const submitButton = menuItemForm?.querySelector('button[type="submit"]');
        const spinner = submitButton?.querySelector('.spinner-border');
        
        // Previsualización de imagen
        if (imagenInput && imagePreview && previewImage) {
            imagenInput.addEventListener('change', function() {
                const file = this.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        previewImage.src = e.target.result;
                        imagePreview.style.display = 'block';
                    }
                    reader.readAsDataURL(file);
                } else {
                    imagePreview.style.display = 'none';
                    previewImage.src = '';
                }
            });
        }
    
        if (menuItemForm) {
            menuItemForm.addEventListener('submit', async function(e) {
                e.preventDefault();
                
                // Mostrar spinner y deshabilitar botón
                if (submitButton && spinner) {
                    submitButton.disabled = true;
                    spinner.style.display = 'inline-block';
                }
    
                // Limpiar errores previos
                this.querySelectorAll('.is-invalid').forEach(el => {
                    el.classList.remove('is-invalid');
                });
    
                try {
                    const formData = new FormData(this);
                    const response = await fetch(this.action, {
                        method: 'POST',
                        body: formData,
                        headers: {
                            'X-Requested-With': 'XMLHttpRequest',
                            'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value
                        },
                        credentials: 'same-origin'
                    });
    
                    const data = await response.json();
    
                    if (response.ok && data.status === 'success') {
                        // Cerrar modal
                        const menuItemModal = bootstrap.Modal.getInstance(document.getElementById('menuItemModal'));
                        menuItemModal.hide();
    
                        // Mostrar mensaje de éxito
                        Swal.fire({
                            icon: 'success',
                            title: 'Éxito',
                            text: data.message,
                            timer: 3000,
                            confirmButtonColor: '#39a900',
                            timerProgressBar: true
                        }).then(() => {
                            location.reload();
                        });
                    } else {
                        // Mostrar errores de validación
                        if (data.errors) {
                            Object.entries(data.errors).forEach(([field, messages]) => {
                                const input = this.querySelector(`[name="${field}"]`);
                                if (input) {
                                    input.classList.add('is-invalid');
                                    const feedback = input.nextElementSibling;
                                    if (feedback && feedback.classList.contains('invalid-feedback')) {
                                        feedback.textContent = Array.isArray(messages) ? messages[0] : messages;
                                    }
                                }
                            });
                        }
    
                        Swal.fire({
                            icon: 'error',
                            title: 'Error',
                            text: data.message || 'Ha ocurrido un error al procesar la solicitud.'
                        });
                    }
                } catch (error) {
                    console.error('Error:', error);
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'Ha ocurrido un error al procesar la solicitud.'
                    });
                } finally {
                    // Ocultar spinner y habilitar botón
                    if (submitButton && spinner) {
                        submitButton.disabled = false;
                        spinner.style.display = 'none';
                    }
                }
            });
    
            // Limpiar formulario al cerrar el modal
            document.getElementById('menuItemModal')?.addEventListener('hidden.bs.modal', function() {
                menuItemForm.reset();
                imagePreview.style.display = 'none';
                previewImage.src = '';
                menuItemForm.querySelectorAll('.is-invalid').forEach(el => {
                    el.classList.remove('is-invalid');
                });
            });
        }
    });

    document.addEventListener('DOMContentLoaded', function() {
        const inventarioForm = document.querySelector('#inventarioModal form');
        
        if (inventarioForm) {
            inventarioForm.addEventListener('submit', async function(e) {
                e.preventDefault();
                
                try {
                    const formData = new FormData(this);
                    const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
    
                    const response = await fetch(this.action, {
                        method: 'POST',
                        body: formData,
                        headers: {
                            'X-Requested-With': 'XMLHttpRequest',
                            'X-CSRFToken': csrfToken
                        }
                    });
                    
                    const data = await response.json();
                    
                    // Cerrar el modal
                    const inventarioModal = bootstrap.Modal.getInstance(document.getElementById('inventarioModal'));
                    inventarioModal.hide();
                    
                    if (data.status === 'success') {
                        Swal.fire({
                            icon: 'success',
                            title: 'Éxito',
                            text: data.message,
                            timer: 3000,
                            confirmButtonColor: '#39a900',
                            timerProgressBar: true
                        }).then(() => {
                            location.reload();
                        });
                    } else {
                        Swal.fire({
                            icon: 'error',
                            title: 'Error',
                            text: data.message
                        });
                    }
                } catch (error) {
                    console.error('Error:', error);
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'Ha ocurrido un error al procesar la solicitud.'
                    });
                }
            });
            document.getElementById('inventarioModal')?.addEventListener('hidden.bs.modal', function() {
                const form = this.querySelector('form');
                if (form) {
                    form.reset();
                    form.querySelectorAll('.is-invalid').forEach(el => {
                        el.classList.remove('is-invalid');
                    });
                }
            });
            }
        });

        document.addEventListener("DOMContentLoaded", function() {
            let isEditMode = false;
            let empleadoId = null;
        
            // Configuración para el botón de "Nuevo Empleado"
            const btnCrear = document.querySelector(".btn-crear");
            if (btnCrear) {
                btnCrear.addEventListener("click", function() {
                    isEditMode = false;
                    document.getElementById("empleadoForm").reset();
                    document.getElementById("empleado-id").value = "";
                    document.querySelector("#empleadoModalLabel").textContent = "Registrar Nuevo Empleado";
        
                    // Oculta la vista previa de la imagen
                    const imagePreview = document.getElementById("imagePreview");
                    if (imagePreview) {
                        imagePreview.style.display = "none";
                        const img = imagePreview.querySelector("img");
                        if (img) img.src = "";
                    }
                });
            }
        
            // Configuración para el botón de "Editar Empleado"
            document.querySelectorAll(".btn-editar").forEach(button => {
                button.addEventListener("click", function() {
                    isEditMode = true;
                    empleadoId = this.dataset.id;
        
                    fetch(`editar-empleado/${empleadoId}/`, {
                        method: "GET",
                        headers: {
                            "X-Requested-With": "XMLHttpRequest"
                        }
                    })
                    .then(response => response.json())
                    .then(data => {
                        if (data) {
                            document.querySelector("#empleadoModalLabel").textContent = "Editar Empleado";
                            document.getElementById("empleado-id").value = empleadoId;
                            document.getElementById("id_nombre").value = data.nombre;
                            document.getElementById("id_apellido").value = data.apellido;
                            document.getElementById("id_puesto").value = data.puesto;
                            document.getElementById("id_telefono").value = data.telefono;
                            document.getElementById("id_fecha_contratacion").value = data.fecha_contratacion;
        
                            const imagePreview = document.getElementById("imagePreview");
                            if (imagePreview && data.foto) {
                                imagePreview.style.display = "block";
                                const img = imagePreview.querySelector("img");
                                if (img) img.src = data.foto;
                            } else {
                                imagePreview.style.display = "none";
                            }
                        }
                    })
                    .catch(error => {
                        console.error('Error al cargar datos del empleado:', error);
                    });
                });
            });
        
            // Envío del formulario de creación o edición de empleado
            const empleadoForm = document.getElementById("empleadoForm");
            if (empleadoForm) {
                empleadoForm.addEventListener("submit", function(event) {
                    event.preventDefault();
        
                    const formData = new FormData(this);
                    const url = isEditMode ? `editar-empleado/${empleadoId}/` : 'registrar-empleado/';
        
                    fetch(url, {
                        method: "POST",
                        body: formData,
                        headers: {
                            "X-Requested-With": "XMLHttpRequest"
                        }
                    })
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            Swal.fire({
                                icon: 'success',
                                title: 'Éxito',
                                text: data.message,
                                timer: 3000,
                                confirmButtonColor: '#39a900',
                                timerProgressBar: true
                            }).then(() => {
                                location.reload();
                            });
                        } else {
                            Swal.fire({
                                icon: 'error',
                                title: 'Error',
                                text: data.message,
                                confirmButtonColor: '#d33'
                            });
        
                            // Muestra errores específicos en el formulario
                            if (data.errors) {
                                for (const [key, value] of Object.entries(data.errors)) {
                                    const errorField = document.querySelector(`[name="${key}"]`).nextElementSibling;
                                    if (errorField) errorField.textContent = value.join(", ");
                                }
                            }
                        }
                    })
                    .catch(error => {
                        console.error('Error de red:', error);
                        Swal.fire({
                            icon: 'error',
                            title: 'Error de red',
                            text: 'No se pudo conectar al servidor. Intenta nuevamente.'
                        });
                    });
                });
            }
        });
        