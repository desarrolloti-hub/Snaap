// Controlador para el navbar del host
export function initNavbarHost() {
    // Esperar a que el DOM esté completamente cargado
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setupNavbar);
    } else {
        setupNavbar();
    }
}

function setupNavbar() {
    const burgerBtn = document.getElementById('snaap-burger-btn');
    const navMenu = document.getElementById('snaap-nav-list');
    
    if (!burgerBtn || !navMenu) return;
    
    // Crear overlay
    const overlay = document.createElement('div');
    overlay.className = 'menu-overlay';
    document.body.appendChild(overlay);
    
    function toggleMenu() {
        navMenu.classList.toggle('active');
        overlay.classList.toggle('active');
        document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
    }
    
    burgerBtn.addEventListener('click', toggleMenu);
    overlay.addEventListener('click', toggleMenu);
    
    // Cerrar menú al hacer click en un enlace (en móvil)
    const menuLinks = navMenu.querySelectorAll('a');
    menuLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            if (window.innerWidth <= 1024) {
                e.preventDefault();
                toggleMenu();
            }
        });
    });
    
    // Cerrar menú al redimensionar ventana
    window.addEventListener('resize', function() {
        if (window.innerWidth > 1024 && navMenu.classList.contains('active')) {
            toggleMenu();
        }
    });
}

// Exportar por defecto
export default { initNavbarHost };