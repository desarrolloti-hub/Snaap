// src/modules/shared/notificationButton/notificationButtonController.js
import { userService } from '../../../services/userService.js';
import { notificationService } from '../../../services/notificationService.js';

let isInitialized = false;

export async function initNotificationButton() {
    if (isInitialized) return;
    isInitialized = true;

    console.log('🔔 Inicializando botón de notificaciones');

    const container = document.getElementById('notificationButtonContainer');
    if (!container) {
        console.warn('⚠️ No se encontró #notificationButtonContainer');
        return;
    }

    // 🔥 Cargar HTML
    try {
        const response = await fetch('/modules/shared/notificationButton/notificationButton.html');
        if (!response.ok) throw new Error('Error al cargar el componente');
        const html = await response.text();
        container.innerHTML = html;

        // 🔥 Configurar eventos
        setupNotificationButton();

        // 🔥 Verificar estado inicial
        updateButtonState();

        console.log('✅ Botón de notificaciones inicializado');
    } catch (error) {
        console.error('❌ Error al cargar botón de notificaciones:', error);
    }
}

function setupNotificationButton() {
    const btn = document.getElementById('notificationBtn');
    if (!btn) return;

    btn.addEventListener('click', handleNotificationClick);
}

async function handleNotificationClick() {
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

    const btn = document.getElementById('notificationBtn');
    const statusText = document.getElementById('notificationStatus');
    const badge = document.getElementById('notificationBadge');

    // 🔥 Mostrar loading
    btn.disabled = true;
    btn.style.opacity = '0.6';

    try {
        notificationService.setUsuarioActual(user);
        
        // 🔥 Verificar si ya está suscrito
        if (notificationService.isSubscribed) {
            // Desuscribirse
            const result = await notificationService.unsubscribe();
            if (result.success) {
                updateButtonState();
                Swal.fire({
                    title: 'Notificaciones desactivadas',
                    text: 'Ya no recibirás notificaciones push',
                    icon: 'info',
                    confirmButtonText: 'OK'
                });
            }
        } else {
            // Suscribirse
            const result = await notificationService.subscribeToNotifications();
            
            if (result.success) {
                updateButtonState();
                Swal.fire({
                    title: '¡Notificaciones activadas!',
                    text: 'Recibirás notificaciones push de SNAAP',
                    icon: 'success',
                    confirmButtonText: 'OK'
                });
            } else {
                Swal.fire({
                    title: 'Error',
                    text: result.error || 'No se pudo activar las notificaciones',
                    icon: 'error',
                    confirmButtonText: 'OK'
                });
            }
        }
    } catch (error) {
        console.error('❌ Error:', error);
        Swal.fire({
            title: 'Error',
            text: error.message || 'Ocurrió un error',
            icon: 'error',
            confirmButtonText: 'OK'
        });
    }

    // 🔥 Restaurar botón
    btn.disabled = false;
    btn.style.opacity = '1';
}

function updateButtonState() {
    const btn = document.getElementById('notificationBtn');
    const statusText = document.getElementById('notificationStatus');
    const badge = document.getElementById('notificationBadge');

    if (!btn) return;

    const isSubscribed = notificationService.isSubscribed;

    if (isSubscribed) {
        btn.classList.add('active');
        btn.style.borderColor = '#00ff88';
        if (statusText) statusText.textContent = 'Notificaciones activas ✅';
    } else {
        btn.classList.remove('active');
        btn.style.borderColor = '#4db8ff';
        if (statusText) statusText.textContent = 'Activar notificaciones';
    }

    // 🔥 Cargar notificaciones no leídas
    loadUnreadCount();
}

async function loadUnreadCount() {
    const user = userService.getCurrentUser();
    if (!user) return;

    try {
        notificationService.setUsuarioActual(user);
        const result = await notificationService.getUserNotifications();
        
        if (result.success) {
            const unreadCount = result.unreadCount || 0;
            const badge = document.getElementById('notificationBadge');
            if (badge) {
                if (unreadCount > 0) {
                    badge.textContent = unreadCount > 99 ? '99+' : unreadCount;
                    badge.style.display = 'inline-block';
                } else {
                    badge.style.display = 'none';
                }
            }
        }
    } catch (error) {
        console.error('Error al cargar notificaciones no leídas:', error);
    }
}

// 🔥 Escuchar cambios de autenticación
document.addEventListener('auth:changed', () => {
    updateButtonState();
});

export default initNotificationButton;