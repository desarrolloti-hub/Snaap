// src/services/hostService.js
import { User } from '../classes/userClass.js';
import { userRepository } from '../repositories/userRepository.js';
import { 
  createUserWithEmailAndPassword,
  sendEmailVerification,
  updateProfile,
  deleteUser
} from 'firebase/auth';
import { auth } from '../config/firebaseConfig.js';

class HostService {
  constructor() {
    this.usuarioActual = null;
  }

  /**
   * Crear un nuevo host (con autenticación en Firebase)
   */
  async crearHost(hostData) {
    try {
      // Validaciones
      if (!hostData.username || hostData.username.length < 3) {
        throw new Error('El nombre de usuario debe tener al menos 3 caracteres');
      }

      if (!hostData.email || !this.isValidEmail(hostData.email)) {
        throw new Error('El email no es válido');
      }

      if (!hostData.password || hostData.password.length < 6) {
        throw new Error('La contraseña debe tener al menos 6 caracteres');
      }

      // Verificar si el usuario ya existe
      const existingUser = await userRepository.getByEmail(hostData.email);
      if (existingUser) {
        throw new Error('Ya existe un usuario con este email');
      }

      // Crear usuario en Firebase Auth
      let firebaseUser;
      try {
        const userCredential = await createUserWithEmailAndPassword(
          auth, 
          hostData.email, 
          hostData.password
        );
        firebaseUser = userCredential.user;

        // Actualizar perfil en Auth
        await updateProfile(firebaseUser, {
          displayName: hostData.username
        });

        // Enviar email de verificación
        await sendEmailVerification(firebaseUser);
      } catch (authError) {
        console.error('Error en autenticación:', authError);
        throw new Error(`Error al crear usuario: ${authError.message}`);
      }

      // Crear usuario en Firestore con rol 'host'
      const newHost = new User({
        uid: firebaseUser.uid,
        username: hostData.username,
        email: hostData.email,
        phone: hostData.phone || '',
        company: hostData.company || '',
        bio: hostData.bio || '',
        role: 'host',
        status: hostData.status || 'active',
        photoURL: firebaseUser.photoURL || null,
        emailVerified: firebaseUser.emailVerified || false,
        createdAt: new Date()
      });

      const hostGuardado = await userRepository.create(newHost);

      return {
        success: true,
        host: hostGuardado,
        message: `Host "${hostGuardado.username}" creado exitosamente`
      };
    } catch (error) {
      console.error('Error en servicio de creación de host:', error);
      return {
        success: false,
        error: error.message || 'Error al crear el host'
      };
    }
  }

  /**
   * Validar formato de email
   */
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Obtener todos los hosts
   */
  async obtenerTodosLosHosts() {
    try {
      const allUsers = await userRepository.getAllUsers();
      const hosts = allUsers.filter(u => u.role === 'host');
      return {
        success: true,
        hosts: hosts
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Obtener host por ID
   */
  async obtenerHostPorId(id) {
    try {
      const host = await userRepository.getById(id);
      if (!host || host.role !== 'host') {
        throw new Error('Host no encontrado');
      }
      return {
        success: true,
        host: host
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Actualizar host
   */
  async actualizarHost(id, data) {
    try {
      const host = await userRepository.getById(id);
      if (!host || host.role !== 'host') {
        throw new Error('Host no encontrado');
      }

      host.username = data.username || host.username;
      host.email = data.email || host.email;
      host.phone = data.phone || host.phone;
      host.company = data.company || host.company;
      host.status = data.status || host.status;
      host.bio = data.bio || host.bio;
      host.updatedAt = new Date();

      await userRepository.update(host);

      return {
        success: true,
        host: host,
        message: 'Host actualizado exitosamente'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Eliminar host
   */
  async eliminarHost(id) {
    try {
      const host = await userRepository.getById(id);
      if (!host || host.role !== 'host') {
        throw new Error('Host no encontrado');
      }

      await userRepository.delete(id);

      return {
        success: true,
        message: 'Host eliminado exitosamente'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

export const hostService = new HostService();