// src/repositories/qrRepository.js
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
    where,
    orderBy,
    Timestamp,
    increment
} from 'firebase/firestore';
import { QrCode } from '../classes/qrClass.js';

class QrRepository {
    constructor() {
        this.collectionName = 'qr_codes';
        this.collectionRef = collection(db, this.collectionName);
        this.logsCollectionName = 'qr_scan_logs';
        this.logsCollectionRef = collection(db, this.logsCollectionName);
    }

    // ============================================
    // 📥 OBTENER QR POR ID
    // ============================================
    async getById(id) {
        try {
            const docRef = doc(this.collectionRef, id);
            const docSnap = await getDoc(docRef);
            if (!docSnap.exists()) return null;
            return QrCode.fromFirestore(docSnap);
        } catch (error) {
            console.error('Error al obtener QR:', error);
            throw error;
        }
    }

    // ============================================
    // 📥 OBTENER QR POR TOKEN
    // ============================================
    async getByToken(token) {
        try {
            const q = query(
                this.collectionRef,
                where('token', '==', token)
            );
            const snapshot = await getDocs(q);
            if (snapshot.empty) return null;
            return QrCode.fromFirestore(snapshot.docs[0]);
        } catch (error) {
            console.error('Error al obtener QR por token:', error);
            throw error;
        }
    }

    // ============================================
    // 📥 OBTENER QR POR EVENTO
    // ============================================
    async getByEventoId(eventoId) {
        try {
            const q = query(
                this.collectionRef,
                where('eventoId', '==', eventoId)
            );
            const snapshot = await getDocs(q);
            if (snapshot.empty) return null;
            return QrCode.fromFirestore(snapshot.docs[0]);
        } catch (error) {
            console.error('Error al obtener QR por evento:', error);
            throw error;
        }
    }

    // ============================================
    // ➕ CREAR QR
    // ============================================
    async create(qrCode) {
        try {
            const data = {
                ...qrCode.toFirestore(),
                createdAt: Timestamp.fromDate(new Date()),
                updatedAt: Timestamp.fromDate(new Date())
            };
            const docRef = await addDoc(this.collectionRef, data);
            return { id: docRef.id, ...qrCode, ...data };
        } catch (error) {
            console.error('Error al crear QR:', error);
            throw error;
        }
    }

    // ============================================
    // ✏️ ACTUALIZAR QR
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
            console.error('Error al actualizar QR:', error);
            throw error;
        }
    }

    // ============================================
    // 🔢 INCREMENTAR ESCANEOS
    // ============================================
    async incrementScans(id) {
        try {
            const docRef = doc(this.collectionRef, id);
            await updateDoc(docRef, {
                scans: increment(1),
                updatedAt: Timestamp.fromDate(new Date())
            });
            return true;
        } catch (error) {
            console.error('Error al incrementar escaneos:', error);
            throw error;
        }
    }

    // ============================================
    // 📝 AGREGAR LOG DE ESCANEO
    // ============================================
    async addScanLog(qrId, logData) {
        try {
            const data = {
                qrId: qrId,
                ...logData,
                timestamp: Timestamp.fromDate(new Date())
            };
            await addDoc(this.logsCollectionRef, data);
            return true;
        } catch (error) {
            console.error('Error al agregar log de escaneo:', error);
            throw error;
        }
    }

    // ============================================
    // ❌ ELIMINAR QR
    // ============================================
    async delete(id) {
        try {
            const docRef = doc(this.collectionRef, id);
            await deleteDoc(docRef);
            return true;
        } catch (error) {
            console.error('Error al eliminar QR:', error);
            throw error;
        }
    }
}

export const qrRepository = new QrRepository();