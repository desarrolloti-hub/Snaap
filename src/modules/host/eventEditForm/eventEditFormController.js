// Cargar eventos del localStorage
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

const getEventoToEdit = () => {
    const eventoId = localStorage.getItem('eventoParaEditar');
    
    if (eventoId) {
        const evento = eventos.find(e => e.id === parseInt(eventoId));
        if (evento) {
            document.getElementById('eventoId').value = evento.id;
            document.getElementById('title').value = evento.title;
            document.getElementById('date').value = evento.date;
            document.getElementById('attendees').value = evento.attendees;
            document.getElementById('uploadedPhotos').value = evento.uploadedPhotos;
            document.getElementById('img').value = evento.img;
        } else {
            alert('Evento no encontrado');
            window.location.hash = '#/host/event-crud';
        }
        localStorage.removeItem('eventoParaEditar');
    } else {
        alert('No se ha seleccionado ningún evento para editar');
        window.location.hash = '#/host/event-crud';
    }
};

const updateEvento = (event) => {
    event.preventDefault();
    
    const id = parseInt(document.getElementById('eventoId').value);
    const title = document.getElementById('title').value.trim();
    const date = document.getElementById('date').value.trim();
    const attendees = parseInt(document.getElementById('attendees').value);
    const uploadedPhotos = parseInt(document.getElementById('uploadedPhotos').value);
    const img = document.getElementById('img').value.trim();
    
    if (!title || !date || !img) {
        alert('Por favor completa todos los campos');
        return;
    }
    
    if (isNaN(attendees) || attendees < 0 || isNaN(uploadedPhotos) || uploadedPhotos < 0) {
        alert('Por favor ingresa números válidos');
        return;
    }
    
    if (id) {
        const index = eventos.findIndex(e => e.id === id);
        if (index !== -1) {
            eventos[index] = {
                ...eventos[index],
                title: title,
                date: date,
                attendees: attendees,
                uploadedPhotos: uploadedPhotos,
                img: img
            };
            saveEventos();
            alert('✅ Evento actualizado exitosamente');
            window.location.hash = '#/host/event-crud';
        } else {
            alert('Error: No se encontró el evento');
        }
    }
};

const cancelEdit = () => {
    if (confirm('¿Estás seguro de que deseas cancelar la edición?')) {
        window.location.hash = '#/host/event-crud';
    }
};

const goBack = () => {
    if (confirm('¿Estás seguro de que deseas volver? Los cambios no se guardarán.')) {
        window.location.hash = '#/host/event-crud';
    }
};

export function eventEditFormController() {
    loadEventos();
    getEventoToEdit();
    
    const form = document.getElementById('eventoEditForm');
    if (form) {
        form.addEventListener('submit', updateEvento);
    }
    
    const cancelarBtn = document.getElementById('cancelarBtn');
    if (cancelarBtn) {
        cancelarBtn.addEventListener('click', cancelEdit);
    }
    
    const btnVolver = document.getElementById('btnVolver');
    if (btnVolver) {
        btnVolver.addEventListener('click', goBack);
    }
}

export default eventEditFormController;