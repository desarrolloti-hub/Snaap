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
                <button class="btn-edit" data-id="${evento.id}"><i class="fas fa-edit"></i> Editar Fotos</button>
            </div>
        </div>
    `).join('');
    
    // Agregar event listeners a los botones de editar
    document.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const id = parseInt(btn.dataset.id);
            editEvento(id);
        });
    });
    
    // Agregar event listener a las tarjetas
    document.querySelectorAll('.evento-card').forEach(card => {
        card.addEventListener('click', () => {
            const id = parseInt(card.dataset.id);
            editEvento(id);
        });
    });
};

const editEvento = (id) => {
    const evento = eventos.find(e => e.id === id);
    if (evento) {
        document.getElementById('eventoId').value = evento.id;
        document.getElementById('title').value = evento.title;
        document.getElementById('date').value = evento.date;
        document.getElementById('attendees').value = evento.attendees;
        document.getElementById('uploadedPhotos').value = evento.uploadedPhotos;
        document.getElementById('img').value = evento.img;
        
        // Cambiar texto del botón submit
        const submitBtn = document.querySelector('#eventoForm button[type="submit"]');
        if (submitBtn) {
            submitBtn.innerHTML = '<i class="fas fa-save"></i> Actualizar Fotos';
        }
    }
};

const clearForm = () => {
    document.getElementById('eventoId').value = '';
    document.getElementById('title').value = '';
    document.getElementById('date').value = '';
    document.getElementById('attendees').value = '';
    document.getElementById('uploadedPhotos').value = '';
    document.getElementById('img').value = '';
    
    const submitBtn = document.querySelector('#eventoForm button[type="submit"]');
    if (submitBtn) {
        submitBtn.innerHTML = '<i class="fas fa-save"></i> Guardar';
    }
};

const saveOrUpdateEvento = (event) => {
    event.preventDefault();
    
    const id = parseInt(document.getElementById('eventoId').value);
    const uploadedPhotos = parseInt(document.getElementById('uploadedPhotos').value);
    const img = document.getElementById('img').value;
    
    if (id) {
        // Solo actualizar fotos y URL de imagen, mantener el resto igual
        const index = eventos.findIndex(e => e.id === id);
        if (index !== -1) {
            eventos[index] = { 
                ...eventos[index],
                uploadedPhotos: uploadedPhotos,
                img: img
            };
            saveEventos();
            alert('Fotos actualizadas exitosamente');
            renderEventosList(document.getElementById('searchInput')?.value || '');
            clearForm();
        }
    }
};

// Función principal del controlador
export function eventCrudController() {
    loadEventos();
    renderEventosList();
    
    const form = document.getElementById('eventoForm');
    if (form) {
        form.addEventListener('submit', saveOrUpdateEvento);
    }
    
    const cancelarBtn = document.getElementById('cancelarBtn');
    if (cancelarBtn) {
        cancelarBtn.addEventListener('click', clearForm);
    }
    
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            renderEventosList(e.target.value);
        });
    }
    
    // Cargar evento seleccionado desde el carrusel
    const eventoSeleccionado = localStorage.getItem('eventoSeleccionado');
    if (eventoSeleccionado) {
        const evento = JSON.parse(eventoSeleccionado);
        editEvento(evento.id);
        localStorage.removeItem('eventoSeleccionado');
    }
}

export default eventCrudController;