// src/repositories/eventRepository.js
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
  orderBy,
  limit,
  Timestamp,
  addDoc
} from 'firebase/firestore';
import { Evento } from '../classes/eventClass.js';

class EventoRepository {
  constructor() {
    this.collectionName = 'eventos';
    this.collectionRef = collection(db, this.collectionName);
  }

  // ➕ CREAR evento
  async create(evento) {
    try {
      if (!evento.isValid()) {
        throw new Error('El evento no es válido. Verifica los campos requeridos.');
      }

      const data = {
        ...evento.toFirestore(),
        fechaEvento: Timestamp.fromDate(evento.fechaEvento || new Date()),
        createdAt: Timestamp.fromDate(evento.createdAt || new Date()),
        updatedAt: Timestamp.fromDate(new Date()),
        fechaLimite: Timestamp.fromDate(evento.fechaLimite || evento.calcularFechaLimite(evento.paquete))
      };

      let docRef;
      if (evento.id) {
        docRef = doc(this.collectionRef, evento.id);
        await setDoc(docRef, data);
      } else {
        docRef = await addDoc(this.collectionRef, data);
      }

      return new Evento({ ...evento, id: docRef.id });
    } catch (error) {
      console.error('Error al crear evento en Firestore:', error);
      throw new Error(`Error al guardar evento: ${error.message}`);
    }
  }

