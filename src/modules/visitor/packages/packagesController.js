// src/modules/visitor/packages/packagesController.js

export async function packagesController() {
    // Cargar CSS específico
    const cssLink = document.querySelector('link[href="/src/css/components/packages.css"]');
    if (!cssLink) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = '/src/css/components/packages.css';
        document.head.appendChild(link);
    }

    // Datos para la galería de imágenes
    const galeriaImagenes = [
        "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=600&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=600&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1506157786151-b8491531f063?q=80&w=600&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=600&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=600&auto=format&fit=crop"
    ];

    // Cargar imágenes en la galería
    const galeriaContainer = document.getElementById('galeria-imagenes');
    if (galeriaContainer) {
        galeriaImagenes.forEach(img => {
            const div = document.createElement('div');
            div.className = 'img-item';
            div.innerHTML = `<img src="${img}" alt="Paquete evento" loading="lazy">`;
            galeriaContainer.appendChild(div);
        });
    }

    // Lógica de desplazamiento horizontal de la galería
    const track = document.getElementById('galeria-track');
    const btnPrev = document.getElementById('galeria-prev');
    const btnNext = document.getElementById('galeria-next');
    
    if (track && btnPrev && btnNext) {
        btnPrev.addEventListener('click', () => {
            track.scrollBy({ left: -350, behavior: 'smooth' });
        });
        btnNext.addEventListener('click', () => {
            track.scrollBy({ left: 350, behavior: 'smooth' });
        });
    }

    // Eventos de los botones principales
    const botonesAccion = document.querySelectorAll('[data-action]');
    botonesAccion.forEach(btn => {
        btn.addEventListener('click', () => {
            const action = btn.getAttribute('data-action');
            if (action === 'favoritos') {
                alert('✅ Añadido a favoritos');
            } else if (action === 'rentar') {
                alert('🎉 Solicita cotización personalizada');
            } else if (action === 'pago') {
                alert('💳 Aceptamos tarjetas, transferencia y cripto');
            }
        });
    });

    // Eventos de los botones de precio
    const pricingBtns = document.querySelectorAll('.btn-pricing');
    pricingBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const plan = btn.getAttribute('data-plan');
            alert(`Has seleccionado el plan ${plan}. Pronto te contactaremos.`);
        });
    });

    // Scroll Reveal
    function initScrollReveal() {
        const elementsToReveal = document.querySelectorAll(
            '.paquete-header, .paquete-galeria, .paquete-main-content, .paquete-pricing'
        );
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.2 });

        elementsToReveal.forEach(el => observer.observe(el));
    }

    // Inicializar scroll reveal después de que el DOM esté listo
    setTimeout(initScrollReveal, 100);
}