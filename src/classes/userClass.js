// src/classes/Usuario.js
export class Usuario {
  constructor({
    id = null,
    nombre = '',
    email = '',
    provider = 'email',
    uid = null,
    createdAt = null,
    updatedAt = null,
    emailVerified = false,
    photoURL = null,
    role = 'user'
  } = {}) {
    this.id = id;
    this.nombre = nombre;
    this.email = email;
    this.provider = provider;
    this.uid = uid;
    this.createdAt = createdAt || new Date();
    this.updatedAt = updatedAt || new Date();
    this.emailVerified = emailVerified;
    this.photoURL = photoURL;
    this.role = role;
  }

  // Métodos de utilidad
  toFirestore() {
    return {
      nombre: this.nombre,
      email: this.email,
      provider: this.provider,
      uid: this.uid,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      emailVerified: this.emailVerified,
      photoURL: this.photoURL,
      role: this.role
    };
  }

  static fromFirestore(doc) {
    const data = doc.data();
    return new Usuario({
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate?.() || data.createdAt,
      updatedAt: data.updatedAt?.toDate?.() || data.updatedAt
    });
  }

  // Método para validar si el usuario está completo
  isValid() {
    return this.nombre && this.nombre.length > 0 && 
           this.email && this.email.length > 0;
  }

  // Método para obtener nombre para mostrar
  getDisplayName() {
    return this.nombre || this.email?.split('@')[0] || 'Usuario';
  }
}