// src/modules/shared/navbar/navbarController.js
import { userService } from '../../../services/userService.js';
import { getRedirectPathByRole } from '../../../core/permissions.js';

let navbarInitialized = false;

// ============================================
// ðŸ”¥ RUTAS DONDE NO SE MUESTRA EL NAVBAR
// ============================================
const HIDDEN_NAVBAR_ROUTES = [
    '/user/home',
    '/user/gallery',
    '/user/scan',
    '/event'
];

// ============================================
// ðŸ” VERIFICAR SI EL NAVBAR DEBE OCULTARSE
// ============================================
function shouldHideNavbar() {
    const currentPath = window.location.pathname;
    console.log('ðŸ” Verificando navbar para ruta:', currentPath);
    
    // Verificar rutas exactas
    if (HIDDEN_NAVBAR_ROUTES.includes(currentPath)) {
        console.log('âœ… Navbar oculto (ruta exacta)');
        return true;
    }
    
    // Verificar rutas con parÃ¡metros (ej: /event/:id)
    for (const route of HIDDEN_NAVBAR_ROUTES) {
        if (route.includes(':')) {
            const pattern = route.replace(/:\w+/g, '[^/]+');
            const regex = new RegExp(`^${pattern}$`);
            if (regex.test(currentPath)) {
                console.log('âœ… Navbar oculto (ruta con parÃ¡metro)');
                return true;
            }
        }
        // Verificar si la ruta actual comienza con la ruta base
        if (currentPath.startsWith(route) && route !== '/') {
            console.log('âœ… Navbar oculto (ruta base)');
            return true;
        }
    }
    
    console.log('âŒ Navbar visible');
    return false;
}

export async function initNavbar() {
    if (navbarInitialized) return;
    navbarInitialized = true;

    console.log('ðŸ”¥ Navbar unificado iniciado');

    const navbarContainer = document.getElementById('navbar-container');
    if (!navbarContainer) {
        console.warn('âš ï¸ No se encontrÃ³ #navbar-container');
        return;
    }

    try {
        const response = await fetch('/modules/shared/navbar/navbar.html');
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const html = await response.text();
        navbarContainer.innerHTML = html;

        setupNavbarEvents();
        updateNavbarVisibility();

        document.addEventListener('auth:changed', () => {
            updateNavbarVisibility();
        });

        document.addEventListener('route:changed', () => {
            updateNavbarVisibility();
        });

        setupMobileToggle();

        console.log('âœ… Navbar unificado cargado');
    } catch (error) {
        console.error('âŒ Error cargando navbar:', error);
        navbarContainer.innerHTML = getFallbackNavbar();
        setupNavbarEvents();
    }
}

function setupNavbarEvents() {
    // ðŸ”¥ LOGOUT
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }

    // ðŸ”¥ PERFIL
    const profileLink = document.getElementById('profile-link');
    if (profileLink) {
        profileLink.addEventListener('click', (e) => {
            e.preventDefault();
            const user = userService.getCurrentUser();
            if (user) {
                const path = getRedirectPathByRole(user.role);
                navigateTo(path);
            }
        });
    }

    // ðŸ”¥ NOTIFICACIONES - BOTÃ“N
    const notificationBtn = document.getElementById('notificationToggleBtn');
    if (notificationBtn) {
        notificationBtn.addEventListener('click', handleNotificationToggle);
    }

    // ðŸ”¥ CERRAR MENÃš AL HACER CLIC EN UN BOTÃ“N
    document.querySelectorAll('.snaap-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const menu = document.getElementById('snaap-nav-list');
            const burger = document.getElementById('snaap-burger-btn');
            if (menu && menu.classList.contains('active')) {
                menu.classList.remove('active');
                if (burger) {
                    const icon = burger.querySelector('i');
                    if (icon) {
                        icon.classList.remove('fa-xmark');
                        icon.classList.add('fa-bars');
                    }
                }
            }
        });
    });
}

