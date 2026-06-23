// src/services/UsuarioService.js
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  sendEmailVerification,
  updateProfile,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { auth } from '../config/firebaseConfig.js';
import { Usuario } from '../classes/userClass.js';
import { usuarioRepository } from '../repositories/userRepository.js';

class UsuarioService {
  constructor() {
    this.googleProvider = new GoogleAuthProvider();
    this.currentUser = null;
    this.authStateListeners = [];
  }

  /**
   * Registrar un nuevo usuario con email y contraseña
   */
  async registrarConEmail(email, password, nombre) {
    try {
      // Validaciones de negocio
      if (!email || !password || !nombre) {
        throw new Error('Todos los campos son requeridos');
      }

      if (password.length < 6) {
        throw new Error('La contraseña debe tener al menos 6 caracteres');
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error('Correo electrónico inválido');
      }

      // Crear usuario en Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // Actualizar perfil en Auth
      await updateProfile(firebaseUser, {
        displayName: nombre
      });

      // Crear entidad Usuario
      const usuario = new Usuario({
        uid: firebaseUser.uid,
        nombre: nombre,
        email: email,
        provider: 'email',
        emailVerified: firebaseUser.emailVerified,
        photoURL: firebaseUser.photoURL || null,
        createdAt: new Date()
      });

      // Guardar en Firestore
      await usuarioRepository.create(usuario);

      // Enviar email de verificación
      await sendEmailVerification(firebaseUser);

      // Actualizar usuario actual
      this.currentUser = usuario;

      return {
        success: true,
        user: usuario,
        message: 'Usuario registrado exitosamente. Verifica tu email.'
      };
    } catch (error) {
      console.error('Error en registro de usuario:', error);
      
      // Manejar errores específicos de Firebase
      let mensaje = 'Error al registrar usuario';
      if (error.code === 'auth/email-already-in-use') {
        mensaje = 'El correo electrónico ya está registrado';
      } else if (error.code === 'auth/invalid-email') {
        mensaje = 'Correo electrónico inválido';
      } else if (error.code === 'auth/weak-password') {
        mensaje = 'La contraseña es muy débil';
      } else {
        mensaje = error.message || 'Error al registrar usuario';
      }

      return {
        success: false,
        error: mensaje
      };
    }
  }

  /**
   * Iniciar sesión con email y contraseña
   */
  async loginConEmail(email, password) {
    try {
      if (!email || !password) {
        throw new Error('Email y contraseña son requeridos');
      }

      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // Verificar si el usuario existe en Firestore
      let usuario = await usuarioRepository.getByUid(firebaseUser.uid);

      // Si no existe en Firestore, crearlo (por si se registró directamente en Auth)
      if (!usuario) {
        usuario = new Usuario({
          uid: firebaseUser.uid,
          nombre: firebaseUser.displayName || email.split('@')[0],
          email: firebaseUser.email,
          provider: 'email',
          emailVerified: firebaseUser.emailVerified,
          photoURL: firebaseUser.photoURL
        });
        await usuarioRepository.create(usuario);
      }

      this.currentUser = usuario;
      
      return {
        success: true,
        user: usuario,
        message: 'Inicio de sesión exitoso'
      };
    } catch (error) {
      console.error('Error en login:', error);
      
      let mensaje = 'Error al iniciar sesión';
      if (error.code === 'auth/user-not-found') {
        mensaje = 'Usuario no encontrado';
      } else if (error.code === 'auth/wrong-password') {
        mensaje = 'Contraseña incorrecta';
      } else if (error.code === 'auth/invalid-email') {
        mensaje = 'Correo electrónico inválido';
      } else if (error.code === 'auth/user-disabled') {
        mensaje = 'Usuario deshabilitado';
      } else {
        mensaje = error.message || 'Error al iniciar sesión';
      }

      return {
        success: false,
        error: mensaje
      };
    }
  }

