// src/modules/host/projection/projectionController.js
import { userService } from '../../../services/userService.js';
import { eventService } from '../../../services/eventService.js';
import { userImageService } from '../../../services/userImageService.js';

// ============================================
// 🎮 CONTROLADOR DE PROYECCIÓN
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

            await this.loadImages();
            this.setupEventListeners();
            this.startSlideshow();

            // 🔥 ENTRAR EN PANTALLA COMPLETA
            this.enterFullscreen();

            // 🔥 AUTO-REFRESH CADA 10 SEGUNDOS
            setInterval(() => {
                this.refreshImages();
            }, 10000);

        } catch (error) {
            console.error('Error initializing projection:', error);
            this.showError('Error al cargar la proyección');
        }
    }

    // ============================================
    // 📋 CARGAR IMÁGENES
    // ============================================
    async loadImages() {
        try {
            const result = await userImageService.getEventImages(this.eventoId);
            
            if (!result.success) {
                throw new Error(result.error);
            }

            this.images = result.images;
            console.log(`📋 ${this.images.length} imágenes cargadas`);

            if (this.images.length === 0) {
                this.showEmptyState();
                return;
            }

            this.hideEmptyState();
            this.currentIndex = 0;
            this.showImage();

        } catch (error) {
            console.error('Error loading images:', error);
            this.showError('Error al cargar las imágenes');
        }
    }

    // ============================================
    // 🖼️ MOSTRAR IMAGEN
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
            
            // 🔥 REINICIAR ANIMACIÓN
            slideImage.style.animation = 'none';
            setTimeout(() => {
                slideImage.style.animation = 'fadeIn 0.5s ease';
            }, 10);
        }
    }

    // ============================================
    // ▶️ INICIAR PRESENTACIÓN
    // ============================================
    startSlideshow() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
        }

        if (this.images.length === 0) return;

        this.intervalId = setInterval(() => {
            this.nextImage();
        }, this.intervalTime);

        console.log(`▶️ Proyección iniciada (${this.intervalTime / 1000}s)`);
    }

    // ============================================
    // ⏭️ SIGUIENTE IMAGEN (BUCLE INFINITO)
    // ============================================
    nextImage() {
        if (this.images.length === 0) return;

        // 🔥 CUANDO LLEGA AL FINAL, VUELVE A EMPEZAR
        if (this.currentIndex < this.images.length - 1) {
            this.currentIndex++;
        } else {
            this.currentIndex = 0; // 🔁 BUCLE INFINITO
        }

        this.showImage();
    }

    // ============================================
    // 🖥️ PANTALLA COMPLETA
    // ============================================
    enterFullscreen() {
        const container = document.getElementById('projectionContainer');
        
        // 🔥 INTENTAR ENTRAR EN PANTALLA COMPLETA
        try {
            if (container.requestFullscreen) {
                container.requestFullscreen();
            } else if (container.webkitRequestFullscreen) {
                container.webkitRequestFullscreen();
            } else if (container.msRequestFullscreen) {
                container.msRequestFullscreen();
            }
            console.log('🖥️ Pantalla completa activada');
        } catch (error) {
            console.log('⚠️ No se pudo activar pantalla completa:', error);
        }

        // 🔥 ESCUCHAR CUANDO SALGA DE PANTALLA COMPLETA
        document.addEventListener('fullscreenchange', () => {
            if (!document.fullscreenElement) {
                console.log('🖥️ Salió de pantalla completa');
            }
        });
    }

    // ============================================
    // 🔄 ACTUALIZAR IMÁGENES (Auto-refresh)
    // ============================================
    async refreshImages() {
        try {
            const result = await userImageService.getEventImages(this.eventoId);
            if (!result.success) return;

            const newImages = result.images;
            
            // 🔥 SI HAY NUEVAS IMÁGENES
            if (newImages.length > this.images.length) {
                const oldLength = this.images.length;
                this.images = newImages;
                
                // Si estábamos en la última o no había fotos, mostrar la nueva
                if (this.currentIndex >= oldLength - 1 || oldLength === 0) {
                    this.currentIndex = oldLength;
                    this.showImage();
                }
                
                console.log(`📋 ${newImages.length - oldLength} imágenes nuevas agregadas`);
            }
        } catch (error) {
            console.error('Error refreshing images:', error);
        }
    }

    // ============================================
    // 🎨 ESTADOS
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
    // 🎯 CONFIGURAR EVENTOS
    // ============================================
    setupEventListeners() {
        // 🔥 BOTÓN SALIR
        const exitBtn = document.getElementById('exitBtn');
        if (exitBtn) {
            exitBtn.addEventListener('click', () => {
                // Salir de pantalla completa si está activa
                if (document.fullscreenElement) {
                    document.exitFullscreen();
                }
                window.location.href = `/host/live-event?id=${this.eventoId}`;
            });
        }

        // 🔥 TECLA ESC PARA SALIR
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                // Si está en pantalla completa, solo sale de ella
                // El botón Salir es el que redirige
            }
        });
    }

    // ============================================
    // 📦 UTILIDADES
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
// ✅ EXPORT
// ============================================
export function initProjectionController() {
    new ProjectionController();
}

// ============================================
// 🚀 INIT
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    new ProjectionController();
});