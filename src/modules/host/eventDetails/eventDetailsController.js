export function eventDetailsController() {
    loadEventData();
    setupEventListeners();
    // checkHostSession();  // ELIMINADA
}

let currentEvent = null;

// ============================================
// FUNCIONES LOCALES
// ============================================

function loadEvents() {
    return JSON.parse(localStorage.getItem('eventos') || '[]');
}

function getEventById(id) {
    const events = loadEvents();
    return events.find(e => e.id === parseInt(id));
}

function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

// ============================================
// FUNCIONES DEL CONTROLADOR
// ============================================

function loadEventData() {
    const urlParams = new URLSearchParams(window.location.search);
    const eventId = urlParams.get('id');
    
    if (!eventId) {
        Swal.fire({
            title: 'Error',
            text: 'No se especificó qué evento ver',
            icon: 'error',
            confirmButtonText: 'OK'
        }).then(() => {
            window.location.href = '/host/event-crud';
        });
        return;
    }
    
    currentEvent = getEventById(eventId);
    
    if (!currentEvent) {
        Swal.fire({
            title: 'Error',
            text: 'El evento no existe',
            icon: 'error',
            confirmButtonText: 'OK'
        }).then(() => {
            window.location.href = '/host/event-crud';
        });
        return;
    }
    
    // Mostrar datos del evento
    const titleEl = document.getElementById('eventTitle');
    const dateEl = document.getElementById('eventDate');
    const timeEl = document.getElementById('eventTime');
    const locationEl = document.getElementById('eventLocation');
    const attendeesEl = document.getElementById('eventAttendees');
    const photosEl = document.getElementById('eventPhotos');
    const descriptionEl = document.getElementById('eventDescription');
    const packageEl = document.getElementById('eventPackage');
    const imageEl = document.getElementById('eventImage');
    
    if (titleEl) titleEl.textContent = currentEvent.title || 'Sin título';
    if (dateEl) dateEl.textContent = currentEvent.date || 'No especificada';
    if (timeEl) timeEl.textContent = currentEvent.time || 'No especificada';
    if (locationEl) locationEl.textContent = currentEvent.location || 'No especificada';
    if (attendeesEl) attendeesEl.textContent = currentEvent.attendees || 0;
    if (photosEl) photosEl.textContent = currentEvent.uploadedPhotos || 0;
    if (descriptionEl) descriptionEl.textContent = currentEvent.description || 'Sin descripción';
    if (packageEl) packageEl.textContent = currentEvent.package || 'No especificado';
    
    if (imageEl && currentEvent.img) {
        imageEl.src = currentEvent.img;
        imageEl.alt = currentEvent.title || 'Imagen del evento';
    }
}

function setupEventListeners() {
    const btnVolver = document.getElementById('btnVolver');
    const btnEditar = document.getElementById('btnEditar');
    
    if (btnVolver) {
        btnVolver.addEventListener('click', () => {
            window.location.href = '/host/event-crud';
        });
    }
    
    if (btnEditar && currentEvent) {
        btnEditar.addEventListener('click', () => {
            localStorage.setItem('eventoParaEditar', currentEvent.id.toString());
            window.location.href = '/host/event-edit';
        });
    }
}