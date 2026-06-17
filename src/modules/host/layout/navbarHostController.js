// src/modules/host/layout/navbarHostController.js

export const navbarHostController = {
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
            
        } catch (error) {
            console.error('Error loading navbar, usando fallback:', error);
            container.innerHTML = this.getNavbarHTML();
        }
        
        this.attachEvents();
    },

    getNavbarHTML() {
        return `
            <nav class="snaap-navbar">
                <a href="/" class="snaap-logo" data-link>
                    Sn<span class="neon-aa">aa</span>p
                </a>
                <div class="snaap-burger" id="snaap-burger-btn">
                    <i class="fas fa-bars"></i>
                </div>
                <ul class="snaap-menu" id="snaap-nav-list">
                    <li><a href="/host" class="snaap-btn" data-link><i class="fas fa-home"></i> Inicio</a></li>            
                    <li><a href="/host/create-event" class="snaap-btn" data-link><i class="fas fa-plus-circle"></i> Crear nuevo evento</a></li>
                    <li><a href="/host/event-crud" class="snaap-btn" data-link><i class="fas fa-calendar-alt"></i> Historial de eventos</a></li>
                    <li><a href="/host/profile" class="snaap-btn" data-link><i class="fas fa-user-circle"></i> Perfil</a></li>
                    <li><a href="#" class="snaap-btn" data-link id="logout-host-btn"><i class="fas fa-sign-out-alt"></i> Cerrar sesión</a></li>
                    <li class="snaap-footer-item"></li>
                </ul>
            </nav>
        `;
    },

    attachEvents() {
        // Menú hamburguesa
        const burgerBtn = document.getElementById('snaap-burger-btn');
        const navList = document.getElementById('snaap-nav-list');
        
        if (burgerBtn && navList) {
            const newBurgerBtn = burgerBtn.cloneNode(true);
            burgerBtn.parentNode.replaceChild(newBurgerBtn, burgerBtn);
            
            newBurgerBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                navList.classList.toggle('active');
                
                const icon = newBurgerBtn.querySelector('i');
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
        }
        
        // Cerrar menú al hacer click en un enlace
        const allLinks = document.querySelectorAll('.snaap-btn');
        allLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (navList) {
                    navList.classList.remove('active');
                    if (burgerBtn) {
                        const icon = burgerBtn.querySelector('i');
                        if (icon) {
                            icon.classList.remove('fa-xmark');
                            icon.classList.add('fa-bars');
                        }
                    }
                }
            });
        });
        
        // LOGOUT - SweetAlert2 (sin estilos en el JS)
        const logoutBtn = document.getElementById('logout-host-btn');
        if (logoutBtn) {
            const newLogoutBtn = logoutBtn.cloneNode(true);
            logoutBtn.parentNode.replaceChild(newLogoutBtn, logoutBtn);
            
            newLogoutBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                try {
                    const result = await Swal.fire({
                        title: '¿Cerrar sesión?',
                        text: '¿Estás seguro de que deseas cerrar sesión?',
                        icon: 'question',
                        showCancelButton: true,
                        confirmButtonText: 'Sí, cerrar',
                        cancelButtonText: 'Cancelar'
                    });
                    
                    if (result.isConfirmed) {
                        localStorage.removeItem('snaap_current_user');
                        window.location.href = '/';
                    }
                } catch (error) {
                    console.error('Error al mostrar SweetAlert:', error);
                    if (confirm('¿Cerrar sesión?')) {
                        localStorage.removeItem('snaap_current_user');
                        window.location.href = '/';
                    }
                }
            });
        }
    }
};

export default navbarHostController;