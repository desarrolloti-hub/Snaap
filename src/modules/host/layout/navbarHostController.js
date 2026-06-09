// src/modules/host/layout/navbarHostController.js

export const navbarHostController = {
    /**
     * Renderiza el navbar en el contenedor especificado
     * @param {HTMLElement} container - Elemento DOM donde se inyectará el navbar
     */
    async render(container) {
        if (!container) {
            console.error('navbarHostController: No se proporcionó un contenedor válido');
            return;
        }

        try {
            const response = await fetch('/modules/host/layout/navbarHost.html');
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const html = await response.text();
            container.innerHTML = html;
            
            // Adjuntar eventos después de inyectar el HTML
            this.attachEvents();
            
        } catch (error) {
            console.error('Error loading navbar:', error);
            container.innerHTML = this.getFallbackNavbar();
            // Intentar adjuntar eventos también para el fallback
            this.attachEvents();
        }
    },

    /**
     * Adjunta todos los eventos del navbar
     */
    attachEvents() {
        const burgerBtn = document.getElementById('snaap-burger-btn-host');
        const navList = document.getElementById('snaap-nav-list-host');
        
        if (!burgerBtn || !navList) return;
        
        const icon = burgerBtn.querySelector('i');
        
        const toggleMenu = (e) => {
            e.stopPropagation();
            navList.classList.toggle('active');
            
            if (icon) {
                if (navList.classList.contains('active')) {
                    icon.classList.remove('fa-bars');
                    icon.classList.add('fa-xmark');
                } else {
                    icon.classList.remove('fa-xmark');
                    icon.classList.add('fa-bars');
                }
            }
        };
        
        // Reemplazar para evitar duplicados de eventos
        const newBurgerBtn = burgerBtn.cloneNode(true);
        burgerBtn.parentNode.replaceChild(newBurgerBtn, burgerBtn);
        
        const newNavList = document.getElementById('snaap-nav-list-host');
        const newIcon = newBurgerBtn.querySelector('i');
        
        newBurgerBtn.addEventListener('click', toggleMenu);
        
        // Cerrar menú al hacer click en un enlace
        const allLinks = document.querySelectorAll('.snaap-btn-host');
        allLinks.forEach(link => {
            // Remover event listeners antiguos para evitar duplicados
            link.removeEventListener('click', this.handleLinkClick);
            // Agregar nuevo
            link.addEventListener('click', this.handleLinkClick);
        });
        
        // Logout
        const logoutBtn = document.getElementById('logout-host-btn');
        if (logoutBtn) {
            logoutBtn.removeEventListener('click', this.handleLogout);
            logoutBtn.addEventListener('click', this.handleLogout);
        }
    },

    /**
     * Manejador para clicks en enlaces del navbar
     * @param {Event} e 
     */
    handleLinkClick(e) {
        const navList = document.getElementById('snaap-nav-list-host');
        const icon = document.querySelector('#snaap-burger-btn-host i');
        
        if (navList && navList.classList.contains('active')) {
            navList.classList.remove('active');
            if (icon) {
                icon.classList.remove('fa-xmark');
                icon.classList.add('fa-bars');
            }
        }
    },

    /**
     * Manejador para el botón de logout
     * @param {Event} e 
     */
    handleLogout(e) {
        if (!confirm('¿Cerrar sesión?')) {
            e.preventDefault();
        }
    },

    /**
     * Navbar de respaldo en caso de error de carga
     * @returns {string} HTML del navbar alternativo
     */
    getFallbackNavbar() {
        return `
            <nav class="snaap-navbar-host">
                <a href="/host" class="snaap-logo-host" data-link>
                    <span class="sn-glow-host">S</span>
                    <span class="sn-glow-host">n</span>
                    <span class="aa-neonblue-host">a</span>
                    <span class="aa-neonblue-host">a</span>
                    <span class="p-solid-host">p</span>
                    <span class="host-badge">Host</span>
                </a>
                <div class="snaap-burger-host" id="snaap-burger-btn-host">
                    <i class="fas fa-bars"></i>
                </div>
                <ul class="snaap-menu-host" id="snaap-nav-list-host">
                    <li><a href="/host" class="snaap-btn-host" data-link><i class="fas fa-chart-line"></i> perfil</a></li>
                    <li><a href="/host/properties" class="snaap-btn-host" data-link><i class="fas fa-building"></i> nuevo evento</a></li>
                    <li><a href="/host/reservations" class="snaap-btn-host" data-link><i class="fas fa-calendar-check"></i> Reservaciones</a></li>
                    <li><a href="/host/earnings" class="snaap-btn-host" data-link><i class="fas fa-dollar-sign"></i> eventos</a></li>
                    <li><a href="/host/settings" class="snaap-btn-host" data-link><i class="fas fa-cog"></i> Configuración</a></li>
                    <li><a href="/" class="snaap-btn-host" data-link id="logout-host-btn"><i class="fas fa-sign-out-alt"></i> Cerrar sesión</a></li>
                    <li class="snaap-footer-item-host">
                        <a href="https://rsienterprise.com/" target="_blank" class="snaap-footer-link-host">
                            desarrollada por rsi enterprise mexico
                        </a>
                    </li>
                </ul>
            </nav>
        `;
    }
};

export default navbarHostController;