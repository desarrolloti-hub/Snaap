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
  // 📤 SUBIR IMAGEN AL EVENTO
  // ============================================
  async uploadImage(file, type, eventoId, userName = null, deviceId = null) {
    try {
      const user = this.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      // Validar archivo
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        throw new Error('Formato no soportado. Usa JPG, PNG, GIF o WebP');
      }

      if (file.size > 5 * 1024 * 1024) {
        throw new Error('La imagen debe ser menor a 5MB');
      }

      // 🔥 SUBIR A STORAGE
      const carpeta = `eventos/${eventoId}/users/${user.uid}/${type}`;
      const result = await storageService.subirImagen(file, carpeta);

      if (!result.success) {
        throw new Error(result.error);
      }

      // 🔥 DETERMINAR NOMBRE DE USUARIO
      // Prioridad: parámetro > localStorage > usuario autenticado > invitado
      const finalUserName = userName || 
                           localStorage.getItem('snaap_user_name') || 
                           user.username || 
                           user.email?.split('@')[0] || 
                           'Invitado';

      const finalDeviceId = deviceId || localStorage.getItem('snaap_device_id') || `device_${Date.now()}`;

      // 🔥 GUARDAR METADATA EN FIRESTORE
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

      // 🔥 ACTUALIZAR CONTADOR DEL EVENTO (+1)
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
      // 🔥 VERIFICAR SI ES HOST O ADMIN
      const isHostOrAdmin = currentUser?.role === 'host' || currentUser?.role === 'sysadmin';
      
      // 🔥 SI ES HOST O ADMIN, OBTENER TODAS LAS IMÁGENES DEL EVENTO
      // 🔥 SI ES USUARIO NORMAL, OBTENER SOLO LAS SUYAS
      const effectiveUserId = userId || currentUser?.uid || null;

      let images;
      if (isHostOrAdmin) {
        // Host/Admin: Ver todas las imágenes del evento (incluye invitados)
        images = await eventImageRepository.getByEvent(eventoId);
        console.log(`📋 Host/Admin: ${images.length} imágenes del evento ${eventoId}`);
      } else {
        // Usuario normal: Ver solo sus imágenes
        images = await eventImageRepository.getByEventAndUser(eventoId, effectiveUserId);
        console.log(`📋 Usuario: ${images.length} imágenes propias en evento ${eventoId}`);
      }

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
  // 📋 OBTENER IMÁGENES DE UN EVENTO POR DISPOSITIVO
  // ============================================
  async getDeviceEventImages(eventoId, deviceId) {
    try {
      const images = await eventImageRepository.getByEventAndDevice(eventoId, deviceId);
      return { success: true, images };
    } catch (error) {
      console.error('❌ Error al obtener imágenes por dispositivo:', error);
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

      // 🔥 VERIFICAR PERMISOS
      const isHostOrAdmin = user?.role === 'host' || user?.role === 'sysadmin';
      
      // Obtener la imagen para verificar propiedad
      const image = await eventImageRepository.getById(imageId);
      if (!image) {
        throw new Error('Imagen no encontrada');
      }

      // Solo el dueño de la imagen o un host/admin pueden eliminarla
      if (!isHostOrAdmin && image.userId !== user.uid) {
        throw new Error('No tienes permiso para eliminar esta imagen');
      }

      // 🔥 ELIMINAR DE STORAGE
      if (storagePath) {
        await storageService.eliminarImagen(storagePath);
      }

      // 🔥 ELIMINAR DE FIRESTORE
      await eventImageRepository.delete(imageId);

      // 🔥 ACTUALIZAR CONTADOR DEL EVENTO (-1)
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
  // 📊 OBTENER ESTADÍSTICAS DE IMÁGENES POR EVENTO
  // ============================================
  async getEventImageStats(eventoId) {
    try {
      const images = await eventImageRepository.getByEvent(eventoId);
      
      const total = images.length;
      const photos = images.filter(img => img.type === 'photo').length;
      const drawings = images.filter(img => img.type === 'drawing').length;
      
      // Usuarios únicos (por userName o userId)
      const uniqueUsers = new Set();
      images.forEach(img => {
        if (img.userName) {
          uniqueUsers.add(img.userName);
        } else if (img.userId) {
          uniqueUsers.add(img.userId);
        }
      });

      return {
        success: true,
        stats: {
          total,
          photos,
          drawings,
          uniqueUsers: uniqueUsers.size
        }
      };
    } catch (error) {
      console.error('❌ Error al obtener estadísticas:', error);
      return { success: false, error: error.message };
    }
  }

  // ============================================
  // 🔄 ESCUCHAR IMÁGENES EN TIEMPO REAL
  // ============================================
  listenToEventImages(eventoId, callback) {
    return eventImageRepository.listenToEventImages(eventoId, callback);
  }

  // ============================================
  // 🔄 ESCUCHAR IMÁGENES POR USUARIO EN TIEMPO REAL
  // ============================================
  listenToUserEventImages(eventoId, userId, callback) {
    return eventImageRepository.listenToUserEventImages(eventoId, userId, callback);
  }

  // ============================================
  // 🗑️ ELIMINAR TODAS LAS IMÁGENES DE UN EVENTO
  // ============================================
  async deleteAllEventImages(eventoId) {
    try {
      const user = this.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      const isHostOrAdmin = user?.role === 'host' || user?.role === 'sysadmin';
      if (!isHostOrAdmin) {
        throw new Error('No tienes permiso para eliminar todas las imágenes');
      }

      const images = await eventImageRepository.getByEvent(eventoId);
      
      // Eliminar de Storage
      for (const image of images) {
        if (image.path) {
          await storageService.eliminarImagen(image.path);
        }
      }

      // Eliminar de Firestore
      for (const image of images) {
        await eventImageRepository.delete(image.id);
      }

      // Actualizar contador del evento
      await eventService.incrementEventPhotoCount(eventoId, -images.length);

      return {
        success: true,
        message: `${images.length} imágenes eliminadas exitosamente`
      };
    } catch (error) {
      console.error('❌ Error al eliminar todas las imágenes:', error);
      return { success: false, error: error.message };
    }
  }
}

export const eventImageService = new EventImageService();