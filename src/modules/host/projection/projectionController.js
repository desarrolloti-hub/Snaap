// src/modules/host/projection/projectionController.js
import { userService } from '../../../services/userService.js';
import { eventService } from '../../../services/eventService.js';
import { eventImageService } from '../../../services/eventImageService.js';
import { qrService } from '../../../services/qrService.js';

// ============================================
// ðŸŽ® CONTROLADOR DE PROYECCIÃ“N
// ============================================
class ProjectionController {
    constructor() {
        this.currentUser = null;
        this.eventoId = null;
        this.eventoData = null;
        this.images = [];
        this.currentIndex = 0;
        this.qrImage = '';
        this.intervalId = null;
        this.imagesListener = null;
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

            await this.loadEventData();
            await this.generateQrForProjection();
            await this.loadImages();
            this.setupEventListeners();
            this.startSlideshow();
            this.startImageListener();

            // ðŸ”¥ ENTRAR EN PANTALLA COMPLETA
            this.enterFullscreen();

        } catch (error) {
            console.error('Error initializing projection:', error);
            this.showError('Error al cargar la proyecciÃ³n');
        }
    }

    // ============================================
    // 📥 CARGAR DATOS DEL EVENTO
    // ============================================
    async loadEventData() {
        try {
            const result = await eventService.obtenerEventoPorId(this.eventoId);
            if (!result.success) {
                throw new Error(result.error || 'No se pudo cargar el evento');
            }
            this.eventoData = result.evento;
        } catch (error) {
            console.error('Error loading event data:', error);
        }
    }

    // ============================================
    // 📲 GENERAR QR PARA LA PROYECCIÓN
    // ============================================
    async generateQrForProjection() {
        try {
            if (!this.eventoId || !this.currentUser) return;

            qrService.setUsuarioActual(this.currentUser);
            const redirectUrl = `${window.location.origin}/user/home?eventId=${this.eventoId}`;
            const result = await qrService.generarQr(this.eventoId, {
                redirectUrl,
                eventName: this.eventoData?.nombre || 'Evento'
            });

            if (result.success) {
                this.qrImage = result.qrImage;
                this.renderQrPanel();
            }
        } catch (error) {
            console.error('Error generating projection QR:', error);
        }
    }

    renderQrPanel() {
        const qrImageEl = document.getElementById('qrImageDisplay');
        const qrPanel = document.getElementById('qrPanel');

        if (qrImageEl && this.qrImage) {
            qrImageEl.src = this.qrImage;
            qrImageEl.alt = 'QR del evento';
        }

        if (qrPanel) {
            qrPanel.style.display = this.qrImage ? 'flex' : 'none';
        }
    }

    // ============================================
    // 📷 CARGAR IMÁGENES
    // ============================================
    async loadImages() {
        try {
            const result = await eventImageService.getEventImages(this.eventoId);
            
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
            const result = await eventImageService.getEventImages(this.eventoId);
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
    // ðŸ”„ ESCUCHAR IMÁGENES EN TIEMPO REAL
    // ============================================
    startImageListener() {
        if (!this.eventoId || this.imagesListener) return;

        this.imagesListener = eventImageService.listenToEventImages(this.eventoId, (images) => {
            const previousLength = this.images.length;
            this.images = images;

            if (this.images.length === 0) {
                this.showEmptyState();
                return;
            }

            this.hideEmptyState();

            if (previousLength === 0) {
                this.currentIndex = 0;
            }

            if (this.currentIndex >= this.images.length) {
                this.currentIndex = this.images.length - 1;
            }

            this.showImage();
            console.log(`📡 Projection: ${images.length} imágenes actualizadas en tiempo real`);
        });
    }

    stopImageListener() {
        if (typeof this.imagesListener === 'function') {
            this.imagesListener();
            this.imagesListener = null;
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
