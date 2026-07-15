// src/main.js
import { initRouter } from './router/router.js';
import { initNavbar } from './modules/shared/navbar/navbarController.js';
import { initNotification } from './modules/shared/notification/notificationController.js';
import { userService } from './services/userService.js';

// 🔥 Inicializar navbar unificado primero
initNavbar();

// 🔥 Luego inicializar router
initRouter();

// 🔥 Inicializar notificaciones después de autenticación
document.addEventListener('auth:changed', async () => {
    const user = userService.getCurrentUser();
    if (user) {
        await initNotification();
    }
});

// 🔥 También al cargar la página (si ya hay usuario)
document.addEventListener('DOMContentLoaded', async () => {
    const user = userService.getCurrentUser();
    if (user) {
        await initNotification();
    }
});

console.log('🚀 Snaap iniciado correctamente');