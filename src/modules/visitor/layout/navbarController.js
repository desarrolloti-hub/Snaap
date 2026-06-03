// src/modules/visitor/layout/navbarController.js

export const navbarController = {
    render(container) {
        container.innerHTML = `
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
        
        // Esperar un momento para que el DOM se actualice
        setTimeout(() => {
            this.attachEvents();
        }, 100);
    },
    
    attachEvents() {
        const burgerBtn = document.getElementById('snaap-burger-btn');
        const navList = document.getElementById('snaap-nav-list');
        
        console.log('burgerBtn:', burgerBtn);
        console.log('navList:', navList);
        
        if (!burgerBtn || !navList) {
            console.error('Elementos no encontrados');
            return;
        }
        
        const icon = burgerBtn.querySelector('i');
        
        // Función para abrir/cerrar menú
        const toggleMenu = (e) => {
            e.stopPropagation();
            navList.classList.toggle('active');
            
            console.log('Menú active:', navList.classList.contains('active'));
            
            if (icon) {
                if (navList.classList.contains('active')) {
                    icon.classList.remove('fa-bars');
                    icon.classList.add('fa-xmark');
                    icon.style.color = '#ff00aa';
                } else {
                    icon.classList.remove('fa-xmark');
                    icon.classList.add('fa-bars');
                    icon.style.color = '#ffffff';
                }
            }
        };
        
        // Limpiar event listeners anteriores
        const newBurgerBtn = burgerBtn.cloneNode(true);
        burgerBtn.parentNode.replaceChild(newBurgerBtn, burgerBtn);
        
        const newNavList = document.getElementById('snaap-nav-list');
        const newIcon = newBurgerBtn.querySelector('i');
        
        // Agregar event listener nuevo
        newBurgerBtn.addEventListener('click', toggleMenu);
        
        // Cerrar menú al hacer click en un enlace
        const links = document.querySelectorAll('.snaap-btn');
        links.forEach(link => {
            link.addEventListener('click', () => {
                newNavList.classList.remove('active');
                if (newIcon) {
                    newIcon.classList.remove('fa-xmark');
                    newIcon.classList.add('fa-bars');
                    newIcon.style.color = '#ffffff';
                }
            });
        });
        
        console.log('✅ Eventos del navbar adjuntados');
    }
};

export default navbarController;