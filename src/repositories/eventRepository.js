// src/repositories/EventoRepository.js
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
  Timestamp,
  addDoc
} from 'firebase/firestore';
import { Evento } from '../classes/eventClass.js';

class EventoRepository {
  constructor() {
    this.collectionName = 'eventos';
    this.collectionRef = collection(db, this.collectionName);
  }

  /**
   * Crear un nuevo evento en Firestore
   */
  async create(evento) {
    try {
      if (!evento.isValid()) {
        throw new Error('El evento no es válido. Verifica los campos requeridos.');
      }

      // Preparar datos para Firestore
      const data = {
        ...evento.toFirestore(),
        fechaEvento: Timestamp.fromDate(evento.fechaEvento),
        createdAt: Timestamp.fromDate(evento.createdAt || new Date()),
        updatedAt: Timestamp.fromDate(new Date()),
        fechaLimite: Timestamp.fromDate(evento.fechaLimite || evento.calcularFechaLimite(evento.paquete))
      };

      // Si tiene ID, usar setDoc, si no, usar addDoc
      let docRef;
      if (evento.id) {
        docRef = doc(this.collectionRef, evento.id);
        await setDoc(docRef, data);
      } else {
        docRef = await addDoc(this.collectionRef, data);
      }

      // Crear una nueva instancia con el ID generado
      const eventoCreado = new Evento({
        ...evento,
        id: docRef.id
      });

      return eventoCreado;
    } catch (error) {
      console.error('Error al crear evento en Firestore:', error);
      throw new Error(`Error al guardar evento: ${error.message}`);
    }
  }

  /**
   * Obtener un evento por su ID
   */
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

  /**
   * Obtener eventos por usuario creador
   */
  async getByCreador(uid) {
    try {
      if (!uid) {
        throw new Error('Se requiere el UID del creador para buscar eventos');
      }

      const q = query(
        this.collectionRef, 
        where('creadoPor', '==', uid),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const eventos = [];

      querySnapshot.forEach((doc) => {
        eventos.push(Evento.fromFirestore(doc));
      });

      return eventos;
    } catch (error) {
      console.error('Error al obtener eventos por creador:', error);
      throw new Error(`Error al obtener eventos: ${error.message}`);
    }
  }

  /**
   * Obtener eventos por estado
   */
  async getByEstado(estado) {
    try {
      const q = query(
        this.collectionRef, 
        where('estado', '==', estado),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const eventos = [];

      querySnapshot.forEach((doc) => {
        eventos.push(Evento.fromFirestore(doc));
      });

      return eventos;
    } catch (error) {
      console.error('Error al obtener eventos por estado:', error);
      throw new Error(`Error al obtener eventos: ${error.message}`);
    }
  }

  /**
   * Obtener eventos activos (estado = 'active')
   */
  async getEventosActivos() {
    return this.getByEstado('active');
  }

  /**
   * Obtener todos los eventos (con límite)
   */
  async getAll(limit = 50) {
    try {
      const q = query(
        this.collectionRef,
        orderBy('createdAt', 'desc'),
        limit(limit)
      );
      
      const querySnapshot = await getDocs(q);
      const eventos = [];

      querySnapshot.forEach((doc) => {
        eventos.push(Evento.fromFirestore(doc));
      });

      return eventos;
    } catch (error) {
      console.error('Error al obtener todos los eventos:', error);
      throw new Error(`Error al obtener eventos: ${error.message}`);
    }
  }

  /**
   * Actualizar un evento existente
   */
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

      // Asegurar que las fechas sean Timestamps
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

  /**
   * Actualizar el estado de un evento
   */
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

  /**
   * Agregar un invitado al evento
   */
  async agregarInvitado(eventoId, invitado) {
    try {
      if (!eventoId) {
        throw new Error('Se requiere el ID del evento');
      }

      const evento = await this.getById(eventoId);
      if (!evento) {
        throw new Error('Evento no encontrado');
      }

      // Verificar si el invitado ya existe (por email)
      const existe = evento.invitados.some(i => i.email === invitado.email);
      if (existe) {
        throw new Error('El invitado ya está registrado en este evento');
      }

      // Agregar nuevo invitado con estado pendiente
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

  /**
   * Eliminar un invitado del evento
   */
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

  /**
   * Eliminar un evento
   */
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

  /**
   * Buscar eventos por nombre
   */
  async searchByNombre(nombre) {
    try {
      if (!nombre || nombre.length < 2) {
        return [];
      }

      // Firestore no soporta búsqueda parcial directamente
      // Esta es una implementación básica que busca coincidencias exactas de prefijo
      const q = query(
        this.collectionRef,
        where('nombre', '>=', nombre),
        where('nombre', '<=', nombre + '\uf8ff'),
        orderBy('nombre')
      );

      const querySnapshot = await getDocs(q);
      const eventos = [];

      querySnapshot.forEach((doc) => {
        eventos.push(Evento.fromFirestore(doc));
      });

      return eventos;
    } catch (error) {
      console.error('Error al buscar eventos:', error);
      return [];
    }
  }

  /**
   * Verificar si existe un evento por código de acceso
   */
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

  /**
   * Obtener estadísticas de eventos para un usuario
   */
  async getEstadisticas(uid) {
    try {
      const eventos = await this.getByCreador(uid);
      
      const estadisticas = {
        total: eventos.length,
        activos: eventos.filter(e => e.estado === 'active').length,
        completados: eventos.filter(e => e.estado === 'completed').length,
        cancelados: eventos.filter(e => e.estado === 'cancelled').length,
        pendientes: eventos.filter(e => e.estado === 'pending').length,
        totalInvitados: eventos.reduce((total, e) => total + e.invitados.length, 0),
        confirmados: eventos.reduce((total, e) => total + e.getTotalInvitadosConfirmados(), 0)
      };

      return estadisticas;
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      return null;
    }
  }
}

// Exportar una instancia única del repositorio
export const eventoRepository = new EventoRepository();