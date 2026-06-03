// src/modules/visitor/aboutUs/aboutUsController.js

import { aboutUsView } from './aboutUsView.js';

const aboutUsControllerHandler = {
    // Textos del about
    texts: {
        historia: "Snaap nació de una pregunta simple pero poderosa: ¿si cada instante de un evento pudiera vivirse no solo desde la pista, sino desde los ojos de todos los que lo habitan? Imaginamos un lugar donde las fotos, los dibujos, los mensajes y los videos se mezclaran en un lienzo digital gigante, en tiempo real. Donde el público dejara de ser espectador para convertirse en el alma de la fiesta. Donde el código QR no fuera un simple acceso, sino una puerta a la expresión colectiva.",
        inspiracion: "Nos inspira la magia de los momentos compartidos. Cada evento es único, y nuestra misión es capturar esa esencia y amplificarla. Creemos en la tecnología como puente entre las personas, no como barrera. Por eso creamos Snaap: para que nadie se pierda ni un segundo de la experiencia, y para que cada asistente se convierta en parte fundamental del espectáculo."
    },

    // Inicializar carruseles
    initCarousels() {
        const setupCarrusel = (carruselId, puntosId) => {
            const slides = document.querySelectorAll(`#${carruselId} .acerca-slide`);
            const puntos = document.querySelectorAll(`#${puntosId} .carrusel-punto`);
            
            if (slides.length === 0) return;
            let index = 0;

            puntos.forEach((punto, i) => {
                punto.addEventListener("click", () => {
                    slides[index].classList.remove("active");
                    puntos[index].classList.remove("active");
                    index = i;
                    slides[index].classList.add("active");
                    puntos[index].classList.add("active");
                });
            });

            setInterval(() => {
                slides[index].classList.remove("active");
                puntos[index].classList.remove("active");
                index = (index + 1) % slides.length;
                slides[index].classList.add("active");
                puntos[index].classList.add("active");
            }, 4000);
        };

        setupCarrusel("carrusel-1", "puntos-carrusel-1");
        setupCarrusel("carrusel-2", "puntos-carrusel-2");
    },

    // Inicializar botones de cotizar
    initButtons() {
        const botonesCotizar = document.querySelectorAll('[data-cotizar], #btnCotizarFlotante');
        botonesCotizar.forEach(btn => {
            btn.addEventListener('click', () => {
                alert('¡Gracias por tu interés! Pronto un asesor se comunicará contigo.');
            });
        });
    },

    // Scroll reveal
    initScrollReveal() {
        const elementsToReveal = document.querySelectorAll('.snaap-acerca-cabecera, .acerca-bloque, .snaap-servicios-grid');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.2 });

        elementsToReveal.forEach(el => observer.observe(el));
        
        const header = document.querySelector('.snaap-acerca-cabecera');
        if (header && header.getBoundingClientRect().top < window.innerHeight) {
            header.classList.add('visible');
            observer.unobserve(header);
        }
    },

    // Cargar CSS
    loadCSS() {
        const cssLink = document.querySelector('link[href="/src/css/components/aboutUs.css"]');
        if (!cssLink) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = '/src/css/components/aboutUs.css';
            document.head.appendChild(link);
        }
    },

    // Rellenar textos
    fillTexts() {
        const historiaEl = document.getElementById('historia-texto');
        const inspiracionEl = document.getElementById('inspiracion-texto');
        
        if (historiaEl) historiaEl.textContent = this.texts.historia;
        if (inspiracionEl) inspiracionEl.textContent = this.texts.inspiracion;
    },

    // Método principal de inicialización
    async init() {
        this.loadCSS();
        
        const app = document.getElementById('app');
        if (!app) return;
        
        app.innerHTML = aboutUsView;
        
        this.fillTexts();
        this.initCarousels();
        this.initButtons();
        
        setTimeout(() => this.initScrollReveal(), 100);
    }
};

// Exportación ÚNICA y CORRECTA
export async function aboutUsController() {
    await aboutUsControllerHandler.init();
}

export default aboutUsControllerHandler;