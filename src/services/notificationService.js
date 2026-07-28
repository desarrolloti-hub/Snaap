// src/services/notificationService.js
import { doc, setDoc, serverTimestamp, deleteDoc } from 'firebase/firestore';
import { getToken, onMessage, deleteToken } from 'firebase/messaging';
import { auth, db, messaging } from '../config/firebaseConfig.js';

class NotificationService {
    constructor() {
        this.usuarioActual = null;
        this.isSubscribed = false;
        this.token = null;
        // 🔥 TU VAPID KEY - COPIADA DE FIREBASE CONSOLE
        this.vapidKey = 'BDdFYK9tTU_ybSjUNwp4--1lgj7ay2VNTtvNaN';
    }

    setUsuarioActual(usuario) {
        this.usuarioActual = usuario;
    }

    // ============================================
    // 🔐 OBTENER USUARIO AUTENTICADO DE FIREBASE
    // ============================================
    getAuthUser() {
        // Primero intentar con el usuario actual del servicio
        if (this.usuarioActual && this.usuarioActual.uid) {
            return this.usuarioActual;
        }
        // Si no, usar el usuario de Firebase Auth
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
    // 📱 REGISTRAR NOTIFICACIONES PUSH
    // ============================================
    async registerPushNotifications() {
        try {
            console.log('🔔 Iniciando registro de notificaciones push...');

            // 🔥 1. OBTENER USUARIO AUTENTICADO DE FIREBASE
            const user = this.getAuthUser();
            
            if (!user) {
                console.error('❌ No hay usuario autenticado en Firebase Auth');
                console.log('ℹ️ Por favor, inicia sesión primero');
                
                // 🔥 SOLICITAR INICIO DE SESIÓN AUTOMÁTICO
                const shouldLogin = confirm('⚠️ No estás autenticado en Firebase. ¿Quieres ir a la página de inicio de sesión?');
                if (shouldLogin) {
                    if (typeof window.navigateTo === 'function') {
                        window.navigateTo('/login');
                    } else {
                        window.location.href = '/login';
                    }
                }
                return { success: false, error: 'Usuario no autenticado en Firebase' };
            }

            console.log('👤 Usuario autenticado en Firebase:', user.email);
            console.log('   📌 UID:', user.uid);

            // 2. Verificar soporte
            if (!('Notification' in window)) {
                return { success: false, error: 'Tu navegador no soporta notificaciones' };
            }

            // 3. Solicitar permiso
            const permission = await Notification.requestPermission();
            console.log('📊 Permiso:', permission);

            if (permission !== 'granted') {
                return { success: false, error: 'Permiso denegado' };
            }

            // 4. Registrar Service Worker
            if ('serviceWorker' in navigator) {
                try {
                    const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
                    console.log('✅ Service Worker registrado:', registration);
                } catch (swError) {
                    console.warn('⚠️ Error al registrar Service Worker:', swError);
                }
            }

            // 🔥 5. ESPERAR A QUE EL TOKEN DE AUTENTICACIÓN ESTÉ LISTO
            await new Promise(resolve => setTimeout(resolve, 1000));

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

                // 7. Guardar en Firestore
                await this.saveTokenToFirestore(user.uid, token);

                this.isSubscribed = true;
                
                // 🔥 8. Mostrar notificación de éxito
                this.showInAppNotification({
                    title: '🔔 Notificaciones activadas',
                    body: 'Recibirás notificaciones de SNAAP',
                    icon: '✅'
                });

                return { success: true, token: token, message: 'Notificaciones activadas correctamente' };

            } catch (tokenError) {
                console.error('❌ Error al obtener token:', tokenError);
                
                // 🔥 SI EL ERROR ES DE AUTENTICACIÓN, REINTENTAR
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
                                title: '🔔 Notificaciones activadas',
                                body: 'Recibirás notificaciones de SNAAP (reintento)',
                                icon: '✅'
                            });
                            
                            return { success: true, token: tokenRetry, message: 'Notificaciones activadas (reintento)' };
                        }
                    } catch (retryError) {
                        console.error('❌ Error en reintento:', retryError);
                    }
                }
                
                return { success: false, error: 'Error al obtener token: ' + tokenError.message };
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
    // 📥 ELIMINAR TOKEN DE FIRESTORE
    // ============================================
    async removeTokenFromFirestore(userUid, token) {
        try {
            if (!userUid || !token) return false;
            
            const tokenRef = doc(db, 'users', userUid, 'devices', token);
            await setDoc(tokenRef, { 
                active: false, 
                updatedAt: serverTimestamp() 
            }, { merge: true });
            
            console.log('✅ Token desactivado en Firestore');
            return true;
        } catch (error) {
            console.error('❌ Error al desactivar token:', error);
            return false;
        }
    }

    // ============================================
    // 🔄 ESCUCHAR NOTIFICACIONES EN PRIMER PLANO
    // ============================================
    listenForMessages(callback) {
        try {
            onMessage(messaging, (payload) => {
                console.log('📨 Notificación en primer plano:', payload);
                
                // Mostrar notificación en pantalla
                if (payload?.notification) {
                    const title = payload.notification.title || 'Snaap';
                    const body = payload.notification.body || 'Tienes una nueva notificación';
                    
                    // Mostrar notificación del sistema
                    if (Notification.permission === 'granted') {
                        new Notification(title, {
                            body: body,
                            icon: payload.notification.icon || '/assets/imagenes/Snaap.png',
                            data: payload.data || {}
                        });
                    }

                    // Mostrar en la UI (toast)
                    this.showInAppNotification({ 
                        title, 
                        body, 
                        icon: '📢', 
                        data: payload.data,
                        link: payload.data?.link || null
                    });
                }

                if (callback) callback(payload);
            });
            console.log('✅ Escuchando notificaciones en primer plano');
        } catch (error) {
            console.error('❌ Error al escuchar mensajes:', error);
        }
    }

    // ============================================
    // 💬 MOSTRAR NOTIFICACIÓN EN APP (Toast)
    // ============================================
    showInAppNotification({ title, body, icon = '📢', link = null, data = {} }) {
        // Buscar o crear contenedor
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

        // Auto-eliminar después de 5 segundos
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

            // Eliminar token de Firestore
            const user = this.getAuthUser();
            if (user && user.uid && this.token) {
                await this.removeTokenFromFirestore(user.uid, this.token);
            }

            // Eliminar token de FCM
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
            authUser: this.getAuthUser()
        };
    }
}

export const notificationService = new NotificationService();