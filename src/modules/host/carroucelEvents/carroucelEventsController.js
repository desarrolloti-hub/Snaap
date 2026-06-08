const eventosData = [
    { 
        title: "Los XV de Rusi", 
        img: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=600&auto=format&fit=crop", 
        price: "$15,000 MXN",
        date: "15 Marzo 2024",
        attendees: 120
    },
    { 
        title: "Boda Legendaria", 
        img: "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=600&auto=format&fit=crop", 
        price: "$45,000 MXN",
        date: "22 Febrero 2024",
        attendees: 250
    },
    { 
        title: "Fiesta Locura Total", 
        img: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=600&auto=format&fit=crop", 
        price: "$25,000 MXN",
        date: "10 Enero 2024",
        attendees: 180
    },
];

export function carroucelEventsController() {
    let currentActiveIndex = 2;
    
    // Buscar o crear el contenedor
    let container = document.getElementById('carroucel-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'carroucel-container';
        const app = document.getElementById('app');
        if (app) app.appendChild(container);
    }
    
    const section = document.createElement('section');
    section.className = 'snaap-carousel-section';
    section.innerHTML = `
        <div class="carousel-title">
            <h2><i class="fas fa-calendar-alt"></i> Eventos Realizados</h2>
            <p>Descubre los eventos más memorables que hemos snapeado.</p>
        </div>
        <div class="carousel-track" id="snaap-carousel-track"></div>
        <button class="nav-button btn-prev" id="snaap-prev-btn">
            <i class="fas fa-chevron-left"></i>
        </button>
        <button class="nav-button btn-next" id="snaap-next-btn">
            <i class="fas fa-chevron-right"></i>
        </button>
    `;
    
    const renderCards = () => {
        const track = section.querySelector('#snaap-carousel-track');
        if (!track) return;
        track.innerHTML = '';
        
        eventosData.forEach((item, index) => {
            const card = document.createElement('div');
            card.className = 'card';
            
            if (index === currentActiveIndex) {
                card.classList.add('active');
            } else if (index === (currentActiveIndex - 1 + eventosData.length) % eventosData.length) {
                card.classList.add('prev');
            } else if (index === (currentActiveIndex + 1) % eventosData.length) {
                card.classList.add('next');
            } else {
                card.classList.add('hidden');
            }
            
            card.innerHTML = `
                <img src="${item.img}" alt="${item.title}">
                <h3>${item.title}</h3>
                <div class="price">${item.price}</div>
                <div class="event-date">
                    <i class="fas fa-calendar-day"></i>
                    <span>${item.date}</span>
                    <i class="fas fa-users" style="margin-left: 8px;"></i>
                    <span>${item.attendees} asistentes</span>
                </div>
            `;
            
            track.appendChild(card);
        });
    };
    
    const move = (direction) => {
        currentActiveIndex = (currentActiveIndex + direction + eventosData.length) % eventosData.length;
        renderCards();
    };
    
    renderCards();
    
    const prevBtn = section.querySelector('#snaap-prev-btn');
    const nextBtn = section.querySelector('#snaap-next-btn');
    
    if (prevBtn) prevBtn.addEventListener('click', () => move(-1));
    if (nextBtn) nextBtn.addEventListener('click', () => move(1));
    
    container.innerHTML = '';
    container.appendChild(section);
}

export default carroucelEventsController;