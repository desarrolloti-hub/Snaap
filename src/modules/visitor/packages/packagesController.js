export async function packagesController() {
    // Cargar CSS específico
    const cssLink = document.querySelector('link[href="/src/css/components/packages.css"]');
    if (!cssLink) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = '/src/css/components/packages.css';
        document.head.appendChild(link);
    }

    const app = document.getElementById('app');
    if (!app) return;

    // Datos para la galería de imágenes (puedes cambiarlas)
    const galeriaImagenes = [
        "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=600&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=600&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=600&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1506157786151-b8491531f063?q=80&w=600&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=600&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=600&auto=format&fit=crop"
    ];

    app.innerHTML = `
        <div class="snaap-paquetes-section">
            <div class="paquete-header">
                <h2>Artist<span>aa</span> Emergente.</h2>
                <p>Descubre experiencias únicas con nuestro catálogo de eventos premium</p>
            </div>

            <!-- Galería horizontal mejorada -->
            <div class="paquete-galeria">
                <button class="galeria-nav" id="galeria-prev"><i class="fas fa-chevron-left"></i></button>
                <div class="galeria-track" id="galeria-track">
                    <div class="galeria-imagenes" id="galeria-imagenes"></div>
                </div>
                <button class="galeria-nav" id="galeria-next"><i class="fas fa-chevron-right"></i></button>
            </div>

            <!-- Contenido principal -->
            <div class="paquete-main-content">
                <div class="paquete-logo-frame">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/b/bd/Rolling_Stones_logo.svg" alt="Icono Artista">
                </div>
                <div class="paquete-info">
                    <h3>det<span>aa</span>lles del p<span>aaa</span>quete.</h3>
                    <p>
                        Branding neón personalizado, iluminación reactiva y una experiencia sonora de primer nivel para tu evento Snaap! 
                        Incluye DJ en vivo, equipo de sonido profesional, efectos láser y pantallas LED.
                    </p>
                </div>
                <div class="paquete-acciones">
                    <button class="btn-snaap-pkg" data-action="favoritos"><i class="fas fa-heart"></i> agregar a favoritos</button>
                    <button class="btn-snaap-pkg" data-action="rentar"><i class="fas fa-shopping-cart"></i> rentar ahora</button>
                    <button class="btn-snaap-pkg" data-action="pago"><i class="fas fa-credit-card"></i> formas de pago</button>
                </div>
            </div>

            <!-- Características adicionales -->
            <div class="paquete-features">
                <h3>¿Qué <span class="neon-text">incluye</span>?</h3>
                <div class="features-grid">
                    <div class="feature-card"><i class="fas fa-music"></i><h4>DJ profesional</h4><p>Set list personalizado</p></div>
                    <div class="feature-card"><i class="fas fa-lightbulb"></i><h4>Iluminación LED</h4><p>Espectáculo de luces sincronizado</p></div>
                    <div class="feature-card"><i class="fas fa-vr-cardboard"></i><h4>Realidad aumentada</h4><p>Efectos visuales inmersivos</p></div>
                    <div class="feature-card"><i class="fas fa-camera"></i><h4>Fotografía 360°</h4><p>Recuerdos instantáneos</p></div>
                </div>
            </div>

            <!-- Tabla de precios -->
            <div class="paquete-pricing">
                <h3>Precios <span class="neon-text">especiales</span></h3>
                <div class="pricing-table">
                    <div class="pricing-card">
                        <h4>Básico</h4>
                        <div class="price">$1,999</div>
                        <ul><li><i class="fas fa-check"></i> 4 horas</li><li><i class="fas fa-check"></i> Equipo básico</li><li><i class="fas fa-times"></i> DJ</li></ul>
                        <button class="btn-pricing" data-plan="basico">Seleccionar</button>
                    </div>
                    <div class="pricing-card">
                        <h4>Premium</h4>
                        <div class="price">$3,999</div>
                        <ul><li><i class="fas fa-check"></i> 6 horas</li><li><i class="fas fa-check"></i> DJ + luces</li><li><i class="fas fa-check"></i> 1 camarógrafo</li></ul>
                        <button class="btn-pricing" data-plan="premium">Seleccionar</button>
                    </div>
                    <div class="pricing-card">
                        <h4>Deluxe</h4>
                        <div class="price">$7,499</div>
                        <ul><li><i class="fas fa-check"></i> 8 horas</li><li><i class="fas fa-check"></i> Shows láser</li><li><i class="fas fa-check"></i> Cobertura total</li></ul>
                        <button class="btn-pricing" data-plan="deluxe">Seleccionar</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Cargar imágenes en la galería
    const galeriaContainer = document.getElementById('galeria-imagenes');
    if (galeriaContainer) {
        galeriaImagenes.forEach(img => {
            const div = document.createElement('div');
            div.className = 'img-item';
            div.innerHTML = `<img src="${img}" alt="Paquete evento">`;
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
        btn.addEventListener('click', (e) => {
            const action = btn.getAttribute('data-action');
            if (action === 'favoritos') alert('✅ Añadido a favoritos');
            else if (action === 'rentar') alert('🎉 Solicita cotización personalizada');
            else if (action === 'pago') alert('💳 Aceptamos tarjetas, transferencia y cripto');
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
}