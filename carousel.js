/**
 * Componente: Carousel.js (Neon Glass Ultra-Wide Element Edition)
 * Características: Carrusel de ancho completo, 12 imágenes reales, inyección en contenedor específico.
 */

const SnaapUltraWideCarousel = (() => {
    const styles = `
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');

        :root {
            --azul-neon: #0047AB;
            --rosa-neon: #FF007A;
            --azul-claro: #4db8ff;
            --card-glass: rgba(15, 15, 20, 0.6);
        }

        /* --- SECCIÓN PRINCIPAL (ANCHO COMPLETO) --- */
        .snaap-carousel-section {
            padding: 40px 0;
            overflow: hidden;
            background: transparent;
            font-family: 'Poppins', sans-serif;
            display: flex;
            flex-direction: column;
            align-items: center;
            position: relative;
            width: 100vw;
            left: 50%;
            transform: translateX(-50%);
        }

        /* --- CONTENEDOR DE TARJETAS --- */
        .carousel-track {
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
            width: 100%;
            height: 520px;
            perspective: 1500px;
        }

        /* --- TARJETAS PREMIUM (GLASSMORPHISM) --- */
        .card {
            position: absolute;
            width: 320px;
            height: 460px;
            background: var(--card-glass);
            backdrop-filter: blur(25px);
            -webkit-backdrop-filter: blur(25px);
            border: 2px solid rgba(0, 71, 171, 0.4);
            border-radius: 28px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: space-between;
            padding: 30px 25px;
            box-sizing: border-box;
            transition: all 0.6s cubic-bezier(0.23, 1, 0.32, 1);
            cursor: pointer;
            box-shadow: 0 25px 60px rgba(0, 0, 0, 0.6);
            user-select: none;
            overflow: hidden;
        }

        .card img {
            width: 100%;
            height: 230px;
            object-fit: cover;
            border-radius: 20px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.5);
            transition: transform 0.5s ease;
        }

        .card h3 {
            color: #ffffff;
            font-size: 22px;
            font-weight: 700;
            margin: 0;
            text-align: center;
            letter-spacing: -0.8px;
        }

        .card .price {
            color: #ffffff;
            font-size: 24px;
            font-weight: 800;
            letter-spacing: 2px;
            margin: 0;
            text-shadow: 0 0 10px rgba(255,255,255,0.4);
        }

        /* --- POSICIONAMIENTO EN CAPAS --- */
        .card.active {
            transform: translateX(0) scale(1) translateZ(150px);
            z-index: 10;
            opacity: 1;
            border-color: rgba(0, 71, 171, 0.7);
            box-shadow: 0 0 30px rgba(0, 71, 171, 0.3), 0 30px 70px rgba(0,0,0,0.8);
        }

        .card.prev {
            transform: translateX(-340px) scale(0.85) rotateY(20deg) translateZ(0);
            z-index: 5;
            opacity: 0.5;
            filter: blur(1px);
        }

        .card.next {
            transform: translateX(340px) scale(0.85) rotateY(-20deg) translateZ(0);
            z-index: 5;
            opacity: 0.5;
            filter: blur(1px);
        }

        .card.hidden {
            transform: translateX(0) scale(0.6) translateZ(-500px);
            opacity: 0;
            z-index: 0;
            pointer-events: none;
        }

        /* --- EFECTO HOVER SÓLO CONTORNO ROSA --- */
        .card.active:hover {
            border-color: var(--rosa-neon);
            box-shadow: 0 0 40px rgba(255, 0, 122, 0.5), 0 35px 80px rgba(0,0,0,0.9);
            transform: translateY(-8px) scale(1.03) translateZ(150px);
        }

        .card.active:hover img {
            transform: scale(1.05);
        }

        /* --- NAVEGACIÓN --- */
        .nav-button {
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
            width: 70px;
            height: 70px;
            border-radius: 50%;
            background: rgba(0, 0, 0, 0.5);
            backdrop-filter: blur(8px);
            border: 3px solid var(--azul-neon);
            color: var(--azul-claro);
            font-size: 28px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            z-index: 100;
            transition: all 0.4s cubic-bezier(0.19, 1, 0.22, 1);
            box-shadow: 0 0 20px rgba(0, 71, 171, 0.4);
            user-select: none;
        }

        .nav-button svg {
            width: 24px;
            height: 24px;
            fill: none;
            stroke: currentColor;
            stroke-width: 3;
            stroke-linecap: round;
            stroke-linejoin: round;
        }

        .nav-button:hover {
            border-color: var(--rosa-neon);
            color: var(--rosa-neon);
            box-shadow: 0 0 35px rgba(255, 0, 122, 0.7);
            transform: translateY(-50%) scale(1.1);
        }

        .btn-prev { left: 4%; }
        .btn-next { right: 4%; }

        /* --- RESPONSIVE MOBILE --- */
        @media (max-width: 1024px) {
            .carousel-track { height: 480px; perspective: 1000px; }
            .card { width: 280px; height: 420px; padding: 25px 20px; }
            .card img { height: 190px; }
            .card.active { transform: translateX(0) scale(1) translateZ(80px); }
            .card.prev { transform: translateX(-200px) scale(0.8) rotateY(15deg); }
            .card.next { transform: translateX(200px) scale(0.8) rotateY(-14deg); }
            .nav-button { width: 55px; height: 55px; border-width: 2px; }
            .btn-prev { left: 2%; }
            .btn-next { right: 2%; }
        }
    `;

    // 12 Tarjetas con imágenes reales de fiesta
    const cardData = [
        { title: "los XV de rusi", img: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=600&auto=format&fit=crop", price: "$$$$$" },
        { title: "boda legendaria.", img: "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=600&auto=format&fit=crop", price: "$$$$$" },
        { title: "fiestas locas.", img: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=600&auto=format&fit=crop", price: "$$$$$" },
        { title: "artista emergente.", img: "https://images.unsplash.com/photo-1506157786151-b8491531f063?q=80&w=600&auto=format&fit=crop", price: "$$$$$" },
        { title: "primera comunion 🙏", img: "https://images.unsplash.com/photo-1545128485-c400e7702796?q=80&w=600&auto=format&fit=crop", price: "$$$$$" },
        { title: "pool party VIP ☀️", img: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?q=80&w=600&auto=format&fit=crop", price: "$$$$$" },
        { title: "antro & neon night 🌌", img: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=600&auto=format&fit=crop", price: "$$$$$" },
        { title: "graduación épica 🎓", img: "https://images.unsplash.com/photo-1523580494863-6f3031224574?q=80&w=600&auto=format&fit=crop", price: "$$$$$" },
        { title: "festival vibes 🎪", img: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=600&auto=format&fit=crop", price: "$$$$$" },
        { title: "cóctel empresarial 🍸", img: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?q=80&w=600&auto=format&fit=crop", price: "$$$$$" },
        { title: "cumpleaños destrampado 🎂", img: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?q=80&w=600&auto=format&fit=crop", price: "$$$$$" },
        { title: "concierto acústico 🎸", img: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?q=80&w=600&auto=format&fit=crop", price: "$$$$$" }
    ];

    let currentActiveIndex = 2; // Inicia al centro en "fiestas locas."

    const init = () => {
        const styleSheet = document.createElement("style");
        styleSheet.innerText = styles;
        document.head.appendChild(styleSheet);

        const section = document.createElement("section");
        section.className = "snaap-carousel-section";
        section.innerHTML = `
            <div class="carousel-track" id="snaap-carousel-track"></div>
            <button class="nav-button btn-prev" id="snaap-prev-btn">
                <svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"></polyline></svg>
            </button>
            <button class="nav-button btn-next" id="snaap-next-btn">
                <svg viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </button>
        `;

        // LA MAGIA: Inserta el componente dentro del contenedor de tu HTML
        const targetContainer = document.getElementById("contenedor-carrusel");
        
        if (targetContainer) {
            targetContainer.appendChild(section);
        } else {
            // Respaldo por si acaso
            const scriptTag = document.querySelector('script[src="carousel.js"]');
            document.body.insertBefore(section, scriptTag);
        }

        renderCarouselCards();

        document.getElementById('snaap-prev-btn').addEventListener('click', () => moveCarousel(-1));
        document.getElementById('snaap-next-btn').addEventListener('click', () => moveCarousel(1));
    };

    const renderCarouselCards = () => {
        const track = document.getElementById('snaap-carousel-track');
        track.innerHTML = '';

        cardData.forEach((item, index) => {
            const card = document.createElement('div');
            card.className = 'card';
            
            if (index === currentActiveIndex) {
                card.classList.add('active');
            } else if (index === (currentActiveIndex - 1 + cardData.length) % cardData.length) {
                card.classList.add('prev');
            } else if (index === (currentActiveIndex + 1) % cardData.length) {
                card.classList.add('next');
            } else {
                card.classList.add('hidden');
            }

            card.innerHTML = `
                <h3>${item.title}</h3>
                <img src="${item.img}" alt="${item.title}">
                <div class="price">${item.price}</div>
            `;
            track.appendChild(card);
        });
    };

    const moveCarousel = (direction) => {
        currentActiveIndex = (currentActiveIndex + direction + cardData.length) % cardData.length;
        renderCarouselCards();
    };

    return { init };
})();

// Inicializa al cargar la página
// Borra window.onload y pon esto al final de carousel.js:
document.addEventListener("DOMContentLoaded", SnaapUltraWideCarousel.init);