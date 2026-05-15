/**
 * Componente: acercaDeNosotros.js (Snaap Style - Navigator Buttons Edition)
 * Características: Fondo galáctico neón, bordes pulsantes, 2 carruseles de imágenes.
 * Botones: Estilo cápsula/navegador unificado (bordes redondeados, azul claro -> rosa con glow perimetral).
 * Diseño: 100% fiel a tu imagen de referencia.
 */

const SnaapAcercaComponent = (() => {
    const styles = `
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700;800;900&display=swap');

        :root {
            --snaap-azul: #0047AB;
            --snaap-rosa: #FF007A;
            --snaap-azul-claro: #4db8ff;
        }

        .snaap-acerca-section {
            width: 100%;
           
            color: #ffffff;
            font-family: 'Poppins', sans-serif;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            align-items: center;
            padding-bottom: 80px;
            position: relative;
            z-index: 10;
        }

        /* --- SECCIÓN 1: CABECERA CON FONDO GALÁCTICO VIBRANTE --- */
        .snaap-acerca-cabecera {
            width: 100%;
            height: 350px;
            position: relative;
            background: linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=1600&auto=format&fit=crop');
            background-size: cover;
            background-position: center;
            display: flex;
            justify-content: center;
            align-items: center;
            margin-bottom: 60px;
        }

        .acerca-titulo-principal {
            text-align: center;
            text-transform: uppercase;
            position: relative;
            z-index: 5;
        }

        .acerca-titulo-principal .light-text {
            font-size: 38px;
            font-weight: 700;
            color: #fff;
            margin: 0;
            letter-spacing: 2px;
        }

        .acerca-titulo-principal .light-text span {
            color: var(--snaap-azul-claro);
            text-shadow: 0 0 10px var(--snaap-azul);
        }

        .acerca-titulo-principal .big-text {
            font-size: 46px;
            font-weight: 900;
            color: #fff;
            margin: 0;
            letter-spacing: 1px;
        }

        /* Líneas Neón Divisoras con Pulso */
        .acerca-divisor-neon {
            width: 100%;
            position: absolute;
            left: 0;
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 5%;
            box-sizing: border-box;
        }

        .acerca-divisor-neon.top { top: 40px; }
        .acerca-divisor-neon.bottom { bottom: 40px; }

        .acerca-divisor-neon .linea-horizontal {
            flex: 1;
            height: 2px;
            background: linear-gradient(90deg, var(--snaap-azul), var(--snaap-rosa));
            box-shadow: 0 0 12px rgba(0, 71, 171, 0.8);
        }

        .acerca-divisor-neon .conector-cuadrado {
            width: 8px;
            height: 8px;
            background: transparent;
            border: 2px solid #fff;
            margin: 0 10px;
            box-shadow: 0 0 5px #fff;
        }

        /* --- NUEVOS BOTONES: ESTILO NAVEGADOR COMPLETO --- */
        .btn-cotizar-navigator {
            background: rgba(0, 0, 0, 0.5);
            backdrop-filter: blur(5px);
            border: 2px solid var(--snaap-azul);
            border-radius: 50px; /* Estilo cápsula idéntico al nav */
            color: var(--snaap-azul-claro);
            font-family: 'Poppins', sans-serif;
            font-weight: 700;
            font-size: 14px;
            cursor: pointer;
            text-transform: uppercase;
            padding: 12px 40px;
            letter-spacing: 1px;
            transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            box-shadow: 0 0 15px rgba(0, 71, 171, 0.3);
            user-select: none;
        }

        /* El botón flotante mantiene su posición absoluta pero cambia el estilo */
        .btn-cotizar-flotante {
            position: absolute;
            bottom: 60px;
            left: 50%;
            transform: translateX(-50%);
            z-index: 20;
        }

        .btn-cotizar-navigator:hover {
            border-color: var(--snaap-rosa);
            color: var(--snaap-rosa);
            box-shadow: 0 0 25px rgba(255, 0, 122, 0.6), inset 0 0 5px rgba(255, 0, 122, 0.2);
            transform: scale(1.05) translateY(-3px);
        }
        
        /* Ajuste específico para el hover flotante (por el translateX) */
        .btn-cotizar-flotante:hover {
            transform: translateX(-50%) translateY(-3px) scale(1.05);
        }

        /* --- SECCIÓN 2: HISTORIA & NUESTRA INSPIRACIÓN --- */
        .snaap-acerca-bloques {
            width: 90%;
            max-width: 1200px;
            display: flex;
            flex-direction: column;
            gap: 80px;
            margin: 60px auto 100px auto;
        }

        .acerca-bloque {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 60px;
        }

        .acerca-bloque.invertido {
            flex-direction: row-reverse;
        }

        .bloque-texto {
            flex: 1;
            text-align: center;
        }

        .bloque-texto h3 {
            font-size: 38px;
            font-weight: 900;
            margin: 0 0 20px 0;
            color: #fff;
        }

        .bloque-texto h3 span {
            color: var(--snaap-azul-claro);
            text-shadow: 0 0 10px var(--snaap-azul);
        }

        .bloque-texto p {
            font-size: 14px;
            font-weight: 400;
            line-height: 1.7;
            color: rgba(255,255,255,0.8);
            margin-bottom: 30px;
            max-width: 420px;
            margin-left: auto;
            margin-right: auto;
        }

        /* --- CARRUSEL DE IMÁGENES --- */
        .bloque-imagen-carrusel {
            flex: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
        }

        .acerca-slide-wrapper {
            position: relative;
            width: 440px;
            height: 280px;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 15px 35px rgba(0,0,0,0.7);
            border: 2px solid rgba(255,255,255,0.1);
        }

        .acerca-slide {
            width: 100%;
            height: 100%;
            object-fit: cover;
            display: none;
        }

        .acerca-slide.active {
            display: block;
            animation: fadeIn 0.5s ease;
        }

        .acerca-carrusel-puntos {
            display: flex;
            gap: 12px;
            margin-top: 20px;
        }

        .carrusel-punto {
            width: 9px;
            height: 9px;
            background: rgba(255,255,255,0.3);
            border-radius: 50%;
            cursor: pointer;
            transition: all 0.3s ease;
        }

        .carrusel-punto.active {
            background: var(--snaap-azul-claro);
            box-shadow: 0 0 10px var(--snaap-azul-claro);
            transform: scale(1.2);
        }

        /* --- SECCIÓN 3: ICONOS DE SERVICIO CON LÍNEAS DIVISORAS --- */
        .snaap-servicios-grid {
            width: 95%;
            max-width: 1300px;
            margin: 40px auto;
            position: relative;
            padding-bottom: 40px;
        }

        .servicios-row {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            position: relative;
            width: 100%;
        }

        .servicio-col {
            flex: 1;
            text-align: center;
            padding: 0 30px;
            position: relative;
            box-sizing: border-box;
        }

        .servicio-icon-wrapper {
            font-size: 65px;
            color: var(--snaap-azul-claro);
            filter: drop-shadow(0 0 10px var(--snaap-azul));
            margin-bottom: 15px;
        }

        .servicio-col h4 {
            font-size: 16px;
            font-weight: 900;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin: 0 0 45px 0;
            color: #fff;
        }

        .servicio-col h4 span {
            color: var(--snaap-azul-claro);
        }

        .servicio-col p {
            font-size: 13px;
            font-weight: 400;
            line-height: 1.6;
            color: rgba(255,255,255,0.7);
            max-width: 320px;
            margin: 45px auto 0 auto;
        }

        .grid-linea-horizontal {
            position: absolute;
            top: 110px;
            left: 0;
            width: 100%;
            height: 2px;
            background: linear-gradient(90deg, var(--snaap-azul), var(--snaap-rosa), var(--snaap-azul));
            box-shadow: 0 0 10px rgba(0, 71, 171, 0.5);
            z-index: 1;
        }

        .grid-linea-vertical {
            position: absolute;
            top: 110px;
            height: 180px;
            width: 2px;
            background: var(--snaap-azul-claro);
            box-shadow: 0 0 8px var(--snaap-azul);
            z-index: 2;
        }

        .grid-linea-vertical.v1 { left: 33.33%; }
        .grid-linea-vertical.v2 { left: 66.66%; }

        .grid-conector-cuadrado {
            position: absolute;
            width: 8px;
            height: 8px;
            background: #000;
            border: 2px solid #fff;
            box-shadow: 0 0 5px #fff;
            z-index: 5;
        }

        .grid-conector-cuadrado.c1 { top: 107px; left: 33.1%; }
        .grid-conector-cuadrado.c2 { top: 107px; left: 66.42%; }
        .grid-conector-cuadrado.c3 { top: 286px; left: 33.1%; }
        .grid-conector-cuadrado.c4 { top: 286px; left: 66.42%; }
        .grid-conector-cuadrado.ext-left { top: 107px; left: 0; }
        .grid-conector-cuadrado.ext-right { top: 107px; right: 0; }

        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }

        @media (max-width: 900px) {
            .acerca-bloque, .acerca-bloque.invertido { flex-direction: column; gap: 40px; }
            .acerca-slide-wrapper { width: 100%; max-width: 360px; height: 230px; }
            .servicios-row { flex-direction: column; gap: 60px; }
            .grid-linea-horizontal, .grid-linea-vertical, .grid-conector-cuadrado { display: none; }
            .servicio-col p { margin-top: 15px; }
            .servicio-col h4 { margin-bottom: 15px; }
            .acerca-divisor-neon { padding: 0 2%; }
            .big-text { font-size: 32px !important; }
            .light-text { font-size: 24px !important; }
        }
    `;

    const textoMockup = "Primera línea con texto suave. Segunda línea que continúa la idea. Tercera línea para mantener la forma Cuarta línea sin mensaje específico. Quinta línea para completar las cinco.";

    const init = () => {
        const styleSheet = document.createElement("style");
        styleSheet.innerText = styles;
        document.head.appendChild(styleSheet);

        const target = document.getElementById("contenedor-acerca");
        if (!target) return;

        const section = document.createElement("section");
        section.className = "snaap-acerca-section";

        section.innerHTML = `
            <div class="snaap-acerca-cabecera">
                <div class="acerca-divisor-neon top">
                    <div class="connector-izq conector-cuadrado"></div>
                    <div class="linea-horizontal"></div>
                    <div class="conector-der conector-cuadrado"></div>
                </div>
                
                <div class="acerca-titulo-principal">
                    <h2 class="light-text">Acerc<span>aa</span> de</h2>
                    <h2 class="big-text">NOSOTROS.</h2>
                </div>

                <button class="btn-cotizar-navigator btn-cotizar-flotante">Cotizar</button>

                <div class="acerca-divisor-neon bottom">
                    <div class="connector-izq conector-cuadrado"></div>
                    <div class="linea-horizontal"></div>
                    <div class="conector-der conector-cuadrado"></div>
                </div>
            </div>

            <div class="snaap-acerca-bloques">
                
                <div class="acerca-bloque">
                    <div class="bloque-texto">
                        <h3>Histori<span>aa</span></h3>
                        <p>${textoMockup}</p>
                        <button class="btn-cotizar-navigator">Cotizar</button>
                    </div>
                    <div class="bloque-imagen-carrusel">
                        <div class="acerca-slide-wrapper" id="carrusel-1">
                            <img class="acerca-slide active" src="https://images.unsplash.com/photo-1511632765486-a01980e01a18?q=80&w=600&auto=format&fit=crop">
                            <img class="acerca-slide" src="https://images.unsplash.com/photo-1543012474-9461f6764dfc?q=80&w=600&auto=format&fit=crop">
                            <img class="acerca-slide" src="https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?q=80&w=600&auto=format&fit=crop">
                            <img class="acerca-slide" src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=600&auto=format&fit=crop">
                        </div>
                        <div class="acerca-carrusel-puntos" id="puntos-carrusel-1">
                            <span class="carrusel-punto active"></span>
                            <span class="carrusel-punto"></span>
                            <span class="carrusel-punto"></span>
                            <span class="carrusel-punto"></span>
                        </div>
                    </div>
                </div>

                <div class="acerca-bloque invertido">
                    <div class="bloque-texto">
                        <h3>Nuestr<span>aa</span> inspiracion.</h3>
                        <p>${textoMockup}</p>
                        <button class="btn-cotizar-navigator">Cotizar</button>
                    </div>
                    <div class="bloque-imagen-carrusel">
                        <div class="acerca-slide-wrapper" id="carrusel-2">
                            <img class="acerca-slide active" src="https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=600&auto=format&fit=crop">
                            <img class="acerca-slide" src="https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=600&auto=format&fit=crop">
                            <img class="acerca-slide" src="https://images.unsplash.com/photo-1506157786151-b8491531f063?q=80&w=600&auto=format&fit=crop">
                            <img class="acerca-slide" src="https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=600&auto=format&fit=crop">
                        </div>
                        <div class="acerca-carrusel-puntos" id="puntos-carrusel-2">
                            <span class="carrusel-punto active"></span>
                            <span class="carrusel-punto"></span>
                            <span class="carrusel-punto"></span>
                            <span class="carrusel-punto"></span>
                        </div>
                    </div>
                </div>

            </div>

            <div class="snaap-servicios-grid">
                <div class="grid-linea-horizontal"></div>
                <div class="grid-linea-vertical v1"></div>
                <div class="grid-linea-vertical v2"></div>
                <div class="grid-conector-cuadrado ext-left"></div>
                <div class="grid-conector-cuadrado ext-right"></div>
                <div class="grid-conector-cuadrado c1"></div>
                <div class="grid-conector-cuadrado c2"></div>
                <div class="grid-conector-cuadrado c3"></div>
                <div class="grid-conector-cuadrado c4"></div>

                <div class="servicios-row">
                    <div class="servicio-col">
                        <div class="servicio-icon-wrapper">
                            <i class="far fa-user-circle"></i>
                        </div>
                        <h4>Servicio de calid<span>aa</span>d</h4>
                        <p>Primera línea con texto suave. Segunda línea quecontinúa la idea. Tercera línea para ma ntener la forma Cuarta</p>
                    </div>

                    <div class="servicio-col">
                        <div class="servicio-icon-wrapper">
                            <i class="far fa-gem"></i>
                        </div>
                        <h4><span>aa</span>tencion personbaliz<span>aa</span>d</h4>
                        <p>Primera línea con texto suave. Segunda línea quecontinúa la idea. Tercera línea para ma ntener la forma Cuarta</p>
                    </div>

                    <div class="servicio-col">
                        <div class="servicio-icon-wrapper">
                            <i class="fas fa-wallet"></i>
                        </div>
                        <h4>Precios a la medid<span>aa</span></h4>
                        <p>Primera línea con texto suave. Segunda línea quecontinúa la idea. Tercera línea para ma ntener la forma Cuarta</p>
                    </div>
                </div>
            </div>
        `;

        target.appendChild(section);
        setupCarruselLogic("carrusel-1", "puntos-carrusel-1");
        setupCarruselLogic("carrusel-2", "puntos-carrusel-2");
    };

    const setupCarruselLogic = (carruselId, puntosId) => {
        const slides = document.querySelectorAll(`#${carruselId} .acerca-slide`);
        const puntos = document.querySelectorAll(`#${puntosId} .carrusel-punto`);
        let index = 0;

        puntos.forEach((punto, i) => {
            punto.addEventListener("click", () => {
                slides[index].classList.remove("active");
                puntos[index].classList.remove("active");
                index = i;
                slides[index].classList.add("active");
                puntos[index].classList.add("active");
            });
        });

        setInterval(() => {
            slides[index].classList.remove("active");
            puntos[index].classList.remove("active");
            index = (index + 1) % slides.length;
            slides[index].classList.add("active");
            puntos[index].classList.add("active");
        }, 4000);
    };

    return { init };
})();

document.addEventListener("DOMContentLoaded", SnaapAcercaComponent.init);