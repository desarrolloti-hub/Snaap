// src/services/userService.js
import { User } from '../classes/userClass.js';
import { userRepository } from '../repositories/userRepository.js';
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  sendEmailVerification,
  updateProfile,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged
} from 'firebase/auth';
import { auth } from '../config/firebaseConfig.js';

class UserService {
  constructor() {
    this.usuarioActual = null;
    this.googleProvider = new GoogleAuthProvider();
  }

  // ============================================
  // 🔐 REGISTRO CON EMAIL
  // ============================================
  async registrarUsuario(email, password, username) {
    try {
      // Validaciones
      if (!username || username.length < 3) {
        throw new Error('El nombre debe tener al menos 3 caracteres');
      }
      if (!email || !this.isValidEmail(email)) {
        throw new Error('Email inválido');
      }
      if (!password || password.length < 6) {
        throw new Error('La contraseña debe tener al menos 6 caracteres');
      }

      // Verificar si ya existe
      const existingUser = await userRepository.getByEmail(email);
      if (existingUser) {
        throw new Error('Ya existe un usuario con este email');
      }

      // Crear en Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // Actualizar perfil
      await updateProfile(firebaseUser, { displayName: username });

      // Enviar email de verificación
      await sendEmailVerification(firebaseUser);

      // 🔥 CREAR USUARIO CON ROL 'host'
      const user = new User({
        uid: firebaseUser.uid,
        username: username,
        email: email,
        role: 'host',
        status: 'active',
        photoURL: firebaseUser.photoURL || null,
        emailVerified: firebaseUser.emailVerified || false,
        createdAt: new Date()
      });

      await userRepository.create(user);
      this.usuarioActual = user;
      localStorage.setItem('snaap_current_user', JSON.stringify(user));

      return {
        success: true,
        user: user,
        role: 'host',
        message: `✅ Usuario "${username}" registrado exitosamente. Verifica tu email.`
      };
    } catch (error) {
      console.error('Error en registro:', error);
      let mensaje = error.message;
      if (error.code === 'auth/email-already-in-use') {
        mensaje = 'El email ya está registrado';
      } else if (error.code === 'auth/weak-password') {
        mensaje = 'La contraseña es muy débil';
      } else if (error.code === 'auth/invalid-email') {
        mensaje = 'Email inválido';
      }
      return { success: false, error: mensaje };
    }
  }

  // ============================================
  // 🔐 LOGIN CON EMAIL
  // ============================================
  async loginUsuario(email, password) {
    try {
      if (!email || !password) {
        throw new Error('Email y contraseña son requeridos');
      }

      // Autenticar en Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // Obtener de Firestore
      let user = await userRepository.getByUid(firebaseUser.uid);

      // Si no existe en Firestore, crearlo con rol 'host'
      if (!user) {
        user = new User({
          uid: firebaseUser.uid,
          username: firebaseUser.displayName || email.split('@')[0],
          email: firebaseUser.email,
          role: 'host',
          status: 'active',
          photoURL: firebaseUser.photoURL || null,
          emailVerified: firebaseUser.emailVerified || false,
          createdAt: new Date()
        });
        await userRepository.create(user);
      }

      // Actualizar último login
      user.updateLastLogin();
      await userRepository.update(user);

      // Guardar en memoria
      this.usuarioActual = user;
      localStorage.setItem('snaap_current_user', JSON.stringify(user));

      return {
        success: true,
        user: user,
        message: `✅ ¡Bienvenido ${user.username}!`,
        role: user.role
      };
    } catch (error) {
      console.error('Error en login:', error);
      let mensaje = 'Error al iniciar sesión';
      if (error.code === 'auth/user-not-found') mensaje = 'Usuario no encontrado';
      else if (error.code === 'auth/wrong-password') mensaje = 'Contraseña incorrecta';
      else if (error.code === 'auth/invalid-email') mensaje = 'Email inválido';
      else if (error.code === 'auth/user-disabled') mensaje = 'Usuario deshabilitado';
      else if (error.code === 'auth/too-many-requests') mensaje = 'Demasiados intentos. Intenta más tarde';
      else mensaje = error.message || 'Error al iniciar sesión';
      return { success: false, error: mensaje };
    }
  }

