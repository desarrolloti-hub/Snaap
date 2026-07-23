// src/services/carouselService.js
import { CarouselItem } from '../classes/carouselItemClass.js';
import { carouselRepository } from '../repositories/carouselRepository.js';
import { storageService } from './storageService.js';

class CarouselService {
  constructor() {
    this.usuarioActual = null;
  }

  setUsuarioActual(usuario) {
    this.usuarioActual = usuario;
  }

  // ============================================
  // 📥 OBTENER ITEMS ACTIVOS
  // ============================================
  async obtenerItemsActivos() {
    try {
      const items = await carouselRepository.getActiveItems();
      console.log(`📊 ${items.length} imágenes activas obtenidas`);
      return { success: true, items: items };
    } catch (error) {
      console.error('Error al obtener items activos:', error);
      return { success: false, error: error.message };
    }
  }

  // ============================================
  // 📥 OBTENER TODOS LOS ITEMS (admin)
  // ============================================
  async obtenerTodosLosItems() {
    try {
      if (!this.usuarioActual || this.usuarioActual.role !== 'sysadmin') {
        throw new Error('No tienes permisos para administrar el carrusel');
      }
      const items = await carouselRepository.getAllItems();
      return { success: true, items: items };
    } catch (error) {
      console.error('Error al obtener todos los items:', error);
      return { success: false, error: error.message };
    }
  }

  // ============================================
  // ➕ CREAR ITEM - CON STORAGE
  // ============================================
  async crearItem(data, imageFile = null) {
    try {
      if (!this.usuarioActual || this.usuarioActual.role !== 'sysadmin') {
        throw new Error('No tienes permisos para administrar el carrusel');
      }

      if (!data.title || data.title.trim() === '') {
        throw new Error('El título es obligatorio');
      }

      let imageUrl = data.imageUrl || '';
      let imagePath = '';

      // 🔥 SI HAY ARCHIVO, SUBIR A STORAGE
      if (imageFile) {
        console.log('📤 Subiendo imagen a Storage...');
        const uploadResult = await storageService.subirImagen(
          imageFile, 
          'carrusel', 
          `${Date.now()}_${imageFile.name}`
        );
        
        if (!uploadResult.success) {
          throw new Error(`Error al subir imagen: ${uploadResult.error}`);
        }
        
        imageUrl = uploadResult.url;
        imagePath = uploadResult.path;
        console.log('✅ Imagen subida a Storage:', imageUrl);
      } else if (data.imageUrl) {
        // Si solo hay URL, intentar migrar a Storage
        console.log('📤 Migrando imagen desde URL a Storage...');
        const migrateResult = await storageService.migrarImagenDesdeUrl(
          data.imageUrl,
          'carrusel',
          `carrusel_${Date.now()}`
        );
        
        if (migrateResult.success) {
          imageUrl = migrateResult.url;
          imagePath = migrateResult.path;
          console.log('✅ Imagen migrada a Storage:', imageUrl);
        } else {
          imageUrl = data.imageUrl;
          console.warn('⚠️ No se pudo migrar, usando URL original');
        }
      }

      if (!imageUrl) {
        throw new Error('La URL de la imagen es requerida');
      }

      const allItems = await carouselRepository.getAllItems();
      const maxOrder = allItems.reduce((max, item) => Math.max(max, item.order || 0), 0);

      const newItem = new CarouselItem({
        imageUrl: imageUrl,
        imagePath: imagePath,
        title: data.title.trim(),
        subtitle: data.subtitle ? data.subtitle.trim() : '',
        link: data.link ? data.link.trim() : '/host/event-crud',
        order: data.order !== undefined ? data.order : maxOrder + 1,
        active: data.active !== undefined ? data.active : true,
        createdAt: new Date()
      });

      const created = await carouselRepository.create(newItem);
      
      return {
        success: true,
        item: created,
        message: 'Imagen agregada al carrusel correctamente'
      };

    } catch (error) {
      console.error('❌ Error al crear item del carrusel:', error);
      return { success: false, error: error.message || 'Error al crear la imagen en el carrusel' };
    }
  }

