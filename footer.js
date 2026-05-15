/**
 * Componente: Footer.js (Classic Neon Edition)
 * Estructura original con iconos Azul -> Rosa Hover.
 */

const FooterPremium = (() => {
    const styles = `
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap');
        @import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css');

        :root {
            --azul-neon: #0047AB;
            --rosa-neon: #FF007A;
            --azul-claro: #4db8ff; 
            --glass-bg: rgba(0, 0, 0, 0.9);
            --glass-border: rgba(255, 255, 255, 0.1);
        }

        .snaap-footer {
            background: var(--glass-bg);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border-top: 1px solid var(--glass-border);
            color: #fff;
            font-family: 'Poppins', sans-serif;
            padding: 60px 5% 30px 5%;
            position: relative;
            width: 100%;
            box-sizing: border-box;
            margin-top: 50px;
        }

        .footer-container {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            flex-wrap: wrap;
            max-width: 1200px;
            margin: 0 auto;
            gap: 40px;
        }

        /* --- LOGO ORIGINAL --- */
        .footer-logo {
            font-size: 60px;
            font-weight: 800;
            color: #ffffff;
            text-decoration: none;
            letter-spacing: -2px;
            display: flex;
            align-items: center;
            margin-bottom: 20px;
        }

        .footer-logo .neon-aa {
            color: transparent;
            -webkit-text-stroke: 1.5px var(--azul-claro);
            filter: drop-shadow(0 0 10px var(--azul-neon));
            margin: 0 3px;
        }

        /* --- SECCIÓN TÉRMINOS CON LÍNEA --- */
        .footer-info-section {
            flex: 2;
            min-width: 300px;
            padding-left: 40px;
            border-left: 2px solid rgba(255,255,255,0.1);
        }

        .footer-info-section h3 {
            font-size: 18px;
            font-weight: 700;
            text-transform: uppercase;
            margin-bottom: 15px;
        }

        .footer-info-section p {
            font-size: 14px;
            line-height: 1.6;
            color: rgba(255,255,255,0.7);
        }

        /* --- REDES SOCIALES --- */
        .social-title {
            font-size: 18px;
            font-weight: 700;
            margin-top: 30px;
            margin-bottom: 20px;
        }

        .social-title span {
            color: transparent;
            -webkit-text-stroke: 1px var(--azul-claro);
        }

        .social-icons {
            display: flex;
            gap: 20px;
        }

        /* ICONOS AZULES POR DEFECTO */
        .social-link {
            font-size: 26px;
            color: var(--azul-claro); 
            text-decoration: none;
            transition: all 0.3s ease;
            filter: drop-shadow(0 0 5px var(--azul-neon));
        }

        /* HOVER ROSA CON DESTELLO */
        .social-link:hover {
            color: var(--rosa-neon);
            filter: drop-shadow(0 0 10px var(--rosa-neon)) drop-shadow(0 0 20px var(--rosa-neon));
            transform: translateY(-5px);
        }

        /* --- BOTTOM RSI --- */
        .footer-bottom {
            width: 100%;
            text-align: center;
            margin-top: 50px;
            padding-top: 20px;
            border-top: 1px solid rgba(255,255,255,0.05);
        }

        .rsi-link {
            color: #fff;
            text-decoration: none;
            font-size: 13px;
            display: inline-flex;
            align-items: center;
            gap: 10px;
        }

        .rsi-link span {
            color: transparent;
            -webkit-text-stroke: 0.8px var(--azul-claro);
            font-weight: 700;
        }

        /* --- RESPONSIVE --- */
        @media (max-width: 768px) {
            .footer-container { flex-direction: column; align-items: center; text-align: center; }
            .footer-info-section { padding-left: 0; border-left: none; border-top: 2px solid rgba(255,255,255,0.1); padding-top: 30px; width: 100%; }
            .social-icons { justify-content: center; }
            .footer-logo { justify-content: center; }
        }
    `;

    const init = () => {
        const styleSheet = document.createElement("style");
        styleSheet.innerText = styles;
        document.head.appendChild(styleSheet);

        const footer = document.createElement("footer");
        footer.className = "snaap-footer";
        footer.innerHTML = `
            <div class="footer-container">
                <div class="footer-logo-section">
                    <a href="#" class="footer-logo">
                        Sn<span class="neon-aa">aa</span>p
                    </a>
                </div>

                <div class="footer-info-section">
                    <h3>Términos y Condiciones.</h3>
                    <p>
                        Primera línea con texto suave. Segunda línea que continúa la idea. 
                        Tercera línea para mantener la forma. Cuarta línea sin mensaje específico. 
                        Quinta línea para completar las cinco.
                    </p>

                    <div class="social-title">
                        NUESTR<span>aa</span>S REDES SOCI<span>aa</span>LES
                    </div>
                    <div class="social-icons">
                        <a href="#" class="social-link"><i class="fab fa-x-twitter"></i></a>
                        <a href="#" class="social-link"><i class="fab fa-facebook-f"></i></a>
                        <a href="#" class="social-link"><i class="fab fa-instagram"></i></a>
                        <a href="#" class="social-link"><i class="fab fa-whatsapp"></i></a>
                    </div>
                </div>
            </div>

            <div class="footer-bottom">
                <a href="https://rsienterprise.com/" target="_blank" class="rsi-link">
                    Desarrollado por RSI Enterprise México
                </a>
            </div>
        `;

        document.body.appendChild(footer);
    };

    return { init };
})();

// Pon esto al final de footer.js:
document.addEventListener("DOMContentLoaded", FooterPremium.init);
