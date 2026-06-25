// src/modules/shared/errors/404Controller.js
import { userService } from '../../../services/userService.js';
import { getRedirectPathByRole } from '../../../core/permissions.js';

// Función para cargar estilos específicos del 404
function load404Styles() {
    if (!document.querySelector('link[href*="404.css"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = '/src/css/pages/404.css';
        document.head.appendChild(link);
    }
}

// 🔥 Función para redirigir según el rol
function redirectToHome() {
    const user = userService.getCurrentUser();
    if (user) {
        // Si está logueado, redirigir a su dashboard según rol
        const redirectPath = getRedirectPathByRole(user.role);
        window.location.href = redirectPath;
    } else {
        // Si no está logueado, ir al inicio
        window.location.href = '/';
    }
}

// Función para iniciar el contador de redirección
function startCountdown(seconds = 3) {
    let timeLeft = seconds;
    const countdownElement = document.getElementById('countdown');
    
    const interval = setInterval(() => {
        timeLeft--;
        if (countdownElement) {
            countdownElement.textContent = timeLeft;
        }
        
        if (timeLeft <= 0) {
            clearInterval(interval);
            redirectToHome();
        }
    }, 1000);
}

// Configurar event listeners
function setupEventListeners() {
    const goHomeBtn = document.getElementById('goHomeBtn');
    if (goHomeBtn) {
        goHomeBtn.addEventListener('click', redirectToHome);
    }
}

// Inicializar la página 404
function init404() {
    // 🔥 Mostrar mensaje personalizado según rol
    updateWelcomeMessage();
    setupEventListeners();
    startCountdown(4);
}

// 🔥 Actualizar mensaje según el rol del usuario
function updateWelcomeMessage() {
    const user = userService.getCurrentUser();
    const titleEl = document.querySelector('.error-title');
    const descEl = document.querySelector('.error-description');
    
    if (user) {
        const roleMessages = {
            'sysadmin': {
                title: 'Acceso restringido',
                desc: 'Esta sección no está disponible para administradores.'
            },
            'host': {
                title: 'Sitio en mantenimiento',
                desc: 'Estamos mejorando la experiencia para hosts.'
            },
            'user': {
                title: 'Sitio en mantenimiento',
                desc: 'Estamos mejorando la experiencia para usuarios.'
            }
        };
        
        const message = roleMessages[user.role] || roleMessages['user'];
        if (titleEl) titleEl.textContent = message.title;
        if (descEl) descEl.textContent = message.desc;
    }
}

// Función principal del controlador
export async function init404Controller() {
    console.log('🔥 Inicializando 404Controller...');
    
    load404Styles();
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init404);
    } else {
        init404();
    }
}

export { init404, setupEventListeners, startCountdown, redirectToHome };