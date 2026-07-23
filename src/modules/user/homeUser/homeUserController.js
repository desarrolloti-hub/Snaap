// src/modules/user/homeUser/homeUserController.js
import { userService } from '../../../services/userService.js';
import { eventService } from '../../../services/eventService.js';
import { userImageService } from '../../../services/userImageService.js';

// ============================================
// ðŸŽ® CONTROLLER PRINCIPAL
// ============================================
class HomeUserController {
    constructor() {
        this.currentUser = null;
        this.userData = null;
        this.eventoId = null;
        this.eventoData = null;
        this.images = [];
        this.previewImages = [];
        
        // ðŸ”¥ DIBUJO
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
    // ðŸš€ INICIALIZACIÃ“N
    // ============================================
    async initialize() {
        try {
            this.currentUser = userService.getCurrentUser();
            if (!this.currentUser) {
                import('../../utils/navigation.js').then(({ navigateOrHref }) => navigateOrHref('/login'));
                return;
            }

            const urlParams = new URLSearchParams(window.location.search);
            this.eventoId = urlParams.get('eventId');

            if (!this.eventoId) {
                this.showError('No se especificÃ³ un evento');
                return;
            }

            await this.loadEventData();
            await this.loadUserData();
            this.setupEventListeners();
            await this.loadUserImages();
            this.updateEventHeader();

        } catch (error) {
            console.error('Error initializing user home:', error);
            this.showError('Error al cargar la pÃ¡gina');
        }
    }

    // ============================================
    // ðŸ“¥ CARGAR DATOS DEL EVENTO
    // ============================================
    async loadEventData() {
        try {
            const result = await eventService.obtenerEventoPorId(this.eventoId);
            if (!result.success) {
                throw new Error(result.error);
            }
            this.eventoData = result.evento;
            console.log('âœ… Evento cargado:', this.eventoData?.nombre);
        } catch (error) {
            console.error('Error loading event data:', error);
            throw error;
        }
    }

    // ============================================
    // ðŸ“¥ CARGAR DATOS DEL USUARIO
    // ============================================
    async loadUserData() {
        try {
            const result = await userService.obtenerUsuarioPorUid(this.currentUser.uid);
            
            if (result.success) {
                this.userData = result.user;
            } else {
                this.userData = this.currentUser;
            }
            
            if (!this.userData.images) {
                this.userData.images = [];
            }
            
        } catch (error) {
            console.error('âŒ Error loading user data:', error);
            this.userData = this.currentUser;
            if (!this.userData.images) {
                this.userData.images = [];
            }
        }
    }

    // ============================================
    // ðŸ–¼ï¸ ACTUALIZAR HEADER
    // ============================================
    updateEventHeader() {
        const headerTitle = document.querySelector('.user-home-header h1');
        const eventBadge = document.querySelector('.event-badge');
        
        if (headerTitle && this.eventoData) {
            headerTitle.innerHTML = `<i class="fas fa-calendar-alt"></i> ${this.eventoData.nombre || 'Evento'}`;
        }
        if (eventBadge && this.eventoData) {
            eventBadge.innerHTML = `<i class="fas fa-ticket-alt"></i> ${this.eventoData.nombre || 'Evento'}`;
        }
    }

    // ============================================
    // ðŸŽ¯ CONFIGURAR EVENTOS
    // ============================================
    setupEventListeners() {
        // ðŸ”¥ BOTÃ“N 1: TOMAR FOTO
        const takePhotoBtn = document.getElementById('takePhotoBtn');
        if (takePhotoBtn) {
            takePhotoBtn.addEventListener('click', this.handleTakePhoto.bind(this));
        }

        // ðŸ”¥ BOTÃ“N 2: SUBIR DIBUJO
        const uploadDrawingBtn = document.getElementById('uploadDrawingBtn');
        if (uploadDrawingBtn) {
            uploadDrawingBtn.addEventListener('click', this.openDrawingModal.bind(this));
        }

        // ðŸ”¥ BOTÃ“N 3: MIS FOTOS (GalerÃ­a del dispositivo)
        const openGalleryBtn = document.getElementById('openGalleryBtn');
        const galleryInput = document.getElementById('galleryFileInput');
        
        if (openGalleryBtn && galleryInput) {
            openGalleryBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.handleOpenGallery();
            });
            
            galleryInput.addEventListener('change', this.handleGalleryUpload.bind(this));
        }

        // ðŸ”¥ MODAL DE DIBUJO
        this.setupDrawingEvents();