// ============================================
// ðŸ”” MANEJAR CLIC EN BOTÃ“N DE NOTIFICACIONES
// ============================================
async function handleNotificationToggle() {
    const user = userService.getCurrentUser();
    if (!user) {
        Swal.fire({
            title: 'Inicia sesiÃ³n',
            text: 'Debes iniciar sesiÃ³n para activar las notificaciones',
            icon: 'warning',
            confirmButtonText: 'OK'
        });
        return;
    }

    const btn = document.getElementById('notificationToggleBtn');
    const statusText = document.getElementById('notificationStatus');
    
    btn.disabled = true;
    btn.style.opacity = '0.6';

    try {
        const { toggleSubscription } = await import('../../../modules/shared/notification/notificationController.js');
        await toggleSubscription();
        
        const { notificationService } = await import('../../../services/notificationService.js');
        
        if (notificationService.isSubscribed) {
            if (statusText) statusText.textContent = 'âœ… Activadas';
            btn.style.borderColor = '#00ff88';
            btn.style.color = '#00ff88';
            btn.classList.add('active');
        } else {
            if (statusText) statusText.textContent = 'ðŸ”” Activar';
            btn.style.borderColor = '#4db8ff';
            btn.style.color = '#ffffff';
            btn.classList.remove('active');
        }
    } catch (error) {
        console.error('âŒ Error en notificaciones:', error);
        Swal.fire({
            title: 'Error',
            text: error.message || 'OcurriÃ³ un error al activar las notificaciones',
            icon: 'error',
            confirmButtonText: 'OK'
        });
    }

    btn.disabled = false;
    btn.style.opacity = '1';
}

// ============================================
// ðŸ‘¤ ACTUALIZAR VISIBILIDAD DEL NAVBAR
// ============================================
function updateNavbarVisibility() {
    // ðŸ”¥ VERIFICAR SI DEBE OCULTARSE
    if (shouldHideNavbar()) {
        const navbar = document.getElementById('snaapNavbar');
        if (navbar) {
            navbar.style.display = 'none';
            console.log('âœ… Navbar oculto');
        }
        const navbarContainer = document.getElementById('navbar-container');
        if (navbarContainer) {
            navbarContainer.style.display = 'none';
        }
        return;
    }

    // Si no debe ocultarse, mostrarlo
    const navbar = document.getElementById('snaapNavbar');
    if (navbar) {
        navbar.style.display = '';
    }
    const navbarContainer = document.getElementById('navbar-container');
    if (navbarContainer) {
        navbarContainer.style.display = '';
    }

    const user = userService.getCurrentUser();
    const isAuthenticated = !!user;
    const role = user ? user.role : null;

    console.log(`ðŸ”„ Actualizando navbar - Auth: ${isAuthenticated}, Rol: ${role}`);

    // ðŸ”¥ MOSTRAR/OCULTAR ELEMENTOS SEGÃšN ROL
    const items = document.querySelectorAll('[data-role]');
    items.forEach(item => {
        const roles = item.getAttribute('data-role').split(',');
        
        if (roles.includes('guest')) {
            item.style.display = isAuthenticated ? 'none' : '';
            return;
        }

        if (isAuthenticated && roles.includes(role)) {
            item.style.display = '';
        } else {
            item.style.display = 'none';
        }
    });

    // ðŸ”¥ ACTUALIZAR NOMBRE DE PERFIL
    const profileName = document.getElementById('profile-name');
    if (profileName && user) {
        profileName.textContent = user.username || user.email?.split('@')[0] || 'Perfil';
    } else if (profileName) {
        profileName.textContent = 'Perfil';
    }

    // ðŸ”¥ ACTUALIZAR ENLACE DE PERFIL
    const profileLink = document.getElementById('profile-link');
    if (profileLink && user) {
        const path = getRedirectPathByRole(role);
        profileLink.setAttribute('href', path);
    }

    // ðŸ”¥ ACTUALIZAR ENLACE ACTIVO
    updateActiveLink();

    // ðŸ”¥ ACTUALIZAR NOTIFICACIONES SI EL USUARIO ESTÃ AUTENTICADO
    if (user) {
        import('../../../modules/shared/notification/notificationController.js')
            .then(module => {
                if (module.updateNotificationUI) {
                    module.updateNotificationUI();
                }
            })
            .catch(() => {});
    }
}

