// src/services/qrService.js
import { qrRepository } from '../repositories/qrRepository.js';
import { QrCode } from '../classes/qrClass.js';

// Librería para generar QR (instalar: npm install qrcode)
import QRCode from 'qrcode';

class QrService {
    constructor() {
        this.usuarioActual = null;
    }

    setUsuarioActual(usuario) {
        this.usuarioActual = usuario;
    }

    // ============================================
    // 📤 GENERAR QR PARA UN EVENTO
    // ============================================
    async generarQr(eventoId, data = {}) {
        try {
            if (!this.usuarioActual) {
                throw new Error('Usuario no autenticado');
            }

            if (!eventoId) {
                throw new Error('ID del evento es requerido');
            }

            // 🔥 DATOS QUE CONTENDRÁ EL QR
            const qrData = {
                eventoId: eventoId,
                hostId: this.usuarioActual.uid,
                hostName: this.usuarioActual.displayName || this.usuarioActual.email,
                fechaGeneracion: new Date().toISOString(),
                ...data,
                // 🔥 URL para acceder al evento
                url: `${window.location.origin}/event/${eventoId}`,
                // 🔥 Token único para validación
                token: this.generateToken()
            };

            // 🔥 GENERAR QR COMO IMAGEN
            const qrImage = await QRCode.toDataURL(JSON.stringify(qrData), {
                errorCorrectionLevel: 'H',
                margin: 2,
                width: 300,
                color: {
                    dark: '#000000',
                    light: '#ffffff'
                }
            });

            // 🔥 GUARDAR EN FIRESTORE
            const qrCode = new QrCode({
                eventoId: eventoId,
                hostId: this.usuarioActual.uid,
                token: qrData.token,
                data: qrData,
                qrImage: qrImage,
                createdAt: new Date(),
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 días
                isActive: true,
                scans: 0
            });

            const saved = await qrRepository.create(qrCode);

            return {
                success: true,
                qrCode: saved,
                qrImage: qrImage,
                message: 'QR generado correctamente'
            };

        } catch (error) {
            console.error('❌ Error al generar QR:', error);
            return {
                success: false,
                error: error.message || 'Error al generar el QR'
            };
        }
    }

    // ============================================
    // 🔍 VALIDAR Y ESCANEAR QR
    // ============================================
    async escanearQr(token) {
        try {
            // 🔥 BUSCAR QR POR TOKEN
            const qrCode = await qrRepository.getByToken(token);
            
            if (!qrCode) {
                return {
                    success: false,
                    error: 'QR inválido o no encontrado'
                };
            }

            // 🔥 VERIFICAR SI ESTÁ ACTIVO
            if (!qrCode.isActive) {
                return {
                    success: false,
                    error: 'Este QR ya no está activo'
                };
            }

            // 🔥 VERIFICAR SI EXPIRÓ
            if (qrCode.expiresAt && new Date() > qrCode.expiresAt) {
                return {
                    success: false,
                    error: 'Este QR ha expirado'
                };
            }

            // 🔥 INCREMENTAR CONTADOR DE ESCANEOS
            await qrRepository.incrementScans(qrCode.id);

            // 🔥 REGISTRAR ESCANEO
            await qrRepository.addScanLog(qrCode.id, {
                scannedAt: new Date(),
                scannerId: this.usuarioActual?.uid || 'anonymous',
                scannerEmail: this.usuarioActual?.email || 'anonymous'
            });

            return {
                success: true,
                data: qrCode.data,
                eventoId: qrCode.eventoId,
                message: 'QR escaneado correctamente'
            };

        } catch (error) {
            console.error('❌ Error al escanear QR:', error);
            return {
                success: false,
                error: error.message || 'Error al escanear el QR'
            };
        }
    }

    // ============================================
    // 📥 OBTENER QR DE UN EVENTO
    // ============================================
    async obtenerQrEvento(eventoId) {
        try {
            const qrCode = await qrRepository.getByEventoId(eventoId);
            
            if (!qrCode) {
                return {
                    success: false,
                    error: 'No hay QR para este evento'
                };
            }

            return {
                success: true,
                qrCode: qrCode
            };

        } catch (error) {
            console.error('❌ Error al obtener QR:', error);
            return {
                success: false,
                error: error.message || 'Error al obtener el QR'
            };
        }
    }

    // ============================================
    // ❌ DESACTIVAR QR
    // ============================================
    async desactivarQr(qrId) {
        try {
            if (!this.usuarioActual) {
                throw new Error('Usuario no autenticado');
            }

            const result = await qrRepository.update(qrId, {
                isActive: false,
                updatedAt: new Date()
            });

            return {
                success: true,
                message: 'QR desactivado correctamente'
            };

        } catch (error) {
            console.error('❌ Error al desactivar QR:', error);
            return {
                success: false,
                error: error.message || 'Error al desactivar el QR'
            };
        }
    }

    // ============================================
    // 🛠️ GENERAR TOKEN ÚNICO
    // ============================================
    generateToken() {
        return Math.random().toString(36).substring(2, 15) + 
               Math.random().toString(36).substring(2, 15);
    }
}

export const qrService = new QrService();