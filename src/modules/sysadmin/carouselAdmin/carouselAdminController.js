// src/modules/sysadmin/carouselAdmin/carouselAdminController.js
import { userService } from '../../../services/userService.js';
import { carouselService } from '../../../services/carouselService.js';

let currentItems = [];
let editingItemId = null;
let eventsInitialized = false;

export async function carouselAdminController() {
    console.log('🔥 Carrusel Admin Controller iniciado');

    if (!userService.isAuthenticated()) {
        console.warn('⚠️ Usuario no autenticado');
        window.location.href = '/login';
        return;
    }

    const user = userService.getCurrentUser();
    if (user.role !== 'sysadmin') {
        Swal.fire({
            title: 'Acceso Denegado',
            text: 'No tienes permisos de administrador',
            icon: 'error',
            confirmButtonText: 'OK'
        }).then(() => {
            window.location.href = '/';
        });
        return;
    }

    carouselService.setUsuarioActual(user);
    
    await new Promise(resolve => {
        if (document.readyState === 'complete') {
            resolve();
        } else {
            window.addEventListener('load', resolve);
        }
    });
    
    await loadItems();
    
    if (!eventsInitialized) {
        setupAllEvents();
        eventsInitialized = true;
    } else {
        console.log('⏭️ Eventos ya inicializados, saltando...');
    }
}

async function loadItems() {
    const container = document.getElementById('carouselItemsContainer');
    if (container) {
        container.innerHTML = '<div class="loading-text">Cargando imágenes...</div>';
    }

    try {
        const result = await carouselService.obtenerTodosLosItems();
        if (result.success) {
            currentItems = result.items;
            renderItems();
        } else {
            Swal.fire({
                title: 'Error',
                text: 'Error al cargar: ' + result.error,
                icon: 'error',
                confirmButtonText: 'OK'
            });
        }
    } catch (error) {
        console.error('Error:', error);
        Swal.fire({
            title: 'Error',
            text: 'Error al cargar imágenes',
            icon: 'error',
            confirmButtonText: 'OK'
        });
    }
}

