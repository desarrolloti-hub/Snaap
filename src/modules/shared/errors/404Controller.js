// Función para cargar estilos específicos del 404
function load404Styles() {
    // Verificar si el CSS ya está cargado
    if (!document.querySelector('link[href*="404.css"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = '/src/css/pages/404.css';
        document.head.appendChild(link);
    }
}

// Función para redirigir al inicio
function redirectToHome() {
    window.location.href = '/';
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
    // Configurar event listeners
    setupEventListeners();
    
    // Iniciar contador de redirección
    startCountdown(3);
}

// Función principal del controlador (la que llama el router)
export async function init404Controller() {
    console.log('Inicializando 404Controller...');
    
    // Cargar estilos específicos
    load404Styles();
    
    // Inicializar después de que el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init404);
    } else {
        init404();
    }
}

// Exportar funciones para uso externo
export { init404, setupEventListeners, startCountdown, redirectToHome };