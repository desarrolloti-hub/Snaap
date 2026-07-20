// src/modules/host/liveEvent/liveEventController.js
import { userService } from '../../../services/userService.js';
import { eventService } from '../../../services/eventService.js';
import { userImageService } from '../../../services/userImageService.js';

// ============================================
// 🎮 CONTROLADOR DE EVENTO EN VIVO
// ============================================
class LiveEventController {
    constructor() {
        this.currentUser = null;
        this.eventoId = null;
        this.eventoData = null;
        this.images = [];
        this.autoRefresh = true;
        this.refreshInterval = null;
        this.intervalTime = 5000;
        this.initialize();
    }

    // ============================================
    // 🚀 INICIALIZACIÓN
    // ============================================
    async initialize() {
        try {
            this.currentUser = userService.getCurrentUser();
            if (!this.currentUser) {
                window.location.href = '/login';
                return;
            }

            const urlParams = new URLSearchParams(window.location.search);
            this.eventoId = urlParams.get('id');

            if (!this.eventoId) {
                this.showError('No se especificó un evento');
                return;
            }

            await this.loadEventData();
            await this.loadImages();
            this.setupEventListeners();
            this.startAutoRefresh();
            this.updateEventHeader();

        } catch (error) {
            console.error('Error initializing live event:', error);
            this.showError('Error al cargar el evento en vivo');
        }
    }

    // ============================================
    // 📥 CARGAR DATOS DEL EVENTO
    // ============================================
    async loadEventData() {
        try {
            const result = await eventService.obtenerEventoPorId(this.eventoId);
            if (!result.success) {
                throw new Error(result.error);
            }
            this.eventoData = result.evento;
            console.log('✅ Evento cargado:', this.eventoData?.nombre);
        } catch (error) {
            console.error('Error loading event data:', error);
            throw error;
        }
    }

    // ============================================
    // 🖼️ ACTUALIZAR HEADER
    // ============================================
    updateEventHeader() {
        const titleEl = document.getElementById('eventTitle');
        if (titleEl && this.eventoData) {
            titleEl.textContent = this.eventoData.nombre || 'Evento sin nombre';
        }
    }

    // ============================================
    // 📋 CARGAR IMÁGENES DEL EVENTO
    // ============================================
    async loadImages() {
        try {
            const result = await userImageService.getEventImages(this.eventoId);
            
            if (!result.success) {
                throw new Error(result.error);
            }

            this.images = result.images;
            console.log(`📋 ${this.images.length} imágenes del evento`);

            this.renderGallery();
            this.updateStats();

        } catch (error) {
            console.error('Error loading images:', error);
            this.showError('Error al cargar las imágenes');
        }
    }

    // ============================================
    // 🎨 RENDERIZAR GALERÍA
    // ============================================
    renderGallery() {
        const galleryGrid = document.getElementById('galleryGrid');
        const emptyState = document.getElementById('emptyState');
        
        if (!galleryGrid) return;

        if (this.images.length === 0) {
            galleryGrid.style.display = 'none';
            if (emptyState) {
                emptyState.style.display = 'block';
            }
            return;
        }

        if (emptyState) {
            emptyState.style.display = 'none';
        }
        galleryGrid.style.display = 'grid';

        galleryGrid.innerHTML = this.images.map((image, index) => `
            <div class="gallery-item" data-index="${index}">
                <img src="${image.url}" alt="${image.fileName || 'Imagen'}" loading="lazy">
                <span class="gallery-type ${image.type}">
                    ${image.type === 'photo' ? '📸' : '🎨'}
                </span>
                <div class="gallery-item-info">
                    <span class="gallery-item-date">
                        <i class="fas fa-clock"></i> ${this.getTimeAgo(image.date)}
                    </span>
                </div>
            </div>
        `).join('');

        galleryGrid.querySelectorAll('.gallery-item').forEach((item, index) => {
            item.addEventListener('click', () => {
                this.openModal(index);
            });
        });

        document.querySelectorAll('.gallery-item').forEach((item, i) => {
            item.style.animation = `fadeInUp 0.3s ease forwards`;
            item.style.animationDelay = `${i * 0.05}s`;
        });
    }

    // ============================================
    // 📊 ACTUALIZAR ESTADÍSTICAS
    // ============================================
    updateStats() {
        const photoCount = document.getElementById('photoCount');
        const userCount = document.getElementById('userCount');
        
        if (photoCount) {
            photoCount.innerHTML = `<i class="fas fa-images"></i> ${this.images.length} fotos`;
        }

        const uniqueUsers = new Set();
        this.images.forEach(img => {
            if (img.userId) {
                uniqueUsers.add(img.userId);
            }
        });
        
        if (userCount) {
            userCount.innerHTML = `<i class="fas fa-users"></i> ${uniqueUsers.size || 0} usuarios`;
        }
    }

