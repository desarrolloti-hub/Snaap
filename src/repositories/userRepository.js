// src/repositories/UsuarioRepository.js
import { db } from '../config/firebaseConfig.js';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  Timestamp 
} from 'firebase/firestore';
import { Usuario } from '../classes/userClass.js';

class UsuarioRepository {
  constructor() {
    this.collectionName = 'usuarios';
    this.collectionRef = collection(db, this.collectionName);
  }

  /**
   * Crear un nuevo usuario en Firestore
   */
  async create(usuario) {
    try {
      if (!usuario.uid) {
        throw new Error('El usuario debe tener un UID para guardarse');
      }

      // Si no tiene ID, usar el UID como ID del documento
      const docRef = usuario.id ? doc(this.collectionRef, usuario.id) : doc(this.collectionRef, usuario.uid);
      
      // Asegurar que las fechas sean Timestamps de Firestore
      const data = {
        ...usuario.toFirestore(),
        createdAt: Timestamp.fromDate(usuario.createdAt),
        updatedAt: Timestamp.fromDate(usuario.updatedAt)
      };

      await setDoc(docRef, data);
      
      return { ...usuario, id: docRef.id };
    } catch (error) {
      console.error('Error al crear usuario en Firestore:', error);
      throw new Error(`Error al guardar usuario: ${error.message}`);
    }
  }

  /**
   * Obtener un usuario por su UID
   */
  async getByUid(uid) {
    try {
      if (!uid) {
        throw new Error('Se requiere un UID para buscar el usuario');
      }

      // Buscar por uid
      const q = query(this.collectionRef, where('uid', '==', uid));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        return null;
      }

      const doc = querySnapshot.docs[0];
      return Usuario.fromFirestore(doc);
    } catch (error) {
      console.error('Error al obtener usuario por UID:', error);
      throw new Error(`Error al obtener usuario: ${error.message}`);
    }
  }

  /**
   * Obtener un usuario por su email
   */
  async getByEmail(email) {
    try {
      if (!email) {
        throw new Error('Se requiere un email para buscar el usuario');
      }

      const q = query(this.collectionRef, where('email', '==', email));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        return null;
      }

      const doc = querySnapshot.docs[0];
      return Usuario.fromFirestore(doc);
    } catch (error) {
      console.error('Error al obtener usuario por email:', error);
      throw new Error(`Error al obtener usuario: ${error.message}`);
    }
  }

  /**
   * Obtener un usuario por su ID de documento
   */
  async getById(id) {
    try {
      if (!id) {
        throw new Error('Se requiere un ID para buscar el usuario');
      }

      const docRef = doc(this.collectionRef, id);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return null;
      }

      return Usuario.fromFirestore(docSnap);
    } catch (error) {
      console.error('Error al obtener usuario por ID:', error);
      throw new Error(`Error al obtener usuario: ${error.message}`);
    }
  }

  /**
   * Actualizar un usuario existente
   */
  async update(usuario) {
    try {
      if (!usuario.id) {
        throw new Error('El usuario debe tener un ID para actualizarse');
      }

      const docRef = doc(this.collectionRef, usuario.id);
      const data = {
        ...usuario.toFirestore(),
        updatedAt: Timestamp.fromDate(new Date())
      };

      await updateDoc(docRef, data);
      return usuario;
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      throw new Error(`Error al actualizar usuario: ${error.message}`);
    }
  }

  /**
   * Eliminar un usuario
   */
  async delete(id) {
    try {
      if (!id) {
        throw new Error('Se requiere un ID para eliminar el usuario');
      }

      const docRef = doc(this.collectionRef, id);
      await deleteDoc(docRef);
      return true;
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      throw new Error(`Error al eliminar usuario: ${error.message}`);
    }
  }

  /**
   * Verificar si un usuario existe
   */
  async exists(uid) {
    try {
      const usuario = await this.getByUid(uid);
      return usuario !== null;
    } catch (error) {
      console.error('Error al verificar existencia de usuario:', error);
      return false;
    }
  }
}

// Exportar una instancia única del repositorio
export const usuarioRepository = new UsuarioRepository();