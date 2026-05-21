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
                    <a href="https://rsienterprise.com/" target="_blank" class="rsi-footer-link">
                        desarrollada por rsi enterprise mexico
                    </a>
                </ul>
            </nav>
        `;
    },
    
    attachEvents() {
        const burgerBtn = document.getElementById("snaap-burger-btn");
        const navList = document.getElementById("snaap-nav-list");
        if (!burgerBtn || !navList) return;
        
        const icon = burgerBtn.querySelector("i");
        burgerBtn.addEventListener("click", () => {
            navList.classList.toggle("active");
            icon.classList.toggle("fa-bars");
            icon.classList.toggle("fa-xmark");
            icon.style.color = navList.classList.contains("active") ? "var(--rosa-neon)" : "#fff";
        });
        
        const links = document.querySelectorAll('.snaap-btn');
        links.forEach(link => {
            link.addEventListener("click", () => {
                navList.classList.remove("active");
                if (icon) {
                    icon.className = "fas fa-bars";
                    icon.style.color = "#fff";
                }
            });
        });
    }
};