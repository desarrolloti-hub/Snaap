// src/modules/host/eventDetails/eventDetailsController.js
import { userService } from '../../../services/userService.js';
import { eventService } from '../../../services/eventService.js';

let currentEvent = null;

// ============================================
// 📥 CARGAR EVENTO DESDE FIRESTORE
// ============================================
const loadEventFromFirestore = async (id) => {
    try {
        const result = await eventService.getEventoPorId(id);
        if (result.success) {
            return result.evento;
        } else {
            console.error('Error al cargar evento:', result.error);
            return null;
        }
    } catch (error) {
        console.error('❌ Error al cargar evento:', error);
        return null;
    }
};

// ============================================
// 🖼️ RENDERIZAR DETALLES DEL EVENTO
// ============================================
const renderEventDetails = (evento) => {
    if (!evento) return;
    
    currentEvent = evento;
    
    const titleEl = document.getElementById('eventTitle');
    const dateEl = document.getElementById('eventDate');
    const locationEl = document.getElementById('eventLocation');
    const attendeesEl = document.getElementById('eventAttendees');
    const photosEl = document.getElementById('eventPhotos');
    const descriptionEl = document.getElementById('eventDescription');
    const packageEl = document.getElementById('eventPackage');
    const imageEl = document.getElementById('eventImage');
    const codigoEl = document.getElementById('eventCodigo');
    const estadoEl = document.getElementById('eventEstado');
    
    // 🔥 USAR CAMPOS DE FIRESTORE
    const nombre = evento.nombre || 'Evento sin nombre';
    
    let fecha = 'No especificada';
    if (evento.fechaEvento) {
        fecha = new Date(evento.fechaEvento).toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    }
    
    const ubicacion = evento.ubicacion || 'No especificada';
    const attendees = evento.attendees || evento.invitados?.length || 0;
    const photos = evento.uploadedPhotos || 0;
    const descripcion = evento.descripcion || 'Sin descripción';
    const paquete = evento.paquete || 'No especificado';
    const codigoAcceso = evento.codigoAcceso || 'No generado';
    
    const estadoMap = {
        'active': '✅ Activo',
        'pending': '⏳ Pendiente',
        'completed': '📌 Completado',
        'cancelled': '❌ Cancelado'
    };
    const estado = estadoMap[evento.estado] || evento.estado || 'Desconocido';
    
    const imgUrl = evento.imagenUrl || 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=600&auto=format&fit=crop';
    
    if (titleEl) titleEl.textContent = nombre;
    if (dateEl) dateEl.textContent = fecha;
    if (locationEl) locationEl.textContent = ubicacion;
    if (attendeesEl) attendeesEl.textContent = attendees;
    if (photosEl) photosEl.textContent = photos;
    if (descriptionEl) descriptionEl.textContent = descripcion;
    if (packageEl) packageEl.textContent = paquete;
    if (codigoEl) codigoEl.textContent = codigoAcceso;
    if (estadoEl) estadoEl.textContent = estado;
    
    if (imageEl) {
        imageEl.src = imgUrl;
        imageEl.alt = nombre;
        imageEl.onerror = function() {
            this.src = 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=600&auto=format&fit=crop';
        };
    }
};

// ============================================
// 🔀 REDIRECCIONES
// ============================================
const goBack = () => {
    window.location.href = '/host/event-crud';
};

const goToEdit = () => {
    if (currentEvent) {
        localStorage.setItem('eventoParaEditar', currentEvent.id);
        window.location.href = `/host/event-edit?id=${currentEvent.id}`;
    }
};

// ============================================
// 🚀 CONTROLADOR PRINCIPAL
// ============================================
export async function eventDetailsController() {
    console.log('🔥 Controlador eventDetailsController iniciado');

    if (!userService.isAuthenticated()) {
        console.warn('⚠️ Usuario no autenticado, redirigiendo a login');
        window.location.href = '/login';
        return;
    }

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
    
    Swal.fire({
        title: 'Cargando evento...',
        text: 'Por favor espera',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });
    
    try {
        const evento = await loadEventFromFirestore(eventId);
        Swal.close();
        
        if (!evento) {
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
        
        renderEventDetails(evento);
        
        const btnVolver = document.getElementById('btnVolver');
        if (btnVolver) {
            btnVolver.addEventListener('click', goBack);
        }
        
        const btnEditar = document.getElementById('btnEditar');
        if (btnEditar) {
            btnEditar.addEventListener('click', goToEdit);
        }
        
        console.log('✅ EventDetails Controller finalizado');
    } catch (error) {
        Swal.close();
        console.error('❌ Error al cargar evento:', error);
        Swal.fire({
            title: 'Error',
            text: 'Ocurrió un error al cargar el evento',
            icon: 'error',
            confirmButtonText: 'OK'
        }).then(() => {
            window.location.href = '/host/event-crud';
        });
    }
}

export default eventDetailsController;