const eventosData = [
    { 
        id: 1,
        title: "Los XV de Rusi", 
        img: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=600&auto=format&fit=crop", 
        date: "15 Marzo 2024",
        attendees: 120,
        uploadedPhotos: 45
    },
    { 
        id: 2,
        title: "Boda Legendaria", 
        img: "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=600&auto=format&fit=crop", 
        date: "22 Febrero 2024",
        attendees: 250,
        uploadedPhotos: 128
    },
    { 
        id: 3,
        title: "Fiesta Locura Total", 
        img: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=600&auto=format&fit=crop", 
        date: "10 Enero 2024",
        attendees: 180,
        uploadedPhotos: 92
    },
];

export function carroucelEventsController() {
    let currentActiveIndex = 2;
    const track = document.getElementById('snaap-carousel-track');
    if (!track) return;
    
    const renderCards = () => {
        if (!track) return;
        const cards = track.querySelectorAll('.card');
        
        cards.forEach((card, index) => {
            card.classList.remove('active', 'prev', 'next', 'hidden');
            
            if (index === currentActiveIndex) {
                card.classList.add('active');
            } else if (index === (currentActiveIndex - 1 + eventosData.length) % eventosData.length) {
                card.classList.add('prev');
            } else if (index === (currentActiveIndex + 1) % eventosData.length) {
                card.classList.add('next');
            } else {
                card.classList.add('hidden');
            }
        });
    };
    
    const move = (direction) => {
        currentActiveIndex = (currentActiveIndex + direction + eventosData.length) % eventosData.length;
        renderCards();
    };
    
    // Agregar evento de clic a las tarjetas
    const addCardClickEvents = () => {
        const cards = document.querySelectorAll('.card');
        cards.forEach((card, index) => {
            card.addEventListener('click', () => {
                const evento = eventosData[index];
                // Guardar el evento seleccionado en localStorage
                localStorage.setItem('eventoSeleccionado', JSON.stringify(evento));
                console.log('Evento seleccionado:', evento.title);
                // Usar la función navigateTo del router
                if (typeof window.navigateTo === 'function') {
                    window.navigateTo('/host/event-crud');
                } else {
                    console.error('navigateTo no está disponible');
                    window.location.href = '/host/event-crud';
                }
            });
        });
    };
    
    renderCards();
    addCardClickEvents();
    
    const prevBtn = document.getElementById('snaap-prev-btn');
    const nextBtn = document.getElementById('snaap-next-btn');
    
    if (prevBtn) prevBtn.addEventListener('click', () => move(-1));
    if (nextBtn) nextBtn.addEventListener('click', () => move(1));
}

export default carroucelEventsController;