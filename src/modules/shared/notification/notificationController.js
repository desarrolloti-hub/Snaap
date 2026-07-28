// src/modules/shared/notification/notificationController.js
import { userService } from '../../../services/userService.js';
import { simpleNotificationService } from '../../../services/simpleNotificationService.js';

let isInitialized = false;

export async function initNotification() {
    if (isInitialized) return;
    isInitialized = true;

    console.log('🔔 Inicializando sistema de notificaciones (Simple)...');

    const user = userService.getCurrentUser();
    if (!user) {
        console.log('ℹ️ Usuario no autenticado');
        return;
    }

    // Solicitar permiso automáticamente
    const result = await simpleNotificationService.requestPermission();
    
    if (result.success) {
        console.log('✅ Notificaciones activadas');
        updateButtonState(true);
        
        // Notificación de bienvenida
        simpleNotificationService.sendNotification(
            '¡Bienvenido a SNAAP!',
            'Las notificaciones están activadas',
            '/assets/imagenes/Snaap.png'
        );
    } else {
        console.warn('⚠️ Permiso denegado:', result.permission);
        updateButtonState(false);
    }
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

        const status = simpleNotificationService.getStatus();

        if (status.isSubscribed) {
            const result = await Swal.fire({
                title: '¿Desactivar notificaciones?',
                text: 'Ya no recibirás notificaciones',
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'Sí, desactivar',
                cancelButtonText: 'Cancelar'
            });

            if (result.isConfirmed) {
                simpleNotificationService.isSubscribed = false;
                updateButtonState(false);
                await Swal.fire({
                    title: 'Notificaciones desactivadas',
                    icon: 'info',
                    confirmButtonText: 'OK'
                });
            }
        } else {
            const result = await simpleNotificationService.requestPermission();
            if (result.success) {
                updateButtonState(true);
                simpleNotificationService.sendNotification(
                    '🔔 Notificaciones activadas',
                    'Recibirás notificaciones de SNAAP',
                    '/assets/imagenes/Snaap.png'
                );
                await Swal.fire({
                    title: '¡Notificaciones activadas!',
                    icon: 'success',
                    confirmButtonText: 'OK'
                });
            } else {
                await Swal.fire({
                    title: 'Permiso denegado',
                    text: 'Habilita las notificaciones en tu navegador',
                    icon: 'error',
                    confirmButtonText: 'OK'
                });
            }
        }
    } catch (error) {
        console.error('❌ Error:', error);
        await Swal.fire({
            title: 'Error',
            text: error.message,
            icon: 'error',
            confirmButtonText: 'OK'
        });
    }
}

// ============================================
// 🎨 ACTUALIZAR UI
// ============================================
function updateButtonState(isSubscribed) {
    const btn = document.getElementById('notificationToggleBtn');
    const statusText = document.getElementById('notificationStatus');
    
    if (!btn) return;

    if (isSubscribed) {
        btn.classList.add('active');
        btn.style.borderColor = '#00ff88';
        btn.style.color = '#00ff88';
        if (statusText) statusText.textContent = '✅ Activadas';
    } else {
        btn.classList.remove('active');
        btn.style.borderColor = '#4db8ff';
        btn.style.color = '#ffffff';
        if (statusText) statusText.textContent = '🔔 Activar';
    }
}

export default { initNotification, toggleSubscription };