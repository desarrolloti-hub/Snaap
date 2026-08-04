// src/services/eventImageService.js
import { eventImageRepository } from '../repositories/eventImageRepository.js';
import { userService } from './userService.js';
import { storageService } from './storageService.js';
import { eventService } from './eventService.js';

class EventImageService {
  constructor() {
    this.currentUser = null;
  }

  getUser() {
    const currentUser = userService.getCurrentUser();
    if (currentUser) {
      this.currentUser = currentUser;
      return this.currentUser;
    }

    if (typeof window !== 'undefined') {
      try {
        const storedGuest = localStorage.getItem('snaap_guest_user');
        if (storedGuest) {
          const parsedGuest = JSON.parse(storedGuest);
          if (parsedGuest?.uid) {
            this.currentUser = parsedGuest;
            return this.currentUser;
          }
        }
      } catch (error) {
        console.warn('⚠️ No se pudo leer el usuario invitado:', error);
      }

      const guestUser = {
        uid: `guest-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        email: `guest-${Date.now()}@snaap.local`,
        username: 'Invitado',
        role: 'user'
      };
      localStorage.setItem('snaap_guest_user', JSON.stringify(guestUser));
      this.currentUser = guestUser;
      return this.currentUser;
    }

    return null;
  }

  // ============================================
  // 📤 SUBIR IMAGEN AL EVENTO (ACTUALIZADO)
  // ============================================
  async uploadImage(file, type, eventoId, userName = null, deviceId = null) {
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

      const carpeta = `eventos/${eventoId}/users/${user.uid}/${type}`;
      const result = await storageService.subirImagen(file, carpeta);

      if (!result.success) {
        throw new Error(result.error);
      }

      const finalUserName = userName || 
                           localStorage.getItem('snaap_user_name') || 
                           user.username || 
                           user.email?.split('@')[0] || 
                           'Invitado';

      const finalDeviceId = deviceId || localStorage.getItem('snaap_device_id') || `device_${Date.now()}`;

      const imageData = {
        eventoId: eventoId,
        userId: user.uid,
        userName: finalUserName,
        deviceId: finalDeviceId,
        url: result.url,
        path: result.path,
        type: type,
        fileName: file.name,
        date: new Date().toISOString(),
        createdAt: new Date()
      };

      const saved = await eventImageRepository.create(imageData);

      await eventService.incrementEventPhotoCount(eventoId, 1);

      return {
        success: true,
        image: { id: saved.id, ...imageData },
        message: `${type === 'photo' ? 'Foto' : 'Dibujo'} subido exitosamente`
      };

    } catch (error) {
      console.error('❌ Error al subir imagen al evento:', error);
      return { success: false, error: error.message };
    }
  }

  // ============================================
  // 📋 OBTENER IMÁGENES DE UN EVENTO
  // ============================================
  async getEventImages(eventoId, userId = null) {
    try {
      const currentUser = this.getUser();
      const isHostOrAdmin = currentUser?.role === 'host' || currentUser?.role === 'sysadmin';
      const effectiveUserId = userId || currentUser?.uid || null;

      const images = isHostOrAdmin
        ? await eventImageRepository.getByEvent(eventoId)
        : await eventImageRepository.getByEventAndUser(eventoId, effectiveUserId);

      return { success: true, images };
    } catch (error) {
      console.error('❌ Error al obtener imágenes del evento:', error);
      return { success: false, error: error.message, images: [] };
    }
  }

  // ============================================
  // 📋 OBTENER IMÁGENES DE UN EVENTO POR USUARIO
  // ============================================
  async getUserEventImages(eventoId, userId) {
    try {
      const images = await eventImageRepository.getByEventAndUser(eventoId, userId);
      return { success: true, images };
    } catch (error) {
      console.error('❌ Error al obtener imágenes del usuario en el evento:', error);
      return { success: false, error: error.message, images: [] };
    }
  }

  // ============================================
  // 🗑️ ELIMINAR IMAGEN
  // ============================================
  async deleteImage(imageId, storagePath, eventoId) {
    try {
      const user = this.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      if (storagePath) {
        await storageService.eliminarImagen(storagePath);
      }

      await eventImageRepository.delete(imageId);

      await eventService.incrementEventPhotoCount(eventoId, -1);

      return { success: true, message: 'Imagen eliminada exitosamente' };
    } catch (error) {
      console.error('❌ Error al eliminar imagen:', error);
      return { success: false, error: error.message };
    }
  }

  // ============================================
  // 📊 OBTENER CONTADOR DE IMÁGENES DEL EVENTO
  // ============================================
  async getEventImageCount(eventoId) {
    try {
      const count = await eventImageRepository.countByEvent(eventoId);
      return { success: true, count };
    } catch (error) {
      console.error('❌ Error al contar imágenes:', error);
      return { success: false, error: error.message, count: 0 };
    }
  }

  // ============================================
  // 🔄 ESCUCHAR IMÁGENES EN TIEMPO REAL
  // ============================================
  listenToEventImages(eventoId, callback) {
    return eventImageRepository.listenToEventImages(eventoId, callback);
  }
}

export const eventImageService = new EventImageService();