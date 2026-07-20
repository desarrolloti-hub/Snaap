// src/modules/user/homeUser/homeUserController.js
import { userService } from '../../../services/userService.js';
import { eventService } from '../../../services/eventService.js';
import { userImageService } from '../../../services/userImageService.js';

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
        
        // 🔥 DIBUJO
        this.isDrawing = false;
        this.lastX = 0;
        this.lastY = 0;
        this.currentTool = 'pen';
        this.drawColor = '#4db8ff';
        this.drawSize = 5;
        this.canvas = null;
        this.ctx = null;
        
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
            this.eventoId = urlParams.get('eventId');

            console.log('🔍 Evento ID recibido:', this.eventoId);

            if (!this.eventoId) {
                this.showError('No se especificó un evento');
                return;
            }

            await this.loadEventData();
            await this.loadUserData();
            this.setupEventListeners();
            await this.loadUserImages();
            this.updateEventHeader();

        } catch (error) {
            console.error('Error initializing user home:', error);
            this.showError('Error al cargar la página');
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
    // 📥 CARGAR DATOS DEL USUARIO
    // ============================================
    async loadUserData() {
        try {
            console.log('👤 Cargando datos del usuario...');
            
            const result = await userService.obtenerUsuarioPorUid(this.currentUser.uid);
            
            if (result.success) {
                this.userData = result.user;
                console.log('✅ Usuario desde Firestore:', this.userData);
            } else {
                console.warn('⚠️ No se pudo obtener usuario de Firestore, usando datos de autenticación');
                this.userData = this.currentUser;
            }
            
            if (!this.userData.images) {
                this.userData.images = [];
            }
            
        } catch (error) {
            console.error('❌ Error loading user data:', error);
            this.userData = this.currentUser;
            if (!this.userData.images) {
                this.userData.images = [];
            }
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
    // 🎯 CONFIGURAR EVENTOS DE LOS BOTONES
    // ============================================
    setupEventListeners() {
        // 🔥 BOTÓN 1: TOMAR FOTO (CÁMARA)
        const takePhotoBtn = document.getElementById('takePhotoBtn');
        if (takePhotoBtn) {
            takePhotoBtn.addEventListener('click', this.handleTakePhoto.bind(this));
        }

        // 🔥 BOTÓN 2: SUBIR DIBUJO
        const uploadDrawingBtn = document.getElementById('uploadDrawingBtn');
        if (uploadDrawingBtn) {
            uploadDrawingBtn.addEventListener('click', this.openDrawingModal.bind(this));
        }

        // 🔥 BOTÓN 3: MIS FOTOS (IR A GALERÍA DEL USUARIO)
        const viewPhotosBtn = document.getElementById('viewPhotosBtn');
        if (viewPhotosBtn) {
            viewPhotosBtn.addEventListener('click', this.handleOpenGallery.bind(this));
        }

        // 🔥 MODAL DE DIBUJO
        this.setupDrawingEvents();

        // 🔥 MODAL DE IMAGEN
        this.setupImageModalEvents();

        // 🔥 TECLA ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
                this.closeDrawingModal();
            }
        });
    }

    // ============================================
    // 📸 BOTÓN 1: TOMAR FOTO
    // ============================================
    handleTakePhoto() {
        console.log('📸 Abriendo cámara...');
        
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.capture = 'environment';
        input.style.display = 'none';
        
        input.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            console.log('📸 Foto tomada:', file.name);
            await this.uploadImage(file, 'photo');
            input.remove();
        });
        
        document.body.appendChild(input);
        input.click();
    }

    // ============================================
    // 🎨 BOTÓN 2: ABRIR MODAL DE DIBUJO
    // ============================================
    openDrawingModal() {
        console.log('🎨 Abriendo modal de dibujo...');
        const modal = document.getElementById('drawingModal');
        if (modal) {
            modal.style.display = 'flex';
            setTimeout(() => {
                this.initCanvas();
            }, 100);
        }
    }

    // ============================================
    // 🖼️ BOTÓN 3: MIS FOTOS (REDIRIGIR A GALERÍA)
    // ============================================
    handleOpenGallery() {
        console.log('🖼️ Abriendo galería del usuario...');
        window.location.href = '/user/gallery';
    }

    // ============================================
    // 🔧 INICIALIZAR CANVAS DE DIBUJO
    // ============================================
    initCanvas() {
        this.canvas = document.getElementById('drawingCanvas');
        if (!this.canvas) return;

        const wrapper = this.canvas.parentElement;
        const rect = wrapper.getBoundingClientRect();
        const size = Math.min(rect.width, 500);
        this.canvas.width = size;
        this.canvas.height = size;
        this.canvas.style.width = size + 'px';
        this.canvas.style.height = size + 'px';

        this.ctx = this.canvas.getContext('2d');
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';

        this.canvas.addEventListener('mousedown', this.startDrawing.bind(this));
        this.canvas.addEventListener('mousemove', this.draw.bind(this));
        this.canvas.addEventListener('mouseup', this.stopDrawing.bind(this));
        this.canvas.addEventListener('mouseleave', this.stopDrawing.bind(this));

        this.canvas.addEventListener('touchstart', this.startDrawingTouch.bind(this));
        this.canvas.addEventListener('touchmove', this.drawTouch.bind(this));
        this.canvas.addEventListener('touchend', this.stopDrawing.bind(this));

        console.log('✅ Canvas inicializado');
    }

    // ============================================
    // 🖌️ EVENTOS DE DIBUJO (MOUSE)
    // ============================================
    startDrawing(e) {
        this.isDrawing = true;
        const rect = this.canvas.getBoundingClientRect();
        this.lastX = e.clientX - rect.left;
        this.lastY = e.clientY - rect.top;
    }

    draw(e) {
        if (!this.isDrawing) return;
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        this.drawLine(this.lastX, this.lastY, x, y);
        this.lastX = x;
        this.lastY = y;
    }

    stopDrawing() {
        this.isDrawing = false;
    }

    // ============================================
    // 🖌️ EVENTOS DE DIBUJO (TOUCH)
    // ============================================
    startDrawingTouch(e) {
        e.preventDefault();
        const touch = e.touches[0];
        const rect = this.canvas.getBoundingClientRect();
        this.isDrawing = true;
        this.lastX = touch.clientX - rect.left;
        this.lastY = touch.clientY - rect.top;
    }

    drawTouch(e) {
        e.preventDefault();
        if (!this.isDrawing) return;
        const touch = e.touches[0];
        const rect = this.canvas.getBoundingClientRect();
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        this.drawLine(this.lastX, this.lastY, x, y);
        this.lastX = x;
        this.lastY = y;
    }

    // ============================================
    // 📏 DIBUJAR LÍNEA
    // ============================================
    drawLine(x1, y1, x2, y2) {
        if (!this.ctx) return;

        this.ctx.beginPath();
        this.ctx.moveTo(x1, y1);
        this.ctx.lineTo(x2, y2);
        this.ctx.strokeStyle = this.currentTool === 'eraser' ? '#ffffff' : this.drawColor;
        this.ctx.lineWidth = this.drawSize;
        this.ctx.stroke();
    }

    // ============================================
    // 🎨 CONFIGURAR EVENTOS DEL MODAL DE DIBUJO
    // ============================================
    setupDrawingEvents() {
        const closeBtn = document.getElementById('drawingModalClose');
        if (closeBtn) {
            closeBtn.addEventListener('click', this.closeDrawingModal.bind(this));
        }

        const cancelBtn = document.getElementById('cancelDrawingBtn');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', this.closeDrawingModal.bind(this));
        }

        const overlay = document.getElementById('drawingModal');
        if (overlay) {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    this.closeDrawingModal();
                }
            });
        }

        document.querySelectorAll('.tool-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentTool = btn.dataset.tool;
                
                if (this.currentTool === 'clear') {
                    this.clearCanvas();
                }
            });
        });

        const colorInput = document.getElementById('drawingColor');
        if (colorInput) {
            colorInput.addEventListener('input', (e) => {
                this.drawColor = e.target.value;
            });
        }

        const sizeInput = document.getElementById('drawingSize');
        const sizeValue = document.getElementById('sizeValue');
        if (sizeInput && sizeValue) {
            sizeInput.addEventListener('input', (e) => {
                this.drawSize = parseInt(e.target.value);
                sizeValue.textContent = this.drawSize;
            });
        }

        const saveBtn = document.getElementById('saveDrawingBtn');
        if (saveBtn) {
            saveBtn.addEventListener('click', this.saveDrawing.bind(this));
        }
    }

    // ============================================
    // 🗑️ LIMPIAR CANVAS
    // ============================================
    clearCanvas() {
        if (!this.ctx || !this.canvas) return;
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    // ============================================
    // 💾 GUARDAR DIBUJO
    // ============================================
    async saveDrawing() {
        if (!this.canvas) return;

        try {
            const dataUrl = this.canvas.toDataURL('image/png');
            const response = await fetch(dataUrl);
            const blob = await response.blob();
            const file = new File([blob], `dibujo_${Date.now()}.png`, { type: 'image/png' });

            console.log('🎨 Dibujo guardado, subiendo...');
            await this.uploadImage(file, 'drawing');
            this.closeDrawingModal();
            
        } catch (error) {
            console.error('❌ Error al guardar dibujo:', error);
            this.showError('Error al guardar el dibujo');
        }
    }

    // ============================================
    // 🖼️ CERRAR MODAL DE DIBUJO
    // ============================================
    closeDrawingModal() {
        const modal = document.getElementById('drawingModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    // ============================================
    // 📤 SUBIR IMAGEN
    // ============================================
    async uploadImage(file, type) {
        try {
            this.showLoading();

            const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
            if (!allowedTypes.includes(file.type)) {
                this.showError('❌ Formato no soportado. Usa JPG, PNG, GIF o WebP');
                this.hideLoading();
                return false;
            }

            if (file.size > 5 * 1024 * 1024) {
                this.showError('❌ La imagen debe ser menor a 5MB');
                this.hideLoading();
                return false;
            }

            const result = await userImageService.uploadImage(file, type, this.eventoId);

            if (!result.success) {
                throw new Error(result.error);
            }

            await this.loadUserImages();

            this.showSuccess(`✅ ${type === 'photo' ? 'Foto' : 'Dibujo'} subido exitosamente`);
            this.hideLoading();
            return true;

        } catch (error) {
            console.error('❌ Error uploading image:', error);
            this.showError(error.message || 'Error al subir la imagen');
            this.hideLoading();
            return false;
        }
    }

    // ============================================
    // 📋 CARGAR IMÁGENES DEL USUARIO
    // ============================================
    async loadUserImages() {
        const galleryGrid = document.getElementById('galleryGrid');
        if (!galleryGrid) return;

        try {
            const result = await userImageService.getUserImages();
            
            if (!result.success) {
                throw new Error(result.error);
            }

            const allImages = result.images;
            console.log(`📋 Cargando ${allImages.length} imágenes del usuario`);

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
    // 🖼️ MODAL DE IMAGEN
    // ============================================
    setupImageModalEvents() {
        const closeBtn = document.getElementById('modalCloseBtn');
        if (closeBtn) {
            closeBtn.addEventListener('click', this.closeModal.bind(this));
        }

        const overlay = document.getElementById('imageModal');
        if (overlay) {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    this.closeModal();
                }
            });
        }

        const deleteBtn = document.getElementById('modalDeleteBtn');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', this.handleDeleteImage.bind(this));
        }
    }

    openModal(index) {
        const image = this.images[index];
        if (!image) return;

        const modal = document.getElementById('imageModal');
        const modalImage = document.getElementById('modalImage');
        const modalDate = document.getElementById('modalDate');
        const modalDeleteBtn = document.getElementById('modalDeleteBtn');

        if (modalImage) modalImage.src = image.url;
        
        let dateText = '';
        if (image.date) {
            dateText = new Date(image.date).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        }
        
        const typeText = image.type === 'photo' ? '📸 Foto' : '🎨 Dibujo';
        
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
    // 🗑️ ELIMINAR IMAGEN
    // ============================================
    async handleDeleteImage(e) {
        const index = parseInt(e.target.dataset.index);
        if (isNaN(index)) return;

        const confirmDelete = confirm('⚠️ ¿Estás seguro de que quieres eliminar esta imagen?');
        if (!confirmDelete) return;

        try {
            this.showLoading();

            const result = await userImageService.deleteImage(index);
            
            if (!result.success) {
                throw new Error(result.error);
            }

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