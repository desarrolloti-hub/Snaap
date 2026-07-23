// src/services/notificationService.js
import { notificationRepository } from '../repositories/notificationRepository.js';

class NotificationService {
    constructor() {
        this.usuarioActual = null;
        this.isSubscribed = false;
        this.token = null;
    }

    setUsuarioActual(usuario) {
        this.usuarioActual = usuario;
    }

    // ============================================
    // ðŸ“± SUSCRIBIRSE A NOTIFICACIONES (MODO SIMPLE)
    // ============================================
    async subscribeToNotifications() {
        try {
            console.log('ðŸ”” Iniciando suscripciÃ³n (modo simple)...');

            if (!this.usuarioActual) {
                return { success: false, error: 'Usuario no autenticado' };
            }

            // ðŸ”¥ VERIFICAR QUE ESTAMOS EN EL NAVEGADOR
            if (typeof window === 'undefined') {
                return { success: false, error: 'No estÃ¡s en un navegador' };
            }

            // ðŸ”¥ VERIFICAR QUE NOTIFICATION EXISTE
            if (!window.Notification) {
                console.warn('âš ï¸ window.Notification no existe');
                return { 
                    success: false, 
                    error: 'Tu navegador no soporta notificaciones. Usa Chrome o Firefox.' 
                };
            }

            console.log('âœ… window.Notification existe');

            // ðŸ”¥ SOLICITAR PERMISO
            let permission = 'denied';
            try {
                permission = await window.Notification.requestPermission();
                console.log('ðŸ“Š Permiso obtenido:', permission);
            } catch (permError) {
                console.error('âŒ Error al solicitar permiso:', permError);
                return { 
                    success: false, 
                    error: 'Error al solicitar permiso: ' + permError.message 
                };
            }

            if (permission !== 'granted') {
                console.warn('âš ï¸ Permiso denegado:', permission);
                return { 
                    success: false, 
                    error: 'Permiso denegado. Acepta los permisos en tu navegador.' 
                };
            }

            console.log('âœ… Permiso concedido');

            // ðŸ”¥ GUARDAR EN FIRESTORE (para mantener registro)
            try {
                await notificationRepository.saveToken(
                    this.usuarioActual.uid,
                    'simple_mode_' + Date.now(),
                    {
                        device: navigator.userAgent || 'Unknown',
                        platform: 'web',
                        browser: this.getBrowserInfo(),
                        timestamp: new Date().toISOString(),
                        type: 'simple_notification'
                    }
                );
                console.log('âœ… Registro guardado en Firestore');
            } catch (saveError) {
                console.error('âŒ Error al guardar:', saveError);
            }

            this.isSubscribed = true;
            console.log('âœ… Suscrito a notificaciones (modo simple)');

            return { 
                success: true, 
                message: 'Notificaciones activadas correctamente (modo simple)'
            };

        } catch (error) {
            console.error('âŒ Error general:', error);
            return { 
                success: false, 
                error: error.message || 'Error al suscribirse' 
            };
        }
    }

