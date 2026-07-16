// src/classes/eventClass.js
export class Evento {
  constructor({
    id = null,
    nombre = '',
    paquete = 'basico',
    paqueteDetalles = null,
    creadoPor = '',
    creadoPorEmail = '',
    creadoPorNombre = '',
    fechaEvento = null,
    descripcion = '',
    ubicacion = '',
    invitados = [],
    estado = 'pending',
    attendees = 0,
    uploadedPhotos = 0,
    tipo = 'evento',
    createdAt = null,
    updatedAt = null,
    fechaLimite = null,
    codigoAcceso = '',
    // 🔥 NUEVO CAMPO PARA IMÁGENES DEL EVENTO
    eventImages = []
  } = {}) {
    this.id = id;
    this.nombre = nombre;
    this.paquete = paquete;
    this.paqueteDetalles = paqueteDetalles || this.getPaqueteDetalles(paquete);
    this.creadoPor = creadoPor;
    this.creadoPorEmail = creadoPorEmail;
    this.creadoPorNombre = creadoPorNombre;
    this.fechaEvento = fechaEvento || new Date();
    this.descripcion = descripcion;
    this.ubicacion = ubicacion;
    this.invitados = invitados || [];
    this.estado = estado;
    this.attendees = attendees || 0;
    this.uploadedPhotos = uploadedPhotos || 0;
    this.tipo = tipo;
    this.createdAt = createdAt || new Date();
    this.updatedAt = updatedAt || new Date();
    this.fechaLimite = fechaLimite || this.calcularFechaLimite(paquete);
    this.codigoAcceso = codigoAcceso || this.generarCodigoAcceso();
    // 🔥 NUEVO CAMPO
    this.eventImages = eventImages || [];
  }

  toFirestore() {
    return {
      nombre: this.nombre,
      paquete: this.paquete,
      paqueteDetalles: this.paqueteDetalles,
      creadoPor: this.creadoPor,
      creadoPorEmail: this.creadoPorEmail,
      creadoPorNombre: this.creadoPorNombre,
      fechaEvento: this.fechaEvento,
      descripcion: this.descripcion,
      ubicacion: this.ubicacion,
      invitados: this.invitados,
      estado: this.estado,
      attendees: this.attendees,
      uploadedPhotos: this.uploadedPhotos,
      tipo: this.tipo,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      fechaLimite: this.fechaLimite,
      codigoAcceso: this.codigoAcceso,
      // 🔥 NUEVO CAMPO
      eventImages: this.eventImages
    };
  }

  static fromFirestore(doc) {
    const data = doc.data();
    return new Evento({
      id: doc.id,
      ...data,
      fechaEvento: data.fechaEvento?.toDate?.() || data.fechaEvento,
      createdAt: data.createdAt?.toDate?.() || data.createdAt,
      updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
      fechaLimite: data.fechaLimite?.toDate?.() || data.fechaLimite,
      eventImages: data.eventImages || []
    });
  }

  isValid() {
    return this.nombre && this.nombre.trim().length >= 3 && this.paquete;
  }

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

  calcularFechaLimite(paquete) {
    const fecha = new Date(this.fechaEvento || new Date());
    const dias = {
      basico: 1,
      estandar: 2,
      premium: 3,
      empresarial: 7
    };
    const diasAgregar = dias[paquete] || 1;
    fecha.setDate(fecha.getDate() + diasAgregar);
    return fecha;
  }

  generarCodigoAcceso() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let codigo = '';
    for (let i = 0; i < 8; i++) {
      codigo += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return codigo;
  }

  // ============================================
  // 🔥 MÉTODOS PARA IMÁGENES DEL EVENTO
  // ============================================
  addEventImage(imageData) {
    this.eventImages.push(imageData);
    this.updatedAt = new Date();
  }

  removeEventImage(index) {
    this.eventImages.splice(index, 1);
    this.updatedAt = new Date();
  }

  getEventImages() {
    return this.eventImages || [];
  }

  getEventImagesByType(type) {
    return this.eventImages.filter(img => img.type === type);
  }

  getTotalInvitadosConfirmados() {
    return this.invitados.filter(i => i.estado === 'confirmado').length;
  }

  isActive() {
    return this.estado === 'active';
  }

  isCompleted() {
    return this.estado === 'completed';
  }

  isPending() {
    return this.estado === 'pending';
  }

  isCancelled() {
    return this.estado === 'cancelled';
  }
}