/**
 * Componente: Navegator.js (Neon Outline Hover Edition)
 * Efectos: 'aa' huecas, botones simétricos, Hover de contorno rosa (sin relleno).
 */

const NavegatorPremiumFull = (() => {
    const styles = `
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');
        @import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css');

        :root {
            --azul-neon: #0047AB;
            --rosa-neon: #FF007A;
            --azul-claro: #4db8ff; 
            --glass-bg: rgba(0, 0, 0, 0.85);
            --glass-border: rgba(255, 255, 255, 0.1);
        }

        /* --- NAVBAR --- */
        .snaap-navbar {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 80px;
            box-sizing: border-box;
            z-index: 10000;
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border-bottom: 1px solid var(--glass-border);
            font-family: 'Poppins', sans-serif;
            padding: 0 5%;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        /* --- LOGO --- */
        .snaap-logo {
            font-size: 35px;
            font-weight: 800;
            color: #ffffff;
            text-decoration: none;
            letter-spacing: -1px;
            display: flex;
            align-items: center;
        }

        .snaap-logo .neon-aa {
            color: transparent;
            -webkit-text-stroke: 1.2px var(--azul-claro);
            filter: drop-shadow(0 0 8px var(--azul-neon));
            margin: 0 2px;
        }

        /* --- MENÚ --- */
        .snaap-menu {
            display: flex;
            list-style: none;
            gap: 15px;
            margin: 0;
            padding: 0;
            align-items: center;
        }

        /* --- BOTONES CON HOVER DE CONTORNO ROSA --- */
        .snaap-btn {
            background: transparent;
            border: 2px solid var(--azul-neon);
            padding: 8px 0;
            width: 170px;
            border-radius: 50px;
            color: #fff;
            text-decoration: none;
            font-size: 13px;
            font-weight: 600;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            text-transform: capitalize;
            transition: all 0.3s ease-in-out;
            box-shadow: 0 0 5px rgba(0, 71, 171, 0.3);
            animation: neonPulse 2.5s infinite alternate;
        }

        @keyframes neonPulse {
            from { box-shadow: 0 0 5px var(--azul-neon); border-color: var(--azul-neon); }
            to { box-shadow: 0 0 15px var(--azul-neon), inset 0 0 2px var(--azul-neon); border-color: var(--azul-claro); }
        }

        .snaap-btn i {
            color: var(--azul-claro);
            transition: color 0.3s;
        }

        /* EFECTO HOVER: SOLO CONTORNO ROSA */
        .snaap-btn:hover {
            border-color: var(--rosa-neon); /* Cambia el color del borde */
            background: transparent; /* Mantiene la transparencia */
            transform: translateY(-3px);
            box-shadow: 0 0 20px var(--rosa-neon), inset 0 0 8px var(--rosa-neon); /* Brillo rosa exterior e interior */
            animation: none; /* Detenemos el pulso azul */
            color: #fff;
        }

        .snaap-btn:hover i {
            color: var(--rosa-neon); /* El icono también se vuelve rosa para combinar */
            filter: drop-shadow(0 0 5px var(--rosa-neon));
        }

        /* --- LEYENDA RSI --- */
        .rsi-footer-link {
            display: none;
            text-align: center;
            padding: 20px;
            font-size: 12px;
            color: rgba(255, 255, 255, 0.6);
            text-decoration: none;
            letter-spacing: 0.5px;
        }

        /* --- RESPONSIVE --- */
        .snaap-burger {
            display: none;
            color: #fff;
            font-size: 30px;
            cursor: pointer;
            z-index: 10001;
        }

        @media (max-width: 1024px) {
            .snaap-burger { display: block; }

            .snaap-menu {
                position: fixed;
                top: 0;
                right: -100%;
                width: 100%;
                height: 100vh;
                background: rgba(5, 5, 10, 0.98);
                backdrop-filter: blur(30px);
                flex-direction: column;
                justify-content: center;
                transition: 0.6s cubic-bezier(0.77, 0, 0.175, 1);
                gap: 20px;
                padding: 0;
            }

            .snaap-menu.active { right: 0; }

            .snaap-btn {
                font-size: 16px;
                padding: 11px 0;
                width: 290px; /* Tamaño cápsula móvil */
            }

            .rsi-footer-link {
                display: block;
                position: absolute;
                bottom: 35px;
                width: 100%;
                left: 0;
            }
        }
    `;

    const init = () => {
        const styleSheet = document.createElement("style");
        styleSheet.innerText = styles;
        document.head.appendChild(styleSheet);

        const nav = document.createElement("nav");
        nav.className = "snaap-navbar";
        nav.innerHTML = `
            <a href="#" class="snaap-logo">
                Sn<span class="neon-aa">aa</span>p
            </a>
            
            <div class="snaap-burger" id="snaap-burger-btn">
                <i class="fas fa-bars"></i>
            </div>

            <ul class="snaap-menu" id="snaap-nav-list">
                <li><a href="/index.html" class="snaap-btn"><i class="fas fa-house"></i> Inicio</a></li>
                <li><a href="/aboutUs.html" class="snaap-btn"><i class="fas fa-info-circle"></i> Sobre nosotros</a></li>
                <li><a href="/packages.html" class="snaap-btn"><i class="fas fa-boxes"></i> Paquetes</a></li>
                <li><a href="/login.html" class="snaap-btn"><i class="fas fa-user"></i> Inicio de sesión</a></li>
                
                <a href="https://rsienterprise.com/" target="_blank" class="rsi-footer-link">
                    desarrollada por rsi enterprice mexico
                </a>
            </ul>
        `;

        document.body.prepend(nav);

        const burgerBtn = document.getElementById("snaap-burger-btn");
        const navList = document.getElementById("snaap-nav-list");
        const icon = burgerBtn.querySelector("i");

        burgerBtn.addEventListener("click", () => {
            navList.classList.toggle("active");
            icon.classList.toggle("fa-bars");
            icon.classList.toggle("fa-xmark");
            icon.style.color = navList.classList.contains("active") ? "var(--rosa-neon)" : "#fff";
        });

        const links = document.querySelectorAll('.snaap-btn');
        links.forEach(n => n.addEventListener("click", () => {
            navList.classList.remove("active");
            icon.className = "fas fa-bars";
            icon.style.color = "#fff";
        }));
    };

    return { init };
})();

// Borra window.onload si existía y pon esto al final de navegator.js:
document.addEventListener("DOMContentLoaded", NavegatorPremiumFull.init);