  // ============================================
  // 🔐 LOGIN CON GOOGLE
  // ============================================
  async loginConGoogle() {
    try {
      const result = await signInWithPopup(auth, this.googleProvider);
      const firebaseUser = result.user;

      // Obtener de Firestore
      let user = await userRepository.getByUid(firebaseUser.uid);

      // Si no existe en Firestore, crearlo con rol 'host'
      if (!user) {
        user = new User({
          uid: firebaseUser.uid,
          username: firebaseUser.displayName || 'Usuario Google',
          email: firebaseUser.email,
          role: 'host',
          status: 'active',
          photoURL: firebaseUser.photoURL || null,
          emailVerified: firebaseUser.emailVerified || false,
          createdAt: new Date()
        });
        await userRepository.create(user);
      }

      // Actualizar último login
      user.updateLastLogin();
      await userRepository.update(user);

      // Guardar en memoria
      this.usuarioActual = user;
      localStorage.setItem('snaap_current_user', JSON.stringify(user));

      return {
        success: true,
        user: user,
        message: `✅ ¡Bienvenido ${user.username}!`,
        role: user.role
      };
    } catch (error) {
      console.error('Error en login con Google:', error);
      let mensaje = 'Error al iniciar sesión con Google';
      if (error.code === 'auth/popup-closed-by-user') {
        mensaje = 'Ventana de Google cerrada';
      } else if (error.code === 'auth/account-exists-with-different-credential') {
        mensaje = 'Ya existe una cuenta con este email usando otro método';
      }
      return { success: false, error: mensaje };
    }
  }

  // ============================================
  // 🔐 RECUPERAR CONTRASEÑA
  // ============================================
  async recuperarContrasena(email) {
    try {
      if (!email || !this.isValidEmail(email)) {
        throw new Error('Email inválido');
      }
      await sendPasswordResetEmail(auth, email);
      return {
        success: true,
        message: '📧 Se ha enviado un enlace de recuperación a tu email'
      };
    } catch (error) {
      console.error('Error en recuperación:', error);
      let mensaje = 'Error al enviar el enlace de recuperación';
      if (error.code === 'auth/user-not-found') {
        mensaje = 'No existe una cuenta con este email';
      }
      return { success: false, error: mensaje };
    }
  }

  // ============================================
  // 🚪 CERRAR SESIÓN
  // ============================================
  async logout() {
    try {
      await signOut(auth);
      this.usuarioActual = null;
      localStorage.removeItem('snaap_current_user');
      return { success: true, message: 'Sesión cerrada exitosamente' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // ============================================
  // 👤 USUARIO ACTUAL
  // ============================================
  getCurrentUser() {
    if (this.usuarioActual) return this.usuarioActual;
    const storedUser = localStorage.getItem('snaap_current_user');
    if (storedUser) {
      try {
        this.usuarioActual = JSON.parse(storedUser);
        return this.usuarioActual;
      } catch (e) {
        return null;
      }
    }
    return null;
  }

  isAuthenticated() {
    return this.getCurrentUser() !== null;
  }

  // ============================================
  // 🗺️ RUTAS POR ROL
  // ============================================
  getRedirectPath(role) {
    const routes = {
      'sysadmin': '/sysadmin/home',
      'host': '/host',
      'user': '/'
    };
    return routes[role] || '/';
  }

  // ============================================
  // ✅ VALIDACIONES
  // ============================================
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // ============================================
  // 📡 ESCUCHAR ESTADO DE AUTENTICACIÓN
  // ============================================
  onAuthStateChanged(callback) {
    return onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        let user = await userRepository.getByUid(firebaseUser.uid);
        if (!user) {
          user = new User({
            uid: firebaseUser.uid,
            username: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Usuario',
            email: firebaseUser.email,
            role: 'host',
            status: 'active',
            photoURL: firebaseUser.photoURL || null,
            emailVerified: firebaseUser.emailVerified || false
          });
          await userRepository.create(user);
        }
        this.usuarioActual = user;
        localStorage.setItem('snaap_current_user', JSON.stringify(user));
        callback({ user: user, authenticated: true });
      } else {
        this.usuarioActual = null;
        localStorage.removeItem('snaap_current_user');
        callback({ user: null, authenticated: false });
      }
    });
  }

  // ============================================
  // ✏️ ACTUALIZAR PERFIL DEL USUARIO
  // ============================================
  async actualizarPerfil(userData) {
    try {
      const user = this.getCurrentUser();
      if (!user) {
        throw new Error('No hay usuario autenticado');
      }

      // Obtener datos actuales de Firestore
      const userDoc = await userRepository.getByUid(user.uid);
      if (!userDoc) {
        throw new Error('Usuario no encontrado en Firestore');
      }

      // Actualizar campos permitidos
      userDoc.username = userData.username || userDoc.username;
      userDoc.phone = userData.phone || userDoc.phone;
      userDoc.bio = userData.bio || userDoc.bio;
      userDoc.company = userData.company || userDoc.company;
      userDoc.website = userData.website || userDoc.website;
      userDoc.specialty = userData.specialty || userDoc.specialty;
      userDoc.experience = userData.experience || userDoc.experience;
      userDoc.photoURL = userData.photoURL || userDoc.photoURL;
      userDoc.updatedAt = new Date();

      // Guardar en Firestore
      await userRepository.update(userDoc);

      // Actualizar usuario actual
      this.usuarioActual = userDoc;
      localStorage.setItem('snaap_current_user', JSON.stringify(userDoc));

      return {
        success: true,
        user: userDoc,
        message: 'Perfil actualizado exitosamente'
      };
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

export const userService = new UserService();