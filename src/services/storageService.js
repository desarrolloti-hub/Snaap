// src/services/storageService.js
import { storage } from '../config/firebaseConfig.js';
import { 
  ref, 
  uploadBytes,
  getDownloadURL, 
  deleteObject,
  listAll,
  getMetadata,
  uploadBytesResumable
} from 'firebase/storage';

class StorageService {
  constructor() {
    this.usuarioActual = null;
    // 🔥 AHORA USA STORAGE REAL (NO BASE64)
    this.useBase64 = false;
  }

  setUsuarioActual(usuario) {
    this.usuarioActual = usuario;
  }

  // ============================================
  // 📤 SUBIR IMAGEN A FIREBASE STORAGE
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

      const extension = file.name.split('.').pop();
      const nombreArchivo = nombrePersonalizado 
        ? `${nombrePersonalizado}.${extension}` 
        : `${Date.now()}_${file.name}`;

      const path = `imagenes/${carpeta}/${nombreArchivo}`;
      const storageRef = ref(storage, path);

      console.log(`📤 Subiendo imagen a Storage: ${path}`);

      const snapshot = await uploadBytes(storageRef, file, {
        contentType: file.type,
        customMetadata: {
          uploadedBy: this.usuarioActual?.uid || 'anonymous',
          uploadedAt: new Date().toISOString(),
          originalName: file.name,
          size: String(file.size)
        }
      });

      const downloadURL = await getDownloadURL(snapshot.ref);

      console.log(`✅ Imagen subida a Storage: ${downloadURL}`);

      return {
        success: true,
        url: downloadURL,
        path: path,
        fileName: file.name,
        size: file.size,
        type: file.type,
        isBase64: false,
        storageRef: snapshot.ref
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
  // 📤 SUBIR IMAGEN CON PROGRESO
  // ============================================
  async subirImagenConProgreso(file, carpeta = 'general', onProgress = null) {
    try {
      if (!file) throw new Error('No se proporcionó ningún archivo');
      if (file.size > 5 * 1024 * 1024) throw new Error('La imagen no puede superar los 5MB');

      const path = `imagenes/${carpeta}/${Date.now()}_${file.name}`;
      const storageRef = ref(storage, path);

      const uploadTask = uploadBytesResumable(storageRef, file, {
        contentType: file.type,
        customMetadata: {
          uploadedBy: this.usuarioActual?.uid || 'anonymous',
          uploadedAt: new Date().toISOString()
        }
      });

      return new Promise((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            if (onProgress) onProgress(progress);
          },
          (error) => reject({ success: false, error: error.message }),
          async () => {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            resolve({
              success: true,
              url: downloadURL,
              path: path,
              fileName: file.name,
              size: file.size,
              type: file.type,
              isBase64: false
            });
          }
        );
      });

    } catch (error) {
      console.error('❌ Error:', error);
      return { success: false, error: error.message };
    }
  }

  // ============================================
  // 📥 OBTENER URL DE IMAGEN
  // ============================================
  async obtenerUrl(path) {
    try {
      if (!path) throw new Error('No se proporcionó un path');
      
      if (path.startsWith('data:image')) {
        return { success: true, url: path };
      }
      
      const storageRef = ref(storage, path);
      const url = await getDownloadURL(storageRef);
      
      return { success: true, url: url };
    } catch (error) {
      console.error('Error al obtener URL:', error);
      return { success: false, error: error.message };
    }
  }

  // ============================================
  // 🗑️ ELIMINAR IMAGEN DE STORAGE
  // ============================================
  async eliminarImagen(path) {
    try {
      if (!path) {
        console.warn('⚠️ No se proporcionó path para eliminar');
        return { success: true, message: 'No hay imagen para eliminar' };
      }
      
      if (path.startsWith('data:image') || path.startsWith('base64_')) {
        console.log(`✅ Imagen Base64 eliminada (virtual): ${path}`);
        return { success: true, message: 'Imagen eliminada correctamente' };
      }
      
      console.log(`🗑️ Eliminando imagen de Storage: ${path}`);
      const storageRef = ref(storage, path);
      await deleteObject(storageRef);
      console.log(`✅ Imagen eliminada: ${path}`);
      
      return { success: true, message: 'Imagen eliminada correctamente' };
    } catch (error) {
      console.error('Error al eliminar imagen:', error);
      return { success: false, error: error.message };
    }
  }

  // ============================================
  // 🗑️ ELIMINAR IMAGEN POR URL
  // ============================================
  async eliminarImagenPorUrl(url) {
    try {
      if (!url) {
        console.warn('⚠️ No se proporcionó URL para eliminar');
        return { success: true, message: 'No hay imagen para eliminar' };
      }

      if (url.startsWith('data:image')) {
        console.log(`✅ Imagen Base64 eliminada (virtual)`);
        return { success: true, message: 'Imagen eliminada correctamente' };
      }

      if (url.includes('firebasestorage.googleapis.com')) {
        try {
          const decodedUrl = decodeURIComponent(url);
          const match = decodedUrl.match(/\/o\/(.+?)\?/);
          if (match && match[1]) {
            const path = match[1];
            return await this.eliminarImagen(path);
          }
        } catch (error) {
          console.error('Error al extraer path de URL:', error);
        }
      }

      return { success: true, message: 'No se pudo eliminar la imagen, pero continuamos' };
    } catch (error) {
      console.error('Error al eliminar imagen por URL:', error);
      return { success: false, error: error.message };
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
      
      return { success: true, imagenes: imagenes };
    } catch (error) {
      console.error('Error al listar imágenes:', error);
      return { success: false, error: error.message };
    }
  }

  // ============================================
  // 🔄 MIGRAR IMAGEN DE URL A STORAGE
  // ============================================
  async migrarImagenDesdeUrl(urlImagen, carpeta = 'general', nombrePersonalizado = null) {
    try {
      console.log(`⬆️ Migrando imagen desde URL...`);

      const response = await fetch(urlImagen);
      if (!response.ok) throw new Error(`Error al descargar imagen: ${response.status}`);

      const blob = await response.blob();
      const extension = blob.type.split('/')[1] || 'jpg';
      const nombreArchivo = nombrePersonalizado 
        ? `${nombrePersonalizado}.${extension}` 
        : `migrado_${Date.now()}.${extension}`;

      const file = new File([blob], nombreArchivo, { type: blob.type });
      return await this.subirImagen(file, carpeta, nombreArchivo);

    } catch (error) {
      console.error('❌ Error al migrar imagen:', error);
      return { success: false, error: error.message };
    }
  }
}

export const storageService = new StorageService();