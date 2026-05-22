export async function init404Controller() {
    console.log('🚀 404 Controller ejecutándose');

    // Cargar CSS específico
    const cssLink = document.querySelector('link[href="/src/css/pages/404.css"]');
    if (!cssLink) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = '/src/css/pages/404.css';
        document.head.appendChild(link);
    }

    const app = document.getElementById('app');
    if (!app) return;

    // Pintar el HTML del error directamente
    app.innerHTML = `
        <div class="snaap-error-container">
            <div class="error-card">
                <div class="maintenance-icon">
                    <i class="fas fa-tools"></i>
                </div>
                <h1 class="error-code">404</h1>
                <h2 class="error-title">Sitio en mantenimiento</h2>
                <p class="error-message">
                    Estamos mejorando la experiencia Snaap.<br>
                    Vuelve pronto, habrá novedades increíbles.
                </p>
                <button class="btn-redirect" id="redirect-btn">Ir al inicio</button>
                <div class="countdown">
                    Redirigiendo en <span id="countdown-number">5</span> segundos...
                </div>
            </div>
        </div>
    `;

    // Lógica de redirección
    let seconds = 5;
    const countdownSpan = document.getElementById('countdown-number');
    const redirectBtn = document.getElementById('redirect-btn');

    const redirect = () => {
        window.location.href = '/';
    };

    const interval = setInterval(() => {
        seconds--;
        if (countdownSpan) countdownSpan.innerText = seconds;
        if (seconds <= 0) {
            clearInterval(interval);
            redirect();
        }
    }, 1000);

    if (redirectBtn) {
        redirectBtn.addEventListener('click', () => {
            clearInterval(interval);
            redirect();
        });
    }
}