    // ============================================
    // 🖼️ MODAL
    // ============================================
    openModal(index) {
        const image = this.images[index];
        if (!image) return;

        const modal = document.getElementById('imageModal');
        const modalImage = document.getElementById('modalImage');
        const modalDate = document.getElementById('modalDate');
        const modalUser = document.getElementById('modalUser');

        if (modalImage) modalImage.src = image.url;
        
        const dateText = new Date(image.date).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        if (modalDate) {
            modalDate.innerHTML = `<i class="fas fa-calendar-day"></i> ${dateText}`;
        }
        
        if (modalUser) {
            modalUser.innerHTML = `<i class="fas fa-user"></i> ${image.userName || 'Usuario'}`;
        }
        
        if (modal) modal.style.display = 'flex';
    }

    closeModal() {
        const modal = document.getElementById('imageModal');
        if (modal) modal.style.display = 'none';
    }

    // ============================================
    // 🎯 CONFIGURAR EVENTOS
    // ============================================
    setupEventListeners() {
        const btnBack = document.getElementById('btnBack');
        if (btnBack) {
            btnBack.addEventListener('click', () => {
                window.location.href = `/host/event-details?id=${this.eventoId}`;
            });
        }

        const refreshBtn = document.getElementById('refreshBtn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', async () => {
                refreshBtn.disabled = true;
                refreshBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Actualizando...';
                await this.loadImages();
                refreshBtn.innerHTML = '<i class="fas fa-sync-alt"></i> Actualizar';
                refreshBtn.disabled = false;
                this.showSuccess('✅ Galería actualizada');
            });
        }

        const autoRefreshBtn = document.getElementById('autoRefreshBtn');
        if (autoRefreshBtn) {
            autoRefreshBtn.addEventListener('click', () => {
                this.toggleAutoRefresh();
            });
        }

        const shareQrBtn = document.getElementById('shareQrBtn');
        if (shareQrBtn) {
            shareQrBtn.addEventListener('click', () => {
                const url = `${window.location.origin}/user/home?eventId=${this.eventoId}`;
                navigator.clipboard.writeText(url);
                this.showSuccess('✅ Enlace copiado al portapapeles');
            });
        }

        const projectBtn = document.getElementById('projectBtn');
        if (projectBtn) {
            projectBtn.addEventListener('click', () => {
                window.location.href = `/host/projection?id=${this.eventoId}`;
            });
        }

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

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
            }
        });
    }

    // ============================================
    // 🔄 AUTO-REFRESH
    // ============================================
    startAutoRefresh() {
        if (this.autoRefresh) {
            this.refreshInterval = setInterval(async () => {
                await this.loadImages();
            }, this.intervalTime);
            console.log(`🔄 Auto-refresh activado (${this.intervalTime / 1000}s)`);
        }
    }

    toggleAutoRefresh() {
        const btn = document.getElementById('autoRefreshBtn');
        const info = document.getElementById('refreshInfo');
        
        this.autoRefresh = !this.autoRefresh;
        
        if (this.autoRefresh) {
            if (btn) {
                btn.innerHTML = '<i class="fas fa-pause"></i> Auto-refresh';
                btn.classList.remove('btn-snaap-secondary');
                btn.classList.add('btn-snaap');
            }
            if (info) {
                info.textContent = '🔄 Actualización automática activada';
                info.style.color = '#4db8ff';
            }
            this.startAutoRefresh();
            this.showSuccess('🔄 Auto-refresh activado');
        } else {
            if (this.refreshInterval) {
                clearInterval(this.refreshInterval);
                this.refreshInterval = null;
            }
            if (btn) {
                btn.innerHTML = '<i class="fas fa-play"></i> Auto-refresh';
                btn.classList.remove('btn-snaap');
                btn.classList.add('btn-snaap-secondary');
            }
            if (info) {
                info.textContent = '⏸️ Actualización automática pausada';
                info.style.color = '#ff007a';
            }
            this.showInfo('⏸️ Auto-refresh pausado');
        }
    }

    // ============================================
    // 📦 UTILIDADES
    // ============================================
    getTimeAgo(date) {
        const now = new Date();
        const diff = now - new Date(date);
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'Hace un momento';
        if (minutes < 60) return `Hace ${minutes} min`;
        if (hours < 24) return `Hace ${hours} h`;
        return `Hace ${days} d`;
    }

    showSuccess(message) {
        Swal.fire({
            title: 'Éxito',
            text: message,
            icon: 'success',
            timer: 2000,
            showConfirmButton: false,
            toast: true,
            position: 'top-end'
        });
    }

    showError(message) {
        Swal.fire({
            title: 'Error',
            text: message,
            icon: 'error',
            confirmButtonText: 'Aceptar'
        });
    }

    showInfo(message) {
        Swal.fire({
            title: 'Info',
            text: message,
            icon: 'info',
            timer: 1500,
            showConfirmButton: false,
            toast: true,
            position: 'top-end'
        });
    }
}

// ============================================
// ✅ EXPORT
// ============================================
export function initLiveEventController() {
    new LiveEventController();
}

// ============================================
// 🚀 INIT
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    new LiveEventController();
});