function renderItems() {
    const container = document.getElementById('carouselItemsContainer');
    if (!container) return;

    if (currentItems.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-images"></i>
                <p>No hay imágenes en el carrusel</p>
                <p class="empty-state-subtitle">Haz clic en "Agregar imagen" para comenzar</p>
            </div>
        `;
        return;
    }

    container.innerHTML = currentItems.map(item => `
        <div class="carousel-item-card" data-id="${item.id}">
            <div class="item-preview">
                <img src="${item.imageUrl}" alt="${item.title || 'Imagen'}" 
                     onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22300%22 height=%22200%22><rect width=%22300%22 height=%22200%22 fill=%22%231a1a2e%22/><text x=%22150%22 y=%22100%22 text-anchor=%22middle%22 fill=%22%23666%22>Sin imagen</text></svg>'">
                <div class="item-overlay">
                    <span class="item-order">#${item.order || 0}</span>
                    <span class="item-status ${item.active ? 'active' : 'inactive'}">
                        ${item.active ? 'Activo' : 'Inactivo'}
                    </span>
                    ${item.imagePath && item.imagePath.startsWith('base64_') ? '<span class="item-status base64">📷 Base64</span>' : ''}
                </div>
            </div>
            <div class="item-info">
                <h4>${item.title || 'Sin título'}</h4>
                <p>${item.subtitle || ''}</p>
                ${item.link ? `<p class="item-link">🔗 ${item.link}</p>` : ''}
            </div>
            <div class="item-actions">
                <button class="btn-toggle" data-id="${item.id}" data-active="${item.active}">
                    <i class="fas ${item.active ? 'fa-toggle-on' : 'fa-toggle-off'}"></i>
                </button>
                <button class="btn-edit" data-id="${item.id}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-delete" data-id="${item.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
}

function setupAllEvents() {
    console.log('🔧 Configurando eventos...');
    
    const addBtn = document.getElementById('addImageBtn');
    if (addBtn) {
        addBtn.onclick = function(e) {
            e.preventDefault();
            console.log('➕ Click en Agregar imagen');
            openAddModal();
            return false;
        };
        console.log('✅ Evento asignado a "Agregar imagen"');
    }

    const migrateBtn = document.getElementById('migrateImagesBtn');
    if (migrateBtn) {
        migrateBtn.onclick = function(e) {
            e.preventDefault();
            console.log('☁️ Click en Migrar a Storage');
            Swal.fire({
                title: 'Información',
                text: 'ℹ️ Las imágenes se guardan en Base64. No es necesario migrar.',
                icon: 'info',
                confirmButtonText: 'OK'
            });
            return false;
        };
        console.log('✅ Evento asignado a "Migrar a Storage"');
    }

    const saveBtn = document.getElementById('saveImageBtn');
    if (saveBtn) {
        saveBtn.onclick = function(e) {
            e.preventDefault();
            console.log('💾 Click en Guardar');
            saveImage();
            return false;
        };
        console.log('✅ Evento asignado a "Guardar"');
    }

    const closeBtn = document.getElementById('closeModal');
    if (closeBtn) {
        closeBtn.onclick = function(e) {
            e.preventDefault();
            closeModalHandler();
            return false;
        };
    }

    const cancelBtn = document.getElementById('cancelModal');
    if (cancelBtn) {
        cancelBtn.onclick = function(e) {
            e.preventDefault();
            closeModalHandler();
            return false;
        };
    }

    window.addEventListener('click', function(e) {
        const modal = document.getElementById('addImageModal');
        if (modal && e.target === modal) {
            closeModalHandler();
        }
    });

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const modal = document.getElementById('addImageModal');
            if (modal && modal.style.display === 'flex') {
                closeModalHandler();
            }
        }
    });

    document.addEventListener('click', function(e) {
        const toggleBtn = e.target.closest('.btn-toggle');
        if (toggleBtn) {
            e.preventDefault();
            e.stopPropagation();
            const id = toggleBtn.dataset.id;
            const active = toggleBtn.dataset.active === 'true';
            console.log('🔄 Toggle:', id, active);
            toggleItem(id, active);
            return;
        }
        
        const editBtn = e.target.closest('.btn-edit');
        if (editBtn) {
            e.preventDefault();
            e.stopPropagation();
            const id = editBtn.dataset.id;
            console.log('✏️ Editar:', id);
            openEditModal(id);
            return;
        }
        
        const deleteBtn = e.target.closest('.btn-delete');
        if (deleteBtn) {
            e.preventDefault();
            e.stopPropagation();
            const id = deleteBtn.dataset.id;
            console.log('🗑️ Eliminar:', id);
            deleteItem(id);
            return;
        }
    });

    console.log('✅ Todos los eventos configurados');
}

function openAddModal() {
    console.log('📝 Abriendo modal de agregar');
    
    const modal = document.getElementById('addImageModal');
    if (!modal) {
        Swal.fire({
            title: 'Error',
            text: 'El modal no está disponible',
            icon: 'error',
            confirmButtonText: 'OK'
        });
        return;
    }
    
    editingItemId = null;
    document.getElementById('modalTitle').textContent = 'Agregar imagen al carrusel';
    document.getElementById('modalIcon').innerHTML = '<i class="fas fa-plus-circle"></i>';
    document.getElementById('saveImageBtn').textContent = 'Guardar';
    document.getElementById('imageRequired').textContent = '* (URL o archivo)';
    document.getElementById('imageHint').textContent = 'Pega una URL de imagen o selecciona un archivo (se guardará en Base64)';
    document.getElementById('imageForm').reset();
    document.getElementById('imageUrlInput').value = '';
    document.getElementById('imageFile').value = '';
    
    modal.style.display = 'flex';
    modal.classList.add('show');
    document.body.classList.add('modal-open');
    
    setTimeout(() => document.getElementById('imageTitle').focus(), 100);
    console.log('✅ Modal de agregar abierto correctamente');
}

