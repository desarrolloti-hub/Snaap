// src/services/userImageService.js
import { userService } from './userService.js';
import { storageService } from './storageService.js';
import { eventService } from './eventService.js';

class UserImageService {
    constructor() {
        this.currentUser = null;
    }

    getUser() {
        this.currentUser = userService.getCurrentUser();
        return this.currentUser;
    }

    // ============================================
    // 📤 SUBIR IMAGEN A STORAGE
    // ============================================
    async uploadImage(file, type, eventoId) {
        try {
            const user = this.getUser();
            if (!user) throw new Error('Usuario no autenticado');

            const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
            if (!allowedTypes.includes(file.type)) {
                throw new Error('Formato no soportado. Usa JPG, PNG, GIF o WebP');
            }

            if (file.size > 5 * 1024 * 1024) {
                throw new Error('La imagen debe ser menor a 5MB');
            }

            // 🔥 SUBIR A STORAGE (no Base64)
            const carpeta = `users/${user.uid}/images/${type}`;
            const result = await storageService.subirImagen(file, carpeta);

            if (!result.success) {
                throw new Error(result.error);
            }

            const imageData = {
                url: result.url,
                path: result.path,
                type: type,
                fileName: file.name,
                eventoId: eventoId,
                date: new Date().toISOString(),
                userId: user.uid,
                userName: user.username || user.email || 'Usuario'
            };

            const saveResult = await this.saveImageReference(imageData);
            if (!saveResult.success) {
                throw new Error(saveResult.error);
            }

            // 🔥 ACTUALIZAR CONTADOR DE FOTOS DEL EVENTO
            await this.updateEventPhotoCount(eventoId);

            return {
                success: true,
                image: imageData,
                message: `${type === 'photo' ? 'Foto' : 'Dibujo'} subido exitosamente`
            };

        } catch (error) {
            console.error('❌ Error al subir imagen:', error);
            return { success: false, error: error.message };
        }
    }

    // ============================================
    // 💾 GUARDAR REFERENCIA EN FIRESTORE
    // ============================================
    async saveImageReference(imageData) {
        try {
            const user = this.getUser();
            if (!user) throw new Error('Usuario no autenticado');

            const result = await userService.obtenerUsuarioPorUid(user.uid);
            if (!result.success) throw new Error(result.error);

            const userDoc = result.user;
            const images = userDoc.images || [];
            images.push(imageData);

            const updateResult = await userService.actualizarPerfil({
                images: images
            });

            if (!updateResult.success) throw new Error(updateResult.error);

            return { success: true, images: images };

        } catch (error) {
            console.error('❌ Error al guardar referencia:', error);
            return { success: false, error: error.message };
        }
    }

    // ============================================
    // 🔥 ACTUALIZAR CONTADOR DE FOTOS DEL EVENTO
    // ============================================
    async updateEventPhotoCount(eventoId) {
        try {
            const result = await this.getUserImages();
            if (!result.success) return;

            const eventImages = result.images.filter(img => img.eventoId === eventoId);
            const count = eventImages.length;

            await eventService.actualizarEvento(eventoId, {
                uploadedPhotos: count
            });

            console.log(`📊 Contador actualizado: ${count} fotos para evento ${eventoId}`);

        } catch (error) {
            console.error('❌ Error al actualizar contador:', error);
        }
    }

    // ============================================
    // 📋 OBTENER TODAS LAS IMÁGENES DEL USUARIO
    // ============================================
    async getUserImages() {
        try {
            const user = this.getUser();
            if (!user) throw new Error('Usuario no autenticado');

            const result = await userService.obtenerUsuarioPorUid(user.uid);
            if (!result.success) throw new Error(result.error);

            const userDoc = result.user;
            const images = userDoc.images || [];

            images.sort((a, b) => new Date(b.date) - new Date(a.date));

            return { success: true, images: images };

        } catch (error) {
            console.error('❌ Error al obtener imágenes del usuario:', error);
            return { success: false, error: error.message, images: [] };
        }
    }

    // ============================================
    // 📋 OBTENER IMÁGENES DE UN EVENTO
    // ============================================
    async getEventImages(eventoId) {
        try {
            const result = await this.getUserImages();
            if (!result.success) throw new Error(result.error);

            const images = result.images.filter(img => img.eventoId === eventoId);

            return { success: true, images: images };

        } catch (error) {
            console.error('❌ Error al obtener imágenes del evento:', error);
            return { success: false, error: error.message, images: [] };
        }
    }

    // ============================================
    // 🗑️ ELIMINAR IMAGEN
    // ============================================
    async deleteImage(index) {
        try {
            const user = this.getUser();
            if (!user) throw new Error('Usuario no autenticado');

            const result = await userService.obtenerUsuarioPorUid(user.uid);
            if (!result.success) throw new Error(result.error);

            const userDoc = result.user;
            const images = userDoc.images || [];

            if (index < 0 || index >= images.length) {
                throw new Error('Índice de imagen inválido');
            }

            const deletedImage = images[index];
            const eventoId = deletedImage.eventoId;

            // 🔥 ELIMINAR DE STORAGE
            if (deletedImage.path) {
                const deleteResult = await storageService.eliminarImagen(deletedImage.path);
                if (!deleteResult.success) {
                    console.warn('⚠️ No se pudo eliminar de Storage:', deleteResult.error);
                }
            }

            images.splice(index, 1);

            const updateResult = await userService.actualizarPerfil({
                images: images
            });

            if (!updateResult.success) throw new Error(updateResult.error);

            // 🔥 ACTUALIZAR CONTADOR DEL EVENTO
            if (eventoId) {
                await this.updateEventPhotoCount(eventoId);
            }

            return {
                success: true,
                images: images,
                message: 'Imagen eliminada exitosamente'
            };

        } catch (error) {
            console.error('❌ Error al eliminar imagen:', error);
            return { success: false, error: error.message };
        }
    }

    // ============================================
    // 🗑️ ELIMINAR TODAS LAS IMÁGENES DE UN EVENTO
    // ============================================
    async deleteEventImages(eventoId) {
        try {
            const result = await this.getEventImages(eventoId);
            if (!result.success) throw new Error(result.error);

            const images = result.images;

            for (const image of images) {
                if (image.path) {
                    await storageService.eliminarImagen(image.path);
                }
            }

            const user = this.getUser();
            if (!user) throw new Error('Usuario no autenticado');

            const userResult = await userService.obtenerUsuarioPorUid(user.uid);
            if (!userResult.success) throw new Error(userResult.error);

            const userDoc = userResult.user;
            const allImages = userDoc.images || [];
            const filteredImages = allImages.filter(img => img.eventoId !== eventoId);

            await userService.actualizarPerfil({
                images: filteredImages
            });

            await eventService.actualizarEvento(eventoId, {
                uploadedPhotos: 0
            });

            return {
                success: true,
                message: `Todas las imágenes del evento fueron eliminadas`
            };

        } catch (error) {
            console.error('❌ Error al eliminar imágenes del evento:', error);
            return { success: false, error: error.message };
        }
    }
}

export const userImageService = new UserImageService();