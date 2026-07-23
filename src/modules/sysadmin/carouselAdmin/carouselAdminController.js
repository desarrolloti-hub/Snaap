// src/modules/sysadmin/carouselAdmin/carouselAdminController.js
import { userService } from '../../../services/userService.js';
import { carouselService } from '../../../services/carouselService.js';

let currentItems = [];
let editingItemId = null;

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
    await loadItems();
    setupEvents();
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
            Swal.fire('Error', result.error, 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        Swal.fire('Error', 'Error al cargar imágenes', 'error');
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
                    ${item.imagePath ? '<span class="item-status storage">📦 Storage</span>' : ''}
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

function setupEvents() {
    // Botón Agregar
    const addBtn = document.getElementById('addImageBtn');
    if (addBtn) {
        addBtn.onclick = function(e) {
            e.preventDefault();
            openAddModal();
            return false;
        };
    }

    // Botón Migrar (ahora solo info)
    const migrateBtn = document.getElementById('migrateImagesBtn');
    if (migrateBtn) {
        migrateBtn.onclick = function(e) {
            e.preventDefault();
            Swal.fire('Información', 'Las imágenes ya se guardan en Storage automáticamente', 'info');
            return false;
        };
    }

    // Eventos de los botones (delegación)
    document.addEventListener('click', async function(e) {
        const toggleBtn = e.target.closest('.btn-toggle');
        if (toggleBtn) {
            e.preventDefault();
            e.stopPropagation();
            const id = toggleBtn.dataset.id;
            const active = toggleBtn.dataset.active === 'true';
            await toggleItem(id, active);
            return;
        }

        const editBtn = e.target.closest('.btn-edit');
        if (editBtn) {
            e.preventDefault();
            e.stopPropagation();
            const id = editBtn.dataset.id;
            openEditModal(id);
            return;
        }

        const deleteBtn = e.target.closest('.btn-delete');
        if (deleteBtn) {
            e.preventDefault();
            e.stopPropagation();
            const id = deleteBtn.dataset.id;
            await deleteItem(id);
            return;
        }
    });

    // Modal
    const closeBtn = document.getElementById('closeModal');
    if (closeBtn) {
        closeBtn.onclick = function(e) {
            e.preventDefault();
            closeModal();
            return false;
        };
    }

    const cancelBtn = document.getElementById('cancelModal');
    if (cancelBtn) {
        cancelBtn.onclick = function(e) {
            e.preventDefault();
            closeModal();
            return false;
        };
    }

    const saveBtn = document.getElementById('saveImageBtn');
    if (saveBtn) {
        saveBtn.onclick = function(e) {
            e.preventDefault();
            saveImage();
            return false;
        };
    }

    window.addEventListener('click', function(e) {
        const modal = document.getElementById('addImageModal');
        if (modal && e.target === modal) {
            closeModal();
        }
    });

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const modal = document.getElementById('addImageModal');
            if (modal && modal.style.display === 'flex') {
                closeModal();
            }
        }
    });
}

function openAddModal() {
    const modal = document.getElementById('addImageModal');
    if (!modal) {
        Swal.fire('Error', 'El modal no está disponible', 'error');
        return;
    }
    
    editingItemId = null;
    document.getElementById('modalTitle').textContent = 'Agregar imagen al carrusel';
    document.getElementById('saveImageBtn').textContent = 'Guardar';
    document.getElementById('imageForm').reset();
    document.getElementById('imageUrlInput').value = '';
    document.getElementById('imageFile').value = '';
    
    modal.style.display = 'flex';
    modal.classList.add('show');
    document.body.classList.add('modal-open');
}

function openEditModal(id) {
    const item = currentItems.find(i => i.id === id);
    if (!item) {
        Swal.fire('Error', 'Item no encontrado', 'error');
        return;
    }

    const modal = document.getElementById('addImageModal');
    if (!modal) {
        Swal.fire('Error', 'El modal no está disponible', 'error');
        return;
    }

    editingItemId = id;
    document.getElementById('modalTitle').textContent = 'Editar imagen del carrusel';
    document.getElementById('saveImageBtn').textContent = 'Actualizar';
    document.getElementById('imageTitle').value = item.title || '';
    document.getElementById('imageSubtitle').value = item.subtitle || '';
    document.getElementById('imageLink').value = item.link || '';
    document.getElementById('imageUrlInput').value = item.imageUrl || '';
    document.getElementById('imageFile').value = '';
    
    modal.style.display = 'flex';
    modal.classList.add('show');
    document.body.classList.add('modal-open');
}

function closeModal() {
    const modal = document.getElementById('addImageModal');
    if (modal) {
        modal.style.display = 'none';
        modal.classList.remove('show');
        document.body.classList.remove('modal-open');
        editingItemId = null;
    }
}

async function saveImage() {
    const title = document.getElementById('imageTitle').value.trim();
    const subtitle = document.getElementById('imageSubtitle').value.trim();
    const link = document.getElementById('imageLink').value.trim();
    const imageUrl = document.getElementById('imageUrlInput').value.trim();
    const imageFile = document.getElementById('imageFile').files[0];

    if (!title) {
        Swal.fire('Campo Requerido', 'Por favor ingresa un título', 'warning');
        return;
    }

    if (!editingItemId && !imageUrl && !imageFile) {
        Swal.fire('Campo Requerido', 'Por favor ingresa una URL o selecciona un archivo', 'warning');
        return;
    }

    Swal.fire({
        title: editingItemId ? 'Actualizando imagen...' : 'Guardando imagen...',
        text: 'Por favor espera',
        allowOutsideClick: false,
        showConfirmButton: false,
        didOpen: () => Swal.showLoading()
    });

    try {
        const imageData = { title, subtitle, link: link || '/host/event-crud' };
        let result;

        if (editingItemId) {
            result = await carouselService.actualizarItem(editingItemId, imageData, imageFile || null);
        } else {
            result = await carouselService.crearItem({ ...imageData, active: true }, imageFile || null);
        }

        Swal.close();

        if (result.success) {
            Swal.fire('¡Éxito!', editingItemId ? 'Imagen actualizada' : 'Imagen agregada', 'success');
            closeModal();
            await loadItems();
        } else {
            Swal.fire('Error', result.error, 'error');
        }
    } catch (error) {
        Swal.close();
        Swal.fire('Error', error.message, 'error');
    }
}

async function toggleItem(id, currentActive) {
    try {
        const newActive = !currentActive;
        const result = await carouselService.actualizarItem(id, { active: newActive });
        
        if (result.success) {
            Swal.fire('¡Éxito!', `Imagen ${newActive ? 'activada' : 'desactivada'}`, 'success');
            await loadItems();
        } else {
            Swal.fire('Error', result.error, 'error');
        }
    } catch (error) {
        Swal.fire('Error', error.message, 'error');
    }
}

async function deleteItem(id) {
    const item = currentItems.find(i => i.id === id);
    if (!item) return;

    const result = await Swal.fire({
        title: '¿Eliminar imagen?',
        html: `¿Estás seguro de eliminar <strong>${item.title || 'sin título'}</strong>?`,
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
            Swal.fire('¡Éxito!', 'Imagen eliminada', 'success');
            await loadItems();
        } else {
            Swal.fire('Error', deleteResult.error, 'error');
        }
    } catch (error) {
        Swal.close();
        Swal.fire('Error', error.message, 'error');
    }
}

export default carouselAdminController;