  // 🔍 OBTENER evento por ID
  async getById(id) {
    try {
      if (!id) {
        throw new Error('Se requiere un ID para buscar el evento');
      }

      const docRef = doc(this.collectionRef, id);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return null;
      }

      return Evento.fromFirestore(docSnap);
    } catch (error) {
      console.error('Error al obtener evento por ID:', error);
      throw new Error(`Error al obtener evento: ${error.message}`);
    }
  }

  // 🔍 OBTENER eventos por creador (SIN orderBy para evitar índice)
  async getByCreador(uid) {
    try {
      if (!uid) {
        throw new Error('Se requiere el UID del creador para buscar eventos');
      }

      // 🔥 ELIMINAR orderBy para evitar el índice
      const q = query(
        this.collectionRef, 
        where('creadoPor', '==', uid)
      );
      
      const querySnapshot = await getDocs(q);
      const eventos = [];

      querySnapshot.forEach((doc) => {
        eventos.push(Evento.fromFirestore(doc));
      });

      // 🔥 ORDENAR EN MEMORIA
      return eventos.sort((a, b) => {
        const dateA = new Date(a.createdAt);
        const dateB = new Date(b.createdAt);
        return dateB - dateA;
      });
    } catch (error) {
      console.error('Error al obtener eventos por creador:', error);
      throw new Error(`Error al obtener eventos: ${error.message}`);
    }
  }

  // 📋 OBTENER TODOS los eventos (SIN orderBy para evitar índice)
  async getAll(limitCount = 100) {
    try {
      // 🔥 Eliminar orderBy para evitar el índice
      const q = query(
        this.collectionRef
      );
      
      const querySnapshot = await getDocs(q);
      const eventos = [];

      querySnapshot.forEach((doc) => {
        eventos.push(Evento.fromFirestore(doc));
      });

      // 🔥 ORDENAR EN MEMORIA
      const sorted = eventos.sort((a, b) => {
        const dateA = new Date(a.createdAt);
        const dateB = new Date(b.createdAt);
        return dateB - dateA;
      });

      return sorted.slice(0, limitCount);
    } catch (error) {
      console.error('Error al obtener todos los eventos:', error);
      throw new Error(`Error al obtener eventos: ${error.message}`);
    }
  }

  // 🔍 OBTENER eventos por estado
  async getByEstado(estado) {
    try {
      const q = query(
        this.collectionRef, 
        where('estado', '==', estado)
      );
      
      const querySnapshot = await getDocs(q);
      const eventos = [];

      querySnapshot.forEach((doc) => {
        eventos.push(Evento.fromFirestore(doc));
      });

      return eventos.sort((a, b) => {
        const dateA = new Date(a.createdAt);
        const dateB = new Date(b.createdAt);
        return dateB - dateA;
      });
    } catch (error) {
      console.error('Error al obtener eventos por estado:', error);
      throw new Error(`Error al obtener eventos: ${error.message}`);
    }
  }

  // 📋 OBTENER eventos activos
  async getEventosActivos() {
    return this.getByEstado('active');
  }

  // ✏️ ACTUALIZAR evento
  async update(evento) {
    try {
      if (!evento.id) {
        throw new Error('El evento debe tener un ID para actualizarse');
      }

      if (!evento.isValid()) {
        throw new Error('El evento no es válido para actualizar');
      }

      const docRef = doc(this.collectionRef, evento.id);
      const data = {
        ...evento.toFirestore(),
        updatedAt: Timestamp.fromDate(new Date())
      };

      if (data.fechaEvento) {
        data.fechaEvento = Timestamp.fromDate(data.fechaEvento);
      }
      if (data.fechaLimite) {
        data.fechaLimite = Timestamp.fromDate(data.fechaLimite);
      }

      await updateDoc(docRef, data);
      return evento;
    } catch (error) {
      console.error('Error al actualizar evento:', error);
      throw new Error(`Error al actualizar evento: ${error.message}`);
    }
  }

  // 📋 ACTUALIZAR ESTADO del evento
  async updateEstado(id, nuevoEstado) {
    try {
      if (!id) {
        throw new Error('Se requiere el ID del evento');
      }

      if (!nuevoEstado) {
        throw new Error('Se requiere el nuevo estado');
      }

      const docRef = doc(this.collectionRef, id);
      await updateDoc(docRef, {
        estado: nuevoEstado,
        updatedAt: Timestamp.fromDate(new Date())
      });

      return true;
    } catch (error) {
      console.error('Error al actualizar estado del evento:', error);
      throw new Error(`Error al actualizar estado: ${error.message}`);
    }
  }

  // ➕ AGREGAR INVITADO
  async agregarInvitado(eventoId, invitado) {
    try {
      if (!eventoId) {
        throw new Error('Se requiere el ID del evento');
      }

      const evento = await this.getById(eventoId);
      if (!evento) {
        throw new Error('Evento no encontrado');
      }

      const existe = evento.invitados.some(i => i.email === invitado.email);
      if (existe) {
        throw new Error('El invitado ya está registrado en este evento');
      }

      const nuevoInvitado = {
        ...invitado,
        estado: 'pendiente',
        fechaInvitacion: new Date().toISOString()
      };

      evento.invitados.push(nuevoInvitado);
      await this.update(evento);

      return evento;
    } catch (error) {
      console.error('Error al agregar invitado:', error);
      throw new Error(`Error al agregar invitado: ${error.message}`);
    }
  }

  // ❌ ELIMINAR INVITADO
  async eliminarInvitado(eventoId, emailInvitado) {
    try {
      if (!eventoId || !emailInvitado) {
        throw new Error('Se requiere el ID del evento y el email del invitado');
      }

      const evento = await this.getById(eventoId);
      if (!evento) {
        throw new Error('Evento no encontrado');
      }

      evento.invitados = evento.invitados.filter(i => i.email !== emailInvitado);
      await this.update(evento);

      return evento;
    } catch (error) {
      console.error('Error al eliminar invitado:', error);
      throw new Error(`Error al eliminar invitado: ${error.message}`);
    }
  }

  // ❌ ELIMINAR evento
  async delete(id) {
    try {
      if (!id) {
        throw new Error('Se requiere un ID para eliminar el evento');
      }

      const docRef = doc(this.collectionRef, id);
      await deleteDoc(docRef);
      return true;
    } catch (error) {
      console.error('Error al eliminar evento:', error);
      throw new Error(`Error al eliminar evento: ${error.message}`);
    }
  }

  // 🔍 BUSCAR por código de acceso
  async getByCodigoAcceso(codigo) {
    try {
      if (!codigo) {
        throw new Error('Se requiere un código de acceso');
      }

      const q = query(this.collectionRef, where('codigoAcceso', '==', codigo));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        return null;
      }

      const doc = querySnapshot.docs[0];
      return Evento.fromFirestore(doc);
    } catch (error) {
      console.error('Error al obtener evento por código:', error);
      return null;
    }
  }

  // 📊 OBTENER ESTADÍSTICAS
  async getEstadisticas(uid) {
    try {
      const eventos = await this.getByCreador(uid);
      
      return {
        total: eventos.length,
        activos: eventos.filter(e => e.estado === 'active').length,
        completados: eventos.filter(e => e.estado === 'completed').length,
        cancelados: eventos.filter(e => e.estado === 'cancelled').length,
        pendientes: eventos.filter(e => e.estado === 'pending').length,
        totalInvitados: eventos.reduce((total, e) => total + e.invitados.length, 0),
        confirmados: eventos.reduce((total, e) => total + e.getTotalInvitadosConfirmados(), 0)
      };
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      return null;
    }
  }
}

export const eventoRepository = new EventoRepository();