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
                <h1 class="snaap-lema">
                    Escanea, 
                    <span> toma,</span> 
                    <span class="snaap-action">
                        <span class="sn-white">Sn</span>
                        <span class="aa-outline">aa</span>
                        <span class="p-white">p</span>
                    </span>
                </h1>
                <h2 class="snaap-sub">Tu creatividad, al instante, para todos.</h2>
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
                    <p>Captura el momento y crea algo único.</p>
                    
                    <h3>3. ¡<span class="snaap-action">
                        <span class="sn-white">Sn</span>
                        <span class="aa-outline">aa</span>
                        <span class="p-white">p</span>
                    </span>!</h3>
                    <p>Lanza tu instante y que los demás lo vivan a través de tus ojos.</p>
                </div>
            </div>
        </section>

        <section class="snaap-live-mural">
            <h2>Mural en acción</h2>
            <div class="snaap-mural-preview" id="muralPreview"></div>
            <h3>Tu mirada, tu snaap, tu instante todo suma para que el evento viva en todos.</h3>
        </section>

        <section class="snaap-carousel-section">
            <h2>Paquetes 
                <span class="snaap-action">
                    <span class="sn-white">Sn</span>
                    <span class="aa-outline">aa</span>
                    <span class="p-white">p</span>
                </span>
            </h2>
            <div id="contenedor-carrusel"></div>
        </section>

        <section class="snaap-cta">
            <h2>¿Listo para 
                <span class="snaap-action">
                    <span class="sn-white">Sn</span>
                    <span class="aa-outline">aa</span>
                    <span class="p-white">p</span>
                </span>ear?
            </h2>
            <button class="snaap-btn" id="btnContacto">Cotizar ahora</button>
        </section>
    `;

    // Inicializar carrusel
    const carruselDiv = document.getElementById('contenedor-carrusel');
    if (carruselDiv) carouselController.render(carruselDiv);

    // Simular mural con elementos
    const muralPreview = document.getElementById('muralPreview');
    if (muralPreview) {
        const muestras = [
            { icon: '<i class="fa-solid fa-camera"></i>', texto: 'Fotos' },
            { icon: '<i class="fa-solid fa-pencil"></i>', texto: 'Dibujos' },
            { icon: '<i class="fa-solid fa-message"></i>', texto: 'Mensajes' },
            { icon: '<i class="fa-solid fa-film"></i>', texto: 'Videos' }
        ];
        muralPreview.innerHTML = muestras.map(m => `
            <div class="mural-item">
                <span>${m.icon}</span>
                <p>${m.texto}</p>
            </div>
        `).join('');
    }

    // Eventos
    document.getElementById('btnEscanear')?.addEventListener('click', () => alert('📲 Escanea el código QR que aparecerá en la pantalla del evento.'));
    document.getElementById('btnDemo')?.addEventListener('click', () => alert('🎥 Demo: Próximamente podrás probar el mural interactivo.'));
    document.getElementById('btnContacto')?.addEventListener('click', () => alert('💬 Déjanos tu contacto y te enviaremos información.'));

    // ===== SCROLL REVEAL (Solución 2: CTA visible desde el inicio) =====
    function initScrollReveal() {
        // Solo observamos scan y mural (excluimos el CTA)
        const sections = document.querySelectorAll('.snaap-scan-section, .snaap-live-mural');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.2 });

        sections.forEach(section => observer.observe(section));
        
        // Forzar que el CTA sea visible inmediatamente (sin esperar)
        const ctaSection = document.querySelector('.snaap-cta');
        if (ctaSection) {
            ctaSection.classList.add('visible');
        }
    }

    setTimeout(initScrollReveal, 100);
}