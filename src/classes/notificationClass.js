// src/classes/notificationClass.js
export class Notification {
    constructor({
        id = null,
        title = '',
        message = '',
        type = 'general',
        priority = 'normal',
        icon = '',
        link = null,
        data = {},
        recipients = [],
        readBy = [],
        sentAt = null,
        createdAt = null,
        updatedAt = null,
        status = 'pending',
        sentBy = null
    } = {}) {
        this.id = id;
        this.title = title;
        this.message = message;
        this.type = type;
        this.priority = priority;
        this.icon = icon || this.getDefaultIcon(type);
        this.link = link;
        this.data = data;
        this.recipients = recipients;
        this.readBy = readBy || [];
        this.sentAt = sentAt || new Date();
        this.createdAt = createdAt || new Date();
        this.updatedAt = updatedAt || new Date();
        this.status = status;
        this.sentBy = sentBy;
    }

    getDefaultIcon(type) {
        const icons = {
            general: '📢',
            evento: '📅',
            membresia: '💳',
            sistema: '⚙️',
            bienvenida: '👋',
            promocion: '🎉'
        };
        return icons[type] || '📢';
    }

    toFirestore() {
        return {
            title: this.title,
            message: this.message,
            type: this.type,
            priority: this.priority,
            icon: this.icon,
            link: this.link,
            data: this.data,
            recipients: this.recipients,
            readBy: this.readBy,
            sentAt: this.sentAt,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            status: this.status,
            sentBy: this.sentBy
        };
    }

    static fromFirestore(doc) {
        const data = doc.data();
        return new Notification({
            id: doc.id,
            ...data,
            sentAt: data.sentAt?.toDate?.() || data.sentAt,
            createdAt: data.createdAt?.toDate?.() || data.createdAt,
            updatedAt: data.updatedAt?.toDate?.() || data.updatedAt
        });
    }

    isReadBy(userId) {
        return this.readBy.includes(userId);
    }

    markAsRead(userId) {
        if (!this.isReadBy(userId)) {
            this.readBy.push(userId);
        }
    }

    getRecipientCount() {
        return this.recipients.length || 0;
    }

    getReadCount() {
        return this.readBy.length || 0;
    }
}