// src/services/notificationService.js
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { getToken, onMessage, deleteToken } from 'firebase/messaging';
import { auth, db, messaging } from '../config/firebaseConfig.js';

class NotificationService {
    constructor() {
        this.usuarioActual = null;
        this.isSubscribed = false;
        this.token = null;
        // 🔥 VAPID KEY CORRECTA
        this.vapidKey = 'BDdFYK9tTU_ybSjUNwp4--1lgj7ay2VNTtvaNreAZpwfYUF0lJ_HV25-iZUYMDGA3t7VpGgFTlPaWKKVRK7QabM';
        this.isProduction = window.location.hostname !== 'localhost';
    }

    setUsuarioActual(usuario) {
        this.usuarioActual = usuario;
    }

    // ============================================
    // 🔐 OBTENER USUARIO AUTENTICADO DE FIREBASE
    // ============================================
    getAuthUser() {
        if (this.usuarioActual && this.usuarioActual.uid) {
            return this.usuarioActual;
        }
        const firebaseUser = auth.currentUser;
        if (firebaseUser) {
            return {
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                displayName: firebaseUser.displayName
            };
        }
        return null;
    }

    // ============================================
    // 📱 REGISTRAR NOTIFICACIONES FCM
    // ============================================
    async registerPushNotifications() {
        try {
            console.log('🔔 Iniciando registro de notificaciones FCM...');
            console.log(`📍 Entorno: ${this.isProduction ? 'PRODUCCIÓN' : 'LOCAL'}`);

            // 🔥 ADVERTENCIA EN LOCAL
            if (!this.isProduction) {
                console.warn('⚠️ FCM NO funciona en local (HTTP). Usa HTTPS.');
                console.log('💡 Despliega a producción y prueba en: https://snaap-mx.web.app');
                return { 
                    success: false, 
                    error: 'FCM solo funciona en HTTPS. Despliega a producción.' 
                };
            }

            // 1. OBTENER USUARIO
            const user = this.getAuthUser();
            if (!user) {
                console.error('❌ No hay usuario autenticado en Firebase Auth');
                return { success: false, error: 'Usuario no autenticado' };
            }

            console.log('👤 Usuario autenticado:', user.email);
            console.log('📌 UID:', user.uid);

            // 2. VERIFICAR SOPORTE
            if (!('Notification' in window)) {
                return { success: false, error: 'Tu navegador no soporta notificaciones' };
            }

            // 3. SOLICITAR PERMISO
            const permission = await Notification.requestPermission();
            console.log('📊 Permiso:', permission);

            if (permission !== 'granted') {
                return { success: false, error: 'Permiso denegado' };
            }

            // 4. REGISTRAR SERVICE WORKER
            if ('serviceWorker' in navigator) {
                try {
                    await navigator.serviceWorker.register('/firebase-messaging-sw.js');
                    console.log('✅ Service Worker registrado');
                } catch (swError) {
                    console.warn('⚠️ Error al registrar Service Worker:', swError);
                }
            }

            // 🔥 5. ESPERAR A QUE EL TOKEN DE AUTENTICACIÓN ESTÉ LISTO
            await new Promise(resolve => setTimeout(resolve, 1500));

            // 🔥 6. OBTENER TOKEN FCM
            try {
                console.log('📱 Solicitando token FCM...');
                const token = await getToken(messaging, { 
                    vapidKey: this.vapidKey 
                });
                
                if (!token) {
                    return { success: false, error: 'No se pudo obtener el token' };
                }

                console.log('✅ Token FCM obtenido:', token.substring(0, 30) + '...');
                this.token = token;

                // 7. GUARDAR EN FIRESTORE
                await this.saveTokenToFirestore(user.uid, token);

                this.isSubscribed = true;
                
                // 8. Mostrar notificación de éxito
                this.showInAppNotification({
                    title: '🔔 Notificaciones FCM activadas',
                    body: 'Recibirás notificaciones incluso con la página cerrada',
                    icon: '✅'
                });

                return { success: true, token: token, message: 'Notificaciones FCM activadas correctamente' };

            } catch (tokenError) {
                console.error('❌ Error al obtener token FCM:', tokenError);
                
                // Si falla por autenticación, reintentar
                if (tokenError.code === 'messaging/token-subscribe-failed') {
                    console.log('🔄 Reintentando (2)...');
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    
                    try {
                        const tokenRetry = await getToken(messaging, { 
                            vapidKey: this.vapidKey 
                        });
                        if (tokenRetry) {
                            this.token = tokenRetry;
                            await this.saveTokenToFirestore(user.uid, tokenRetry);
                            this.isSubscribed = true;
                            
                            this.showInAppNotification({
                                title: '🔔 Notificaciones FCM activadas',
                                body: 'Recibirás notificaciones de SNAAP',
                                icon: '✅'
                            });
                            
                            return { success: true, token: tokenRetry, message: 'Notificaciones FCM activadas' };
                        }
                    } catch (retryError) {
                        console.error('❌ Error en reintento:', retryError);
                    }
                }
                
                return { success: false, error: 'Error al obtener token FCM: ' + tokenError.message };
            }

        } catch (error) {
            console.error('❌ Error general:', error);
            return { success: false, error: error.message || 'Error al suscribirse' };
        }
    }

    // ============================================
    // 💾 GUARDAR TOKEN EN FIRESTORE
    // ============================================
    async saveTokenToFirestore(userUid, token) {
        try {
            if (!userUid) throw new Error('Usuario no autenticado');
            if (!token) throw new Error('Token no proporcionado');

            const tokenRef = doc(db, 'users', userUid, 'devices', token);
            await setDoc(tokenRef, {
                token: token,
                active: true,
                platform: 'web',
                userAgent: navigator.userAgent || 'unknown',
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            }, { merge: true });

            console.log('✅ Token guardado en Firestore');
            return true;
        } catch (error) {
            console.error('❌ Error al guardar token:', error);
            return false;
        }
    }

