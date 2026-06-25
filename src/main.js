// src/main.js
import { initRouter } from './router/router.js';
import { initNavbar } from './modules/shared/navbar/navbarController.js';

// 🔥 Inicializar navbar unificado primero
initNavbar();

// 🔥 Luego inicializar router
initRouter();

console.log('🚀 Snaap iniciado correctamente');