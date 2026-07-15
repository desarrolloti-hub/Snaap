// src/repositories/notificationRepository.js
import { db } from '../config/firebaseConfig.js';
import {
    collection,
    doc,
    getDoc,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    limit,
    Timestamp,
    arrayUnion,
    arrayRemove
} from 'firebase/firestore';
import { Notification } from '../classes/notificationClass.js';

class NotificationRepository {
    constructor() {
        this.collectionName = 'notifications';
        this.collectionRef = collection(db, this.collectionName);
        this.tokensCollectionName = 'fcm_tokens';
        this.tokensCollectionRef = collection(db, this.tokensCollectionName);
    }

    // ============================================
    // 📥 OBTENER NOTIFICACIÓN POR ID
    // ============================================
    async getById(id) {
        try {
            const docRef = doc(this.collectionRef, id);
            const docSnap = await getDoc(docRef);
            if (!docSnap.exists()) return null;
            return Notification.fromFirestore(docSnap);
        } catch (error) {
            console.error('Error al obtener notificación:', error);
            throw error;
        }
    }

    // ============================================
    // 📥 OBTENER NOTIFICACIONES POR USUARIO
    // ============================================
    async getByUser(userId, limitCount = 50) {
        try {
            const q = query(
                this.collectionRef,
                where('recipients', 'array-contains', userId),
                orderBy('sentAt', 'desc'),
                limit(limitCount)
            );
            const snapshot = await getDocs(q);
            const notifications = [];
            snapshot.forEach(doc => {
                notifications.push(Notification.fromFirestore(doc));
            });
            return notifications;
        } catch (error) {
            console.error('Error al obtener notificaciones del usuario:', error);
            const fallbackQ = query(
                this.collectionRef,
                where('recipients', 'array-contains', userId)
            );
            const fallbackSnapshot = await getDocs(fallbackQ);
            const notifications = [];
            fallbackSnapshot.forEach(doc => {
                notifications.push(Notification.fromFirestore(doc));
            });
            return notifications.sort((a, b) => b.sentAt - a.sentAt);
        }
    }

    // ============================================
    // 📥 OBTENER NOTIFICACIONES NO LEÍDAS
    // ============================================
    async getUnreadByUser(userId) {
        try {
            const notifications = await this.getByUser(userId);
            return notifications.filter(n => !n.isReadBy(userId));
        } catch (error) {
            console.error('Error al obtener notificaciones no leídas:', error);
            return [];
        }
    }

    // ============================================
    // ➕ CREAR NOTIFICACIÓN
    // ============================================
    async create(notification) {
        try {
            const data = {
                ...notification.toFirestore(),
                createdAt: Timestamp.fromDate(new Date()),
                updatedAt: Timestamp.fromDate(new Date())
            };
            const docRef = await addDoc(this.collectionRef, data);
            return { id: docRef.id, ...notification, ...data };
        } catch (error) {
            console.error('Error al crear notificación:', error);
            throw error;
        }
    }

    // ============================================
    // ✏️ ACTUALIZAR NOTIFICACIÓN
    // ============================================
    async update(id, data) {
        try {
            const docRef = doc(this.collectionRef, id);
            await updateDoc(docRef, {
                ...data,
                updatedAt: Timestamp.fromDate(new Date())
            });
            return await this.getById(id);
        } catch (error) {
            console.error('Error al actualizar notificación:', error);
            throw error;
        }
    }

    // ============================================
    // 📌 MARCAR COMO LEÍDA
    // ============================================
    async markAsRead(id, userId) {
        try {
            const docRef = doc(this.collectionRef, id);
            await updateDoc(docRef, {
                readBy: arrayUnion(userId),
                updatedAt: Timestamp.fromDate(new Date())
            });
            return true;
        } catch (error) {
            console.error('Error al marcar como leída:', error);
            throw error;
        }
    }

    // ============================================
    // 📌 MARCAR TODAS COMO LEÍDAS
    // ============================================
    async markAllAsRead(userId) {
        try {
            const notifications = await this.getByUser(userId);
            const promises = notifications.map(n => this.markAsRead(n.id, userId));
            await Promise.all(promises);
            return true;
        } catch (error) {
            console.error('Error al marcar todas como leídas:', error);
            throw error;
        }
    }

    // ============================================
    // ❌ ELIMINAR NOTIFICACIÓN
    // ============================================
    async delete(id) {
        try {
            const docRef = doc(this.collectionRef, id);
            await deleteDoc(docRef);
            return true;
        } catch (error) {
            console.error('Error al eliminar notificación:', error);
            throw error;
        }
    }

    // ============================================
    // 📱 GESTIÓN DE TOKENS FCM
    // ============================================
    async saveToken(userId, token, deviceInfo = {}) {
        try {
            const q = query(
                this.tokensCollectionRef,
                where('userId', '==', userId),
                where('token', '==', token)
            );
            const snapshot = await getDocs(q);
            
            if (!snapshot.empty) {
                const docRef = doc(this.tokensCollectionRef, snapshot.docs[0].id);
                await updateDoc(docRef, {
                    ...deviceInfo,
                    lastUsed: Timestamp.fromDate(new Date()),
                    updatedAt: Timestamp.fromDate(new Date()),
                    isActive: true
                });
                return true;
            }

            await addDoc(this.tokensCollectionRef, {
                userId: userId,
                token: token,
                ...deviceInfo,
                createdAt: Timestamp.fromDate(new Date()),
                updatedAt: Timestamp.fromDate(new Date()),
                isActive: true
            });
            return true;
        } catch (error) {
            console.error('Error al guardar token:', error);
            throw error;
        }
    }

    async removeToken(token) {
        try {
            const q = query(
                this.tokensCollectionRef,
                where('token', '==', token)
            );
            const snapshot = await getDocs(q);
            const promises = snapshot.docs.map(doc => deleteDoc(doc.ref));
            await Promise.all(promises);
            return true;
        } catch (error) {
            console.error('Error al eliminar token:', error);
            throw error;
        }
    }

    async getTokensByUser(userId) {
        try {
            const q = query(
                this.tokensCollectionRef,
                where('userId', '==', userId),
                where('isActive', '==', true)
            );
            const snapshot = await getDocs(q);
            const tokens = [];
            snapshot.forEach(doc => {
                tokens.push({ id: doc.id, ...doc.data() });
            });
            return tokens;
        } catch (error) {
            console.error('Error al obtener tokens del usuario:', error);
            return [];
        }
    }

    async getAllActiveTokens() {
        try {
            const q = query(
                this.tokensCollectionRef,
                where('isActive', '==', true)
            );
            const snapshot = await getDocs(q);
            const tokens = [];
            snapshot.forEach(doc => {
                tokens.push({ id: doc.id, ...doc.data() });
            });
            return tokens;
        } catch (error) {
            console.error('Error al obtener todos los tokens:', error);
            return [];
        }
    }
}

export const notificationRepository = new NotificationRepository();