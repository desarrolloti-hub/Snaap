// src/repositories/hostRepository.js
import { userRepository } from './userRepository.js';

class HostRepository {
    /**
     * Obtener todos los hosts (usuarios con rol 'host')
     */
    async getAll() {
        try {
            const allUsers = await userRepository.getAllUsers();
            return allUsers.filter(u => u.role === 'host');
        } catch (error) {
            console.error('Error al obtener hosts:', error);
            throw error;
        }
    }

    /**
     * Obtener host por ID
     */
    async getById(id) {
        try {
            const user = await userRepository.getById(id);
            if (user && user.role === 'host') {
                return user;
            }
            return null;
        } catch (error) {
            console.error('Error al obtener host por ID:', error);
            throw error;
        }
    }

    /**
     * Obtener host por UID
     */
    async getByUid(uid) {
        try {
            const user = await userRepository.getByUid(uid);
            if (user && user.role === 'host') {
                return user;
            }
            return null;
        } catch (error) {
            console.error('Error al obtener host por UID:', error);
            throw error;
        }
    }

    /**
     * Crear un host (usuario con rol 'host')
     */
    async create(hostData) {
        try {
            // Asegurar que el rol sea 'host'
            hostData.role = 'host';
            return await userRepository.create(hostData);
        } catch (error) {
            console.error('Error al crear host:', error);
            throw error;
        }
    }

    /**
     * Actualizar host
     */
    async update(host) {
        try {
            if (host.role !== 'host') {
                throw new Error('El usuario no es un host');
            }
            return await userRepository.update(host);
        } catch (error) {
            console.error('Error al actualizar host:', error);
            throw error;
        }
    }

    /**
     * Eliminar host
     */
    async delete(id) {
        try {
            return await userRepository.delete(id);
        } catch (error) {
            console.error('Error al eliminar host:', error);
            throw error;
        }
    }
}

export const hostRepository = new HostRepository();