  /**
   * Iniciar sesión con Google
   */
  async loginConGoogle() {
    try {
      const result = await signInWithPopup(auth, this.googleProvider);
      const firebaseUser = result.user;

      // Verificar si el usuario ya existe en Firestore
      let usuario = await usuarioRepository.getByUid(firebaseUser.uid);

      // Si no existe, crearlo
      if (!usuario) {
        usuario = new Usuario({
          uid: firebaseUser.uid,
          nombre: firebaseUser.displayName || 'Usuario Google',
          email: firebaseUser.email,
          provider: 'google',
          emailVerified: firebaseUser.emailVerified,
          photoURL: firebaseUser.photoURL || null,
          createdAt: new Date()
        });
        await usuarioRepository.create(usuario);
      }

      this.currentUser = usuario;

      return {
        success: true,
        user: usuario,
        message: 'Inicio de sesión con Google exitoso'
      };
    } catch (error) {
      console.error('Error en login con Google:', error);
      
      let mensaje = 'Error al iniciar sesión con Google';
      if (error.code === 'auth/popup-closed-by-user') {
        mensaje = 'Ventana de Google cerrada';
      } else if (error.code === 'auth/account-exists-with-different-credential') {
        mensaje = 'Ya existe una cuenta con este email usando otro método';
      } else {
        mensaje = error.message || 'Error al iniciar sesión con Google';
      }

      return {
        success: false,
        error: mensaje
      };
    }
  }

  /**
   * Cerrar sesión
   */
  async logout() {
    try {
      await signOut(auth);
      this.currentUser = null;
      return {
        success: true,
        message: 'Sesión cerrada exitosamente'
      };
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      return {
        success: false,
        error: error.message || 'Error al cerrar sesión'
      };
    }
  }

  /**
   * Obtener usuario actual
   */
  getCurrentUser() {
    return this.currentUser;
  }

  /**
   * Verificar si el usuario está autenticado
   */
  isAuthenticated() {
    return this.currentUser !== null;
  }

  /**
   * Escuchar cambios en el estado de autenticación
   */
  onAuthStateChanged(callback) {
    this.authStateListeners.push(callback);
    
    return onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Usuario autenticado
        try {
          let usuario = await usuarioRepository.getByUid(firebaseUser.uid);
          if (!usuario) {
            // Crear usuario si no existe en Firestore
            usuario = new Usuario({
              uid: firebaseUser.uid,
              nombre: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Usuario',
              email: firebaseUser.email,
              provider: firebaseUser.providerData[0]?.providerId || 'email',
              emailVerified: firebaseUser.emailVerified,
              photoURL: firebaseUser.photoURL || null
            });
            await usuarioRepository.create(usuario);
          }
          this.currentUser = usuario;
          callback({ user: usuario, authenticated: true });
        } catch (error) {
          console.error('Error al obtener usuario de Firestore:', error);
          callback({ user: null, authenticated: false, error: error.message });
        }
      } else {
        // Usuario no autenticado
        this.currentUser = null;
        callback({ user: null, authenticated: false });
      }
    });
  }

  /**
   * Verificar si el email está verificado
   */
  async verificarEmail() {
    try {
      const firebaseUser = auth.currentUser;
      if (firebaseUser) {
        await firebaseUser.reload();
        return firebaseUser.emailVerified;
      }
      return false;
    } catch (error) {
      console.error('Error al verificar email:', error);
      return false;
    }
  }

  /**
   * Enviar email de verificación
   */
  async enviarVerificacionEmail() {
    try {
      const firebaseUser = auth.currentUser;
      if (firebaseUser) {
        await sendEmailVerification(firebaseUser);
        return { success: true, message: 'Email de verificación enviado' };
      }
      return { success: false, error: 'No hay usuario autenticado' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Obtener usuario por ID
   */
  async getUsuarioPorId(id) {
    return await usuarioRepository.getById(id);
  }

  /**
   * Actualizar perfil de usuario
   */
  async actualizarPerfil(usuarioData) {
    try {
      if (!this.currentUser) {
        throw new Error('No hay usuario autenticado');
      }

      const usuarioActual = this.currentUser;
      const usuarioActualizado = new Usuario({
        ...usuarioActual,
        ...usuarioData,
        updatedAt: new Date()
      });

      await usuarioRepository.update(usuarioActualizado);
      
      // Actualizar también en Firebase Auth si cambió el nombre
      const firebaseUser = auth.currentUser;
      if (firebaseUser && usuarioData.nombre) {
        await updateProfile(firebaseUser, {
          displayName: usuarioData.nombre
        });
      }

      this.currentUser = usuarioActualizado;
      
      return {
        success: true,
        user: usuarioActualizado,
        message: 'Perfil actualizado exitosamente'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Error al actualizar perfil'
      };
    }
  }
}

// Exportar una instancia única del servicio
export const usuarioService = new UsuarioService();