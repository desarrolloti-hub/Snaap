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

    try {
        const response = await fetch('/modules/shared/notificationButton/notificationButton.html');
        if (!response.ok) throw new Error('Error al cargar el componente');
        const html = await response.text();
        container.innerHTML = html;

        setupNotificationButton();
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
        await Swal.fire({
            title: 'Inicia sesión',
            text: 'Debes iniciar sesión para activar las notificaciones',
            icon: 'warning',
            confirmButtonText: 'Entendido'
        });
        return;
    }

    // 🔥 VERIFICAR SI ESTÁ EN PRODUCCIÓN
    if (window.location.hostname === 'localhost') {
        await Swal.fire({
            title: '⚠️ HTTPS requerido',
            text: 'Las notificaciones FCM solo funcionan en producción (HTTPS).\n\nDespliega a: https://snaap-mx.web.app',
            icon: 'warning',
            confirmButtonText: 'Entendido'
        });
        return;
    }

    const btn = document.getElementById('notificationBtn');
    const statusText = document.getElementById('notificationStatus');

    // 🔥 Mostrar loading
    btn.disabled = true;
    btn.style.opacity = '0.6';

    try {
        notificationService.setUsuarioActual(user);

        // 🔥 VERIFICAR SI YA ESTÁ SUSCRITO
        if (notificationService.isSubscribed) {
            // Desuscribirse
            const result = await notificationService.unsubscribe();
            if (result.success) {
                updateButtonState();
                await Swal.fire({
                    title: 'Notificaciones desactivadas',
                    text: 'Ya no recibirás notificaciones push',
                    icon: 'info',
                    confirmButtonText: 'OK'
                });
            }
        } else {
            // 🔥 MOSTRAR SWEETALERT DE PERMISO
            const result = await Swal.fire({
                title: '🔔 Activar notificaciones',
                html: `
                    <div style="text-align: center;">
                        <p style="font-size: 1.1rem; margin-bottom: 10px;">
                            ¿Quieres recibir notificaciones de SNAAP?
                        </p>
                        <p style="color: rgba(255,255,255,0.5); font-size: 0.85rem;">
                            Te mantendremos informado sobre eventos, fotos y novedades.
                        </p>
                        <div style="margin-top: 15px; display: flex; gap: 10px; justify-content: center;">
                            <span style="background: rgba(77,184,255,0.15); padding: 4px 12px; border-radius: 20px; font-size: 0.75rem; color: #4db8ff;">
                                <i class="fas fa-bell"></i> Notificaciones push
                            </span>
                            <span style="background: rgba(0,255,136,0.15); padding: 4px 12px; border-radius: 20px; font-size: 0.75rem; color: #00ff88;">
                                <i class="fas fa-check-circle"></i> En tiempo real
                            </span>
                        </div>
                    </div>
                `,
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: '✅ Sí, activar',
                cancelButtonText: '❌ No, gracias',
                confirmButtonColor: '#4db8ff',
                cancelButtonColor: '#ff007a'
            });

            if (!result.isConfirmed) {
                btn.disabled = false;
                btn.style.opacity = '1';
                return;
            }

            // 🔥 REGISTRAR NOTIFICACIONES
            const registerResult = await notificationService.registerPushNotifications();

            if (registerResult.success) {
                updateButtonState();
                await Swal.fire({
                    title: '✅ ¡Notificaciones activadas!',
                    html: `
                        <div style="text-align: center;">
                            <i class="fas fa-check-circle" style="color: #00ff88; font-size: 3rem; margin-bottom: 10px;"></i>
                            <p style="font-size: 1.1rem; margin: 5px 0;">
                                Recibirás notificaciones de SNAAP
                            </p>
                            <p style="color: rgba(255,255,255,0.4); font-size: 0.8rem;">
                                Incluso con la página cerrada 🚀
                            </p>
                        </div>
                    `,
                    icon: 'success',
                    confirmButtonText: 'OK'
                });
            } else {
                await Swal.fire({
                    title: 'Error',
                    text: registerResult.error || 'No se pudo activar las notificaciones',
                    icon: 'error',
                    confirmButtonText: 'Entendido'
                });
            }
        }
    } catch (error) {
        console.error('❌ Error:', error);
        await Swal.fire({
            title: 'Error',
            text: error.message || 'Ocurrió un error',
            icon: 'error',
            confirmButtonText: 'Entendido'
        });
    }

    // 🔥 Restaurar botón
    btn.disabled = false;
    btn.style.opacity = '1';
}

function updateButtonState() {
    const btn = document.getElementById('notificationBtn');
    const statusText = document.getElementById('notificationStatus');

    if (!btn) return;

    const isSubscribed = notificationService.isSubscribed;

    if (isSubscribed) {
        btn.classList.add('active');
        btn.style.borderColor = '#00ff88';
        btn.style.color = '#00ff88';
        if (statusText) statusText.textContent = '✅ Notificaciones activas';
    } else {
        btn.classList.remove('active');
        btn.style.borderColor = '#4db8ff';
        btn.style.color = '#ffffff';
        if (statusText) statusText.textContent = '🔔 Activar notificaciones';
    }
}

document.addEventListener('auth:changed', () => {
    updateButtonState();
});

export default initNotificationButton;