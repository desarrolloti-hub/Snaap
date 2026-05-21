const SnaapUltraWideCarousel = (() => {
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

    let currentActiveIndex = 2;

    const init = () => {
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

        const targetContainer = document.getElementById("contenedor-carrusel");
        if (targetContainer) {
            targetContainer.appendChild(section);
        } else {
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

document.addEventListener("DOMContentLoaded", SnaapUltraWideCarousel.init);