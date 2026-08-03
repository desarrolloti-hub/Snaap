// src/modules/shared/notification/notificationController.js
import { userService } from '../../../services/userService.js';
import { notificationService } from '../../../services/notificationService.js';

let isInitialized = false;

// ============================================
// 🚀 INICIALIZAR NOTIFICACIONES FCM
// ============================================
export async function initNotification() {
    if (isInitialized) return;
    isInitialized = true;

    console.log('🔔 Inicializando sistema de notificaciones FCM...');

    const user = userService.getCurrentUser();
    if (!user) {
        console.log('ℹ️ Usuario no autenticado');
        return;
    }

    notificationService.setUsuarioActual(user);

    // Verificar si ya está suscrito
    const status = notificationService.getSubscriptionStatus();
    if (status.isSubscribed) {
        console.log('✅ Usuario ya suscrito a FCM');
        updateButtonState(true);
        return;
    }

    // 🔥 SOLO REGISTRAR EN PRODUCCIÓN (HTTPS)
    if (window.location.hostname !== 'localhost') {
        const result = await notificationService.registerPushNotifications();
        
        if (result.success) {
            console.log('✅ Notificaciones FCM activadas');
            updateButtonState(true);
            
            // Escuchar mensajes entrantes
            notificationService.listenForMessages((payload) => {
                console.log('📨 Notificación FCM recibida:', payload);
            });
        } else {
            console.warn('⚠️ No se activaron notificaciones FCM:', result.error);
            updateButtonState(false);
        }
    } else {
        console.log('ℹ️ FCM solo funciona en producción (HTTPS)');
        console.log('💡 Despliega a producción: firebase deploy --only hosting');
    }

    // Escuchar cambios de autenticación
    document.addEventListener('auth:changed', async (event) => {
        const detail = event.detail || {};
        const user = detail.user || userService.getCurrentUser();
        
        if (user) {
            notificationService.setUsuarioActual(user);
            const status = notificationService.getSubscriptionStatus();
            if (!status.isSubscribed && window.location.hostname !== 'localhost') {
                const result = await notificationService.registerPushNotifications();
                updateButtonState(result.success);
            }
        }
    });

    console.log('✅ Sistema de notificaciones FCM inicializado');
}

// ============================================
// 🔘 TOGGLE SUSCRIPCIÓN
// ============================================
export async function toggleSubscription() {
    try {
        const user = userService.getCurrentUser();
        if (!user) {
            await Swal.fire({
                title: 'Inicia sesión',
                text: 'Debes iniciar sesión para activar las notificaciones',
                icon: 'warning',
                confirmButtonText: 'OK'
            });
            return;
        }

        notificationService.setUsuarioActual(user);

        if (notificationService.isSubscribed) {
            // Desuscribirse
            const result = await notificationService.unsubscribe();
            if (result.success) {
                await Swal.fire({
                    title: 'Notificaciones desactivadas',
                    text: 'Ya no recibirás notificaciones FCM',
                    icon: 'info',
                    confirmButtonText: 'OK'
                });
                updateButtonState(false);
            } else {
                await Swal.fire({
                    title: 'Error',
                    text: result.error || 'No se pudo desactivar',
                    icon: 'error',
                    confirmButtonText: 'OK'
                });
            }
        } else {
            // Suscribirse - SOLO EN PRODUCCIÓN
            if (window.location.hostname === 'localhost') {
                await Swal.fire({
                    title: '⚠️ HTTPS requerido',
                    text: 'Las notificaciones FCM solo funcionan en producción (HTTPS).\n\nDespliega a: https://snaap-mx.web.app',
                    icon: 'warning',
                    confirmButtonText: 'OK'
                });
                return;
            }

            const result = await notificationService.registerPushNotifications();
            if (result.success) {
                await Swal.fire({
                    title: '¡Notificaciones FCM activadas!',
                    text: 'Recibirás notificaciones incluso con la página cerrada',
                    icon: 'success',
                    confirmButtonText: 'OK'
                });
                updateButtonState(true);
                
                notificationService.listenForMessages((payload) => {
                    console.log('📨 Notificación FCM recibida:', payload);
                });
            } else {
                await Swal.fire({
                    title: 'Error',
                    text: result.error || 'No se pudo activar FCM',
                    icon: 'error',
                    confirmButtonText: 'OK'
                });
            }
        }
    } catch (error) {
        console.error('❌ Error:', error);
        await Swal.fire({
            title: 'Error',
            text: error.message || 'Ocurrió un error',
            icon: 'error',
            confirmButtonText: 'OK'
        });
    }
}

// ============================================
// 🎨 ACTUALIZAR UI
// ============================================
export function updateButtonState(isSubscribed) {
    const btn = document.getElementById('notificationToggleBtn');
    const statusText = document.getElementById('notificationStatus');
    const badge = document.getElementById('notificationBadge');
    
    if (!btn) return;

    if (isSubscribed) {
        btn.classList.add('active');
        btn.style.borderColor = '#00ff88';
        btn.style.color = '#00ff88';
        if (statusText) statusText.textContent = '✅ FCM Activadas';
        if (badge) {
            badge.style.display = 'inline-block';
            badge.textContent = '📡';
        }
    } else {
        btn.classList.remove('active');
        btn.style.borderColor = '#4db8ff';
        btn.style.color = '#ffffff';
        if (statusText) statusText.textContent = '🔔 Activar FCM';
        if (badge) badge.style.display = 'none';
    }
}

// ============================================
// 📤 CREAR BOTÓN DE NOTIFICACIONES
// ============================================
export function createNotificationButton(container) {
    if (!container) return;
    
    const btnHTML = `
        <button id="notificationToggleBtn" class="btn-notification" style="
            background: rgba(10, 10, 20, 0.9);
            backdrop-filter: blur(20px);
            border: 2px solid #4db8ff;
            border-radius: 50px;
            padding: 12px 24px;
            color: #ffffff;
            font-family: 'Poppins', sans-serif;
            font-size: 0.9rem;
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            gap: 12px;
            box-shadow: 0 0 20px rgba(77, 184, 255, 0.2);
            position: relative;
        ">
            <i class="fas fa-bell" style="font-size: 1.2rem;"></i>
            <span id="notificationStatus">🔔 Activar FCM</span>
            <span id="notificationBadge" style="
                display: none;
                background: #ff007a;
                color: white;
                border-radius: 50%;
                padding: 2px 8px;
                font-size: 0.7rem;
                font-weight: 700;
                min-width: 20px;
                text-align: center;
                position: absolute;
                top: -5px;
                right: -5px;
            ">📡</span>
        </button>
    `;
    
    container.innerHTML = btnHTML;
    
    const status = notificationService.getSubscriptionStatus();
    updateButtonState(status.isSubscribed);
}

// ============================================
// 📨 ENVIAR NOTIFICACIÓN DESDE CUALQUIER LUGAR
// ============================================
export function sendNotification(title, body, icon = '/assets/imagenes/Snaap.png', link = null) {
    notificationService.showInAppNotification({ title, body, icon, link });
}

export default { 
    initNotification, 
    toggleSubscription, 
    updateButtonState, 
    createNotificationButton,
    sendNotification
};