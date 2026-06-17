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
                uploadedPhotos: 45,
                description: "Fiesta de 15 años con música en vivo y buffet",
                location: "Salón Eventos Plaza",
                time: "20:00"
            },
            { 
                id: 2,
                title: "Boda Legendaria", 
                img: "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=600&auto=format&fit=crop", 
                date: "22 Febrero 2024",
                attendees: 250,
                uploadedPhotos: 128,
                description: "Boda civil y religiosa con recepción",
                location: "Hacienda Los Sueños",
                time: "18:30"
            },
            { 
                id: 3,
                title: "Fiesta Locura Total", 
                img: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=600&auto=format&fit=crop", 
                date: "10 Enero 2024",
                attendees: 180,
                uploadedPhotos: 92,
                description: "Fiesta electrónica con los mejores DJs",
                location: "Club Night",
                time: "22:00"
            },
        ];
        saveEventos();
    }
};

const saveEventos = () => {
    localStorage.setItem('eventos', JSON.stringify(eventos));
};

// Función para eliminar un evento
const deleteEvento = async (id) => {
    eventos = eventos.filter(evento => evento.id !== id);
    saveEventos();
    renderEventosList(document.getElementById('searchInput')?.value || '');
    
    await Swal.fire({
        title: '¡Evento Eliminado!',
        text: 'El evento ha sido eliminado correctamente',
        icon: 'success',
        confirmButtonText: 'OK'
    });
};

// Mostrar modal de confirmación con SweetAlert2
const showDeleteModal = (evento) => {
    Swal.fire({
        title: '¿Eliminar Evento?',
        html: `¿Estás seguro de eliminar el evento <strong>${evento.title}</strong>?<br>Esta acción no se puede deshacer.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ff007a',
        cancelButtonColor: '#4db8ff',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            deleteEvento(evento.id);
        }
    });
};

// Función para redirigir al formulario de edición
const redirectToEditForm = (eventoId) => {
    console.log('Redirigiendo a editar con ID:', eventoId);
    localStorage.setItem('eventoParaEditar', eventoId);
    if (typeof navigateTo === 'function') {
        navigateTo('/host/event-edit');
    } else {
        window.location.href = '/host/event-edit';
    }
};

// Función para redirigir a la página de detalles
const redirectToViewDetails = (eventoId) => {
    console.log('Redirigiendo a ver detalles del evento ID:', eventoId);
    localStorage.setItem('eventoParaVer', eventoId);
    if (typeof navigateTo === 'function') {
        navigateTo('/host/event-details');
    } else {
        window.location.href = '/host/event-details';
    }
};

// Función para redirigir al formulario de creación
const redirectToCreateForm = () => {
    console.log('Redirigiendo a crear nuevo evento');
    localStorage.removeItem('eventoParaEditar');
    localStorage.removeItem('eventoParaVer');
    if (typeof navigateTo === 'function') {
        navigateTo('/host/create-event');
    } else {
        window.location.href = '/host/create-event';
    }
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
                <button class="btn-view" data-id="${evento.id}" title="Ver detalles del evento">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn-edit" data-id="${evento.id}" title="Editar evento">
                    <i class="fas fa-pencil-alt"></i>
                </button>
                <button class="btn-delete" data-id="${evento.id}" data-title="${evento.title}" title="Eliminar evento">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </div>
        </div>
    `).join('');
    
    // Agregar event listeners a los botones de ver detalles
    const viewButtons = document.querySelectorAll('.btn-view');
    viewButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const id = parseInt(btn.getAttribute('data-id'));
            console.log('Botón Ver Detalles clickeado, ID:', id);
            redirectToViewDetails(id);
        });
    });
    
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
}

export default eventCrudController;