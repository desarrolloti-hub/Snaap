// src/services/deviceService.js
import { deviceRepository } from '../repositories/deviceRepository.js';

class DeviceService {
  constructor() {
    this.currentDeviceId = null;
    this.currentEventId = null;
    this.currentUserName = null;
  }

  /**
   * Obtener o crear ID de dispositivo
   */
  getDeviceId() {
    let deviceId = localStorage.getItem('snaap_device_id');
    if (!deviceId) {
      deviceId = `device_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
      localStorage.setItem('snaap_device_id', deviceId);
    }
    this.currentDeviceId = deviceId;
    return deviceId;
  }

  /**
   * Verificar si el dispositivo ya está registrado en este evento
   */
  async checkDeviceExists(deviceId, eventId) {
    try {
      const result = await deviceRepository.getByDeviceAndEvent(deviceId, eventId);
      if (result) {
        this.currentUserName = result.userName;
        this.currentEventId = eventId;
        return result;
      }
      return null;
    } catch (error) {
      console.error('❌ Error al verificar dispositivo:', error);
      return null;
    }
  }

  /**
   * Registrar dispositivo con nombre de usuario
   */
  async registerDevice(deviceId, eventId, userName) {
    try {
      const result = await deviceRepository.upsert(deviceId, eventId, userName);
      if (result.success) {
        this.currentUserName = userName;
        this.currentEventId = eventId;
        localStorage.setItem('snaap_user_name', userName);
        localStorage.setItem('snaap_current_event', eventId);
      }
      return result;
    } catch (error) {
      console.error('❌ Error al registrar dispositivo:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Obtener el nombre del usuario actual
   */
  getCurrentUserName() {
    return this.currentUserName || localStorage.getItem('snaap_user_name') || null;
  }

  /**
   * Obtener usuarios de un evento (para host)
   */
  async getEventUsers(eventId) {
    try {
      return await deviceRepository.getUsersByEvent(eventId);
    } catch (error) {
      console.error('❌ Error al obtener usuarios del evento:', error);
      return [];
    }
  }

  /**
   * Validar nombre de usuario (máximo 15 caracteres)
   */
  validateUserName(name) {
    if (!name || name.trim().length === 0) {
      return { valid: false, error: 'Por favor ingresa tu nombre' };
    }
    if (name.trim().length < 2) {
      return { valid: false, error: 'El nombre debe tener al menos 2 caracteres' };
    }
    if (name.trim().length > 15) {
      return { valid: false, error: 'El nombre no puede tener más de 15 caracteres' };
    }
    return { valid: true, name: name.trim() };
  }
}

export const deviceService = new DeviceService();