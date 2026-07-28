// src/services/simpleNotificationService.js

class SimpleNotificationService {
    constructor() {
        this.isSubscribed = false;
        this.permission = 'default';
        this.notifications = [];
    }

    // ============================================
    // 📱 SOLICITAR PERMISO
    // ============================================
    async requestPermission() {
        try {
            if (!('Notification' in window)) {
                return { success: false, error: 'Notificaciones no soportadas' };
            }

            const permission = await Notification.requestPermission();
            this.permission = permission;
            this.isSubscribed = permission === 'granted';

            return { 
                success: permission === 'granted', 
                permission: permission,
                message: permission === 'granted' ? 'Permiso concedido' : 'Permiso denegado'
            };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // ============================================
    // 💬 ENVIAR NOTIFICACIÓN
    // ============================================
    sendNotification(title, body, icon = '/assets/imagenes/Snaap.png', link = null) {
        try {
            if (this.permission !== 'granted') {
                console.warn('⚠️ Permiso no concedido');
                return false;
            }

            const notification = new Notification(title, {
                body: body,
                icon: icon,
                data: { link: link }
            });

            notification.onclick = () => {
                if (link) {
                    if (typeof window.navigateTo === 'function') {
                        window.navigateTo(link);
                    } else {
                        window.location.href = link;
                    }
                }
                notification.close();
            };

            // Guardar en historial
            this.notifications.push({
                title,
                body,
                icon,
                link,
                date: new Date().toISOString()
            });

            setTimeout(() => notification.close(), 5000);
            return true;

        } catch (error) {
            console.error('❌ Error al enviar notificación:', error);
            return false;
        }
    }

    // ============================================
    // 📋 OBTENER HISTORIAL
    // ============================================
    getHistory() {
        return this.notifications;
    }

    // ============================================
    // 📊 ESTADO
    // ============================================
    getStatus() {
        return {
            isSubscribed: this.isSubscribed,
            permission: this.permission,
            totalNotificaciones: this.notifications.length
        };
    }
}

export const simpleNotificationService = new SimpleNotificationService();