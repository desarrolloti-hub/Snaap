import { carouselController } from '/src/modules/shared/errors/carouselController.js';

export async function homeController() {
    // Cargar CSS del home
    if (!document.querySelector('link[href="/src/css/pages/home.css"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = '/src/css/pages/home.css';
        document.head.appendChild(link);
    }
    // CSS del carrusel
    if (!document.querySelector('link[href="/src/css/components/carousel.css"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = '/src/css/components/carousel.css';
        document.head.appendChild(link);
    }

    const app = document.getElementById('app');
    if (!app) return;

    app.innerHTML = `
        <section class="snaap-hero">
            <div class="snaap-hero-content">
                <h1 class="snaap-lema">Escanea, <span>toma</span>, <span class="snaap-action">¡Snaap!</span></h1>
                <p class="snaap-sub">Comparte tu creatividad al instante en el mural colectivo</p>
                <div class="snaap-buttons">
                    <button class="snaap-btn" id="btnEscanear"><i class="fa fa-qrcode" aria-hidden="true"></i> Escanear QR</button>
                    <button class="snaap-btn" id="btnDemo"><i class="fa-solid fa-calendar"></i> Iniciar fiesta</button>
                </div>
            </div>
        </section>

        <section class="snaap-scan-section">
            <div class="snaap-scan-container">
                <div class="qr-mockup">
                    <i class="fas fa-qrcode"></i>
                </div>
                <div class="snaap-scan-text">
                    <h3>1. Escanea el código</h3>
                    <p>Aparecerá en tu evento. Accede a la sala Snaap desde tu móvil.</p>
                    <h3>2. Toma o dibuja</h3>
                    <p>Captura el momento o crea algo único.</p>
                    <h3>3. ¡Snaap!</h3>
                    <p>Envíalo y aparece al instante en la pantalla gigante.</p>
                </div>
            </div>
        </section>

        <section class="snaap-live-mural">
            <h2>Mural <span class="snaap-neon-text">en acción</span></h2>
            <div class="snaap-mural-preview" id="muralPreview"></div>
            <p style="color: #4db8ff;">Tu mirada, tu snap, tu instante: todo suma para que el evento viva en todos.</p>
        </section>

        <section class="snaap-carousel-section">
            <h2>Paquetes <span class="snaap-neon-text">Snaap</span></h2>
            <div id="contenedor-carrusel"></div>
        </section>

        <section class="snaap-cta">
            <h2>¿Listo para <span class="snaap-neon-text">Snaapear</span> tu evento?</h2>
            <button class="snaap-btn" id="btnContacto">Cotizar ahora</button>
        </section>
    `;

    // Inicializar carrusel
    const carruselDiv = document.getElementById('contenedor-carrusel');
    if (carruselDiv) carouselController.render(carruselDiv);

    // Simular mural con elementos aleatorios (ejemplo)
    const muralPreview = document.getElementById('muralPreview');
    if (muralPreview) {
        const muestras = [
            { emoji: '<i class="fa-solid fa-camera"></i>', texto: 'Foto del público' },
            { emoji: '<i class="fa-solid fa-pencil"></i>', texto: 'Dibujo' },
            { emoji: '<i class="fa-solid fa-message"></i>', texto: 'Mensaje' },
            { emoji: '<i class="fa-solid fa-film"></i>', texto: 'Selfie grupal' }
        ];
        muralPreview.innerHTML = muestras.map(m => `
            <div class="mural-item">
                <span>${m.emoji}</span>
                <p>${m.texto}</p>
            </div>
        `).join('');
    }

    // Eventos
    document.getElementById('btnEscanear')?.addEventListener('click', () => alert('📲 Escanea el código QR que aparecerá en la pantalla del evento.'));
    document.getElementById('btnDemo')?.addEventListener('click', () => alert('🎥 Demo: Próximamente podrás probar el mural interactivo.'));
    document.getElementById('btnContacto')?.addEventListener('click', () => alert('💬 Déjanos tu contacto y te enviaremos información.'));
}