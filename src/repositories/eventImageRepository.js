// src/repositories/eventImageRepository.js
import { db } from '../config/firebaseConfig.js';
import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  increment,
  onSnapshot,
  Timestamp
} from 'firebase/firestore';

class EventImageRepository {
  constructor() {
    this.collectionName = 'eventImages';
    this.collectionRef = collection(db, this.collectionName);
  }

  // ============================================
  // ➕ CREAR IMAGEN
  // ============================================
  async create(data) {
    try {
      const docRef = await addDoc(this.collectionRef, {
        ...data,
        createdAt: Timestamp.fromDate(new Date())
      });
      return { id: docRef.id, ...data };
    } catch (error) {
      console.error('❌ Error al crear imagen de evento:', error);
      throw error;
    }
  }

  // ============================================
  // 📥 OBTENER IMÁGENES POR EVENTO
  // ============================================
  async getByEvent(eventoId) {
    try {
      const q = query(
        this.collectionRef,
        where('eventoId', '==', eventoId)
      );
      const snapshot = await getDocs(q);
      const images = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      return images.sort((a, b) => this.sortByDateDesc(a, b));
    } catch (error) {
      console.error('❌ Error al obtener imágenes del evento:', error);
      return [];
    }
  }

  // ============================================
  // 📥 OBTENER IMÁGENES POR EVENTO Y USUARIO
  // ============================================
  async getByEventAndUser(eventoId, userId) {
    try {
      const q = query(
        this.collectionRef,
        where('eventoId', '==', eventoId),
        where('userId', '==', userId)
      );
      const snapshot = await getDocs(q);
      const images = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      return images.sort((a, b) => this.sortByDateDesc(a, b));
    } catch (error) {
      console.error('❌ Error al obtener imágenes del evento por usuario:', error);
      return [];
    }
  }

  // ============================================
  // 📥 OBTENER IMÁGENES POR EVENTO Y DISPOSITIVO (NUEVO)
  // ============================================
  async getByEventAndDevice(eventoId, deviceId) {
    try {
      const q = query(
        this.collectionRef,
        where('eventoId', '==', eventoId),
        where('deviceId', '==', deviceId)
      );
      const snapshot = await getDocs(q);
      const images = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      return images.sort((a, b) => this.sortByDateDesc(a, b));
    } catch (error) {
      console.error('❌ Error al obtener imágenes por dispositivo:', error);
      return [];
    }
  }

  // ============================================
  // 📥 ESCUCHAR IMÁGENES EN TIEMPO REAL
  // ============================================
  listenToEventImages(eventoId, callback) {
    try {
      const q = query(
        this.collectionRef,
        where('eventoId', '==', eventoId)
      );
      return onSnapshot(q, (snapshot) => {
        const images = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        callback(images.sort((a, b) => this.sortByDateDesc(a, b)));
      }, (error) => {
        console.error('❌ Error en onSnapshot:', error);
        callback([]);
      });
    } catch (error) {
      console.error('❌ Error al escuchar imágenes:', error);
      return () => {};
    }
  }

  sortByDateDesc(a, b) {
    const dateA = this.normalizeDate(a.date);
    const dateB = this.normalizeDate(b.date);
    return dateB - dateA;
  }

  normalizeDate(date) {
    if (!date) return 0;
    if (typeof date === 'string') {
      const parsed = Date.parse(date);
      return Number.isNaN(parsed) ? 0 : parsed;
    }
    if (date instanceof Date) {
      return date.getTime();
    }
    if (typeof date.toDate === 'function') {
      return date.toDate().getTime();
    }
    return 0;
  }

  // ============================================
  // ❌ ELIMINAR IMAGEN
  // ============================================
  async delete(id) {
    try {
      const docRef = doc(this.collectionRef, id);
      await deleteDoc(docRef);
      return true;
    } catch (error) {
      console.error('❌ Error al eliminar imagen:', error);
      throw error;
    }
  }

  // ============================================
  // 📊 CONTAR IMÁGENES POR EVENTO
  // ============================================
  async countByEvent(eventoId) {
    try {
      const q = query(
        this.collectionRef,
        where('eventoId', '==', eventoId)
      );
      const snapshot = await getDocs(q);
      return snapshot.size;
    } catch (error) {
      console.error('❌ Error al contar imágenes:', error);
      return 0;
    }
  }
}

export const eventImageRepository = new EventImageRepository();