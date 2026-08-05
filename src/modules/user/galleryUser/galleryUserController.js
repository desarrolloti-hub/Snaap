// src/modules/user/galleryUser/galleryUserController.js
import { userService } from '../../../services/userService.js';
import { eventImageService } from '../../../services/eventImageService.js';

// ============================================
// 🎮 CONTROLADOR DE GALERÍA
// ============================================
class GalleryUserController {
    constructor() {
        this.currentUser = null;
        this.eventoId = null;
        this.allImages = [];
        this.filteredImages = [];
        this.currentFilter = 'all';
        this.initialize();
    }

    // ============================================
    // 🚀 INICIALIZACIÓN
    // ============================================
    async initialize() {
        try {
            this.currentUser = userService.getCurrentUser();
            if (!this.currentUser) {
                this.currentUser = {
                    uid: 'guest-user',
                    email: null,
                    username: 'Invitado',
                    role: 'user'
                };
            }

            const urlParams = new URLSearchParams(window.location.search);
            this.eventoId = urlParams.get('eventId');

            if (!this.eventoId) {
                this.eventoId = localStorage.getItem('snaap_current_event');
                if (!this.eventoId) {
                    this.showError('No se especificó un evento');
                    return;
                }
            }

            console.log('🔍 Evento ID para galería:', this.eventoId);

            // ✅ EL NAVBAR SE MUESTRA NORMALMENTE - NO LO OCULTAMOS

            await this.loadImages();
            this.setupEventListeners();
            this.updateCounter();

        } catch (error) {
            console.error('Error initializing gallery:', error);
            this.showError('Error al cargar la galería');
        }
    }

    // ============================================
    // 📋 CARGAR IMÁGENES DEL EVENTO
    // ============================================
    async loadImages() {
        const galleryGrid = document.getElementById('galleryGrid');
        if (!galleryGrid) return;

        try {
            galleryGrid.innerHTML = `
                <div class="loading-spinner">
                    <div class="spinner"></div>
                    <p><i class="fas fa-spinner fa-spin"></i> Cargando imágenes...</p>
                </div>
            `;

            const result = await eventImageService.getEventImages(this.eventoId, this.currentUser?.uid);
            
            if (!result.success) {
                throw new Error(result.error);
            }

            this.allImages = result.images;
            console.log(`📋 ${this.allImages.length} imágenes cargadas con nombres de usuario`);

            this.applyFilter();

        } catch (error) {
            console.error('Error loading images:', error);
            galleryGrid.innerHTML = `<p class="error-message">Error al cargar imágenes: ${error.message}</p>`;
        }
    }

    // ============================================
    // 🎨 APLICAR FILTRO
    // ============================================
    applyFilter() {
        if (this.currentFilter === 'all') {
            this.filteredImages = this.allImages;
        } else {
            this.filteredImages = this.allImages.filter(img => img.type === this.currentFilter);
        }

        this.renderGallery(this.filteredImages);
        this.updateCounter();
    }

    // ============================================
    // 🎨 RENDERIZAR GALERÍA CON NOMBRES
    // ============================================
    renderGallery(images) {
        const galleryGrid = document.getElementById('galleryGrid');
        if (!galleryGrid) return;

        if (!images || images.length === 0) {
            galleryGrid.innerHTML = this.getEmptyStateHTML();
            return;
        }

        galleryGrid.innerHTML = images.map((image, index) => `
            <div class="gallery-item" data-index="${index}">
                <img src="${image.url}" alt="${image.fileName || 'Imagen'}" loading="lazy">
                <span class="gallery-type ${image.type}">
                    ${image.type === 'photo' ? '<i class="fas fa-camera"></i>' : '<i class="fas fa-paint-brush"></i>'}
                </span>
                <div class="gallery-item-info">
                    <span class="gallery-item-user">
                        <i class="fas fa-user-circle"></i> ${image.userName || 'Anónimo'}
                    </span>
                    <span class="gallery-item-date">
                        <i class="fas fa-calendar-alt"></i> ${this.formatDate(image.date)}
                    </span>
                </div>
            </div>
        `).join('');

        galleryGrid.querySelectorAll('.gallery-item').forEach((item, index) => {
            item.addEventListener('click', () => {
                this.openModal(index);
            });
        });
    }

