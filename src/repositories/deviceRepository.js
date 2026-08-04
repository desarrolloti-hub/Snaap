// src/repositories/deviceRepository.js
import { db } from '../config/firebaseConfig.js';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  query,
  where,
  getDocs,
  collection,
  Timestamp
} from 'firebase/firestore';

class DeviceRepository {
  constructor() {
    this.collectionName = 'deviceUsers';
    this.collectionRef = collection(db, this.collectionName);
  }

  /**
   * Obtener dispositivo por ID compuesto (deviceId + eventId)
   */
  async getByDeviceAndEvent(deviceId, eventId) {
    try {
      const docId = `${deviceId}_${eventId}`;
      const docRef = doc(this.collectionRef, docId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      }
      return null;
    } catch (error) {
      console.error('❌ Error al obtener dispositivo:', error);
      return null;
    }
  }

  /**
   * Crear o actualizar dispositivo
   */
  async upsert(deviceId, eventId, userName) {
    try {
      const docId = `${deviceId}_${eventId}`;
      const docRef = doc(this.collectionRef, docId);
      
      const data = {
        deviceId: deviceId,
        eventId: eventId,
        userName: userName.trim().slice(0, 15),
        lastUsedAt: Timestamp.fromDate(new Date())
      };

      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        await updateDoc(docRef, {
          userName: userName.trim().slice(0, 15),
          lastUsedAt: Timestamp.fromDate(new Date())
        });
      } else {
        await setDoc(docRef, {
          ...data,
          createdAt: Timestamp.fromDate(new Date())
        });
      }

      return { success: true, data: data };
    } catch (error) {
      console.error('❌ Error al guardar dispositivo:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Obtener todos los usuarios de un evento (para el host)
   */
  async getUsersByEvent(eventId) {
    try {
      const q = query(
        this.collectionRef,
        where('eventId', '==', eventId)
      );
      const snapshot = await getDocs(q);
      
      const users = [];
      snapshot.forEach(doc => {
        users.push({ id: doc.id, ...doc.data() });
      });
      
      return users;
    } catch (error) {
      console.error('❌ Error al obtener usuarios del evento:', error);
      return [];
    }
  }

  /**
   * Obtener todos los dispositivos de un evento (para estadísticas)
   */
  async getDevicesByEvent(eventId) {
    try {
      const q = query(
        this.collectionRef,
        where('eventId', '==', eventId)
      );
      const snapshot = await getDocs(q);
      
      const devices = [];
      snapshot.forEach(doc => {
        devices.push({ id: doc.id, ...doc.data() });
      });
      
      return devices;
    } catch (error) {
      console.error('❌ Error al obtener dispositivos del evento:', error);
      return [];
    }
  }
}

export const deviceRepository = new DeviceRepository();