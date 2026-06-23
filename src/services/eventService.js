// src/services/eventService.js
import { Evento } from '../classes/eventClass.js';
import { eventoRepository } from '../repositories/eventRepository.js';

class EventoService {
  constructor() {
    this.usuarioActual = null;
  }

  /**
   * Establecer el usuario actual para asociarlo a los eventos
   */
  setUsuarioActual(usuario) {
    this.usuarioActual = usuario;
  }

  /**
   * Crear un nuevo evento
   */
  async crearEvento(eventoData) {
    try {
      // Validaciones de negocio
      if (!eventoData.nombre || eventoData.nombre.trim().length === 0) {
        throw new Error('El nombre del evento es requerido');
      }

      if (eventoData.nombre.length < 3) {
        throw new Error('El nombre del evento debe tener al menos 3 caracteres');
      }

      if (!eventoData.paquete) {
        throw new Error('Debes seleccionar un paquete para el evento');
      }

      // Validar que el paquete sea válido
      const paquetesValidos = ['basico', 'estandar', 'premium', 'empresarial'];
      if (!paquetesValidos.includes(eventoData.paquete)) {
        throw new Error('Paquete no válido');
      }

      // Obtener detalles del paquete
      const paqueteDetalles = this.getPaqueteDetalles(eventoData.paquete);

      // Crear la entidad Evento
      const evento = new Evento({
        nombre: eventoData.nombre.trim(),
        paquete: eventoData.paquete,
        paqueteDetalles: paqueteDetalles,
        creadoPor: this.usuarioActual?.uid || 'usuario-anonimo',
        creadoPorEmail: this.usuarioActual?.email || '',
        fechaEvento: eventoData.fechaEvento || new Date(),
        descripcion: eventoData.descripcion || '',
        ubicacion: eventoData.ubicacion || '',
        invitados: eventoData.invitados || [],
        estado: 'pending'
      });

      // Guardar en Firestore
      const eventoGuardado = await eventoRepository.create(evento);
      
      return {
        success: true,
        evento: eventoGuardado,
        message: `Evento "${eventoGuardado.nombre}" creado exitosamente`,
        codigoAcceso: eventoGuardado.codigoAcceso
      };
    } catch (error) {
      console.error('Error en servicio de creación de evento:', error);
      return {
        success: false,
        error: error.message || 'Error al crear el evento'
      };
    }
  }

  /**
   * Obtener detalles de un paquete
   */
  getPaqueteDetalles(paquete) {
    const paquetesInfo = {
      basico: {
        nombre: "Paquete Básico",
        precio: "$00 MXN",
        caracteristicas: [
          "Capacidad para 50 invitados",
          "Capacidad de almacenamiento para 200 fotos",
          "Solo puedes subir fotos, dibujos y notas",
          "Duración: 24 horas después del evento",
        ]
      },
      estandar: {
        nombre: "Paquete Estándar",
        precio: "$00 MXN",
        caracteristicas: [
          "Capacidad para 100 invitados",
          "Galería de fotos premium",
          "Música en vivo (1 hora)",
          "Soporte prioritario",
          "Duración: 48 horas después del evento",
          "Video streaming básico"
        ]
      },
      premium: {
        nombre: "Paquete Premium",
        precio: "$00 MXN",
        caracteristicas: [
          "Capacidad para 150 invitados",
          "Galería de fotos + video",
          "Música en vivo (2 horas)",
          "Soporte 24/7",
          "Duración: 72 horas después del evento",
          "Video streaming HD",
          "Fotógrafo profesional"
        ]
      },
      empresarial: {
        nombre: "Paquete Empresarial",
        precio: "$00 MXN",
        caracteristicas: [
          "Capacidad para 200 invitados",
          "Cobertura multimedia completa",
          "Soporte dedicado",
          "Duración: 7 días después del evento",
          "Streaming 4K",
          "Marca personalizada"
        ]
      }
    };

    return paquetesInfo[paquete] || null;
  }

