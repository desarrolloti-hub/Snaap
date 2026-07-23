// src/modules/user/galleryUser/galleryUserController.js
import { userService } from '../../../services/userService.js';
import { userImageService } from '../../../services/userImageService.js';

// ============================================
// ðŸŽ® CONTROLADOR DE GALERÃA
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
    // ðŸš€ INICIALIZACIÃ“N
    // ============================================
    async initialize() {
        try {
            this.currentUser = userService.getCurrentUser();
            if (!this.currentUser) {
                import('../../utils/navigation.js').then(({ navigateOrHref }) => navigateOrHref('/login'));
                return;
            }

            // ðŸ”¥ OBTENER EVENTO ID DE LA URL
            const urlParams = new URLSearchParams(window.location.search);
            this.eventoId = urlParams.get('eventId');

            console.log('ðŸ” Evento ID para galerÃ­a:', this.eventoId);

            if (!this.eventoId) {
                this.showError('No se especificÃ³ un evento');
                return;
            }

            await this.loadImages();
            this.setupEventListeners();
            this.updateCounter();

        } catch (error) {
            console.error('Error initializing gallery:', error);
            this.showError('Error al cargar la galerÃ­a');
        }
    }

    // ============================================
    // ðŸ“‹ CARGAR IMÃGENES DEL EVENTO
    // ============================================
    async loadImages() {
        const galleryGrid = document.getElementById('galleryGrid');
        if (!galleryGrid) return;

        try {
            galleryGrid.innerHTML = `
                <div class="loading-spinner">
                    <div class="spinner"></div>
                    <p><i class="fas fa-spinner fa-spin"></i> Cargando imÃ¡genes...</p>
                </div>
            `;

            // ðŸ”¥ OBTENER TODAS LAS IMÃGENES DEL USUARIO
            const result = await userImageService.getUserImages();
            
            if (!result.success) {
                throw new Error(result.error);
            }

            // ðŸ”¥ FILTRAR SOLO LAS DEL EVENTO ACTUAL
            this.allImages = result.images.filter(img => img.eventoId === this.eventoId);
            console.log(`ðŸ“‹ ${this.allImages.length} imÃ¡genes del evento cargadas`);

            // Aplicar filtro
            this.applyFilter();

        } catch (error) {
            console.error('Error loading images:', error);
            galleryGrid.innerHTML = `<p class="error-message">Error al cargar imÃ¡genes: ${error.message}</p>`;
        }
    }

    // ============================================
    // ðŸŽ¨ APLICAR FILTRO
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
    // ðŸŽ¨ RENDERIZAR GALERÃA
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
                    <span class="gallery-item-date">
                        <i class="fas fa-calendar-alt"></i> ${this.formatDate(image.date)}
                    </span>
                </div>
            </div>
        `).join('');

        // Eventos para abrir modal
        galleryGrid.querySelectorAll('.gallery-item').forEach((item, index) => {
            item.addEventListener('click', () => {
                this.openModal(index);
            });
        });
    }

    // ============================================
    // ðŸ–¼ï¸ MODAL
    // ============================================
    openModal(index) {
        const image = this.filteredImages[index];
        if (!image) return;

        const modal = document.getElementById('imageModal');
        const modalImage = document.getElementById('modalImage');
        const modalDate = document.getElementById('modalDate');
        const modalDeleteBtn = document.getElementById('modalDeleteBtn');

        if (modalImage) modalImage.src = image.url;
        
        const dateText = this.formatDate(image.date);
        const typeText = image.type === 'photo' ? 'ðŸ“¸ Foto' : 'ðŸŽ¨ Dibujo';
        
        if (modalDate) {
            modalDate.innerHTML = `<i class="fas fa-calendar-day"></i> ${dateText} - ${typeText}`;
        }
        
        if (modalDeleteBtn) modalDeleteBtn.dataset.index = index;
        if (modal) modal.style.display = 'flex';
    }

    closeModal() {
        const modal = document.getElementById('imageModal');
        if (modal) modal.style.display = 'none';
    }

    // ============================================
    // ðŸ—‘ï¸ ELIMINAR IMAGEN
    // ============================================
    async handleDeleteImage(e) {
        const index = parseInt(e.target.dataset.index);
        if (isNaN(index)) return;

        const confirmDelete = confirm('âš ï¸ Â¿EstÃ¡s seguro de que quieres eliminar esta imagen?');
        if (!confirmDelete) return;

        // ðŸ”¥ Encontrar el Ã­ndice en el array completo de imÃ¡genes del evento
        const imageToDelete = this.filteredImages[index];
        const globalIndex = this.allImages.findIndex(img => img.url === imageToDelete.url);

        try {
            const result = await userImageService.deleteImage(globalIndex);
            if (!result.success) {
                throw new Error(result.error);
            }

            this.closeModal();
            await this.loadImages();
            this.showSuccess('âœ… Imagen eliminada exitosamente');

        } catch (error) {
            console.error('Error deleting image:', error);
            this.showError(error.message || 'Error al eliminar la imagen');
        }
    }

    // ============================================
    // ðŸŽ¯ CONFIGURAR EVENTOS
    // ============================================
    setupEventListeners() {
        // BotÃ³n volver - ðŸ”¥ REDIRIGE AL EVENTO CON EL ID
        const btnBack = document.getElementById('btnBack');
        if (btnBack) {
            btnBack.addEventListener('click', () => {
                window.go(`/user/home?eventId=${this.eventoId}`);
            });
        }

        // Botones de filtro
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentFilter = btn.dataset.filter;
                this.applyFilter();
            });
        });

        // Modal - Cerrar
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

        // Modal - Eliminar
        const modalDeleteBtn = document.getElementById('modalDeleteBtn');
        if (modalDeleteBtn) {
            modalDeleteBtn.addEventListener('click', this.handleDeleteImage.bind(this));
        }

        // Tecla ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
            }
        });
    }

    // ============================================
    // ðŸ“Š ACTUALIZAR CONTADOR
    // ============================================
    updateCounter() {
        const counter = document.getElementById('imageCounter');
        if (counter) {
            const total = this.allImages.length;
            const filtered = this.filteredImages.length;
            counter.textContent = filtered === total ? 
                `${total} imÃ¡genes` : 
                `${filtered} de ${total} imÃ¡genes`;
        }
    }

    // ============================================
    // ðŸ“¦ UTILIDADES
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
                <h3><i class="fas fa-image"></i> No hay imÃ¡genes en este evento</h3>
                <p><i class="fas fa-camera"></i> Captura una foto o sube un dibujo para comenzar</p>
                <button class="btn-snaap" onclick="window.go('/user/home?eventId=${this.eventoId}'">
                    <i class="fas fa-arrow-left"></i> Volver al evento
                </button>
            </div>
        `);
    }

    showSuccess(message) {
        alert('âœ… ' + message);
    }

    showError(message) {
        alert('âŒ ' + message);
    }
}

// ============================================
// âœ… EXPORT
// ============================================
export function initGalleryUserController() {
    new GalleryUserController();
}

// ============================================
// ðŸš€ INIT
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    new GalleryUserController();
});
