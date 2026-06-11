// Cargar eventos del localStorage o usar datos iniciales
let eventos = [];
let eventoAEliminar = null;

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

// Función para eliminar un evento
const deleteEvento = (id) => {
    eventos = eventos.filter(evento => evento.id !== id);
    saveEventos();
    renderEventosList(document.getElementById('searchInput')?.value || '');
    console.log('Evento eliminado, ID:', id);
};

// Mostrar modal de confirmación
const showDeleteModal = (evento) => {
    eventoAEliminar = evento;
    const modal = document.getElementById('deleteModal');
    const deleteEventTitle = document.getElementById('deleteEventTitle');
    
    if (deleteEventTitle) {
        deleteEventTitle.textContent = evento.title;
    }
    
    if (modal) {
        modal.style.display = 'flex';
    }
};

// Cerrar modal
const closeDeleteModal = () => {
    const modal = document.getElementById('deleteModal');
    if (modal) {
        modal.style.display = 'none';
    }
    eventoAEliminar = null;
};

// Función para redirigir al formulario de edición
const redirectToEditForm = (eventoId) => {
    console.log('Redirigiendo a editar con ID:', eventoId);
    localStorage.setItem('eventoParaEditar', eventoId);
    window.location.hash = '#/host/event-edit';
};

// Función para redirigir al formulario de creación
const redirectToCreateForm = () => {
    console.log('Redirigiendo a crear nuevo evento');
    localStorage.removeItem('eventoParaEditar');
    window.location.hash = '#/host/event-create';
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
                    <i class="fas fa-edit"></i> Editar
                </button>
                <button class="btn-delete" data-id="${evento.id}" data-title="${evento.title}">
                    <i class="fas fa-trash-alt"></i> Eliminar
                </button>
            </div>
        </div>
    `).join('');
    
    // Agregar event listeners a los botones de editar
    const editButtons = document.querySelectorAll('.btn-edit');
    editButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const id = parseInt(btn.getAttribute('data-id'));
            console.log('Botón Editar clickeado, ID:', id);
            redirectToEditForm(id);
        });
    });
    
    // Agregar event listeners a los botones de eliminar
    const deleteButtons = document.querySelectorAll('.btn-delete');
    deleteButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const id = parseInt(btn.getAttribute('data-id'));
            const title = btn.getAttribute('data-title');
            const evento = eventos.find(e => e.id === id);
            if (evento) {
                showDeleteModal(evento);
            }
        });
    });
};

// Función principal del controlador
export function eventCrudController() {
    console.log('Controlador eventCrudController iniciado');
    loadEventos();
    renderEventosList();
    
    // Búsqueda de eventos
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            renderEventosList(e.target.value);
        });
    }
    
    // Botón crear nuevo evento
    const btnCrearEvento = document.getElementById('btnCrearEvento');
    if (btnCrearEvento) {
        btnCrearEvento.addEventListener('click', (e) => {
            e.preventDefault();
            redirectToCreateForm();
        });
    }
    
    // Modal - botón confirmar eliminar
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
    if (confirmDeleteBtn) {
        confirmDeleteBtn.addEventListener('click', () => {
            if (eventoAEliminar) {
                deleteEvento(eventoAEliminar.id);
                closeDeleteModal();
            }
        });
    }
    
    // Modal - botón cancelar
    const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
    if (cancelDeleteBtn) {
        cancelDeleteBtn.addEventListener('click', () => {
            closeDeleteModal();
        });
    }
    
    // Modal - cerrar con la X
    const modalClose = document.querySelector('.modal-close');
    if (modalClose) {
        modalClose.addEventListener('click', () => {
            closeDeleteModal();
        });
    }
    
    // Cerrar modal al hacer clic fuera del contenido
    const modal = document.getElementById('deleteModal');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeDeleteModal();
            }
        });
    }
}

export default eventCrudController;