  /**
   * Obtener evento por ID
   */
  async getEventoPorId(id) {
    try {
      if (!id) {
        throw new Error('Se requiere el ID del evento');
      }

      const evento = await eventoRepository.getById(id);
      if (!evento) {
        throw new Error('Evento no encontrado');
      }

      return {
        success: true,
        evento: evento
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Obtener eventos del usuario actual
   */
  async getEventosDelUsuario() {
    try {
      if (!this.usuarioActual || !this.usuarioActual.uid) {
        const eventos = await eventoRepository.getAll();
        return {
          success: true,
          eventos: eventos
        };
      }

      const eventos = await eventoRepository.getByCreador(this.usuarioActual.uid);
      return {
        success: true,
        eventos: eventos
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Actualizar evento
   */
  async actualizarEvento(id, data) {
    try {
      if (!id) {
        throw new Error('Se requiere el ID del evento');
      }

      const eventoExistente = await eventoRepository.getById(id);
      if (!eventoExistente) {
        throw new Error('Evento no encontrado');
      }

      if (this.usuarioActual && this.usuarioActual.uid && 
          eventoExistente.creadoPor !== this.usuarioActual.uid) {
        throw new Error('No tienes permiso para modificar este evento');
      }

      const eventoActualizado = new Evento({
        ...eventoExistente,
        nombre: data.nombre || eventoExistente.nombre,
        descripcion: data.descripcion || eventoExistente.descripcion,
        ubicacion: data.ubicacion || eventoExistente.ubicacion,
        fechaEvento: data.fechaEvento || eventoExistente.fechaEvento,
        updatedAt: new Date()
      });

      await eventoRepository.update(eventoActualizado);

      return {
        success: true,
        evento: eventoActualizado,
        message: 'Evento actualizado exitosamente'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Cambiar estado del evento
   */
  async cambiarEstadoEvento(id, nuevoEstado) {
    try {
      if (!id) {
        throw new Error('Se requiere el ID del evento');
      }

      const estadosValidos = ['pending', 'active', 'completed', 'cancelled'];
      if (!estadosValidos.includes(nuevoEstado)) {
        throw new Error('Estado no válido');
      }

      await eventoRepository.updateEstado(id, nuevoEstado);

      return {
        success: true,
        message: `Estado del evento actualizado a: ${nuevoEstado}`
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Agregar invitado al evento
   */
  async agregarInvitado(eventoId, invitadoData) {
    try {
      if (!eventoId) {
        throw new Error('Se requiere el ID del evento');
      }

      if (!invitadoData.nombre || !invitadoData.email) {
        throw new Error('Nombre y email del invitado son requeridos');
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(invitadoData.email)) {
        throw new Error('Email inválido');
      }

      const evento = await eventoRepository.agregarInvitado(eventoId, invitadoData);

      return {
        success: true,
        evento: evento,
        message: 'Invitado agregado exitosamente'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Eliminar invitado del evento
   */
  async eliminarInvitado(eventoId, email) {
    try {
      if (!eventoId || !email) {
        throw new Error('Se requiere el ID del evento y el email del invitado');
      }

      const evento = await eventoRepository.eliminarInvitado(eventoId, email);

      return {
        success: true,
        evento: evento,
        message: 'Invitado eliminado exitosamente'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Obtener estadísticas de eventos
   */
  async getEstadisticas() {
    try {
      if (!this.usuarioActual || !this.usuarioActual.uid) {
        const eventos = await eventoRepository.getAll();
        const estadisticas = {
          total: eventos.length,
          activos: eventos.filter(e => e.estado === 'active').length,
          completados: eventos.filter(e => e.estado === 'completed').length,
          cancelados: eventos.filter(e => e.estado === 'cancelled').length,
          pendientes: eventos.filter(e => e.estado === 'pending').length
        };
        return {
          success: true,
          estadisticas: estadisticas
        };
      }

      const estadisticas = await eventoRepository.getEstadisticas(this.usuarioActual.uid);
      return {
        success: true,
        estadisticas: estadisticas
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Buscar eventos por código de acceso
   */
  async buscarPorCodigo(codigo) {
    try {
      if (!codigo) {
        throw new Error('Se requiere un código de acceso');
      }

      const evento = await eventoRepository.getByCodigoAcceso(codigo);
      if (!evento) {
        return {
          success: false,
          error: 'No se encontró un evento con este código'
        };
      }

      return {
        success: true,
        evento: evento
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

// ✅ EXPORTACIÓN CORRECTA - Exportar una instancia del servicio
export const eventService = new EventoService();

// También exportamos la clase por si se necesita
export { EventoService };