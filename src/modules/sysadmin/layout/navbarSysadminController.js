export const navbarSysadminController = {
    render: async function(container) {
        const response = await fetch('/public/modules/sysadmin/layout/navbarSysadmin.html');
        const html = await response.text();
        container.innerHTML = html;
        
        loadStyles();
        setupEventListeners();
        highlightActiveLink();
    }
};

function loadStyles() {
    const styles = [
        { href: '/src/css/components/navbarSysadmin.css', id: 'navbar-sysadmin-style' }
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

function setupEventListeners() {
    const logoutBtn = document.getElementById('logoutBtn');
    const logoutBtnMobile = document.getElementById('logoutBtnMobile');
    
    const handleLogout = async () => {
        const result = await Swal.fire({
            title: '¿Cerrar sesión?',
            text: '¿Estás seguro de que deseas cerrar sesión?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#ff00aa',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Sí, cerrar',
            cancelButtonText: 'Cancelar'
        });
        
        if (result.isConfirmed) {
            localStorage.removeItem('snaap_current_user');
            window.location.href = '/';
        }
    };
    
    if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);
    if (logoutBtnMobile) logoutBtnMobile.addEventListener('click', handleLogout);
    
    // Menú móvil
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });
        
        // Cerrar menú al hacer clic en cualquier botón
        navMenu.querySelectorAll('.snaap-btn-inicio, .snaap-btn-hosts, .snaap-btn-admins, .snaap-btn-eventos, .snaap-btn-stats, .snaap-btn-perfil, .snaap-btn-salir').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
            });
        });
    }
    
    // Cerrar menú al hacer clic fuera
    document.addEventListener('click', (e) => {
        if (navMenu && navToggle) {
            if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
                navMenu.classList.remove('active');
            }
        }
    });
}

function highlightActiveLink() {
    const currentPath = window.location.pathname;
    const allButtons = document.querySelectorAll('.snaap-btn-inicio, .snaap-btn-hosts, .snaap-btn-admins, .snaap-btn-eventos, .snaap-btn-stats');
    
    allButtons.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPath) {
            link.classList.add('active');
        } else if (currentPath.startsWith(href) && href !== '/sysadmin/home') {
            link.classList.add('active');
        }
    });
}