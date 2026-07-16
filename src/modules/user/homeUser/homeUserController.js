// src/modules/user/homeUser/homeUserController.js
import { userService } from '../../../services/userService.js';
import { storageService } from '../../../services/storageService.js';
import { eventService } from '../../../services/eventService.js';

// ============================================
// 🎮 CONTROLLER PRINCIPAL
// ============================================
class HomeUserController {
    constructor() {
        this.currentUser = null;
        this.userData = null;
        this.eventoId = null;
        this.eventoData = null;
        this.images = [];
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

            // 🔥 OBTENER EVENTO ID DE LA URL
            const urlParams = new URLSearchParams(window.location.search);
            this.eventoId = urlParams.get('eventId');

            console.log('🔍 Evento ID recibido:', this.eventoId);

            if (!this.eventoId) {
                this.showError('No se especificó un evento');
                return;
            }

            // 🔥 CARGAR DATOS DEL EVENTO
            await this.loadEventData();
            await this.loadUserData();
            this.setupEventListeners();
            await this.loadUserImages();
            
            // 🔥 MOSTRAR NOMBRE DEL EVENTO
            this.updateEventHeader();

            // 🔥 OCULTAR NAVBAR
            this.hideNavbar();

        } catch (error) {
            console.error('Error initializing user home:', error);
            this.showError('Error al cargar la página');
        }
    }

    // ============================================
    // 👁️ OCULTAR NAVBAR
    // ============================================
    hideNavbar() {
        const navbar = document.getElementById('navbar');
        if (navbar) {
            navbar.style.display = 'none';
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
            console.log('📦 Evento cargado:', this.eventoData?.nombre);
        } catch (error) {
            console.error('Error loading event data:', error);
            throw error;
        }
    }

    // ============================================
    // 📥 CARGAR DATOS DEL USUARIO
    // ============================================
    async loadUserData() {
        try {
            const result = await userService.obtenerUsuarioPorUid(this.currentUser.uid);
            if (!result.success) throw new Error(result.error);
            this.userData = result.user;
        } catch (error) {
            console.error('Error loading user data:', error);
            throw error;
        }
    }

    // ============================================
    // 🖼️ ACTUALIZAR HEADER CON NOMBRE DEL EVENTO
    // ============================================
    updateEventHeader() {
        const headerTitle = document.querySelector('.user-home-header h1');
        const headerSubtitle = document.querySelector('.user-home-header p');
        const eventBadge = document.querySelector('.event-badge');
        
        if (headerTitle && this.eventoData) {
            headerTitle.innerHTML = `<i class="fas fa-calendar-alt"></i> ${this.eventoData.nombre || 'Evento'}`;
        }
        
        if (headerSubtitle) {
            headerSubtitle.innerHTML = `<i class="fas fa-camera"></i> Captura momentos, comparte dibujos y guarda recuerdos de este evento`;
        }

        if (eventBadge && this.eventoData) {
            eventBadge.innerHTML = `<i class="fas fa-ticket-alt"></i> ${this.eventoData.nombre || 'Evento'}`;
        }
    }

    // ============================================
    // 🎯 CONFIGURAR EVENTOS
    // ============================================
    setupEventListeners() {
        const takePhotoBtn = document.getElementById('takePhotoBtn');
        if (takePhotoBtn) {
            takePhotoBtn.addEventListener('click', this.handleTakePhoto.bind(this));
        }

        const uploadDrawingBtn = document.getElementById('uploadDrawingBtn');
        const drawingInput = document.getElementById('drawingInput');
        if (uploadDrawingBtn && drawingInput) {
            uploadDrawingBtn.addEventListener('click', () => drawingInput.click());
            drawingInput.addEventListener('change', this.handleUploadDrawing.bind(this));
        }

        const viewPhotosBtn = document.getElementById('viewPhotosBtn');
        if (viewPhotosBtn) {
            viewPhotosBtn.addEventListener('click', this.toggleGallery.bind(this));
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
    // 📸 TOMAR FOTO
    // ============================================
    handleTakePhoto() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.capture = 'environment';
        input.style.display = 'none';
        
        input.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            await this.uploadImage(file, 'photo');
            input.remove();
        });
        
        document.body.appendChild(input);
        input.click();
    }

    // ============================================
    // 🎨 SUBIR DIBUJO
    // ============================================
    async handleUploadDrawing(e) {
        const file = e.target.files[0];
        if (!file) return;
        await this.uploadImage(file, 'drawing');
        e.target.value = '';
    }

    // ============================================
    // 📤 SUBIR IMAGEN - ASOCIADA AL EVENTO
    // ============================================
    async uploadImage(file, type) {
        try {
            this.showLoading();

            const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
            if (!allowedTypes.includes(file.type)) {
                this.showError('Formato no soportado. Usa JPG, PNG, GIF o WebP');
                this.hideLoading();
                return;
            }

            if (file.size > 5 * 1024 * 1024) {
                this.showError('La imagen debe ser menor a 5MB');
                this.hideLoading();
                return;
            }

            // 🔥 SUBIR A STORAGE CON RUTA DEL EVENTO
            const path = `events/${this.eventoId}/images/${type}/${Date.now()}_${file.name}`;
            const result = await storageService.subirImagen(file, path);

            if (!result.success) {
                throw new Error(result.error);
            }

            // 🔥 GUARDAR REFERENCIA ASOCIADA AL EVENTO
            await this.saveImageReference(result.url, type, file.name);

            await this.loadUserImages();

            this.showSuccess(`✅ ${type === 'photo' ? 'Foto' : 'Dibujo'} subido exitosamente`);
            this.hideLoading();
        } catch (error) {
            console.error('Error uploading image:', error);
            this.showError(error.message || 'Error al subir la imagen');
            this.hideLoading();
        }
    }

    // ============================================
    // 💾 GUARDAR REFERENCIA DE IMAGEN EN EL USUARIO
    // ============================================
    async saveImageReference(url, type, fileName) {
        try {
            // 🔥 GUARDAR IMAGEN ASOCIADA AL EVENTO
            const images = this.userData.images || [];
            images.push({
                url: url,
                type: type,
                fileName: fileName,
                eventoId: this.eventoId,
                date: new Date().toISOString()
            });

            const result = await userService.actualizarPerfil({
                images: images
            });

            if (!result.success) {
                throw new Error(result.error);
            }

            this.userData = result.user;
        } catch (error) {
            console.error('Error saving image reference:', error);
            throw error;
        }
    }

    // ============================================
    // 📋 CARGAR IMÁGENES DEL EVENTO
    // ============================================
    async loadUserImages() {
        const galleryGrid = document.getElementById('galleryGrid');
        if (!galleryGrid) return;

        try {
            // 🔥 FILTRAR IMÁGENES POR EVENTO
            const allImages = this.userData.images || [];
            const eventImages = allImages.filter(img => img.eventoId === this.eventoId);

            if (eventImages.length === 0) {
                galleryGrid.innerHTML = this.getEmptyStateHTML();
                return;
            }

            this.images = eventImages;
            this.renderGallery(eventImages);
        } catch (error) {
            console.error('Error loading images:', error);
            galleryGrid.innerHTML = `<p class="error-message">Error al cargar imágenes: ${error.message}</p>`;
        }
    }

    // ============================================
    // 🎨 RENDERIZAR GALERÍA
    // ============================================
    renderGallery(images) {
        const galleryGrid = document.getElementById('galleryGrid');
        if (!galleryGrid) return;

        galleryGrid.innerHTML = images.map((image, index) => `
            <div class="gallery-item" data-index="${index}">
                <img src="${image.url}" alt="${image.fileName || 'Imagen'}" loading="lazy">
                <span class="gallery-type ${image.type}">
                    ${image.type === 'photo' ? '<i class="fas fa-camera"></i>' : '<i class="fas fa-paint-brush"></i>'}
                </span>
            </div>
        `).join('');

        galleryGrid.querySelectorAll('.gallery-item').forEach(item => {
            item.addEventListener('click', () => {
                const index = parseInt(item.dataset.index);
                this.openModal(index);
            });
        });
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
        const modalDeleteBtn = document.getElementById('modalDeleteBtn');

        if (modalImage) modalImage.src = image.url;
        if (modalDate) modalDate.innerHTML = `<i class="fas fa-calendar-day"></i> ${new Date(image.date).toLocaleDateString('es-ES')} - ${image.type === 'photo' ? '<i class="fas fa-camera"></i> Foto' : '<i class="fas fa-paint-brush"></i> Dibujo'}`;
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

        try {
            this.showLoading();

            const images = this.userData.images || [];
            // 🔥 ELIMINAR SOLO LA IMAGEN DEL EVENTO ACTUAL
            const eventImages = images.filter(img => img.eventoId === this.eventoId);
            const deletedImage = eventImages[index];
            
            // Encontrar y eliminar del array principal
            const globalIndex = images.findIndex(img => img.url === deletedImage.url && img.eventoId === this.eventoId);
            if (globalIndex !== -1) {
                images.splice(globalIndex, 1);
            }

            const result = await userService.actualizarPerfil({
                images: images
            });

            if (!result.success) {
                throw new Error(result.error);
            }

            this.userData = result.user;
            this.closeModal();
            await this.loadUserImages();

            this.showSuccess('✅ Imagen eliminada exitosamente');
            this.hideLoading();
        } catch (error) {
            console.error('Error deleting image:', error);
            this.showError(error.message || 'Error al eliminar la imagen');
            this.hideLoading();
        }
    }

    // ============================================
    // 🔄 TOGGLE GALERÍA
    // ============================================
    toggleGallery() {
        const gallerySection = document.getElementById('gallerySection');
        if (!gallerySection) return;

        if (gallerySection.style.display === 'none') {
            gallerySection.style.display = 'block';
            gallerySection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
            gallerySection.style.display = 'none';
        }
    }

    // ============================================
    // 🎨 EMPTY STATE
    // ============================================
    getEmptyStateHTML() {
        return `
            <div class="empty-state">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="1.5">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <path d="M21 15l-5-5L5 21"/>
                </svg>
                <h3><i class="fas fa-image"></i> No hay imágenes en este evento</h3>
                <p><i class="fas fa-camera"></i> Captura una foto o sube un dibujo para comenzar</p>
            </div>
        `;
    }

    // ============================================
    // 📦 UTILIDADES
    // ============================================
    showLoading() {
        const container = document.getElementById('userHomeContainer');
        if (!container) return;

        const existingLoader = container.querySelector('.loading-overlay');
        if (existingLoader) existingLoader.remove();

        const loader = document.createElement('div');
        loader.className = 'loading-overlay';
        loader.innerHTML = '<div class="spinner"></div>';
        container.style.position = 'relative';
        container.appendChild(loader);
    }

    hideLoading() {
        const container = document.getElementById('userHomeContainer');
        if (!container) return;

        const loader = container.querySelector('.loading-overlay');
        if (loader) loader.remove();
    }

    showSuccess(message) {
        alert('✅ ' + message);
    }

    showError(message) {
        alert('❌ ' + message);
    }

    showInfo(message) {
        alert('ℹ️ ' + message);
    }
}

// ============================================
// ✅ EXPORT
// ============================================
export function initHomeUserController() {
    new HomeUserController();
}

// ============================================
// 🚀 INIT
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    new HomeUserController();
});