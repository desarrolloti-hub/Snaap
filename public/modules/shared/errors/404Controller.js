export async function init404Controller() {
    console.log('🚀 404 Controller ejecutándose');

    // Cargar CSS
    const cssLink = document.querySelector('link[href="/src/css/pages/404.css"]');
    if (!cssLink) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = '/src/css/pages/404.css';
        document.head.appendChild(link);
        console.log('✅ CSS 404 cargado');
    }

    // Esperar un momento a que el DOM esté listo
    setTimeout(() => {
        const countdownSpan = document.getElementById('countdown-number');
        const redirectBtn = document.getElementById('redirect-btn');

        console.log('🔍 Elementos encontrados:', { countdownSpan, redirectBtn });

        let seconds = 5;
        if (countdownSpan) countdownSpan.innerText = seconds;

        const redirect = () => {
            console.log('🔄 Redirigiendo a /');
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
    }, 100); // pequeño retraso para asegurar que el DOM esté listo
}