function openEditModal(id) {
    console.log('✏️ Abriendo modal de edición:', id);
    
    const modal = document.getElementById('addImageModal');
    if (!modal) {
        Swal.fire({
            title: 'Error',
            text: 'El modal no está disponible',
            icon: 'error',
            confirmButtonText: 'OK'
        });
        return;
    }
    
    const item = currentItems.find(i => i.id === id);
    if (!item) {
        Swal.fire({
            title: 'Error',
            text: 'Item no encontrado',
            icon: 'error',
            confirmButtonText: 'OK'
        });
        return;
    }

    editingItemId = id;
    document.getElementById('modalTitle').textContent = 'Editar imagen del carrusel';
    document.getElementById('modalIcon').innerHTML = '<i class="fas fa-edit"></i>';
    document.getElementById('saveImageBtn').textContent = 'Actualizar';
    document.getElementById('imageRequired').textContent = ' (opcional)';
    document.getElementById('imageHint').textContent = 'Deja en blanco para mantener la imagen actual. Si seleccionas archivo, se guardará en Base64.';
    document.getElementById('imageTitle').value = item.title || '';
    document.getElementById('imageSubtitle').value = item.subtitle || '';
    document.getElementById('imageLink').value = item.link || '';
    document.getElementById('imageUrlInput').value = item.imageUrl || '';
    document.getElementById('imageFile').value = '';
    
    modal.style.display = 'flex';
    modal.classList.add('show');
    document.body.classList.add('modal-open');
    
    console.log('✅ Modal de edición abierto correctamente');
}

function closeModalHandler() {
    const modal = document.getElementById('addImageModal');
    if (modal) {
        modal.style.display = 'none';
        modal.classList.remove('show');
        document.body.classList.remove('modal-open');
        editingItemId = null;
        console.log('✅ Modal cerrado');
    }
}

async function saveImage() {
    console.log('💾 Guardando imagen...');
    
    const title = document.getElementById('imageTitle').value.trim();
    const subtitle = document.getElementById('imageSubtitle').value.trim();
    const link = document.getElementById('imageLink').value.trim();
    const imageUrl = document.getElementById('imageUrlInput').value.trim();
    const imageFile = document.getElementById('imageFile').files[0];

    if (!title) {
        Swal.fire({
            title: 'Campo Requerido',
            text: 'Por favor ingresa un título',
            icon: 'warning',
            confirmButtonText: 'OK'
        });
        return;
    }

    if (!editingItemId && !imageUrl && !imageFile) {
        Swal.fire({
            title: 'Campo Requerido',
            text: 'Por favor ingresa una URL de imagen o selecciona un archivo',
            icon: 'warning',
            confirmButtonText: 'OK'
        });
        return;
    }

    if (imageUrl && !isValidUrl(imageUrl)) {
        Swal.fire({
            title: 'URL Inválida',
            text: 'La URL de imagen no es válida',
            icon: 'warning',
            confirmButtonText: 'OK'
        });
        return;
    }

    if (imageFile && imageFile.size > 5 * 1024 * 1024) {
        Swal.fire({
            title: 'Archivo muy grande',
            text: 'La imagen no puede superar los 5MB',
            icon: 'warning',
            confirmButtonText: 'OK'
        });
        return;
    }

    if (imageFile) {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (!allowedTypes.includes(imageFile.type)) {
            Swal.fire({
                title: 'Formato no permitido',
                text: 'Usa JPG, PNG, WEBP o GIF',
                icon: 'warning',
                confirmButtonText: 'OK'
            });
            return;
        }
    }

    Swal.fire({
        title: editingItemId ? 'Actualizando imagen...' : 'Guardando imagen...',
        text: 'Por favor espera',
        allowOutsideClick: false,
        showConfirmButton: false,
        didOpen: () => Swal.showLoading()
    });

    try {
        let result;
        
        const imageData = {
            title,
            subtitle,
            link: link || '/host/event-crud'
        };

        if (imageUrl) {
            imageData.imageUrl = imageUrl;
        }

        if (editingItemId) {
            result = await carouselService.actualizarItem(editingItemId, imageData, imageFile || null);
        } else {
            result = await carouselService.crearItem({ ...imageData, active: true }, imageFile || null);
        }

        Swal.close();

        if (result.success) {
            let mensaje = `✅ ${editingItemId ? 'Actualizada' : 'Agregada'} correctamente`;
            if (imageFile && !imageUrl) {
                mensaje += ' (imagen guardada en Base64)';
            }
            Swal.fire({
                title: '¡Éxito!',
                text: mensaje,
                icon: 'success',
                confirmButtonText: 'OK'
            });
            closeModalHandler();
            await loadItems();
        } else {
            Swal.fire({
                title: 'Error',
                text: result.error || 'Error al guardar la imagen',
                icon: 'error',
                confirmButtonText: 'OK'
            });
        }
    } catch (error) {
        Swal.close();
        console.error('❌ Error al guardar:', error);
        Swal.fire({
            title: 'Error',
            text: error.message || 'Error al guardar la imagen',
            icon: 'error',
            confirmButtonText: 'OK'
        });
    }
}

function isValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

async function toggleItem(id, currentActive) {
    console.log('🔄 Toggle item:', id, currentActive);
    try {
        const newActive = !currentActive;
        const result = await carouselService.actualizarItem(id, { active: newActive });
        
        if (result.success) {
            Swal.fire({
                title: '¡Éxito!',
                text: `Imagen ${newActive ? 'activada' : 'desactivada'} correctamente`,
                icon: 'success',
                confirmButtonText: 'OK'
            });
            await loadItems();
        } else {
            Swal.fire({
                title: 'Error',
                text: result.error || 'Error al cambiar estado',
                icon: 'error',
                confirmButtonText: 'OK'
            });
        }
    } catch (error) {
        console.error('Error al toggle:', error);
        Swal.fire({
            title: 'Error',
            text: 'Error al cambiar estado',
            icon: 'error',
            confirmButtonText: 'OK'
        });
    }
}

async function deleteItem(id) {
    console.log('🗑️ Eliminar item:', id);
    const item = currentItems.find(i => i.id === id);
    if (!item) {
        Swal.fire({
            title: 'Error',
            text: 'Item no encontrado',
            icon: 'error',
            confirmButtonText: 'OK'
        });
        return;
    }

    const result = await Swal.fire({
        title: '¿Eliminar imagen?',
        html: `¿Estás seguro de eliminar la imagen <strong>${item.title || 'sin título'}</strong>?<br>Esta acción no se puede deshacer.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
    });

    if (!result.isConfirmed) return;

    Swal.fire({
        title: 'Eliminando...',
        text: 'Por favor espera',
        allowOutsideClick: false,
        showConfirmButton: false,
        didOpen: () => Swal.showLoading()
    });

    try {
        const deleteResult = await carouselService.eliminarItem(id);
        Swal.close();
        
        if (deleteResult.success) {
            Swal.fire({
                title: '¡Éxito!',
                text: 'Imagen eliminada correctamente',
                icon: 'success',
                confirmButtonText: 'OK'
            });
            await loadItems();
        } else {
            Swal.fire({
                title: 'Error',
                text: deleteResult.error || 'Error al eliminar la imagen',
                icon: 'error',
                confirmButtonText: 'OK'
            });
        }
    } catch (error) {
        Swal.close();
        console.error('Error al eliminar:', error);
        Swal.fire({
            title: 'Error',
            text: 'Error al eliminar la imagen',
            icon: 'error',
            confirmButtonText: 'OK'
        });
    }
}

export default carouselAdminController;