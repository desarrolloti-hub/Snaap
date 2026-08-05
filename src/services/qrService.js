// src/services/qrService.js
import { qrRepository } from '../repositories/qrRepository.js';
import { QrCode } from '../classes/qrClass.js';

// Librería para generar QR (instalar: npm install qrcode)
import QRCode from 'qrcode';

export class QrService {
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

            const origin = data.origin || this.getCurrentOrigin();
            const redirectUrl = data.redirectUrl || this.buildRedirectUrl(eventoId, origin);

            // 🔥 DATOS QUE CONTENDRÁ EL QR
            const qrData = {
                eventoId: eventoId,
                hostId: this.usuarioActual.uid,
                hostName: this.usuarioActual.displayName || this.usuarioActual.email,
                fechaGeneracion: new Date().toISOString(),
                ...data,
                redirectUrl,
                // 🔥 Token único para validación
                token: this.generateToken()
            };

            // 🔥 GENERAR QR COMO IMAGEN CON LA URL DIRECTA DEL EVENTO
            const qrImage = await QRCode.toDataURL(redirectUrl, {
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
    // 🛠️ GENERAR URL DE REDIRECCIÓN PARA EL QR
    // ============================================
    buildRedirectUrl(eventoId, origin = this.getCurrentOrigin()) {
        if (!eventoId) {
            throw new Error('ID del evento es requerido');
        }

        // 🔥 USAR ORIGEN PASADO COMO PARÁMETRO O EL ACTUAL
        const baseOrigin = origin || this.getCurrentOrigin();
        
        // 🔥 OBTENER DEVICE ID PARA INCLUIR EN LA URL
        let deviceId = '';
        if (typeof window !== 'undefined' && window.localStorage) {
            try {
                deviceId = localStorage.getItem('snaap_device_id') || '';
            } catch (e) {
                console.warn('⚠️ No se pudo obtener deviceId:', e);
            }
        }
        
        // Construir URL base
        let url = `${baseOrigin}/user/home?eventId=${encodeURIComponent(eventoId)}`;
        
        // Si hay deviceId, agregarlo a la URL
        if (deviceId) {
            url += `&deviceId=${encodeURIComponent(deviceId)}`;
        }
        
        console.log('🔗 QR redirect URL:', url);
        return url;
    }

    // ============================================
    // 🛠️ OBTENER ORIGEN ACTUAL (CORREGIDO)
    // ============================================
    getCurrentOrigin() {
        // 🔥 PRIMERO: Intentar obtener de producción desde Firebase Hosting
        if (typeof window !== 'undefined') {
            // Si estamos en Firebase Hosting, usar la URL de producción
            const hostname = window.location.hostname;
            
            // Si es producción (snaap-mx.web.app o dominio personalizado)
            if (hostname === 'snaap-mx.web.app' || hostname.includes('snaap')) {
                return window.location.origin;
            }
            
            // Si es localhost, usar el origin de producción como fallback
            if (hostname === 'localhost' || hostname === '127.0.0.1') {
                // 🔥 EN PRODUCCIÓN, USAR LA URL DE FIREBASE HOSTING
                console.warn('⚠️ Estás en localhost. Usando URL de producción para el QR.');
                return 'https://snaap-mx.web.app';
            }
            
            return window.location.origin;
        }

        // Fallback final
        return 'https://snaap-mx.web.app';
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