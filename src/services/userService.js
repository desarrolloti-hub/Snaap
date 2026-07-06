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

  setUsuarioActual(user) {
    this.usuarioActual = user;
    if (user) {
      localStorage.setItem('snaap_current_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('snaap_current_user');
    }
  }

  // ============================================
  // 🔐 REGISTRO CON EMAIL
  // ============================================
  async registrarUsuario(email, password, username) {
    try {
      if (!username || username.length < 3) {
        throw new Error('El nombre debe tener al menos 3 caracteres');
      }
      if (!email || !this.isValidEmail(email)) {
        throw new Error('Email inválido');
      }
      if (!password || password.length < 6) {
        throw new Error('La contraseña debe tener al menos 6 caracteres');
      }

      const existingUser = await userRepository.getByEmail(email);
      if (existingUser) {
        throw new Error('Ya existe un usuario con este email');
      }

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      await updateProfile(firebaseUser, { displayName: username });
      await sendEmailVerification(firebaseUser);

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
      this.setUsuarioActual(user);

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
  // 🔐 CREAR USUARIO ADMIN
  // ============================================
  async crearUsuarioAdmin(userData) {
    try {
      if (!userData.username || userData.username.length < 3) {
        throw new Error('El nombre de usuario debe tener al menos 3 caracteres');
      }
      if (!userData.email || !this.isValidEmail(userData.email)) {
        throw new Error('El email no es válido');
      }
      if (!userData.password || userData.password.length < 6) {
        throw new Error('La contraseña debe tener al menos 6 caracteres');
      }

      const existingUser = await userRepository.getByEmail(userData.email);
      if (existingUser) {
        throw new Error('Ya existe un usuario con este email');
      }

      const userCredential = await createUserWithEmailAndPassword(auth, userData.email, userData.password);
      const firebaseUser = userCredential.user;

      await updateProfile(firebaseUser, { displayName: userData.username });
      await sendEmailVerification(firebaseUser);

      const user = new User({
        uid: firebaseUser.uid,
        username: userData.username,
        email: userData.email,
        phone: userData.phone || '',
        department: userData.department || '',
        notes: userData.notes || '',
        role: 'sysadmin',
        status: userData.status || 'active',
        photoURL: firebaseUser.photoURL || null,
        emailVerified: firebaseUser.emailVerified || false,
        createdAt: new Date()
      });

      await userRepository.create(user);
      this.setUsuarioActual(user);

      return {
        success: true,
        user: user,
        message: `Administrador "${user.username}" creado exitosamente`
      };
    } catch (error) {
      console.error('Error al crear administrador:', error);
      return {
        success: false,
        error: error.message || 'Error al crear el administrador'
      };
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

      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      let user = await userRepository.getByUid(firebaseUser.uid);

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

      if (user.status === 'inactive') {
        console.warn('⚠️ Cuenta inhabilitada:', user.username);
        await signOut(auth);
        throw new Error('❌ Tu cuenta ha sido inhabilitada por el administrador. Contacta con soporte.');
      }

      if (user.status === 'suspended') {
        console.warn('⚠️ Cuenta suspendida:', user.username);
        await signOut(auth);
        throw new Error('❌ Tu cuenta ha sido suspendida. Contacta con soporte.');
      }

      user.updateLastLogin();
      await userRepository.update(user);

      this.setUsuarioActual(user);

      return {
        success: true,
        user: user,
        message: `✅ ¡Bienvenido ${user.username}!`,
        role: user.role
      };
    } catch (error) {
      console.error('Error en login:', error);
      
      if (error.message && error.message.includes('inhabilitada')) {
        return {
          success: false,
          error: '❌ Tu cuenta ha sido inhabilitada por el administrador. Contacta con soporte.'
        };
      }
      
      if (error.message && error.message.includes('suspendida')) {
        return {
          success: false,
          error: '❌ Tu cuenta ha sido suspendida. Contacta con soporte.'
        };
      }

      let mensaje = 'Error al iniciar sesión';
      if (error.code === 'auth/user-not-found') mensaje = 'Usuario no encontrado';
      else if (error.code === 'auth/wrong-password') mensaje = 'Contraseña incorrecta';
      else if (error.code === 'auth/invalid-email') mensaje = 'Email inválido';
      else if (error.code === 'auth/user-disabled') mensaje = 'Usuario deshabilitado';
      else if (error.code === 'auth/too-many-requests') mensaje = 'Demasiados intentos. Intenta más tarde';
      else if (error.message) mensaje = error.message;
      
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

      let user = await userRepository.getByUid(firebaseUser.uid);

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

      if (user.status === 'inactive') {
        console.warn('⚠️ Cuenta inhabilitada:', user.username);
        await signOut(auth);
        throw new Error('❌ Tu cuenta ha sido inhabilitada por el administrador. Contacta con soporte.');
      }

      if (user.status === 'suspended') {
        console.warn('⚠️ Cuenta suspendida:', user.username);
        await signOut(auth);
        throw new Error('❌ Tu cuenta ha sido suspendida. Contacta con soporte.');
      }

      user.updateLastLogin();
      await userRepository.update(user);

      this.setUsuarioActual(user);

      return {
        success: true,
        user: user,
        message: `✅ ¡Bienvenido ${user.username}!`,
        role: user.role
      };
    } catch (error) {
      console.error('Error en login con Google:', error);
      
      if (error.message && error.message.includes('inhabilitada')) {
        return {
          success: false,
          error: '❌ Tu cuenta ha sido inhabilitada por el administrador. Contacta con soporte.'
        };
      }
      
      if (error.message && error.message.includes('suspendida')) {
        return {
          success: false,
          error: '❌ Tu cuenta ha sido suspendida. Contacta con soporte.'
        };
      }

      let mensaje = 'Error al iniciar sesión con Google';
      if (error.code === 'auth/popup-closed-by-user') {
        mensaje = 'Ventana de Google cerrada';
      } else if (error.code === 'auth/account-exists-with-different-credential') {
        mensaje = 'Ya existe una cuenta con este email usando otro método';
      } else if (error.message) {
        mensaje = error.message;
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
      this.setUsuarioActual(null);
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
        this.setUsuarioActual(user);
        callback({ user: user, authenticated: true });
      } else {
        this.setUsuarioActual(null);
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

      const userDoc = await userRepository.getByUid(user.uid);
      if (!userDoc) {
        throw new Error('Usuario no encontrado en Firestore');
      }

      if (userData.username !== undefined) userDoc.username = userData.username;
      if (userData.phone !== undefined) userDoc.phone = userData.phone;
      if (userData.bio !== undefined) userDoc.bio = userData.bio;
      if (userData.company !== undefined) userDoc.company = userData.company;
      if (userData.website !== undefined) userDoc.website = userData.website;
      if (userData.specialty !== undefined) userDoc.specialty = userData.specialty;
      if (userData.experience !== undefined) userDoc.experience = userData.experience;
      if (userData.photoURL !== undefined) userDoc.photoURL = userData.photoURL;
      if (userData.role !== undefined) userDoc.role = userData.role;
      if (userData.status !== undefined) userDoc.status = userData.status;
      if (userData.department !== undefined) userDoc.department = userData.department;
      if (userData.notes !== undefined) userDoc.notes = userData.notes;
      userDoc.updatedAt = new Date();

      await userRepository.update(userDoc);

      this.setUsuarioActual(userDoc);

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

// ✅ EXPORTACIÓN CORRECTA - Asegúrate de que esto esté al final
export const userService = new UserService();