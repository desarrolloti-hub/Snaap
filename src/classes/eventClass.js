// src/classes/eventClass.js
export class Evento {
  constructor({
    id = null,
    nombre = '',
    paquete = '',
    paqueteDetalles = null,
    creadoPor = null,
    creadoPorEmail = null,
    creadoPorNombre = null,  // 🔥 NUEVO
    fechaEvento = null,
    estado = 'pending',
    invitados = [],
    createdAt = null,
    updatedAt = null,
    codigoAcceso = null,
    descripcion = '',
    ubicacion = '',
    fechaLimite = null,
    // 🔥 NUEVOS CAMPOS
    attendees = 0,
    uploadedPhotos = 0,
    tipo = '',
    imagenUrl = ''
  } = {}) {
    this.id = id;
    this.nombre = nombre;
    this.paquete = paquete;
    this.paqueteDetalles = paqueteDetalles;
    this.creadoPor = creadoPor;
    this.creadoPorEmail = creadoPorEmail;
    this.creadoPorNombre = creadoPorNombre;
    this.fechaEvento = fechaEvento || new Date();
    this.estado = estado;
    this.invitados = invitados || [];
    this.createdAt = createdAt || new Date();
    this.updatedAt = updatedAt || new Date();
    this.codigoAcceso = codigoAcceso || this.generarCodigoAcceso();
    this.descripcion = descripcion;
    this.ubicacion = ubicacion;
    this.fechaLimite = fechaLimite || this.calcularFechaLimite(paquete);
    // 🔥 NUEVOS CAMPOS
    this.attendees = attendees || 0;
    this.uploadedPhotos = uploadedPhotos || 0;
    this.tipo = tipo || '';
    this.imagenUrl = imagenUrl || '';
  }

  generarCodigoAcceso() {
    const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let codigo = '';
    for (let i = 0; i < 8; i++) {
      codigo += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
    }
    return codigo;
  }

  calcularFechaLimite(paquete) {
    const ahora = new Date();
    let dias = 1;
    
    switch(paquete) {
      case 'basico': dias = 1; break;
      case 'estandar': dias = 2; break;
      case 'premium': dias = 3; break;
      case 'empresarial': dias = 7; break;
      default: dias = 1;
    }
    
    const fechaLimite = new Date(ahora);
    fechaLimite.setDate(fechaLimite.getDate() + dias);
    return fechaLimite;
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
      estado: this.estado,
      invitados: this.invitados,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      codigoAcceso: this.codigoAcceso,
      descripcion: this.descripcion,
      ubicacion: this.ubicacion,
      fechaLimite: this.fechaLimite,
      // 🔥 NUEVOS CAMPOS
      attendees: this.attendees,
      uploadedPhotos: this.uploadedPhotos,
      tipo: this.tipo,
      imagenUrl: this.imagenUrl
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
      fechaLimite: data.fechaLimite?.toDate?.() || data.fechaLimite
    });
  }

  isValid() {
    return this.nombre && 
           this.nombre.length > 0 && 
           this.paquete && 
           this.paquete.length > 0;
  }

  getPaqueteInfo() {
    if (this.paqueteDetalles) {
      return this.paqueteDetalles;
    }
    
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
    
    return paquetesInfo[this.paquete] || null;
  }

  getInvitadosActivos() {
    return this.invitados.filter(invitado => invitado.estado !== 'rechazado');
  }

  getTotalInvitadosConfirmados() {
    return this.invitados.filter(invitado => invitado.estado === 'confirmado').length;
  }

  isActive() {
    return this.estado === 'active';
  }

  isExpired() {
    if (!this.fechaLimite) return false;
    return new Date() > new Date(this.fechaLimite);
  }
}