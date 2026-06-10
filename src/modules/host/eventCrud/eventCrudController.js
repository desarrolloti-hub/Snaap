// Cargar eventos del localStorage o usar datos iniciales
let eventos = [];

const loadEventos = () => {
    const stored = localStorage.getItem('eventos');
    if (stored) {
        eventos = JSON.parse(stored);
    } else {
        eventos = [
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
        saveEventos();
    }
};

const saveEventos = () => {
    localStorage.setItem('eventos', JSON.stringify(eventos));
};

const renderEventosList = (filter = '') => {
    const container = document.getElementById('eventosList');
    if (!container) return;
    
    const filteredEventos = eventos.filter(evento => 
        evento.title.toLowerCase().includes(filter.toLowerCase())
    );
    
    if (filteredEventos.length === 0) {
        container.innerHTML = '<div class="no-results"><i class="fas fa-calendar-times"></i><p>No hay eventos disponibles</p></div>';
        return;
    }
    
    container.innerHTML = filteredEventos.map(evento => `
        <div class="evento-card" data-id="${evento.id}">
            <img src="${evento.img}" alt="${evento.title}" class="evento-img">
            <div class="evento-info">
                <h3>${evento.title}</h3>
                <p><i class="fas fa-calendar-day"></i> ${evento.date}</p>
                <p><i class="fas fa-users"></i> ${evento.attendees} asistentes</p>
                <p><i class="fas fa-camera"></i> ${evento.uploadedPhotos} fotos</p>
            </div>
            <div class="evento-actions">
                <button class="btn-edit" data-id="${evento.id}">
                    <i class="fas fa-edit"></i> Editar Evento
                </button>
            </div>
        </div>
    `).join('');
    
    // Agregar event listeners a los botones de editar
    const editButtons = document.querySelectorAll('.btn-edit');
    console.log('Botones encontrados:', editButtons.length); // Para depuración
    
    editButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const id = parseInt(btn.getAttribute('data-id'));
            console.log('Botón clickeado, ID:', id); // Para depuración
            redirectToEditForm(id);
        });
    });
};

// Función para redirigir al formulario de edición
const redirectToEditForm = (eventoId) => {
    console.log('Redirigiendo con ID:', eventoId); // Para depuración
    // Guardar el ID del evento a editar en localStorage
    localStorage.setItem('eventoParaEditar', eventoId);
    // Redirigir a la página del formulario de edición usando la ruta
    window.location.hash = '#/host/event-edit';
};

// Función principal del controlador
export function eventCrudController() {
    console.log('Controlador eventCrudController iniciado'); // Para depuración
    loadEventos();
    renderEventosList();
    
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            renderEventosList(e.target.value);
        });
    }
}

export default eventCrudController;