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
        // 🔥 RUTA CORREGIDA - Eliminado /public/
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

        console.log('✅ Navbar unificado cargado');
    } catch (error) {
        console.error('❌ Error cargando navbar:', error);
        navbarContainer.innerHTML = getFallbackNavbar();
        setupNavbarEvents();
    }
}

// ============================================
// 🔧 CONFIGURAR EVENTOS
// ============================================
function setupNavbarEvents() {
    // Logout
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }

    // 🔥 PERFIL - Redirigir a la ruta correcta según el rol
    const profileLink = document.getElementById('profile-link');
    if (profileLink) {
        profileLink.addEventListener('click', (e) => {
            e.preventDefault();
            const user = userService.getCurrentUser();
            if (user) {
                const role = user.role;
                let profilePath = '/host/profile'; // Por defecto
                
                if (role === 'sysadmin') {
                    profilePath = '/sysadmin/profile';
                } else if (role === 'host') {
                    profilePath = '/host/profile';
                } else if (role === 'user') {
                    profilePath = '/profile';
                }
                
                console.log(`🔀 Redirigiendo a perfil: ${profilePath} (rol: ${role})`);
                navigateTo(profilePath);
            }
        });
    }

    // Cerrar menú al hacer clic en enlaces
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
// 🔄 ACTUALIZAR VISIBILIDAD
// ============================================
function updateNavbarVisibility() {
    const user = userService.getCurrentUser();
    const isAuthenticated = !!user;
    const role = user ? user.role : null;

    console.log(`🔄 Actualizando navbar - Auth: ${isAuthenticated}, Rol: ${role}`);

    const items = document.querySelectorAll('[data-role]');
    items.forEach(item => {
        const roles = item.getAttribute('data-role').split(',');
        
        // Si es invitado (guest)
        if (roles.includes('guest')) {
            item.style.display = isAuthenticated ? 'none' : '';
            return;
        }

        // Si es autenticado y tiene el rol
        if (isAuthenticated && roles.includes(role)) {
            item.style.display = '';
        } else {
            item.style.display = 'none';
        }
    });

    // Actualizar nombre de perfil
    const profileName = document.getElementById('profile-name');
    if (profileName && user) {
        profileName.textContent = user.username || user.email?.split('@')[0] || 'Perfil';
    } else if (profileName) {
        profileName.textContent = 'Perfil';
    }

    // Actualizar enlace de perfil (atributo href)
    const profileLink = document.getElementById('profile-link');
    if (profileLink && user) {
        const role = user.role;
        let profilePath = '/host/profile';
        if (role === 'sysadmin') {
            profilePath = '/sysadmin/profile';
        } else if (role === 'host') {
            profilePath = '/host/profile';
        } else if (role === 'user') {
            profilePath = '/profile';
        }
        profileLink.setAttribute('href', profilePath);
    }

    updateActiveLink();
}

// ============================================
// 🚪 CERRAR SESIÓN
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
        didOpen: () => {
            Swal.showLoading();
        }
    });

    try {
        const logoutResult = await userService.logout();
        Swal.close();

        if (logoutResult.success) {
            document.dispatchEvent(new CustomEvent('auth:changed', {
                detail: {
                    user: null,
                    role: null,
                    isAuthenticated: false
                }
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
// 📱 TOGGLE MÓVIL
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
// 🔗 ENLACE ACTIVO
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
// 🆘 NAVBAR DE FALLBACK
// ============================================
function getFallbackNavbar() {
    return `
        <nav class="snaap-navbar-unified">
            <div class="navbar-container">
                <a href="/" class="snaap-logo" data-link>
                    Sn<span class="neon-aa">aa</span>p
                </a>
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

function navigateTo(path) {
    if (typeof window.navigateTo === 'function') {
        window.navigateTo(path);
    } else {
        window.location.href = path;
    }
}

// Inicializar automáticamente
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNavbar);
} else {
    initNavbar();
}