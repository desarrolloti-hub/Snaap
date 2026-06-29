// src/repositories/userRepository.js
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
  Timestamp,
  addDoc
} from 'firebase/firestore';
import { User } from '../classes/userClass.js';

class UserRepository {
  constructor() {
    this.collectionName = 'usuarios';
    this.collectionRef = collection(db, this.collectionName);
  }

  // ➕ CREAR usuario
  async create(user) {
    try {
      if (!user.isValid()) {
        throw new Error('El usuario no es válido');
      }

      const data = {
        ...user.toFirestore(),
        createdAt: Timestamp.fromDate(user.createdAt || new Date()),
        updatedAt: Timestamp.fromDate(new Date()),
        lastLogin: user.lastLogin ? Timestamp.fromDate(user.lastLogin) : null
      };

      let docRef;
      if (user.uid) {
        docRef = doc(this.collectionRef, user.uid);
        await setDoc(docRef, data);
      } else {
        docRef = await addDoc(this.collectionRef, data);
      }

      return new User({ ...user, id: docRef.id, uid: docRef.id });
    } catch (error) {
      console.error('Error al crear usuario:', error);
      throw error;
    }
  }

  // 🔍 OBTENER usuario por ID
  async getById(id) {
    try {
      const docRef = doc(this.collectionRef, id);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) return null;
      return User.fromFirestore(docSnap);
    } catch (error) {
      console.error('Error al obtener usuario:', error);
      throw error;
    }
  }

  // 🔍 OBTENER usuario por Email
  async getByEmail(email) {
    try {
      const q = query(this.collectionRef, where('email', '==', email));
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) return null;
      return User.fromFirestore(querySnapshot.docs[0]);
    } catch (error) {
      console.error('Error al obtener usuario por email:', error);
      throw error;
    }
  }

  // 🔍 OBTENER usuario por UID (Firebase Auth)
  async getByUid(uid) {
    try {
      const q = query(this.collectionRef, where('uid', '==', uid));
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) return null;
      return User.fromFirestore(querySnapshot.docs[0]);
    } catch (error) {
      console.error('Error al obtener usuario por UID:', error);
      throw error;
    }
  }

  // 🔍 OBTENER TODOS LOS USUARIOS 🔥 NUEVO
  async getAllUsers() {
    try {
      const querySnapshot = await getDocs(this.collectionRef);
      const users = [];
      querySnapshot.forEach((doc) => {
        users.push(User.fromFirestore(doc));
      });
      return users;
    } catch (error) {
      console.error('Error al obtener todos los usuarios:', error);
      throw error;
    }
  }

  // ✏️ ACTUALIZAR usuario
  async update(user) {
    try {
      const docId = user.id || user.uid;
      const docRef = doc(this.collectionRef, docId);
      const data = {
        ...user.toFirestore(),
        updatedAt: Timestamp.fromDate(new Date())
      };
      delete data.createdAt;
      delete data.uid;
      await updateDoc(docRef, data);
      return user;
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      throw error;
    }
  }

  // ❌ ELIMINAR usuario
  async delete(id) {
    try {
      const docRef = doc(this.collectionRef, id);
      await deleteDoc(docRef);
      return true;
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      throw error;
    }
  }
}

export const userRepository = new UserRepository();