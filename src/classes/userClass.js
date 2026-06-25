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
    // 🔥 NUEVOS CAMPOS PARA PERFIL
    company = '',
    website = '',
    specialty = '',
    experience = 0
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
    // 🔥 NUEVOS CAMPOS
    this.company = company || '';
    this.website = website || '';
    this.specialty = specialty || '';
    this.experience = experience || 0;
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
      // 🔥 NUEVOS CAMPOS
      company: this.company,
      website: this.website,
      specialty: this.specialty,
      experience: this.experience
    };
  }

  static fromFirestore(doc) {
    const data = doc.data();
    return new User({
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate?.() || data.createdAt,
      updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
      lastLogin: data.lastLogin?.toDate?.() || data.lastLogin
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
}