        // ðŸ”¥ TECLA ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeDrawingModal();
            }
        });
    }

    // ============================================
    // ðŸ“¸ TOMAR FOTO
    // ============================================
    async handleTakePhoto() {
        const result = await Swal.fire({
            title: 'ðŸ“¸ Â¿Usar la cÃ¡mara?',
            text: 'Snaap necesita acceder a tu cÃ¡mara para tomar fotos',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'SÃ­, permitir',
            cancelButtonText: 'Cancelar'
        });

        if (!result.isConfirmed) return;

        try {
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
        } catch (error) {
            console.error('Error accessing camera:', error);
            this.showError('No se pudo acceder a la cÃ¡mara. Verifica los permisos.');
        }
    }

    // ============================================
    // ðŸ–¼ï¸ ABRIR GALERÃA DEL DISPOSITIVO
    // ============================================
    async handleOpenGallery() {
        const result = await Swal.fire({
            title: 'ðŸ–¼ï¸ Â¿Abrir galerÃ­a?',
            text: 'Snaap necesita acceder a tu galerÃ­a para seleccionar fotos',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'SÃ­, permitir',
            cancelButtonText: 'Cancelar'
        });

        if (!result.isConfirmed) return;

        const galleryInput = document.getElementById('galleryFileInput');
        if (galleryInput) {
            galleryInput.click();
        }
    }

    // ============================================
    // ðŸ–¼ï¸ MANEJAR SUBIDA DESDE GALERÃA
    // ============================================
    async handleGalleryUpload(e) {
        const files = e.target.files;
        if (!files || files.length === 0) return;
        
        this.showLoading('Subiendo imÃ¡genes...');
        
        let successCount = 0;
        let errorCount = 0;
        
        for (const file of files) {
            const result = await this.uploadImage(file, 'photo');
            if (result) {
                successCount++;
            } else {
                errorCount++;
            }
        }
        
        this.hideLoading();
        
        if (successCount > 0) {
            this.showSuccess(`âœ… ${successCount} imagen(es) subida(s) exitosamente`);
        }
        if (errorCount > 0) {
            this.showError(`âŒ ${errorCount} imagen(es) no pudieron subirse`);
        }
        
        e.target.value = '';
    }

    // ============================================
    // ðŸ“¤ SUBIR IMAGEN
    // ============================================
    async uploadImage(file, type) {
        try {
            const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
            if (!allowedTypes.includes(file.type)) {
                this.showError('Formato no soportado. Usa JPG, PNG, GIF o WebP');
                return false;
            }

            if (file.size > 5 * 1024 * 1024) {
                this.showError('La imagen debe ser menor a 5MB');
                return false;
            }

            const result = await userImageService.uploadImage(file, type, this.eventoId);

            if (!result.success) {
                throw new Error(result.error);
            }

            await this.loadUserImages();

            return true;

        } catch (error) {
            console.error('âŒ Error uploading image:', error);
            this.showError(error.message || 'Error al subir la imagen');
            return false;
        }
    }

    // ============================================
    // ðŸ“‹ CARGAR IMÃGENES Y VISTA PREVIA
    // ============================================
    async loadUserImages() {
        try {
            const result = await userImageService.getUserImages();
            
            if (!result.success) {
                throw new Error(result.error);
            }

            const allImages = result.images;
            const eventImages = allImages.filter(img => img.eventoId === this.eventoId);

            this.images = eventImages;
            this.previewImages = eventImages.slice(0, 12);
            
            this.renderPreview();
            
        } catch (error) {
            console.error('Error loading images:', error);
        }
    }

    // ============================================
    // ðŸŽ¨ RENDERIZAR VISTA PREVIA
    // ============================================
    renderPreview() {
        const previewGrid = document.getElementById('previewGrid');
        const photoCount = document.getElementById('photoCount');
        
        if (!previewGrid) return;

        if (photoCount) {
            photoCount.textContent = this.images.length;
        }

        if (this.previewImages.length === 0) {
            previewGrid.innerHTML = `
                <div class="empty-preview">
                    <i class="fas fa-camera"></i>
                    <p>No has subido fotos aÃºn</p>
                </div>
            `;
            return;
        }

        previewGrid.innerHTML = this.previewImages.map((image, index) => `
            <div class="preview-item" data-index="${index}">
                <img src="${image.url}" alt="${image.fileName || 'Imagen'}" loading="lazy">
                <span class="preview-type ${image.type}">
                    ${image.type === 'photo' ? 'ðŸ“¸' : 'ðŸŽ¨'}
                </span>
                ${index === 11 && this.images.length > 12 ? `
                    <div class="preview-more">
                        <span>+${this.images.length - 12}</span>
                    </div>
                ` : ''}
            </div>
        `).join('');

        previewGrid.querySelectorAll('.preview-item').forEach(item => {
            item.addEventListener('click', () => {
                this.showFullGallery();
            });
        });
    }

    // ============================================
    // ðŸ–¼ï¸ ABRIR GALERÃA COMPLETA EN MODAL
    // ============================================
    async showFullGallery() {
        const result = await Swal.fire({
            title: 'ðŸ–¼ï¸ Tus fotos',
            html: this.getGalleryModalHTML(),
            width: '90%',
            maxWidth: '800px',
            confirmButtonText: 'Cerrar',
            showCancelButton: true,
            cancelButtonText: 'Ver todas en galerÃ­a',
            preConfirm: () => {
                window.go(`/user/gallery?eventId=${this.eventoId}`);
                return false;
            }
        });

        if (result.dismiss === Swal.DismissReason.cancel) {
            window.go(`/user/gallery?eventId=${this.eventoId}`);
        }
    }

    getGalleryModalHTML() {
        if (this.images.length === 0) {
            return `
                <div class="empty-preview">
                    <i class="fas fa-camera" style="font-size: 3rem; color: rgba(255,255,255,0.3);"></i>
                    <p style="color: rgba(255,255,255,0.5);">No has subido fotos aÃºn</p>
                </div>
            `;
        }

        const grid = this.images.map((image) => `
            <div style="
                position: relative;
                border-radius: 12px;
                overflow: hidden;
                aspect-ratio: 1;
                background: rgba(255,255,255,0.05);
                border: 1px solid rgba(77,184,255,0.1);
            ">
                <img src="${image.url}" alt="${image.fileName || 'Imagen'}" loading="lazy" style="
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                ">
                <span style="
                    position: absolute;
                    top: 8px;
                    right: 8px;
                    background: rgba(0,0,0,0.7);
                    padding: 4px 10px;
                    border-radius: 20px;
                    font-size: 0.7rem;
                    color: #fff;
                ">
                    ${image.type === 'photo' ? 'ðŸ“¸' : 'ðŸŽ¨'}
                </span>
            </div>
        `).join('');

        return `
            <div style="
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 10px;
                max-height: 60vh;
                overflow-y: auto;
                padding: 10px;
            ">
                ${grid}
            </div>
            <div style="
                text-align: center;
                margin-top: 10px;
                color: rgba(255,255,255,0.4);
                font-size: 0.85rem;
            ">
                ${this.images.length} imÃ¡genes
            </div>
        `;
    }

    // ============================================
    // ðŸŽ¨ DIBUJO
    // ============================================
    openDrawingModal() {
        const modal = document.getElementById('drawingModal');
        if (modal) {
            modal.style.display = 'flex';
            setTimeout(() => {
                this.initCanvas();
            }, 100);
        }
    }

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
    }

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

    drawLine(x1, y1, x2, y2) {
        if (!this.ctx) return;
        this.ctx.beginPath();
        this.ctx.moveTo(x1, y1);
        this.ctx.lineTo(x2, y2);
        this.ctx.strokeStyle = this.currentTool === 'eraser' ? '#ffffff' : this.drawColor;
        this.ctx.lineWidth = this.drawSize;
        this.ctx.stroke();
    }

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

    clearCanvas() {
        if (!this.ctx || !this.canvas) return;
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    async saveDrawing() {
        if (!this.canvas) return;

        try {
            const dataUrl = this.canvas.toDataURL('image/png');
            const response = await fetch(dataUrl);
            const blob = await response.blob();
            const file = new File([blob], `dibujo_${Date.now()}.png`, { type: 'image/png' });

            await this.uploadImage(file, 'drawing');
            this.closeDrawingModal();
            
        } catch (error) {
            console.error('âŒ Error al guardar dibujo:', error);
            this.showError('Error al guardar el dibujo');
        }
    }

    closeDrawingModal() {
        const modal = document.getElementById('drawingModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    // ============================================
    // ðŸ“¦ SWEETALERT UTILITIES
    // ============================================
    showLoading(message = 'Cargando...') {
        Swal.fire({
            title: message,
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });
    }

    hideLoading() {
        Swal.close();
    }

    showSuccess(message) {
        Swal.fire({
            title: 'Â¡Ã‰xito!',
            text: message,
            icon: 'success',
            confirmButtonText: 'Aceptar',
            timer: 2500,
            timerProgressBar: true
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
}

// ============================================
// âœ… EXPORT
// ============================================
export function initHomeUserController() {
    if (window.__homeUserControllerInitialized) return;
    window.__homeUserControllerInitialized = true;
    new HomeUserController();
}

// ============================================
// ðŸš€ INIT
// ============================================
// Initialize when DOM is ready, but avoid double-instantiation
document.addEventListener('DOMContentLoaded', () => {
    initHomeUserController();
});
