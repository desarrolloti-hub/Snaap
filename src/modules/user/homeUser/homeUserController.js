// src/modules/user/homeUser/homeUserController.js
import { userService } from '../../../services/userService.js';
import { eventService } from '../../../services/eventService.js';
import { eventImageService } from '../../../services/eventImageService.js';
import { auth } from '../../../config/firebaseConfig.js';

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
        this.previewImages = [];
        
        // 🔥 DIBUJO
        this.isDrawing = false;
        this.lastX = 0;
        this.lastY = 0;
        this.currentTool = 'pen';
        this.drawColor = '#4db8ff';
        this.drawSize = 5;
        this.canvas = null;
        this.ctx = null;
        this.boundKeydownHandler = null;
        this.boundGalleryChangeHandler = null;
        this.boundTakePhotoHandler = null;
        this.boundOpenGalleryHandler = null;
        this.boundDrawingModalCloseHandler = null;
        this.boundCancelDrawingHandler = null;
        this.boundOverlayHandler = null;
        this.boundSaveDrawingHandler = null;
        
        this.initialize();
    }

    // ============================================
    // 🚀 INICIALIZACIÓN
    // ============================================
    async initialize() {
        try {
            console.log('[homeUser] initialize start');

            this.currentUser = this.resolveCurrentUser();
            if (!this.currentUser) {
                console.warn('[homeUser] No current user found');
                this.currentUser = {
                    uid: 'guest-user',
                    email: 'guest@snaap.com',
                    username: 'Invitado',
                    role: 'user'
                };
            }

            const urlParams = new URLSearchParams(window.location.search);
            this.eventoId = urlParams.get('eventId');

            console.log('[homeUser] eventId resolved', this.eventoId);

            if (!this.eventoId) {
                console.warn('[homeUser] Missing eventId in URL');
                this.eventoId = 'demo-event';
            }

            console.log('[homeUser] Setting up listeners...');
            this.setupEventListeners();

            console.log('[homeUser] Loading event data...');
            await this.loadEventData();
            console.log('[homeUser] Loading user data...');
            await this.loadUserData();
            console.log('[homeUser] Loading user images...');
            await this.loadUserImages();
            console.log('[homeUser] Updating event header...');
            this.updateEventHeader();

        } catch (error) {
            console.error('[homeUser] Error initializing user home:', error);
            this.showError('Error al cargar la página');
        }
    }

    // ============================================
    // 📥 CARGAR DATOS DEL EVENTO
    // ============================================
    async loadEventData() {
        try {
            console.log('[homeUser] Calling eventService.obtenerEventoPorId with', this.eventoId);
            const result = await eventService.obtenerEventoPorId(this.eventoId);
            console.log('[homeUser] eventService result', result);
            if (!result.success) {
                throw new Error(result.error || 'No se pudo obtener el evento');
            }
            this.eventoData = result.evento;
            console.log('[homeUser] Evento cargado:', this.eventoData?.nombre);
        } catch (error) {
            console.error('[homeUser] Error loading event data:', error);
            this.eventoData = { nombre: 'Evento', id: this.eventoId };
        }
    }

    // ============================================
    // 📥 CARGAR DATOS DEL USUARIO
    // ============================================
    async loadUserData() {
        try {
            if (!this.currentUser?.uid) {
                this.userData = this.currentUser || { username: 'Invitado', role: 'user' };
                return;
            }

            console.log('[homeUser] Calling userService.obtenerUsuarioPorUid for', this.currentUser.uid);
            const result = await userService.obtenerUsuarioPorUid(this.currentUser.uid);
            console.log('[homeUser] userService profile result', result);
            
            if (result.success) {
                this.userData = result.user;
            } else {
                this.userData = this.currentUser;
            }
            
            if (!this.userData.images) {
                this.userData.images = [];
            }
            
        } catch (error) {
            console.error('[homeUser] Error loading user data:', error);
            this.userData = this.currentUser || { username: 'Invitado', role: 'user' };
            if (!this.userData.images) {
                this.userData.images = [];
            }
        }
    }

    // ============================================
    // 🖼️ ACTUALIZAR HEADER
    // ============================================
    resolveCurrentUser() {
        const serviceUser = userService.getCurrentUser();
        if (serviceUser) return serviceUser;

        if (auth?.currentUser) {
            return {
                uid: auth.currentUser.uid,
                email: auth.currentUser.email,
                username: auth.currentUser.displayName || auth.currentUser.email?.split('@')[0] || 'Usuario',
                role: 'user',
                photoURL: auth.currentUser.photoURL || null
            };
        }

        return null;
    }

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
    // 🎯 CONFIGURAR EVENTOS
    // ============================================
    setupEventListeners() {
        // 🔥 BOTÓN 1: TOMAR FOTO
        const takePhotoBtn = document.getElementById('takePhotoBtn');
        if (takePhotoBtn) {
            this.boundTakePhotoHandler = this.handleTakePhoto.bind(this);
            takePhotoBtn.addEventListener('click', this.boundTakePhotoHandler);
        }

        // 🔥 BOTÓN 2: SUBIR DIBUJO
        const uploadDrawingBtn = document.getElementById('uploadDrawingBtn');
        if (uploadDrawingBtn) {
            this.boundOpenDrawingModalHandler = this.openDrawingModal.bind(this);
            uploadDrawingBtn.addEventListener('click', this.boundOpenDrawingModalHandler);
        }

        // 🔥 BOTÓN 3: MIS FOTOS (Galería del dispositivo)
        const openGalleryBtn = document.getElementById('openGalleryBtn');
        const galleryInput = document.getElementById('galleryFileInput');
        
        if (openGalleryBtn && galleryInput) {
            this.boundOpenGalleryHandler = (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.handleOpenGallery();
            };
            openGalleryBtn.addEventListener('click', this.boundOpenGalleryHandler);

            this.boundGalleryChangeHandler = this.handleGalleryUpload.bind(this);
            galleryInput.addEventListener('change', this.boundGalleryChangeHandler);
        }

        // 🔥 MODAL DE DIBUJO
        this.setupDrawingEvents();

        // 🔥 TECLA ESC
        this.boundKeydownHandler = (e) => {
            if (e.key === 'Escape') {
                this.closeDrawingModal();
            }
        };
        document.addEventListener('keydown', this.boundKeydownHandler);
    }

    // ============================================
    // 📸 TOMAR FOTO
    // ============================================
    async handleTakePhoto() {
        const result = await Swal.fire({
            title: '📸 ¿Usar la cámara?',
            text: 'Snaap necesita acceder a tu cámara para tomar fotos',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Sí, permitir',
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
            this.showError('No se pudo acceder a la cámara. Verifica los permisos.');
        }
    }

    // ============================================
    // 🖼️ ABRIR GALERÍA DEL DISPOSITIVO
    // ============================================
    async handleOpenGallery() {
        const result = await Swal.fire({
            title: '🖼️ ¿Abrir galería?',
            text: 'Snaap necesita acceder a tu galería para seleccionar fotos',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Sí, permitir',
            cancelButtonText: 'Cancelar'
        });

        if (!result.isConfirmed) return;

        const galleryInput = document.getElementById('galleryFileInput');
        if (galleryInput) {
            galleryInput.click();
        }
    }

    // ============================================
    // 🖼️ MANEJAR SUBIDA DESDE GALERÍA
    // ============================================
    async handleGalleryUpload(e) {
        const files = e.target.files;
        if (!files || files.length === 0) return;
        
        this.showLoading('Subiendo imágenes...');
        
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
            this.showSuccess(`✅ ${successCount} imagen(es) subida(s) exitosamente`);
        }
        if (errorCount > 0) {
            this.showError(`❌ ${errorCount} imagen(es) no pudieron subirse`);
        }
        
        e.target.value = '';
    }

    // ============================================
    // 🔔 ENVIAR NOTIFICACIÓN PUSH AL HOST
    // ============================================
    async sendNotificationToHost(title, message, icon = '📸', link = null) {
        try {
            const { notificationService } = await import('../../../services/notificationService.js');
            
            const hostId = this.eventoData?.creadoPor;
            const recipients = hostId ? [hostId] : [];
            
            await notificationService.sendPushNotification({
                title: title,
                body: message,
                icon: icon,
                link: link,
                recipients: recipients
            });
            
        } catch (error) {
            console.warn('⚠️ Error al enviar notificación al host:', error);
        }
    }

    // ============================================
    // 📤 SUBIR IMAGEN (USANDO EVENT-IMAGE-SERVICE)
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

            // 🔥 USAR EVENT-IMAGE-SERVICE (guarda en eventImages)
            const result = await eventImageService.uploadImage(file, type, this.eventoId);

            if (!result.success) {
                throw new Error(result.error);
            }

            // 🔥 RECARGAR IMÁGENES
            await this.loadUserImages();

            // 🔥 ENVIAR NOTIFICACIÓN AL HOST
            const nombreUsuario = this.currentUser?.username || this.currentUser?.email?.split('@')[0] || 'Invitado';
            const nombreEvento = this.eventoData?.nombre || 'Evento';
            
            await this.sendNotificationToHost(
                '📸 Nueva foto subida',
                `${nombreUsuario} ha subido una foto a tu evento "${nombreEvento}"`,
                '📸',
                `/user/gallery?eventId=${this.eventoId}`
            );

            return true;

        } catch (error) {
            console.error('❌ Error uploading image:', error);
            this.showError(error.message || 'Error al subir la imagen');
            return false;
        }
    }

    // ============================================
    // 📋 CARGAR IMÁGENES DESDE eventImages
    // ============================================
    async loadUserImages() {
        try {
            console.log('[homeUser] Calling eventImageService.getEventImages');

            // 🔥 OBTENER SOLO LAS IMÁGENES QUE SUBIÓ EL USUARIO ACTUAL EN ESTE EVENTO
            const result = await eventImageService.getEventImages(this.eventoId, this.currentUser.uid);
            
            if (!result.success) {
                throw new Error(result.error || 'No se pudieron obtener las imágenes');
            }

            const eventImages = result.images || [];

            console.log('[homeUser] images for event', this.eventoId, eventImages.length);
            this.images = eventImages;
            this.previewImages = eventImages.slice(0, 12);
            
            this.renderPreview();
            
        } catch (error) {
            console.error('[homeUser] Error loading images:', error);
        }
    }

    // ============================================
    // 🎨 RENDERIZAR VISTA PREVIA
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
                    <p>No has subido fotos aún</p>
                </div>
            `;
            return;
        }

        previewGrid.innerHTML = this.previewImages.map((image, index) => `
            <div class="preview-item" data-index="${index}">
                <img src="${image.url}" alt="${image.fileName || 'Imagen'}" loading="lazy">
                <span class="preview-type ${image.type}">
                    ${image.type === 'photo' ? '📸' : '🎨'}
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
    // 🖼️ ABRIR GALERÍA COMPLETA EN MODAL
    // ============================================
    async showFullGallery() {
        const result = await Swal.fire({
            title: '🖼️ Tus fotos',
            html: this.getGalleryModalHTML(),
            width: '90%',
            maxWidth: '800px',
            confirmButtonText: 'Cerrar',
            showCancelButton: true,
            cancelButtonText: 'Ver todas en galería',
            preConfirm: () => {
                window.location.href = `/user/gallery?eventId=${this.eventoId}`;
                return false;
            }
        });

        if (result.dismiss === Swal.DismissReason.cancel) {
            window.location.href = `/user/gallery?eventId=${this.eventoId}`;
        }
    }

    getGalleryModalHTML() {
        if (this.images.length === 0) {
            return `
                <div class="empty-preview">
                    <i class="fas fa-camera" style="font-size: 3rem; color: rgba(255,255,255,0.3);"></i>
                    <p style="color: rgba(255,255,255,0.5);">No has subido fotos aún</p>
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
                    ${image.type === 'photo' ? '📸' : '🎨'}
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
                ${this.images.length} imágenes
            </div>
        `;
    }

    // ============================================
    // 🎨 DIBUJO
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
            this.boundDrawingModalCloseHandler = this.closeDrawingModal.bind(this);
            closeBtn.addEventListener('click', this.boundDrawingModalCloseHandler);
        }

        const cancelBtn = document.getElementById('cancelDrawingBtn');
        if (cancelBtn) {
            this.boundCancelDrawingHandler = this.closeDrawingModal.bind(this);
            cancelBtn.addEventListener('click', this.boundCancelDrawingHandler);
        }

        const overlay = document.getElementById('drawingModal');
        if (overlay) {
            this.boundOverlayHandler = (e) => {
                if (e.target === overlay) {
                    this.closeDrawingModal();
                }
            };
            overlay.addEventListener('click', this.boundOverlayHandler);
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
            this.boundSaveDrawingHandler = this.saveDrawing.bind(this);
            saveBtn.addEventListener('click', this.boundSaveDrawingHandler);
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
            console.error('❌ Error al guardar dibujo:', error);
            this.showError('Error al guardar el dibujo');
        }
    }

    closeDrawingModal() {
        const modal = document.getElementById('drawingModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    destroy() {
        if (this.boundKeydownHandler) {
            document.removeEventListener('keydown', this.boundKeydownHandler);
        }

        const takePhotoBtn = document.getElementById('takePhotoBtn');
        if (takePhotoBtn && this.boundTakePhotoHandler) {
            takePhotoBtn.removeEventListener('click', this.boundTakePhotoHandler);
        }

        const uploadDrawingBtn = document.getElementById('uploadDrawingBtn');
        if (uploadDrawingBtn && this.boundOpenDrawingModalHandler) {
            uploadDrawingBtn.removeEventListener('click', this.boundOpenDrawingModalHandler);
        }

        const openGalleryBtn = document.getElementById('openGalleryBtn');
        const galleryInput = document.getElementById('galleryFileInput');
        if (openGalleryBtn && this.boundOpenGalleryHandler) {
            openGalleryBtn.removeEventListener('click', this.boundOpenGalleryHandler);
        }
        if (galleryInput && this.boundGalleryChangeHandler) {
            galleryInput.removeEventListener('change', this.boundGalleryChangeHandler);
        }

        const closeBtn = document.getElementById('drawingModalClose');
        if (closeBtn && this.boundDrawingModalCloseHandler) {
            closeBtn.removeEventListener('click', this.boundDrawingModalCloseHandler);
        }

        const cancelBtn = document.getElementById('cancelDrawingBtn');
        if (cancelBtn && this.boundCancelDrawingHandler) {
            cancelBtn.removeEventListener('click', this.boundCancelDrawingHandler);
        }

        const overlay = document.getElementById('drawingModal');
        if (overlay && this.boundOverlayHandler) {
            overlay.removeEventListener('click', this.boundOverlayHandler);
        }

        const saveBtn = document.getElementById('saveDrawingBtn');
        if (saveBtn && this.boundSaveDrawingHandler) {
            saveBtn.removeEventListener('click', this.boundSaveDrawingHandler);
        }

        if (this.canvas) {
            this.canvas.removeEventListener('mousedown', this.startDrawing.bind(this));
            this.canvas.removeEventListener('mousemove', this.draw.bind(this));
            this.canvas.removeEventListener('mouseup', this.stopDrawing.bind(this));
            this.canvas.removeEventListener('mouseleave', this.stopDrawing.bind(this));
            this.canvas.removeEventListener('touchstart', this.startDrawingTouch.bind(this));
            this.canvas.removeEventListener('touchmove', this.drawTouch.bind(this));
            this.canvas.removeEventListener('touchend', this.stopDrawing.bind(this));
        }
    }

    // ============================================
    // 📦 SWEETALERT UTILITIES
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
            title: '¡Éxito!',
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
// ✅ EXPORT
// ============================================
export function initHomeUserController() {
    if (window.__homeUserControllerInstance && typeof window.__homeUserControllerInstance.destroy === 'function') {
        window.__homeUserControllerInstance.destroy();
    }

    window.__homeUserControllerInstance = new HomeUserController();
    return window.__homeUserControllerInstance;
}

// ============================================
// 🚀 INIT
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    initHomeUserController();
});