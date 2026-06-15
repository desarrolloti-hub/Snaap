import { carouselController } from '/src/modules/shared/errors/carouselController.js';

export async function homeController() {
    loadStyles();
    await loadCarousel();
    setupMuralPreview();
    setupEventListeners();
    initScrollReveal();
    setupAdminButton();
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

// Configurar botón de acceso rápido como admin
function setupAdminButton() {
    // Crear el botón si no existe
    let adminBtn = document.getElementById('adminQuickAccess');
    
    if (!adminBtn) {
        adminBtn = document.createElement('button');
        adminBtn.id = 'adminQuickAccess';
        adminBtn.innerHTML = '<i class="fas fa-shield-alt"></i> Acceso Admin';
        adminBtn.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: rgba(255, 0, 122, 0.9);
            border: none;
            border-radius: 50px;
            padding: 10px 20px;
            color: white;
            font-family: 'Poppins', sans-serif;
            cursor: pointer;
            z-index: 9999;
            font-size: 12px;
            backdrop-filter: blur(10px);
            transition: all 0.3s ease;
        `;
        
        adminBtn.addEventListener('mouseenter', () => {
            adminBtn.style.transform = 'scale(1.05)';
            adminBtn.style.background = 'rgba(255, 0, 122, 1)';
        });
        
        adminBtn.addEventListener('mouseleave', () => {
            adminBtn.style.transform = 'scale(1)';
            adminBtn.style.background = 'rgba(255, 0, 122, 0.9)';
        });
        
        document.body.appendChild(adminBtn);
    }
    
    adminBtn.addEventListener('click', quickLoginAsAdmin);
}

// Función para login rápido como administrador
function quickLoginAsAdmin() {
    // Verificar si ya existe un usuario admin
    let users = JSON.parse(localStorage.getItem('snaap_users') || '[]');
    let adminUser = users.find(u => u.role === 'sysadmin');
    
    if (!adminUser) {
        // Crear usuario admin si no existe
        adminUser = {
            id: Date.now(),
            username: "Administrador",
            email: "admin@snaap.com",
            password: "admin123",
            role: "sysadmin",
            status: "active",
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString(),
            eventsCreated: 0,
            totalAttendees: 0
        };
        users.push(adminUser);
        localStorage.setItem('snaap_users', JSON.stringify(users));
    }
    
    // Actualizar último acceso
    adminUser.lastLogin = new Date().toISOString();
    localStorage.setItem('snaap_current_user', JSON.stringify(adminUser));
    localStorage.setItem('snaap_users', JSON.stringify(users));
    
    alert(`✅ Bienvenido ${adminUser.username}\nRol: Administrador\nRedirigiendo al panel...`);
    
    // Redirigir al home de sysadmin
    window.location.href = '/sysadmin/home';
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