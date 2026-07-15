// src/repositories/carouselRepository.js
import { db } from '../config/firebaseConfig.js';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  where,
  Timestamp
} from 'firebase/firestore';
import { CarouselItem } from '../classes/carouselItemClass.js';

class CarouselRepository {
  constructor() {
    this.collectionName = 'carrusel';
    this.collectionRef = collection(db, this.collectionName);
  }

  // ============================================
  // 🔥 getActiveItems - SIN ÍNDICE (ordenar en memoria)
  // ============================================
  async getActiveItems() {
    try {
      console.log('🔍 Query: Obtener items con active == true (sin orderBy)');
      
      // 🔥 QUERY SIN orderBy - NO necesita índice
      const q = query(
        this.collectionRef,
        where('active', '==', true)
      );
      const snapshot = await getDocs(q);
      
      console.log(`📊 ${snapshot.size} documentos encontrados`);
      
      const items = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        console.log(`   📄 Documento: ${doc.id} - Title: ${data.title} - Active: ${data.active}`);
        items.push(CarouselItem.fromFirestore(doc));
      });
      
      // 🔥 ORDENAR EN MEMORIA (sin necesidad de índice)
      items.sort((a, b) => (a.order || 0) - (b.order || 0));
      
      console.log(`📊 ${items.length} items procesados y ordenados`);
      return items;
    } catch (error) {
      console.error('❌ Error al obtener items activos del carrusel:', error);
      throw error;
    }
  }

  // ============================================
  // 📥 getAllItems - CON orderBy (necesita índice)
  // ============================================
  async getAllItems() {
    try {
      // ⚠️ Esta consulta también necesita índice para orderBy
      // Si falla, quita orderBy o crea el índice
      const q = query(this.collectionRef, orderBy('order', 'asc'));
      const snapshot = await getDocs(q);
      const items = [];
      snapshot.forEach(doc => {
        items.push(CarouselItem.fromFirestore(doc));
      });
      return items;
    } catch (error) {
      console.error('Error al obtener todos los items:', error);
      // 🔥 FALLBACK: obtener sin orderBy
      console.log('🔄 Fallback: obteniendo sin orderBy');
      const snapshot = await getDocs(this.collectionRef);
      const items = [];
      snapshot.forEach(doc => {
        items.push(CarouselItem.fromFirestore(doc));
      });
      items.sort((a, b) => (a.order || 0) - (b.order || 0));
      return items;
    }
  }

  // ============================================
  // 📥 getById
  // ============================================
  async getById(id) {
    try {
      const docRef = doc(this.collectionRef, id);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) return null;
      return CarouselItem.fromFirestore(docSnap);
    } catch (error) {
      console.error('Error al obtener item:', error);
      throw error;
    }
  }

  // ============================================
  // ➕ create
  // ============================================
  async create(item) {
    try {
      const data = {
        ...item.toFirestore(),
        createdAt: Timestamp.fromDate(new Date()),
        updatedAt: Timestamp.fromDate(new Date())
      };
      const docRef = await addDoc(this.collectionRef, data);
      return { id: docRef.id, ...item, ...data };
    } catch (error) {
      console.error('Error al crear item:', error);
      throw error;
    }
  }

  // ============================================
  // ✏️ update
  // ============================================
  async update(id, data) {
    try {
      const docRef = doc(this.collectionRef, id);
      await updateDoc(docRef, {
        ...data,
        updatedAt: Timestamp.fromDate(new Date())
      });
      return await this.getById(id);
    } catch (error) {
      console.error('Error al actualizar item:', error);
      throw error;
    }
  }

  // ============================================
  // ❌ delete
  // ============================================
  async delete(id) {
    try {
      const docRef = doc(this.collectionRef, id);
      await deleteDoc(docRef);
      return true;
    } catch (error) {
      console.error('Error al eliminar item:', error);
      throw error;
    }
  }
}

export const carouselRepository = new CarouselRepository();