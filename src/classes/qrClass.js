// src/classes/qrClass.js
export class QrCode {
    constructor({
        id = null,
        eventoId = '',
        hostId = '',
        token = '',
        data = {},
        qrImage = '',
        createdAt = null,
        expiresAt = null,
        isActive = true,
        scans = 0,
        scanLogs = []
    } = {}) {
        this.id = id;
        this.eventoId = eventoId;
        this.hostId = hostId;
        this.token = token;
        this.data = data;
        this.qrImage = qrImage;
        this.createdAt = createdAt || new Date();
        this.expiresAt = expiresAt;
        this.isActive = isActive;
        this.scans = scans;
        this.scanLogs = scanLogs;
    }

    toFirestore() {
        return {
            eventoId: this.eventoId,
            hostId: this.hostId,
            token: this.token,
            data: this.data,
            qrImage: this.qrImage,
            createdAt: this.createdAt,
            expiresAt: this.expiresAt,
            isActive: this.isActive,
            scans: this.scans,
            scanLogs: this.scanLogs
        };
    }

    static fromFirestore(doc) {
        const data = doc.data();
        return new QrCode({
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate?.() || data.createdAt,
            expiresAt: data.expiresAt?.toDate?.() || data.expiresAt
        });
    }

    isExpired() {
        if (!this.expiresAt) return false;
        return new Date() > this.expiresAt;
    }

    getScanCount() {
        return this.scans || 0;
    }

    getQrUrl() {
        return this.qrImage || '';
    }
}