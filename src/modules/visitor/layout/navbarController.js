export const navbarController = {
    /**
     * Renderiza el navbar de visitante en el contenedor especificado
     * @param {HTMLElement} container - Elemento DOM donde se inyectará el navbar
     */
    async render(container) {
        if (!container) {
            console.error('navbarController: No se proporcionó un contenedor válido');
            return;
        }

        try {
            const response = await fetch('/modules/visitor/layout/navbar.html');
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const html = await response.text();
            container.innerHTML = html;
            
            this.attachEvents();
            
        } catch (error) {
            console.error('Error loading navbar:', error);
            container.innerHTML = this.getFallbackNavbar();
            this.attachEvents();
        }
    },

    /**
     * Adjunta todos los eventos del navbar de visitante
     */
    attachEvents() {
        const burgerBtn = document.getElementById('snaap-burger-btn');
        const navList = document.getElementById('snaap-nav-list');
        
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
        
        const newBurgerBtn = burgerBtn.cloneNode(true);
        burgerBtn.parentNode.replaceChild(newBurgerBtn, burgerBtn);
        
        const newNavList = document.getElementById('snaap-nav-list');
        const newIcon = newBurgerBtn.querySelector('i');
        
        newBurgerBtn.addEventListener('click', toggleMenu);
        
        const allLinks = document.querySelectorAll('.snaap-btn');
        allLinks.forEach(link => {
            link.removeEventListener('click', this.handleLinkClick);
            link.addEventListener('click', this.handleLinkClick);
        });
    },

    /**
     * Manejador para clicks en enlaces del navbar
     * @param {Event} e 
     */
    handleLinkClick(e) {
        const navList = document.getElementById('snaap-nav-list');
        const icon = document.querySelector('#snaap-burger-btn i');
        
        if (navList && navList.classList.contains('active')) {
            navList.classList.remove('active');
            if (icon) {
                icon.classList.remove('fa-xmark');
                icon.classList.add('fa-bars');
            }
        }
    },

    /**
     * Navbar de respaldo en caso de error de carga
     * @returns {string} HTML del navbar alternativo
     */
    getFallbackNavbar() {
        return `
            <nav class="snaap-navbar">
                <a href="/" class="snaap-logo" data-link>
                    Sn<span class="neon-aa">aa</span>p
                </a>
                <div class="snaap-burger" id="snaap-burger-btn">
                    <i class="fas fa-bars"></i>
                </div>
                <ul class="snaap-menu" id="snaap-nav-list">
                    <li><a href="/" class="snaap-btn" data-link><i class="fas fa-house"></i> Inicio</a></li>
                    <li><a href="/nosotros" class="snaap-btn" data-link><i class="fas fa-info-circle"></i> Sobre nosotros</a></li>
                    <li><a href="/paquetes" class="snaap-btn" data-link><i class="fas fa-boxes"></i> Paquetes</a></li>
                    <li><a href="/login" class="snaap-btn" data-link><i class="fas fa-user"></i> Inicio de sesión</a></li>
                    <li class="snaap-footer-item">
                        <a href="https://rsienterprise.com/" target="_blank" class="snaap-footer-link">
                            desarrollada por rsi enterprise mexico
                        </a>
                    </li>
                </ul>
            </nav>
        `;
    }
};

export default navbarController;