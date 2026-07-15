// src/modules/shared/navbar/navbarController.js
import { userService } from '../../../services/userService.js';
import { getRedirectPathByRole } from '../../../core/permissions.js';

let navbarInitialized = false;

export async function initNavbar() {
    if (navbarInitialized) return;
    navbarInitialized = true;

    console.log('🔥 Navbar unificado iniciado');

    const navbarContainer = document.getElementById('navbar-container');
    if (!navbarContainer) {
        console.warn('⚠️ No se encontró #navbar-container');
        return;
    }

    try {
        const response = await fetch('/public/modules/shared/navbar/navbar.html');
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

        console.log('✅ Navbar unificado cargado');
    } catch (error) {
        console.error('❌ Error cargando navbar:', error);
        navbarContainer.innerHTML = getFallbackNavbar();
        setupNavbarEvents();
    }
}

function setupNavbarEvents() {
    // 🔥 LOGOUT
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }

    // 🔥 PERFIL
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

    // 🔥 NOTIFICACIONES - BOTÓN
    const notificationBtn = document.getElementById('notificationToggleBtn');
    if (notificationBtn) {
        notificationBtn.addEventListener('click', handleNotificationToggle);
    }

    // 🔥 CERRAR MENÚ AL HACER CLIC EN UN BOTÓN
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
// 🔔 MANEJAR CLIC EN BOTÓN DE NOTIFICACIONES
// ============================================
async function handleNotificationToggle() {
    const user = userService.getCurrentUser();
    if (!user) {
        Swal.fire({
            title: 'Inicia sesión',
            text: 'Debes iniciar sesión para activar las notificaciones',
            icon: 'warning',
            confirmButtonText: 'OK'
        });
        return;
    }

    const btn = document.getElementById('notificationToggleBtn');
    const statusText = document.getElementById('notificationStatus');
    
    // 🔥 Deshabilitar botón mientras se procesa
    btn.disabled = true;
    btn.style.opacity = '0.6';

    try {
        // 🔥 Importar y ejecutar toggleSubscription
        const { toggleSubscription } = await import('../../../modules/shared/notification/notificationController.js');
        await toggleSubscription();
        
        // 🔥 Actualizar estado del botón
        const { notificationService } = await import('../../../services/notificationService.js');
        
        if (notificationService.isSubscribed) {
            if (statusText) statusText.textContent = '✅ Activadas';
            btn.style.borderColor = '#00ff88';
            btn.style.color = '#00ff88';
            btn.classList.add('active');
        } else {
            if (statusText) statusText.textContent = '🔔 Activar';
            btn.style.borderColor = '#4db8ff';
            btn.style.color = '#ffffff';
            btn.classList.remove('active');
        }
    } catch (error) {
        console.error('❌ Error en notificaciones:', error);
        Swal.fire({
            title: 'Error',
            text: error.message || 'Ocurrió un error al activar las notificaciones',
            icon: 'error',
            confirmButtonText: 'OK'
        });
    }

    // 🔥 Restaurar botón
    btn.disabled = false;
    btn.style.opacity = '1';
}

// ============================================
// 👤 ACTUALIZAR VISIBILIDAD DEL NAVBAR
// ============================================
function updateNavbarVisibility() {
    const user = userService.getCurrentUser();
    const isAuthenticated = !!user;
    const role = user ? user.role : null;

    console.log(`🔄 Actualizando navbar - Auth: ${isAuthenticated}, Rol: ${role}`);

    // 🔥 MOSTRAR/OCULTAR ELEMENTOS SEGÚN ROL
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

    // 🔥 ACTUALIZAR NOMBRE DE PERFIL
    const profileName = document.getElementById('profile-name');
    if (profileName && user) {
        profileName.textContent = user.username || user.email?.split('@')[0] || 'Perfil';
    } else if (profileName) {
        profileName.textContent = 'Perfil';
    }

    // 🔥 ACTUALIZAR ENLACE DE PERFIL
    const profileLink = document.getElementById('profile-link');
    if (profileLink && user) {
        const path = getRedirectPathByRole(role);
        profileLink.setAttribute('href', path);
    }

    // 🔥 ACTUALIZAR ENLACE ACTIVO
    updateActiveLink();

    // 🔥 ACTUALIZAR NOTIFICACIONES SI EL USUARIO ESTÁ AUTENTICADO
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
// 🚪 MANEJAR CIERRE DE SESIÓN
// ============================================
async function handleLogout() {
    const result = await Swal.fire({
        title: '¿Cerrar sesión?',
        text: '¿Estás seguro de que deseas cerrar sesión?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Sí, cerrar',
        cancelButtonText: 'Cancelar'
    });

    if (!result.isConfirmed) return;

    Swal.fire({
        title: 'Cerrando sesión...',
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
                title: '¡Sesión cerrada!',
                text: logoutResult.message,
                icon: 'success',
                confirmButtonText: 'OK'
            });

            navigateTo('/');
        } else {
            Swal.fire({
                title: 'Error',
                text: logoutResult.error || 'Error al cerrar sesión',
                icon: 'error',
                confirmButtonText: 'OK'
            });
        }
    } catch (error) {
        Swal.close();
        console.error('Error en logout:', error);
        Swal.fire({
            title: 'Error',
            text: 'Ocurrió un error al cerrar sesión',
            icon: 'error',
            confirmButtonText: 'OK'
        });
    }
}

// ============================================
// 📱 MENÚ MÓVIL (HAMBURGUESA)
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

    // 🔥 CERRAR MENÚ AL HACER CLIC FUERA
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
// 🔗 ACTUALIZAR ENLACE ACTIVO
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
// ⚠️ NAVBAR DE RESPALDO (FALLBACK)
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
                    <li><a href="/login" class="snaap-btn" data-link><i class="fas fa-user"></i> Iniciar sesión</a></li>
                </ul>
            </div>
        </nav>
    `;
}

// ============================================
// 🧭 NAVEGACIÓN
// ============================================
function navigateTo(path) {
    if (typeof window.navigateTo === 'function') {
        window.navigateTo(path);
    } else {
        window.location.href = path;
    }
}

// ============================================
// 🚀 INICIALIZACIÓN AUTOMÁTICA
// ============================================
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNavbar);
} else {
    initNavbar();
}