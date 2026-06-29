// src/modules/visitor/home/homeController.js
import { carouselController } from '/src/modules/shared/errors/carouselController.js';

export async function homeController() {
    loadStyles();
    await loadCarousel();
    setupMuralPreview();
    setupEventListeners();
    initScrollReveal();
}

// Cargar estilos necesarios
function loadStyles() {
    const styles = [
        { href: '/src/css/pages/home.css', id: 'home-style' },
        { href: '/src/css/components/carousel.css', id: 'carousel-style' }
    ];
    
    styles.forEach(style => {
        if (!document.querySelector(`link[href="${style.href}"]`)) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = style.href;
            document.head.appendChild(link);
        }
    });
}

// Cargar el carrusel de paquetes
async function loadCarousel() {
    const carruselDiv = document.getElementById('contenedor-carrusel');
    if (carruselDiv && carouselController?.render) {
        await carouselController.render(carruselDiv);
    }
}

// Configurar el mural con elementos de ejemplo
function setupMuralPreview() {
    const muralPreview = document.getElementById('muralPreview');
    if (!muralPreview) return;
    
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

// Configurar eventos de los botones
function setupEventListeners() {
    const buttons = [
        { id: 'btnEscanear', handler: () => alert('📲 Escanea el código QR que aparecerá en la pantalla del evento.') },
        { id: 'btnDemo', handler: () => alert('🎥 Demo: Próximamente podrás probar el mural interactivo.') },
        { id: 'btnContacto', handler: () => alert('💬 Déjanos tu contacto y te enviaremos información.') }
    ];
    
    buttons.forEach(({ id, handler }) => {
        const btn = document.getElementById(id);
        if (btn) btn.addEventListener('click', handler);
    });
}

// Inicializar efectos de scroll reveal
function initScrollReveal() {
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
    
    // Forzar que el CTA sea visible inmediatamente
    const ctaSection = document.querySelector('.snaap-cta');
    if (ctaSection) {
        ctaSection.classList.add('visible');
    }
}