    // ============================================
    // ðŸ’¬ MOSTRAR NOTIFICACIÃ“N
    // ============================================
    showNotification({ title, body, icon, link }) {
        try {
            // ðŸ”¥ USAR NOTIFICACIÃ“N DEL SISTEMA
            if (window.Notification && window.Notification.permission === 'granted') {
                const notification = new window.Notification(title, {
                    body: body,
                    icon: icon || '/assets/images/Snaap.png',
                    data: { link: link }
                });

                notification.onclick = () => {
                    if (link) {
                        if (typeof window.navigateTo === 'function') window.navigateTo(link); else window.go(link);
                    }
                    notification.close();
                };

                setTimeout(() => notification.close(), 5000);
                return;
            }

            // ðŸ”¥ FALLBACK: NOTIFICACIÃ“N EN LA UI
            let container = document.getElementById('notificationContainer');
            if (!container) {
                container = document.createElement('div');
                container.id = 'notificationContainer';
                container.style.cssText = `
                    position: fixed;
                    top: 80px;
                    right: 20px;
                    z-index: 10000;
                    max-width: 380px;
                    width: 100%;
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                    pointer-events: none;
                `;
                document.body.appendChild(container);
            }

            const notificationEl = document.createElement('div');
            notificationEl.style.cssText = `
                background: rgba(10, 10, 20, 0.95);
                backdrop-filter: blur(20px);
                border: 1px solid rgba(77, 184, 255, 0.3);
                border-radius: 12px;
                padding: 15px 20px;
                display: flex;
                align-items: flex-start;
                gap: 12px;
                cursor: pointer;
                animation: slideInRight 0.3s ease;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
                pointer-events: auto;
                max-width: 380px;
            `;

            const iconEl = document.createElement('div');
            iconEl.style.cssText = `font-size: 1.5rem; flex-shrink: 0;`;
            iconEl.textContent = icon || 'ðŸ“¢';

            const contentEl = document.createElement('div');
            contentEl.style.cssText = `flex: 1; min-width: 0;`;

            const titleEl = document.createElement('h4');
            titleEl.style.cssText = `
                color: #4db8ff;
                font-size: 0.95rem;
                margin: 0 0 4px 0;
                font-weight: 600;
            `;
            titleEl.textContent = title;

            const bodyEl = document.createElement('p');
            bodyEl.style.cssText = `
                color: rgba(255, 255, 255, 0.8);
                font-size: 0.85rem;
                margin: 0;
                word-wrap: break-word;
            `;
            bodyEl.textContent = body;

            const closeBtn = document.createElement('button');
            closeBtn.style.cssText = `
                background: transparent;
                border: none;
                color: rgba(255, 255, 255, 0.3);
                cursor: pointer;
                font-size: 1.2rem;
                flex-shrink: 0;
                padding: 0 0 0 10px;
            `;
            closeBtn.innerHTML = 'Ã—';
            closeBtn.onclick = (e) => {
                e.stopPropagation();
                notificationEl.style.opacity = '0';
                notificationEl.style.transform = 'translateX(100px)';
                setTimeout(() => notificationEl.remove(), 300);
            };

            contentEl.appendChild(titleEl);
            contentEl.appendChild(bodyEl);
            notificationEl.appendChild(iconEl);
            notificationEl.appendChild(contentEl);
            notificationEl.appendChild(closeBtn);

            notificationEl.onclick = () => {
                if (link) { if (typeof window.navigateTo === 'function') window.navigateTo(link); else window.go(link); }
                notificationEl.remove();
            };

            container.appendChild(notificationEl);

            setTimeout(() => {
                if (notificationEl.parentNode) {
                    notificationEl.style.opacity = '0';
                    notificationEl.style.transform = 'translateX(100px)';
                    setTimeout(() => notificationEl.remove(), 300);
                }
            }, 5000);

        } catch (error) {
            console.error('âŒ Error al mostrar notificaciÃ³n:', error);
        }
    }

    // ============================================
    // ðŸ“¥ OBTENER NOTIFICACIONES DEL USUARIO
    // ============================================
    async getUserNotifications() {
        try {
            if (!this.usuarioActual) {
                throw new Error('Usuario no autenticado');
            }

            const notifications = await notificationRepository.getByUser(this.usuarioActual.uid);
            
            return {
                success: true,
                notifications: notifications,
                unreadCount: notifications.filter(n => !n.isReadBy(this.usuarioActual.uid)).length
            };
        } catch (error) {
            console.error('Error al obtener notificaciones:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // ============================================
    // ðŸ“Œ MARCAR COMO LEÃDA
    // ============================================
    async markAsRead(notificationId) {
        try {
            if (!this.usuarioActual) {
                throw new Error('Usuario no autenticado');
            }

            await notificationRepository.markAsRead(notificationId, this.usuarioActual.uid);
            
            return {
                success: true,
                message: 'NotificaciÃ³n marcada como leÃ­da'
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    // ============================================
    // ðŸ“Œ MARCAR TODAS COMO LEÃDAS
    // ============================================
    async markAllAsRead() {
        try {
            if (!this.usuarioActual) {
                throw new Error('Usuario no autenticado');
            }

            await notificationRepository.markAllAsRead(this.usuarioActual.uid);
            
            return {
                success: true,
                message: 'Todas las notificaciones marcadas como leÃ­das'
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    // ============================================
    // ðŸ› ï¸ UTILIDADES
    // ============================================
    getBrowserInfo() {
        try {
            const ua = navigator.userAgent;
            if (ua.includes('Chrome')) return 'Chrome';
            if (ua.includes('Firefox')) return 'Firefox';
            if (ua.includes('Safari')) return 'Safari';
            if (ua.includes('Edge')) return 'Edge';
            if (ua.includes('Opera')) return 'Opera';
            return 'Unknown';
        } catch {
            return 'Unknown';
        }
    }

    // ============================================
    // ðŸ”„ DESSUSCRIBIRSE
    // ============================================
    async unsubscribe() {
        try {
            if (!this.isSubscribed) {
                return { success: true, message: 'Ya estÃ¡s desuscrito' };
            }

            this.isSubscribed = false;
            console.log('âœ… Desuscrito');

            return { success: true, message: 'Desuscrito correctamente' };

        } catch (error) {
            console.error('âŒ Error al desuscribirse:', error);
            return { success: false, error: error.message };
        }
    }

    // ============================================
    // ðŸ“Š OBTENER ESTADO DE SUSCRIPCIÃ“N
    // ============================================
    getSubscriptionStatus() {
        return {
            isSubscribed: this.isSubscribed,
            usuario: this.usuarioActual?.email || 'No autenticado',
            token: this.token || 'No disponible'
        };
    }
}

export const notificationService = new NotificationService();