// ============================================
// ðŸšª MANEJAR CIERRE DE SESIÃ“N
// ============================================
async function handleLogout() {
    const result = await Swal.fire({
        title: 'Â¿Cerrar sesiÃ³n?',
        text: 'Â¿EstÃ¡s seguro de que deseas cerrar sesiÃ³n?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'SÃ­, cerrar',
        cancelButtonText: 'Cancelar'
    });

    if (!result.isConfirmed) return;

    Swal.fire({
        title: 'Cerrando sesiÃ³n...',
        text: 'Por favor espera',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading()
    });

    try {
        const logoutResult = await userService.logout();
        Swal.close();

        if (logoutResult.success) {
            document.dispatchEvent(new CustomEvent('auth:changed', {
                detail: { user: null, role: null, isAuthenticated: false }
            }));

            await Swal.fire({
                title: 'Â¡SesiÃ³n cerrada!',
                text: logoutResult.message,
                icon: 'success',
                confirmButtonText: 'OK'
            });

            navigateTo('/');
        } else {
            Swal.fire({
                title: 'Error',
                text: logoutResult.error || 'Error al cerrar sesiÃ³n',
                icon: 'error',
                confirmButtonText: 'OK'
            });
        }
    } catch (error) {
        Swal.close();
        console.error('Error en logout:', error);
        Swal.fire({
            title: 'Error',
            text: 'OcurriÃ³ un error al cerrar sesiÃ³n',
            icon: 'error',
            confirmButtonText: 'OK'
        });
    }
}

// ============================================
// ðŸ“± MENÃš MÃ“VIL (HAMBURGUESA)
// ============================================
function setupMobileToggle() {
    const burgerBtn = document.getElementById('snaap-burger-btn');
    const navList = document.getElementById('snaap-nav-list');

    if (!burgerBtn || !navList) return;

    burgerBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        navList.classList.toggle('active');
        const icon = burgerBtn.querySelector('i');
        if (icon) {
            if (navList.classList.contains('active')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-xmark');
            } else {
                icon.classList.remove('fa-xmark');
                icon.classList.add('fa-bars');
            }
        }
    });

    document.addEventListener('click', (e) => {
        if (!e.target.closest('.snaap-navbar-unified')) {
            navList.classList.remove('active');
            const icon = burgerBtn.querySelector('i');
            if (icon) {
                icon.classList.remove('fa-xmark');
                icon.classList.add('fa-bars');
            }
        }
    });
}

// ============================================
// ðŸ”— ACTUALIZAR ENLACE ACTIVO
// ============================================
function updateActiveLink() {
    const currentPath = window.location.pathname;
    document.querySelectorAll('.snaap-btn[data-link]').forEach(link => {
        link.classList.remove('active');
        const href = link.getAttribute('href');
        if (href && href !== '#' && currentPath === href) {
            link.classList.add('active');
        } else if (href && href !== '#' && currentPath.startsWith(href) && href !== '/') {
            link.classList.add('active');
        }
    });
}

// ============================================
// âš ï¸ NAVBAR DE RESPALDO (FALLBACK)
// ============================================
function getFallbackNavbar() {
    return `
        <nav class="snaap-navbar-unified">
            <div class="navbar-container">
                <a href="/" class="snaap-logo" data-link>Sn<span class="neon-aa">aa</span>p</a>
                <div class="snaap-burger" id="snaap-burger-btn">
                    <i class="fas fa-bars"></i>
                </div>
                <ul class="snaap-menu" id="snaap-nav-list">
                    <li><a href="/" class="snaap-btn" data-link><i class="fas fa-house"></i> Inicio</a></li>
                    <li><a href="/login" class="snaap-btn" data-link><i class="fas fa-user"></i> Iniciar sesiÃ³n</a></li>
                </ul>
            </div>
        </nav>
    `;
}

// ============================================
// ðŸ§­ NAVEGACIÃ“N
// ============================================
function navigateTo(path) {
    if (typeof window.navigateTo === 'function') {
        window.navigateTo(path);
    } else {
        window.go(path);
    }
}

// ============================================
// ðŸš€ INICIALIZACIÃ“N AUTOMÃTICA
// ============================================
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNavbar);
} else {
    initNavbar();
}