    // ============================================
    // 🖼️ MODAL CON INFORMACIÓN DEL USUARIO
    // ============================================
    openModal(index) {
        const image = this.filteredImages[index];
        if (!image) return;

        const modal = document.getElementById('imageModal');
        const modalImage = document.getElementById('modalImage');
        const modalDate = document.getElementById('modalDate');
        const modalUser = document.getElementById('modalUser');
        const modalDeleteBtn = document.getElementById('modalDeleteBtn');

        if (modalImage) modalImage.src = image.url;
        
        const dateText = this.formatDate(image.date);
        const typeText = image.type === 'photo' ? '📸 Foto' : '🎨 Dibujo';
        
        if (modalDate) {
            modalDate.innerHTML = `<i class="fas fa-calendar-day"></i> ${dateText} - ${typeText}`;
        }
        
        if (modalUser) {
            modalUser.innerHTML = `<i class="fas fa-user-circle"></i> Subido por: <strong>${image.userName || 'Anónimo'}</strong>`;
        }
        
        if (modalDeleteBtn) modalDeleteBtn.dataset.index = index;
        if (modal) modal.style.display = 'flex';
    }

    closeModal() {
        const modal = document.getElementById('imageModal');
        if (modal) modal.style.display = 'none';
    }

    // ============================================
    // 🗑️ ELIMINAR IMAGEN
    // ============================================
    async handleDeleteImage(e) {
        const index = parseInt(e.target.dataset.index);
        if (isNaN(index)) return;

        const confirmDelete = confirm('⚠️ ¿Estás seguro de que quieres eliminar esta imagen?');
        if (!confirmDelete) return;

        const imageToDelete = this.filteredImages[index];
        if (!imageToDelete) {
            this.showError('No se encontró la imagen a eliminar');
            return;
        }

        try {
            const result = await eventImageService.deleteImage(imageToDelete.id, imageToDelete.path, this.eventoId);
            if (!result.success) {
                throw new Error(result.error);
            }

            this.closeModal();
            await this.loadImages();
            this.showSuccess('✅ Imagen eliminada exitosamente');

        } catch (error) {
            console.error('Error deleting image:', error);
            this.showError(error.message || 'Error al eliminar la imagen');
        }
    }

    // ============================================
    // 🎯 CONFIGURAR EVENTOS
    // ============================================
    setupEventListeners() {
        const btnBack = document.getElementById('btnBack');
        if (btnBack) {
            btnBack.addEventListener('click', () => {
                window.go(`/user/home?eventId=${this.eventoId}`);
            });
        }

        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentFilter = btn.dataset.filter;
                this.applyFilter();
            });
        });

        const modalCloseBtn = document.getElementById('modalCloseBtn');
        const modalOverlay = document.getElementById('imageModal');
        if (modalCloseBtn) {
            modalCloseBtn.addEventListener('click', this.closeModal.bind(this));
        }
        if (modalOverlay) {
            modalOverlay.addEventListener('click', (e) => {
                if (e.target === modalOverlay) {
                    this.closeModal();
                }
            });
        }

        const modalDeleteBtn = document.getElementById('modalDeleteBtn');
        if (modalDeleteBtn) {
            modalDeleteBtn.addEventListener('click', this.handleDeleteImage.bind(this));
        }

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
            }
        });
    }

    // ============================================
    // 📊 ACTUALIZAR CONTADOR
    // ============================================
    updateCounter() {
        const counter = document.getElementById('imageCounter');
        if (counter) {
            const total = this.allImages.length;
            const filtered = this.filteredImages.length;
            counter.textContent = filtered === total ? 
                `${total} imágenes` : 
                `${filtered} de ${total} imágenes`;
        }
    }

    // ============================================
    // 📦 UTILIDADES
    // ============================================
    formatDate(date) {
        if (!date) return 'Fecha no disponible';
        return new Date(date).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    getEmptyStateHTML() {
        return `
            <div class="empty-state">
                <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="1.5">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <path d="M21 15l-5-5L5 21"/>
                </svg>
                <h3><i class="fas fa-image"></i> No hay imágenes en este evento</h3>
                <p><i class="fas fa-camera"></i> Captura una foto o sube un dibujo para comenzar</p>
                <button class="btn-snaap" onclick="window.go('/user/home?eventId=${this.eventoId}')">
                    <i class="fas fa-arrow-left"></i> Volver al evento
                </button>
            </div>
        `;
    }

    showSuccess(message) {
        alert('✅ ' + message);
    }

    showError(message) {
        alert('❌ ' + message);
    }
}

// ============================================
// ✅ EXPORT
// ============================================
export function initGalleryUserController() {
    new GalleryUserController();
}

// ============================================
// 🚀 INIT
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    new GalleryUserController();
});