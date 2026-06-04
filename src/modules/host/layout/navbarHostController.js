// src/modules/host/layout/navbarHostController.js

export const navbarHostController = {
    async render(container) {
        // Cargar el HTML del navbar
        const response = await fetch('/public/modules/host/layout/navbarHost.html');
        const html = await response.text();
        container.innerHTML = html;
        
        // Adjuntar eventos después de inyectar
        setTimeout(() => {
            this.attachEvents();
        }, 50);
    },
    
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
        
        // Reemplazar para evitar duplicados
        const newBurgerBtn = burgerBtn.cloneNode(true);
        burgerBtn.parentNode.replaceChild(newBurgerBtn, burgerBtn);
        
        const newNavList = document.getElementById('snaap-nav-list-host');
        const newIcon = newBurgerBtn.querySelector('i');
        
        newBurgerBtn.addEventListener('click', toggleMenu);
        
        // Cerrar menú al hacer click en un enlace
        document.querySelectorAll('.snaap-btn-host').forEach(link => {
            link.addEventListener('click', () => {
                newNavList.classList.remove('active');
                if (newIcon) {
                    newIcon.classList.remove('fa-xmark');
                    newIcon.classList.add('fa-bars');
                }
            });
        });
        
        // Logout
        const logoutBtn = document.getElementById('logout-host-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                if (!confirm('¿Cerrar sesión?')) {
                    e.preventDefault();
                }
            });
        }
    }
};

export default navbarHostController;