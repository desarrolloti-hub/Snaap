export async function aboutUsController() {
    // Cargar CSS específico si no existe
    const cssLink = document.querySelector('link[href="/src/css/components/aboutUs.css"]');
    if (!cssLink) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = '/src/css/components/aboutUs.css';
        document.head.appendChild(link);
    }

    const textoMockup = "Snaap nació de una pregunta simple pero poderosa ¿si cada instante de un evento pudiera vivirse no solo desde la pista, sino desde los ojos de todos los que lo habitan? Imaginamos un lugar donde las fotos, los dibujos, los mensajes y los videos se mezclaran en un lienzo digital gigante, en tiempo real. Donde el público dejara de ser espectador para convertirse en el alma de la fiesta. Donde el código QR no fuera un simple acceso, sino una puerta a la expresión colectiva.";

    const app = document.getElementById('app');
    if (!app) return;

    app.innerHTML = `
        <div class="snaap-acerca-section">
            <div class="snaap-acerca-cabecera">
                <div class="acerca-divisor-neon top">
                    <div class="connector-izq conector-cuadrado"></div>
                    <div class="linea-horizontal"></div>
                    <div class="conector-der conector-cuadrado"></div>
                </div>
                
                <div class="acerca-titulo-principal">
                    <h2 class="light-text">AcercA de</h2>
                    <h2 class="big-text">NOSOTROS.</h2>
                </div>

                <button class="btn-cotizar-navigator btn-cotizar-flotante" id="btnCotizarFlotante">Cotizar</button>

            </div>

            <div class="snaap-acerca-bloques">
                
                <div class="acerca-bloque">
                    <div class="bloque-texto">
                        <h3>Historia</h3>
                        <p>${textoMockup}</p>
                        <button class="btn-cotizar-navigator" data-cotizar>Cotizar</button>
                    </div>
                    <div class="bloque-imagen-carrusel">
                        <div class="acerca-slide-wrapper" id="carrusel-1">
                            <img class="acerca-slide active" src="https://images.unsplash.com/photo-1511632765486-a01980e01a18?q=80&w=600&auto=format&fit=crop" alt="Evento 1">
                            <img class="acerca-slide" src="https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?q=80&w=600&auto=format&fit=crop" alt="Evento 3">
                            <img class="acerca-slide" src="https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?q=80&w=600&auto=format&fit=crop" alt="Evento 3">
                            <img class="acerca-slide" src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=600&auto=format&fit=crop" alt="Evento 4">
                        </div>
                        <div class="acerca-carrusel-puntos" id="puntos-carrusel-1">
                            <span class="carrusel-punto active"></span>
                            <span class="carrusel-punto"></span>
                            <span class="carrusel-punto"></span>
                            <span class="carrusel-punto"></span>
                        </div>
                    </div>
                </div>

                <div class="acerca-bloque invertido">
                    <div class="bloque-texto">
                        <h3>Nuestra inspiracion.</h3>
                        <p>${textoMockup}</p>
                        <button class="btn-cotizar-navigator" data-cotizar>Cotizar</button>
                    </div>
                    <div class="bloque-imagen-carrusel">
                        <div class="acerca-slide-wrapper" id="carrusel-2">
                            <img class="acerca-slide active" src="https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=600&auto=format&fit=crop" alt="Inspiración 1">
                            <img class="acerca-slide" src="https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=600&auto=format&fit=crop" alt="Inspiración 2">
                            <img class="acerca-slide" src="https://images.unsplash.com/photo-1506157786151-b8491531f063?q=80&w=600&auto=format&fit=crop" alt="Inspiración 3">
                            <img class="acerca-slide" src="https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=600&auto=format&fit=crop" alt="Inspiración 4">
                        </div>
                        <div class="acerca-carrusel-puntos" id="puntos-carrusel-2">
                            <span class="carrusel-punto active"></span>
                            <span class="carrusel-punto"></span>
                            <span class="carrusel-punto"></span>
                            <span class="carrusel-punto"></span>
                        </div>
                    </div>
                </div>

            </div>

            <div class="snaap-servicios-grid">
                <div class="grid-linea-horizontal"></div>
                <div class="grid-linea-vertical v1"></div>
                <div class="grid-linea-vertical v2"></div>
                <div class="grid-conector-cuadrado ext-left"></div>
                <div class="grid-conector-cuadrado ext-right"></div>
                <div class="grid-conector-cuadrado c1"></div>
                <div class="grid-conector-cuadrado c2"></div>
                <div class="grid-conector-cuadrado c3"></div>
                <div class="grid-conector-cuadrado c4"></div>

                <div class="servicios-row">
                    <div class="servicio-col">
                        <div class="servicio-icon-wrapper"><i class="far fa-user-circle"></i></div>
                        <h4>Servicio de calidad</h4>
                        <p>Atención ágil, soluciones creativas y un equipo que convierte tus ideas en experiencias inolvidables.</p>
                    </div>
                    <div class="servicio-col">
                        <div class="servicio-icon-wrapper"><i class="far fa-gem"></i></div>
                        <h4>Atención personalizada</h4>
                        <p>Creamos contigo, no para ti. Tu evento, tu esencia.</p>
                    </div>
                    <div class="servicio-col">
                        <div class="servicio-icon-wrapper"><i class="fas fa-wallet"></i></div>
                        <h4>Precios a la medida</h4>
                        <p>Pagas lo que necesitas. Ni más, ni menos</p>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Inicializar los carruseles después de montar el HTML
    setupCarruselLogic("carrusel-1", "puntos-carrusel-1");
    setupCarruselLogic("carrusel-2", "puntos-carrusel-2");

    // Eventos de los botones "Cotizar"
    const botonesCotizar = document.querySelectorAll('[data-cotizar], #btnCotizarFlotante');
    botonesCotizar.forEach(btn => {
        btn.addEventListener('click', () => {
            alert('¡Gracias por tu interés! Pronto un asesor se comunicará contigo.');
        });
    });

    // ===== NUEVO: SCROLL REVEAL =====
    function initScrollReveal() {
        // Elementos a observar: cabecera, cada bloque, y el grid de servicios
        const elementsToReveal = document.querySelectorAll('.snaap-acerca-cabecera, .acerca-bloque, .snaap-servicios-grid');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target); // Solo aparece una vez
                }
            });
        }, { threshold: 0.2 }); // Se activa cuando el 20% del elemento es visible

        elementsToReveal.forEach(el => observer.observe(el));
        
        // Opcional: si quieres que la cabecera se vea inmediatamente sin esperar scroll (porque ya está visible al cargar)
        const header = document.querySelector('.snaap-acerca-cabecera');
        if (header && header.getBoundingClientRect().top < window.innerHeight) {
            header.classList.add('visible');
            observer.unobserve(header);
        }
    }

    // Pequeño retraso para asegurar que todo esté en el DOM
    setTimeout(initScrollReveal, 100);
}

// Función auxiliar para los carruseles internos (igual que la tuya, sin cambios)
function setupCarruselLogic(carruselId, puntosId) {
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
}