    // ============================================
    // 📤 ENVIAR NOTIFICACIÓN PUSH NATIVA (FCM + TOAST + FIRESTORE)
    // ============================================
    async sendPushNotification({ title, body, icon, link, recipients = [] }) {
        try {
            console.log(`📤 Enviando notificación push: "${title}"`);

            // 1. Mostrar notificación nativa (FCM)
            if (Notification.permission === 'granted') {
                const notification = new Notification(title, {
                    body: body,
                    icon: icon || '/assets/imagenes/Snaap.png',
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

                setTimeout(() => notification.close(), 8000);
            }

            // 2. Mostrar toast en la UI
            this.showInAppNotification({
                title: title,
                body: body,
                icon: icon || '📢',
                link: link
            });

            // 3. Guardar en Firestore (historial)
            if (recipients.length > 0) {
                await this.saveNotificationToFirestore({
                    title,
                    message: body,
                    type: 'evento',
                    priority: 'high',
                    icon: icon || '📢',
                    link: link,
                    recipients: recipients
                });
            }

            console.log('✅ Notificación push enviada correctamente');
            return { success: true };

        } catch (error) {
            console.error('❌ Error al enviar notificación push:', error);
            return { success: false, error: error.message };
        }
    }

    // ============================================
    // 💾 GUARDAR NOTIFICACIÓN EN FIRESTORE (HISTORIAL)
    // ============================================
    async saveNotificationToFirestore({ title, message, type, priority, icon, link, recipients }) {
        try {
            const { notificationRepository } = await import('../repositories/notificationRepository.js');
            const { Notification } = await import('../classes/notificationClass.js');

            const notification = new Notification({
                title: title,
                message: message,
                type: type || 'general',
                priority: priority || 'normal',
                icon: icon || '📢',
                link: link || null,
                recipients: recipients || [],
                sentAt: new Date(),
                status: 'sent'
            });

            await notificationRepository.create(notification);
            console.log('✅ Notificación guardada en Firestore');
            return true;
        } catch (error) {
            console.error('❌ Error al guardar notificación en Firestore:', error);
            return false;
        }
    }

    // ============================================
    // 🔄 ESCUCHAR NOTIFICACIONES EN PRIMER PLANO
    // ============================================
    listenForMessages(callback) {
        try {
            onMessage(messaging, (payload) => {
                console.log('📨 Notificación FCM en primer plano:', payload);
                
                if (payload?.notification) {
                    const title = payload.notification.title || 'Snaap';
                    const body = payload.notification.body || 'Tienes una nueva notificación';
                    
                    if (Notification.permission === 'granted') {
                        new Notification(title, {
                            body: body,
                            icon: payload.notification.icon || '/assets/imagenes/Snaap.png',
                            data: payload.data || {}
                        });
                    }

                    this.showInAppNotification({ 
                        title, 
                        body, 
                        icon: '📢',
                        link: payload.data?.link || null
                    });
                }

                if (callback) callback(payload);
            });
            console.log('✅ Escuchando notificaciones FCM en primer plano');
        } catch (error) {
            console.error('❌ Error al escuchar mensajes:', error);
        }
    }

    // ============================================
    // 💬 MOSTRAR NOTIFICACIÓN EN APP (Toast)
    // ============================================
    showInAppNotification({ title, body, icon = '📢', link = null }) {
        let container = document.getElementById('notificationContainer');
        if (!container) {
            container = document.createElement('div');
            container.id = 'notificationContainer';
            container.style.cssText = `
                position: fixed;
                top: 80px;
                right: 20px;
                z-index: 100000;
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
            color: white;
        `;

        const iconEl = document.createElement('div');
        iconEl.style.cssText = `font-size: 1.5rem; flex-shrink: 0;`;
        iconEl.textContent = icon;

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
        closeBtn.innerHTML = '×';
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
            if (link) {
                if (typeof window.navigateTo === 'function') {
                    window.navigateTo(link);
                } else {
                    window.location.href = link;
                }
            }
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
    }

    // ============================================
    // 🚫 DESUSCRIBIRSE
    // ============================================
    async unsubscribe() {
        try {
            if (!this.isSubscribed) {
                return { success: true, message: 'Ya estás desuscrito' };
            }

            const user = this.getAuthUser();
            if (user && user.uid && this.token) {
                const tokenRef = doc(db, 'users', user.uid, 'devices', this.token);
                await setDoc(tokenRef, { 
                    active: false, 
                    updatedAt: serverTimestamp() 
                }, { merge: true });
            }

            if (this.token) {
                try {
                    await deleteToken(messaging);
                } catch (e) {
                    console.warn('⚠️ Error al eliminar token FCM:', e);
                }
            }

            this.isSubscribed = false;
            this.token = null;
            console.log('✅ Desuscrito correctamente');

            return { success: true, message: 'Notificaciones desactivadas' };

        } catch (error) {
            console.error('❌ Error al desuscribirse:', error);
            return { success: false, error: error.message };
        }
    }

    // ============================================
    // 📊 ESTADO DE SUSCRIPCIÓN
    // ============================================
    getSubscriptionStatus() {
        return {
            isSubscribed: this.isSubscribed,
            token: this.token || 'No disponible',
            usuario: this.getAuthUser()?.email || 'No autenticado',
            authUser: this.getAuthUser(),
            isProduction: this.isProduction
        };
    }
}

export const notificationService = new NotificationService();