  // ============================================
  // ✏️ ACTUALIZAR ITEM - CON STORAGE
  // ============================================
  async actualizarItem(id, data, imageFile = null) {
    try {
      if (!this.usuarioActual || this.usuarioActual.role !== 'sysadmin') {
        throw new Error('No tienes permisos para administrar el carrusel');
      }

      const existingItem = await carouselRepository.getById(id);
      if (!existingItem) {
        throw new Error('Item no encontrado');
      }

      let imageUrl = data.imageUrl || existingItem.imageUrl;
      let imagePath = existingItem.imagePath || '';

      // 🔥 SI HAY NUEVO ARCHIVO, SUBIR Y ELIMINAR EL ANTERIOR
      if (imageFile) {
        console.log('📤 Subiendo nueva imagen a Storage...');
        
        if (existingItem.imagePath) {
          console.log('🗑️ Eliminando imagen anterior:', existingItem.imagePath);
          await storageService.eliminarImagen(existingItem.imagePath);
        }

        const uploadResult = await storageService.subirImagen(
          imageFile, 
          'carrusel', 
          `${Date.now()}_${imageFile.name}`
        );
        
        if (!uploadResult.success) {
          throw new Error(`Error al subir nueva imagen: ${uploadResult.error}`);
        }
        
        imageUrl = uploadResult.url;
        imagePath = uploadResult.path;
        console.log('✅ Nueva imagen subida a Storage:', imageUrl);
      }

      const updateData = {
        imageUrl: imageUrl,
        imagePath: imagePath,
        title: data.title !== undefined ? data.title.trim() : existingItem.title,
        subtitle: data.subtitle !== undefined ? data.subtitle.trim() : existingItem.subtitle,
        link: data.link !== undefined ? data.link.trim() : existingItem.link,
        order: data.order !== undefined ? data.order : existingItem.order,
        active: data.active !== undefined ? data.active : existingItem.active,
        updatedAt: new Date()
      };

      const updated = await carouselRepository.update(id, updateData);
      
      return {
        success: true,
        item: updated,
        message: 'Imagen actualizada correctamente'
      };

    } catch (error) {
      console.error('❌ Error al actualizar item:', error);
      return { success: false, error: error.message || 'Error al actualizar la imagen' };
    }
  }

  // ============================================
  // ❌ ELIMINAR ITEM - CON STORAGE
  // ============================================
  async eliminarItem(id) {
    try {
      if (!this.usuarioActual || this.usuarioActual.role !== 'sysadmin') {
        throw new Error('No tienes permisos para administrar el carrusel');
      }

      const item = await carouselRepository.getById(id);
      if (!item) {
        throw new Error('Item no encontrado');
      }

      // 🔥 ELIMINAR IMAGEN DE STORAGE SI EXISTE
      if (item.imagePath) {
        console.log('🗑️ Eliminando imagen de Storage:', item.imagePath);
        await storageService.eliminarImagen(item.imagePath);
      }

      await carouselRepository.delete(id);
      
      return {
        success: true,
        message: 'Imagen eliminada correctamente'
      };

    } catch (error) {
      console.error('❌ Error al eliminar item:', error);
      return { success: false, error: error.message || 'Error al eliminar la imagen' };
    }
  }

  // ============================================
  // 🔄 REORDENAR ITEMS
  // ============================================
  async reordenarItems(items) {
    try {
      if (!this.usuarioActual || this.usuarioActual.role !== 'sysadmin') {
        throw new Error('No tienes permisos para administrar el carrusel');
      }

      const resultados = [];
      for (const item of items) {
        const result = await carouselRepository.update(item.id, {
          order: item.order,
          updatedAt: new Date()
        });
        resultados.push(result);
      }

      return {
        success: true,
        message: 'Orden actualizado correctamente',
        items: resultados
      };

    } catch (error) {
      console.error('Error al reordenar items:', error);
      return { success: false, error: error.message };
    }
  }
}

export const carouselService = new CarouselService();