// src/modules/host/projection/projectionController.js
import { userService } from '../../../services/userService.js';
import { eventService } from '../../../services/eventService.js';
import { userImageService } from '../../../services/userImageService.js';

// ============================================
// ðŸŽ® CONTROLADOR DE PROYECCIÃ“N
// ============================================
class ProjectionController {
    constructor() {
        this.currentUser = null;
        this.eventoId = null;
        this.images = [];
        this.currentIndex = 0;
        this.intervalId = null;
        this.intervalTime = 5000; // 5 segundos
        this.isPlaying = true;
        this.initialize();
    }

    // ============================================
    // ðŸš€ INICIALIZACIÃ“N
    // ============================================
    async initialize() {
        try {
            this.currentUser = userService.getCurrentUser();
            if (!this.currentUser) {
                if (typeof window.navigateTo === 'function') window.navigateTo('/login'); else window.go('');
                return;
            }

            const urlParams = new URLSearchParams(window.location.search);
            this.eventoId = urlParams.get('id');

            if (!this.eventoId) {
                this.showError('No se especificÃ³ un evento');
                return;
            }

            await this.loadImages();
            this.setupEventListeners();
            this.startSlideshow();

            // ðŸ”¥ ENTRAR EN PANTALLA COMPLETA
            this.enterFullscreen();

            // ðŸ”¥ AUTO-REFRESH CADA 10 SEGUNDOS
            setInterval(() => {
                this.refreshImages();
            }, 10000);

        } catch (error) {
            console.error('Error initializing projection:', error);
            this.showError('Error al cargar la proyecciÃ³n');
        }
    }

    // ============================================
    // ðŸ“‹ CARGAR IMÃGENES
    // ============================================
    async loadImages() {
        try {
            const result = await userImageService.getEventImages(this.eventoId);
            
            if (!result.success) {
                throw new Error(result.error);
            }

            this.images = result.images;
            console.log(`ðŸ“‹ ${this.images.length} imÃ¡genes cargadas`);

            if (this.images.length === 0) {
                this.showEmptyState();
                return;
            }

            this.hideEmptyState();
            this.currentIndex = 0;
            this.showImage();

        } catch (error) {
            console.error('Error loading images:', error);
            this.showError('Error al cargar las imÃ¡genes');
        }
    }

    // ============================================
    // ðŸ–¼ï¸ MOSTRAR IMAGEN
    // ============================================
    showImage() {
        if (this.images.length === 0) {
            this.showEmptyState();
            return;
        }

        const image = this.images[this.currentIndex];
        const slideImage = document.getElementById('slideImage');

        if (slideImage) {
            slideImage.src = image.url;
            slideImage.alt = image.fileName || 'Foto';
            
            // ðŸ”¥ REINICIAR ANIMACIÃ“N
            slideImage.style.animation = 'none';
            setTimeout(() => {
                slideImage.style.animation = 'fadeIn 0.5s ease';
            }, 10);
        }
    }

    // ============================================
    // â–¶ï¸ INICIAR PRESENTACIÃ“N
    // ============================================
    startSlideshow() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
        }

        if (this.images.length === 0) return;

        this.intervalId = setInterval(() => {
            this.nextImage();
        }, this.intervalTime);

        console.log(`â–¶ï¸ ProyecciÃ³n iniciada (${this.intervalTime / 1000}s)`);
    }

    // ============================================
    // â­ï¸ SIGUIENTE IMAGEN (BUCLE INFINITO)
    // ============================================
    nextImage() {
        if (this.images.length === 0) return;

        // ðŸ”¥ CUANDO LLEGA AL FINAL, VUELVE A EMPEZAR
        if (this.currentIndex < this.images.length - 1) {
            this.currentIndex++;
        } else {
            this.currentIndex = 0; // ðŸ” BUCLE INFINITO
        }

        this.showImage();
    }

    // ============================================
    // ðŸ–¥ï¸ PANTALLA COMPLETA
    // ============================================
    enterFullscreen() {
        const container = document.getElementById('projectionContainer');
        
        // ðŸ”¥ INTENTAR ENTRAR EN PANTALLA COMPLETA
        try {
            if (container.requestFullscreen) {
                container.requestFullscreen();
            } else if (container.webkitRequestFullscreen) {
                container.webkitRequestFullscreen();
            } else if (container.msRequestFullscreen) {
                container.msRequestFullscreen();
            }
            console.log('ðŸ–¥ï¸ Pantalla completa activada');
        } catch (error) {
            console.log('âš ï¸ No se pudo activar pantalla completa:', error);
        }

        // ðŸ”¥ ESCUCHAR CUANDO SALGA DE PANTALLA COMPLETA
        document.addEventListener('fullscreenchange', () => {
            if (!document.fullscreenElement) {
                console.log('ðŸ–¥ï¸ SaliÃ³ de pantalla completa');
            }
        });
    }

    // ============================================
    // ðŸ”„ ACTUALIZAR IMÃGENES (Auto-refresh)
    // ============================================
    async refreshImages() {
        try {
            const result = await userImageService.getEventImages(this.eventoId);
            if (!result.success) return;

            const newImages = result.images;
            
            // ðŸ”¥ SI HAY NUEVAS IMÃGENES
            if (newImages.length > this.images.length) {
                const oldLength = this.images.length;
                this.images = newImages;
                
                // Si estÃ¡bamos en la Ãºltima o no habÃ­a fotos, mostrar la nueva
                if (this.currentIndex >= oldLength - 1 || oldLength === 0) {
                    this.currentIndex = oldLength;
                    this.showImage();
                }
                
                console.log(`ðŸ“‹ ${newImages.length - oldLength} imÃ¡genes nuevas agregadas`);
            }
        } catch (error) {
            console.error('Error refreshing images:', error);
        }
    }

    // ============================================
    // ðŸŽ¨ ESTADOS
    // ============================================
    showEmptyState() {
        document.getElementById('emptyState').style.display = 'flex';
        document.getElementById('slideContainer').style.display = 'none';
    }

    hideEmptyState() {
        document.getElementById('emptyState').style.display = 'none';
        document.getElementById('slideContainer').style.display = 'flex';
    }

    // ============================================
    // ðŸŽ¯ CONFIGURAR EVENTOS
    // ============================================
    setupEventListeners() {
        // ðŸ”¥ BOTÃ“N SALIR
        const exitBtn = document.getElementById('exitBtn');
        if (exitBtn) {
            exitBtn.addEventListener('click', () => {
                // Salir de pantalla completa si estÃ¡ activa
                if (document.fullscreenElement) {
                    document.exitFullscreen();
                }
                if (typeof window.navigateTo === 'function') window.navigateTo(`/host/live-event?id=${this.eventoId}`); else window.go(`/host/live-event?id=${this.eventoId}`);
            });
        }

        // ðŸ”¥ TECLA ESC PARA SALIR
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                // Si estÃ¡ en pantalla completa, solo sale de ella
                // El botÃ³n Salir es el que redirige
            }
        });
    }

    // ============================================
    // ðŸ“¦ UTILIDADES
    // ============================================
    showError(message) {
        Swal.fire({
            title: 'Error',
            text: message,
            icon: 'error',
            confirmButtonText: 'Aceptar'
        });
    }
}

// ============================================
// âœ… EXPORT
// ============================================
export function initProjectionController() {
    new ProjectionController();
}

// ============================================
// ðŸš€ INIT
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    new ProjectionController();
});
