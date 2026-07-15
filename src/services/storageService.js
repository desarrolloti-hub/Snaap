// src/services/storageService.js
import { storage } from '../config/firebaseConfig.js';
import { 
  ref, 
  getDownloadURL, 
  deleteObject,
  listAll,
  getMetadata
} from 'firebase/storage';

class StorageService {
  constructor() {
    this.usuarioActual = null;
    // 🔥 USAR BASE64 EN VEZ DE STORAGE (para evitar CORS)
    this.useBase64 = true; // Cambiar a false para usar Storage
  }

  setUsuarioActual(usuario) {
    this.usuarioActual = usuario;
  }

  // ============================================
  // 📤 SUBIR IMAGEN - VERSIÓN BASE64 (SIN CORS)
  // ============================================
  async subirImagen(file, carpeta = 'general', nombrePersonalizado = null) {
    try {
      if (!file) {
        throw new Error('No se proporcionó ningún archivo');
      }

      if (file.size > 5 * 1024 * 1024) {
        throw new Error('La imagen no puede superar los 5MB');
      }

      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        throw new Error(`Formato no permitido. Usa: ${allowedTypes.join(', ')}`);
      }

      console.log(`📤 Convirtiendo imagen a Base64...`);
      console.log(`📦 Tamaño: ${(file.size / 1024).toFixed(2)} KB`);
      console.log(`📄 Tipo: ${file.type}`);

      // 🔥 CONVERTIR A BASE64
      const base64 = await this.fileToBase64(file);
      
      console.log(`✅ Imagen convertida a Base64 (${base64.length} caracteres)`);

      return {
        success: true,
        url: base64,
        path: `base64_${Date.now()}`,
        fileName: file.name,
        size: file.size,
        type: file.type,
        isBase64: true
      };

    } catch (error) {
      console.error('❌ Error al subir imagen:', error);
      return {
        success: false,
        error: error.message || 'Error al subir la imagen',
        code: error.code || 'unknown'
      };
    }
  }

  // ============================================
  // 📤 CONVERTIR ARCHIVO A BASE64
  // ============================================
  fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  }

  // ============================================
  // 📥 OBTENER URL DE IMAGEN (Para Base64, devuelve la misma)
  // ============================================
  async obtenerUrl(path) {
    try {
      if (!path) {
        throw new Error('No se proporcionó un path');
      }
      
      // Si es Base64, devolver la misma URL
      if (path.startsWith('data:image')) {
        return {
          success: true,
          url: path
        };
      }
      
      const storageRef = ref(storage, path);
      const url = await getDownloadURL(storageRef);
      
      return {
        success: true,
        url: url
      };
    } catch (error) {
      console.error('Error al obtener URL:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // ============================================
  // 🗑️ ELIMINAR IMAGEN
  // ============================================
  async eliminarImagen(path) {
    try {
      if (!path) {
        console.warn('⚠️ No se proporcionó path para eliminar');
        return {
          success: true,
          message: 'No hay imagen para eliminar'
        };
      }
      
      // Si es Base64, solo lo ignoramos
      if (path.startsWith('data:image') || path.startsWith('base64_')) {
        console.log(`✅ Imagen Base64 eliminada (virtual): ${path}`);
        return {
          success: true,
          message: 'Imagen eliminada correctamente'
        };
      }
      
      console.log(`🗑️ Eliminando imagen: ${path}`);
      const storageRef = ref(storage, path);
      await deleteObject(storageRef);
      console.log(`✅ Imagen eliminada: ${path}`);
      
      return {
        success: true,
        message: 'Imagen eliminada correctamente'
      };
    } catch (error) {
      console.error('Error al eliminar imagen:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // ============================================
  // 📋 LISTAR IMÁGENES
  // ============================================
  async listarImagenes(carpeta) {
    try {
      const path = `imagenes/${carpeta}`;
      const storageRef = ref(storage, path);
      const result = await listAll(storageRef);
      
      const imagenes = [];
      for (const item of result.items) {
        const url = await getDownloadURL(item);
        const metadata = await getMetadata(item);
        imagenes.push({
          name: item.name,
          path: item.fullPath,
          url: url,
          size: metadata.size,
          contentType: metadata.contentType,
          createdAt: metadata.timeCreated
        });
      }
      
      console.log(`📋 ${imagenes.length} imágenes encontradas en ${path}`);
      
      return {
        success: true,
        imagenes: imagenes
      };
    } catch (error) {
      console.error('Error al listar imágenes:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // ============================================
  // 🔄 MIGRAR IMAGEN DE URL A STORAGE (DESACTIVADO)
  // ============================================
  async migrarImagenDesdeUrl(urlImagen, carpeta = 'general', nombrePersonalizado = null) {
    // 🔥 DESACTIVADO - Usamos Base64
    console.warn('⚠️ Migración desactivada. Usando Base64.');
    return {
      success: false,
      error: 'Migración desactivada. Usa Base64.'
    };
  }
}

export const storageService = new StorageService();