// src/services/eventService.js
import { Evento } from '../classes/eventClass.js';
import { eventoRepository } from '../repositories/eventRepository.js';

class EventoService {
  constructor() {
    this.usuarioActual = null;
  }

  setUsuarioActual(usuario) {
    this.usuarioActual = usuario;
  }

  // ============================================
  // 🔥 CREAR EVENTO
  // ============================================
  async crearEvento(eventoData) {
    try {
      if (!eventoData.nombre || eventoData.nombre.trim().length === 0) {
        throw new Error('El nombre del evento es requerido');
      }

      if (eventoData.nombre.length < 3) {
        throw new Error('El nombre del evento debe tener al menos 3 caracteres');
      }

      if (!eventoData.paquete) {
        throw new Error('Debes seleccionar un paquete para el evento');
      }

      const paquetesValidos = ['basico', 'estandar', 'premium', 'empresarial'];
      if (!paquetesValidos.includes(eventoData.paquete)) {
        throw new Error('Paquete no válido');
      }

      const paqueteDetalles = this.getPaqueteDetalles(eventoData.paquete);

      const usuario = this.usuarioActual || { uid: 'usuario-anonimo', email: '', username: 'Anónimo' };

      const evento = new Evento({
        nombre: eventoData.nombre.trim(),
        paquete: eventoData.paquete,
        paqueteDetalles: paqueteDetalles,
        creadoPor: eventoData.creadoPor || usuario.uid,
        creadoPorEmail: eventoData.creadoPorEmail || usuario.email || '',
        creadoPorNombre: eventoData.creadoPorNombre || usuario.username || 'Host',
        fechaEvento: eventoData.fechaEvento || new Date(),
        descripcion: eventoData.descripcion || '',
        ubicacion: eventoData.ubicacion || '',
        invitados: eventoData.invitados || [],
        estado: eventoData.estado || 'pending',
        attendees: eventoData.attendees || 0,
        uploadedPhotos: eventoData.uploadedPhotos || 0,
        tipo: eventoData.tipo || 'evento'
      });

      const eventoGuardado = await eventoRepository.create(evento);

      if (usuario.uid && usuario.uid !== 'usuario-anonimo') {
        await this.incrementarEventosUsuario(usuario.uid);
      }

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

  // ============================================
  // 🔥 OBTENER EVENTO POR ID
  // ============================================
  async obtenerEventoPorId(id) {
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
      console.error('Error al obtener evento por ID:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // ============================================
  // 🔥 OBTENER EVENTOS SEGÚN ROL
  // ============================================
  async obtenerEventosPorRol(uid, role) {
    try {
      console.log('🔍 Buscando eventos para UID:', uid, 'Rol:', role);

      if (role === 'sysadmin') {
        console.log('👑 Admin: obteniendo todos los eventos');
        const eventos = await eventoRepository.getAll();
        return {
          success: true,
          eventos: eventos
        };
      }

      if (role === 'host') {
        console.log('🎤 Host: obteniendo sus eventos');
        const eventos = await eventoRepository.getByCreador(uid);
        return {
          success: true,
          eventos: eventos
        };
      }

      console.log('👤 Usuario: sin acceso a eventos');
      return {
        success: true,
        eventos: []
      };
    } catch (error) {
      console.error('Error al obtener eventos por rol:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // ============================================
  // 🔥 OBTENER ESTADÍSTICAS PARA EL PERFIL
  // ============================================
  async obtenerEstadisticasPerfil(uid) {
    try {
      const result = await this.obtenerEventosPorUsuario(uid);
      if (!result.success) {
        throw new Error(result.error);
      }

      const eventos = result.eventos;

      const totalEventos = eventos.length;
      const totalInvitados = eventos.reduce((sum, e) => sum + (e.invitados?.length || 0), 0);
      const totalFotos = eventos.reduce((sum, e) => sum + (e.uploadedPhotos || 0), 0);
      const eventosActivos = eventos.filter(e => e.estado === 'active').length;
      const eventosCompletados = eventos.filter(e => e.estado === 'completed').length;
      const eventosPendientes = eventos.filter(e => e.estado === 'pending').length;

      return {
        success: true,
        estadisticas: {
          totalEventos,
          totalInvitados,
          totalFotos,
          eventosActivos,
          eventosCompletados,
          eventosPendientes
        },
        eventos: eventos
      };
    } catch (error) {
      console.error('Error al obtener estadísticas del perfil:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // ============================================
  // 🔥 INCREMENTAR CONTADOR DE EVENTOS
  // ============================================
  async incrementarEventosUsuario(uid) {
    try {
      const { userRepository } = await import('../repositories/userRepository.js');
      const user = await userRepository.getByUid(uid);
      if (user) {
        user.incrementEventsCreated();
        await userRepository.update(user);
        console.log(`✅ Eventos del usuario ${user.username} incrementado a ${user.eventsCreated}`);
      }
    } catch (error) {
      console.error('Error al incrementar eventos del usuario:', error);
    }
  }

  // ============================================
  // 🔥 OBTENER EVENTOS DE UN USUARIO
  // ============================================
  async obtenerEventosPorUsuario(uid) {
    try {
      if (!uid) {
        throw new Error('Se requiere el UID del usuario');
      }

      const eventos = await eventoRepository.getByCreador(uid);
      return {
        success: true,
        eventos: eventos
      };
    } catch (error) {
      console.error('Error al obtener eventos del usuario:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // ============================================
  // 🔥 OBTENER DETALLES DE UN PAQUETE
  // ============================================
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

  // ============================================
  // 🔥 ACTUALIZAR EVENTO
  // ============================================
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

  // ============================================
  // 🔥 CAMBIAR ESTADO DEL EVENTO
  // ============================================
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

  // ============================================
  // 🔥 AGREGAR INVITADO
  // ============================================
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

  // ============================================
  // 🔥 ELIMINAR INVITADO
  // ============================================
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

  // ============================================
  // 🔥 BUSCAR POR CÓDIGO DE ACCESO
  // ============================================
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

export const eventService = new EventoService();
export { EventoService };