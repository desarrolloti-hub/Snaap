// src/services/userImageService.js
import { userService } from './userService.js';
import { storageService } from './storageService.js';

class UserImageService {
    constructor() {
        this.currentUser = null;
    }

    // ============================================
    // 🔍 OBTENER USUARIO ACTUAL
    // ============================================
    getUser() {
        this.currentUser = userService.getCurrentUser();
        return this.currentUser;
    }

    // ============================================
    // 📤 SUBIR IMAGEN
    // ============================================
    async uploadImage(file, type, eventoId) {
        try {
            const user = this.getUser();
            if (!user) {
                throw new Error('Usuario no autenticado');
            }

            const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
            if (!allowedTypes.includes(file.type)) {
                throw new Error('Formato no soportado. Usa JPG, PNG, GIF o WebP');
            }

            if (file.size > 5 * 1024 * 1024) {
                throw new Error('La imagen debe ser menor a 5MB');
            }

            const path = `users/${user.uid}/images/${type}/${Date.now()}_${file.name}`;
            const result = await storageService.subirImagen(file, path);

            if (!result.success) {
                throw new Error(result.error);
            }

            const imageData = {
                url: result.url,
                type: type,
                fileName: file.name,
                eventoId: eventoId,
                date: new Date().toISOString()
            };

            const saveResult = await this.saveImageReference(imageData);
            
            if (!saveResult.success) {
                throw new Error(saveResult.error);
            }

            return {
                success: true,
                image: imageData,
                message: `${type === 'photo' ? 'Foto' : 'Dibujo'} subido exitosamente`
            };

        } catch (error) {
            console.error('❌ Error al subir imagen:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // ============================================
    // 💾 GUARDAR REFERENCIA EN FIRESTORE
    // ============================================
    async saveImageReference(imageData) {
        try {
            const user = this.getUser();
            if (!user) {
                throw new Error('Usuario no autenticado');
            }

            const result = await userService.obtenerUsuarioPorUid(user.uid);
            if (!result.success) {
                throw new Error(result.error);
            }

            const userDoc = result.user;
            const images = userDoc.images || [];
            images.push(imageData);

            const updateResult = await userService.actualizarPerfil({
                images: images
            });

            if (!updateResult.success) {
                throw new Error(updateResult.error);
            }

            return {
                success: true,
                images: images
            };

        } catch (error) {
            console.error('❌ Error al guardar referencia:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // ============================================
    // 📋 OBTENER TODAS LAS IMÁGENES DEL USUARIO
    // ============================================
    async getUserImages() {
        try {
            const user = this.getUser();
            if (!user) {
                throw new Error('Usuario no autenticado');
            }

            const result = await userService.obtenerUsuarioPorUid(user.uid);
            if (!result.success) {
                throw new Error(result.error);
            }

            const userDoc = result.user;
            const images = userDoc.images || [];

            images.sort((a, b) => {
                return new Date(b.date) - new Date(a.date);
            });

            return {
                success: true,
                images: images
            };

        } catch (error) {
            console.error('❌ Error al obtener imágenes del usuario:', error);
            return {
                success: false,
                error: error.message,
                images: []
            };
        }
    }

    // ============================================
    // 📋 OBTENER IMÁGENES DE UN EVENTO
    // ============================================
    async getEventImages(eventoId) {
        try {
            const result = await this.getUserImages();
            if (!result.success) {
                throw new Error(result.error);
            }

            const images = result.images.filter(img => img.eventoId === eventoId);

            return {
                success: true,
                images: images
            };

        } catch (error) {
            console.error('❌ Error al obtener imágenes del evento:', error);
            return {
                success: false,
                error: error.message,
                images: []
            };
        }
    }

    // ============================================
    // 🗑️ ELIMINAR IMAGEN
    // ============================================
    async deleteImage(index) {
        try {
            const user = this.getUser();
            if (!user) {
                throw new Error('Usuario no autenticado');
            }

            const result = await userService.obtenerUsuarioPorUid(user.uid);
            if (!result.success) {
                throw new Error(result.error);
            }

            const userDoc = result.user;
            const images = userDoc.images || [];

            if (index < 0 || index >= images.length) {
                throw new Error('Índice de imagen inválido');
            }

            images.splice(index, 1);

            const updateResult = await userService.actualizarPerfil({
                images: images
            });

            if (!updateResult.success) {
                throw new Error(updateResult.error);
            }

            return {
                success: true,
                images: images,
                message: 'Imagen eliminada exitosamente'
            };

        } catch (error) {
            console.error('❌ Error al eliminar imagen:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
}

export const userImageService = new UserImageService();