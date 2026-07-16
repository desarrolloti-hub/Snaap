// src/classes/userClass.js
export class User {
  constructor({
    id = null,
    uid = null,
    username = '',
    email = '',
    password = '',
    phone = '',
    role = 'user',
    status = 'active',
    createdAt = null,
    updatedAt = null,
    lastLogin = null,
    emailVerified = false,
    photoURL = null,
    eventsAttended = 0,
    eventsCreated = 0,
    bio = '',
    // 🔥 CAMPOS PARA PERFIL
    company = '',
    website = '',
    specialty = '',
    experience = 0,
    // 🔥 NUEVOS CAMPOS PARA USUARIO
    location = '',
    savedEvents = [],
    events = [],
    images = []
  } = {}) {
    this.id = id;
    this.uid = uid || id;
    this.username = username;
    this.email = email;
    this.password = password;
    this.phone = phone;
    this.role = role;
    this.status = status;
    this.createdAt = createdAt || new Date();
    this.updatedAt = updatedAt || new Date();
    this.lastLogin = lastLogin || null;
    this.emailVerified = emailVerified || false;
    this.photoURL = photoURL || null;
    this.eventsAttended = eventsAttended || 0;
    this.eventsCreated = eventsCreated || 0;
    this.bio = bio || '';
    // 🔥 CAMPOS DE PERFIL
    this.company = company || '';
    this.website = website || '';
    this.specialty = specialty || '';
    this.experience = experience || 0;
    // 🔥 NUEVOS CAMPOS
    this.location = location || '';
    this.savedEvents = savedEvents || [];
    this.events = events || [];
    this.images = images || [];
  }

  toFirestore() {
    return {
      uid: this.uid,
      username: this.username,
      email: this.email,
      phone: this.phone,
      role: this.role,
      status: this.status,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      lastLogin: this.lastLogin,
      emailVerified: this.emailVerified,
      photoURL: this.photoURL,
      eventsAttended: this.eventsAttended,
      eventsCreated: this.eventsCreated,
      bio: this.bio,
      // 🔥 CAMPOS DE PERFIL
      company: this.company,
      website: this.website,
      specialty: this.specialty,
      experience: this.experience,
      // 🔥 NUEVOS CAMPOS
      location: this.location,
      savedEvents: this.savedEvents,
      events: this.events,
      images: this.images
    };
  }

  static fromFirestore(doc) {
    const data = doc.data();
    return new User({
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate?.() || data.createdAt,
      updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
      lastLogin: data.lastLogin?.toDate?.() || data.lastLogin,
      savedEvents: data.savedEvents || [],
      events: data.events || [],
      images: data.images || []
    });
  }

  isValid() {
    return this.username && this.username.length >= 3 && this.email && this.email.length > 0;
  }

  isValidEmail() {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(this.email);
  }

  getDisplayName() {
    return this.username || this.email?.split('@')[0] || 'Usuario';
  }

  isActive() {
    return this.status === 'active';
  }

  isSuspended() {
    return this.status === 'suspended';
  }

  isAdmin() {
    return this.role === 'sysadmin';
  }

  isHost() {
    return this.role === 'host';
  }

  isUser() {
    return this.role === 'user';
  }

  incrementEventsAttended() {
    this.eventsAttended += 1;
    this.updatedAt = new Date();
  }

  incrementEventsCreated() {
    this.eventsCreated += 1;
    this.updatedAt = new Date();
  }

  updateLastLogin() {
    this.lastLogin = new Date();
    this.updatedAt = new Date();
  }

  // 🔥 NUEVOS MÉTODOS
  addSavedEvent(eventId) {
    if (!this.savedEvents.includes(eventId)) {
      this.savedEvents.push(eventId);
      this.updatedAt = new Date();
    }
  }

  removeSavedEvent(eventId) {
    this.savedEvents = this.savedEvents.filter(id => id !== eventId);
    this.updatedAt = new Date();
  }

  isEventSaved(eventId) {
    return this.savedEvents.includes(eventId);
  }

  addEvent(eventId) {
    if (!this.events.includes(eventId)) {
      this.events.push(eventId);
      this.updatedAt = new Date();
    }
  }

  removeEvent(eventId) {
    this.events = this.events.filter(id => id !== eventId);
    this.updatedAt = new Date();
  }

  hasEvent(eventId) {
    return this.events.includes(eventId);
  }

  // 🔥 MÉTODOS PARA IMÁGENES
  addImage(imageData) {
    this.images.push(imageData);
    this.updatedAt = new Date();
  }

  removeImage(index) {
    this.images.splice(index, 1);
    this.updatedAt = new Date();
  }

  getImages() {
    return this.images || [];
  }

  getImagesByType(type) {
    return this.images.filter(img => img.type === type);
  }
}