// src/modules/shared/notification/notificationController.js
import { userService } from '../../../services/userService.js';
import { notificationService } from '../../../services/notificationService.js';

let isInitialized = false;
let notificationCount = 0;

export async function initNotification() {
    if (isInitialized) return;
    isInitialized = true;

    console.log('🔔 Inicializando sistema de notificaciones');

    const user = userService.getCurrentUser();
    if (!user) {
        console.log('ℹ️ Usuario no autenticado, esperando...');
        return;
    }

    notificationService.setUsuarioActual(user);

    await updateNotificationUI();

    document.addEventListener('auth:changed', async () => {
        const newUser = userService.getCurrentUser();
        if (newUser) {
            notificationService.setUsuarioActual(newUser);
            await updateNotificationUI();
        }
    });

    console.log('✅ Sistema de notificaciones inicializado');
}

export async function updateNotificationUI() {
    try {
        const user = userService.getCurrentUser();
        if (!user) return;

        notificationService.setUsuarioActual(user);

        const result = await notificationService.getUserNotifications();
        
        if (result.success) {
            const notifications = result.notifications || [];
            const unreadCount = result.unreadCount || 0;
            notificationCount = unreadCount;

            updateBadge(unreadCount);
        }
    } catch (error) {
        console.error('Error al actualizar UI de notificaciones:', error);
    }
}

function updateBadge(count) {
    const badge = document.getElementById('notificationBadge');
    if (badge) {
        if (count > 0) {
            badge.textContent = count > 99 ? '99+' : count;
            badge.style.display = 'inline-block';
        } else {
            badge.style.display = 'none';
        }
    }
}

// 🔥 TOGGLE SUSCRIPCIÓN - CORREGIDO
export async function toggleSubscription() {
    try {
        const user = userService.getCurrentUser();
        if (!user) {
            Swal.fire({
                title: 'Inicia sesión',
                text: 'Debes iniciar sesión para activar las notificaciones',
                icon: 'warning',
                confirmButtonText: 'OK'
            });
            return;
        }

        // 🔥 Asegurar que el usuario está configurado
        notificationService.setUsuarioActual(user);

        // 🔥 Verificar estado actual
        const isSubscribed = notificationService.isSubscribed;

        if (isSubscribed) {
            // 🔥 DESUSCRIBIR
            const result = await notificationService.unsubscribe();
            if (result.success) {
                Swal.fire({
                    title: 'Notificaciones desactivadas',
                    text: 'Ya no recibirás notificaciones push',
                    icon: 'info',
                    confirmButtonText: 'OK',
                    timer: 3000,
                    timerProgressBar: true
                });
                await updateNotificationUI();
                updateButtonState(false);
            } else {
                Swal.fire({
                    title: 'Error',
                    text: result.error || 'No se pudo desactivar las notificaciones',
                    icon: 'error',
                    confirmButtonText: 'OK'
                });
            }
        } else {
            // 🔥 SUSCRIBIR - CON MANEJO DE ERRORES MEJORADO
            Swal.fire({
                title: 'Activando notificaciones...',
                text: 'Por favor espera',
                allowOutsideClick: false,
                showConfirmButton: false,
                didOpen: () => Swal.showLoading()
            });

            try {
                const result = await notificationService.subscribeToNotifications();
                Swal.close();

                if (result.success) {
                    Swal.fire({
                        title: '¡Notificaciones activadas!',
                        text: 'Recibirás notificaciones push de SNAAP',
                        icon: 'success',
                        confirmButtonText: 'OK',
                        timer: 3000,
                        timerProgressBar: true
                    });
                    await updateNotificationUI();
                    updateButtonState(true);
                } else {
                    Swal.fire({
                        title: 'Error',
                        text: result.error || 'No se pudo activar las notificaciones',
                        icon: 'error',
                        confirmButtonText: 'OK'
                    });
                }
            } catch (error) {
                Swal.close();
                console.error('❌ Error en suscripción:', error);
                Swal.fire({
                    title: 'Error',
                    text: error.message || 'Ocurrió un error al activar las notificaciones',
                    icon: 'error',
                    confirmButtonText: 'OK'
                });
            }
        }
    } catch (error) {
        console.error('❌ Error general en toggleSubscription:', error);
        Swal.fire({
            title: 'Error',
            text: error.message || 'Ocurrió un error',
            icon: 'error',
            confirmButtonText: 'OK'
        });
    }
}

function updateButtonState(isSubscribed) {
    const btn = document.getElementById('notificationToggleBtn');
    const statusText = document.getElementById('notificationStatus');
    
    if (!btn) return;

    if (isSubscribed) {
        if (statusText) statusText.textContent = '✅ Activadas';
        btn.style.borderColor = '#00ff88';
        btn.style.color = '#00ff88';
        btn.classList.add('active');
    } else {
        if (statusText) statusText.textContent = '🔔 Activar';
        btn.style.borderColor = '#4db8ff';
        btn.style.color = '#ffffff';
        btn.classList.remove('active');
    }
}

// 🔥 FUNCIÓN PARA MOSTRAR NOTIFICACIÓN EN LA UI
export function showNotification(title, body, icon = '📢', link = null) {
    notificationService.showInAppNotification({
        title,
        body,
        icon,
        link
    });
}

export default initNotification;