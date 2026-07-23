// src/modules/shared/errors/404Controller.js
import { userService } from '../../../services/userService.js';
import { getRedirectPathByRole } from '../../../core/permissions.js';

// FunciÃ³n para cargar estilos especÃ­ficos del 404
function load404Styles() {
    if (!document.querySelector('link[href*="404.css"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = '/src/css/pages/404.css';
        document.head.appendChild(link);
    }
}

// ðŸ”¥ FunciÃ³n para redirigir segÃºn el rol
function redirectToHome() {
    const user = userService.getCurrentUser();
    if (user) {
        // Si estÃ¡ logueado, redirigir a su dashboard segÃºn rol
        const redirectPath = getRedirectPathByRole(user.role);
        window.go(redirectPath);
    } else {
        // Si no estÃ¡ logueado, ir al inicio
        window.go('');
    }
}

// FunciÃ³n para iniciar el contador de redirecciÃ³n
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

// Inicializar la pÃ¡gina 404
function init404() {
    // ðŸ”¥ Mostrar mensaje personalizado segÃºn rol
    updateWelcomeMessage();
    setupEventListeners();
    startCountdown(4);
}

// ðŸ”¥ Actualizar mensaje segÃºn el rol del usuario
function updateWelcomeMessage() {
    const user = userService.getCurrentUser();
    const titleEl = document.querySelector('.error-title');
    const descEl = document.querySelector('.error-description');
    
    if (user) {
        const roleMessages = {
            'sysadmin': {
                title: 'Acceso restringido',
                desc: 'Esta secciÃ³n no estÃ¡ disponible para administradores.'
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

// FunciÃ³n principal del controlador
export async function init404Controller() {
    console.log('ðŸ”¥ Inicializando 404Controller...');
    
    load404Styles();
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init404);
    } else {
        init404();
    }
}

export { init404, setupEventListeners, startCountdown, redirectToHome };
