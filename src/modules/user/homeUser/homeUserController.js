// src/modules/user/homeUser/homeUserController.js
import { userService } from '../../../services/userService.js';
import { storageService } from '../../../services/storageService.js';

// ============================================
// 🎮 CONTROLLER PRINCIPAL
// ============================================
class HomeUserController {
    constructor() {
        this.currentUser = null;
        this.userData = null;
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

            await this.loadUserData();
            this.setupEventListeners();
            await this.loadUserImages();
        } catch (error) {
            console.error('Error initializing user home:', error);
            alert('❌ Error al cargar la página');
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
    // 📤 SUBIR IMAGEN
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

            const result = await storageService.subirImagen(file, `users/${this.currentUser.uid}/${type}`);

            if (!result.success) {
                throw new Error(result.error);
            }

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
    // 💾 GUARDAR REFERENCIA
    // ============================================
    async saveImageReference(url, type, fileName) {
        try {
            const images = this.userData.images || [];
            images.push({
                url: url,
                type: type,
                fileName: fileName,
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
    // 📋 CARGAR IMÁGENES
    // ============================================
    async loadUserImages() {
        const galleryGrid = document.getElementById('galleryGrid');
        if (!galleryGrid) return;

        try {
            const images = this.userData.images || [];

            if (images.length === 0) {
                galleryGrid.innerHTML = this.getEmptyStateHTML();
                return;
            }

            this.images = images;
            this.renderGallery(images);
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
                    ${image.type === 'photo' ? '📸' : '🎨'}
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
        if (modalDate) modalDate.textContent = `📅 ${new Date(image.date).toLocaleDateString('es-ES')} - ${image.type === 'photo' ? '📸 Foto' : '🎨 Dibujo'}`;
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
            images.splice(index, 1);

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
                <h3>No tienes imágenes</h3>
                <p>Captura una foto o sube un dibujo para comenzar</p>
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