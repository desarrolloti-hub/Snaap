// src/modules/host/eventCrud/eventCrudController.js
import { userService } from '../../../services/userService.js';
import { eventService } from '../../../services/eventService.js';
import { eventoRepository } from '../../../repositories/eventRepository.js';

// ============================================
// 📥 CARGAR EVENTOS DESDE FIRESTORE
// ============================================
const loadEventosFromFirestore = async () => {
    try {
        const user = userService.getCurrentUser();
        if (!user) {
            console.warn('⚠️ No hay usuario autenticado');
            return [];
        }

        console.log('👤 Usuario actual:', user);
        console.log('🔍 Buscando eventos para UID:', user.uid);

        const eventos = await eventoRepository.getByCreador(user.uid);
        
        console.log('📊 Eventos encontrados en Firestore:', eventos.length);

        if (eventos && eventos.length > 0) {
            // Guardar en localStorage para compatibilidad
            localStorage.setItem('eventos', JSON.stringify(eventos));
            localStorage.setItem('snaap_events', JSON.stringify(eventos));
            return eventos;
        } else {
            console.log('ℹ️ No se encontraron eventos para este usuario');
            return [];
        }
    } catch (error) {
        console.error('❌ Error al cargar eventos:', error);
        return loadEventosFromLocalStorage();
    }
};

// ============================================
// 📥 FALLBACK: CARGAR EVENTOS DE LOCALSTORAGE
// ============================================
const loadEventosFromLocalStorage = () => {
    const stored = localStorage.getItem('snaap_events');
    if (stored) {
        try {
            const eventos = JSON.parse(stored);
            if (eventos.length > 0) {
                console.log('📊 Eventos cargados desde localStorage:', eventos.length);
                return eventos;
            }
        } catch (e) {
            console.warn('Error al parsear localStorage:', e);
        }
    }
    return [];
};

// ============================================
// 🗑️ ELIMINAR EVENTO DE FIRESTORE
// ============================================
const deleteEventoFromFirestore = async (id) => {
    try {
        await eventoRepository.delete(id);
        console.log(`🗑️ Evento ${id} eliminado de Firestore`);
        
        const eventos = JSON.parse(localStorage.getItem('eventos') || '[]');
        const filtered = eventos.filter(e => e.id !== id);
        localStorage.setItem('eventos', JSON.stringify(filtered));
        localStorage.setItem('snaap_events', JSON.stringify(filtered));
        
        return true;
    } catch (error) {
        console.error('Error al eliminar evento:', error);
        return false;
    }
};

// ============================================
// 📋 RENDERIZAR LISTA DE EVENTOS
// ============================================
const renderEventosList = (eventos, filter = '') => {
    const container = document.getElementById('eventosList');
    if (!container) return;
    
    console.log('🖼️ Renderizando eventos:', eventos.length);
    
    const filteredEventos = eventos.filter(evento => {
        const nombre = evento.nombre || '';
        return nombre.toLowerCase().includes(filter.toLowerCase());
    });
    
    if (filteredEventos.length === 0) {
        container.innerHTML = `
            <div class="no-results">
                <i class="fas fa-calendar-times"></i>
                <p>No hay eventos disponibles</p>
                <small>Crea tu primer evento</small>
            </div>
        `;
        return;
    }
    
    container.innerHTML = filteredEventos.map(evento => {
        // 🔥 USAR CAMPOS DE FIRESTORE
        const imgUrl = evento.imagenUrl || 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=600&auto=format&fit=crop';
        const nombre = evento.nombre || 'Evento sin nombre';
        
        let fecha = 'Fecha no definida';
        if (evento.fechaEvento) {
            fecha = new Date(evento.fechaEvento).toLocaleDateString('es-ES', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            });
        }
        
        const attendees = evento.attendees || evento.invitados?.length || 0;
        const photos = evento.uploadedPhotos || 0;
        const estado = evento.estado || 'pending';
        
        return `
            <div class="evento-card" data-id="${evento.id}">
                <img src="${imgUrl}" alt="${nombre}" class="evento-img" onerror="this.src='https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=600&auto=format&fit=crop'">
                <div class="evento-info">
                    <h3>${nombre}</h3>
                    <p><i class="fas fa-calendar-day"></i> ${fecha}</p>
                    <p><i class="fas fa-users"></i> ${attendees} asistentes</p>
                    <p><i class="fas fa-camera"></i> ${photos} fotos</p>
                    <p><i class="fas fa-tag"></i> ${estado === 'active' ? '✅ Activo' : '⏳ Pendiente'}</p>
                </div>
                <div class="evento-actions">
                    <button class="btn-view" data-id="${evento.id}" title="Ver detalles del evento">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-edit" data-id="${evento.id}" title="Editar evento">
                        <i class="fas fa-pencil-alt"></i>
                    </button>
                    <button class="btn-delete" data-id="${evento.id}" data-title="${nombre}" title="Eliminar evento">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
            </div>
        `;
    }).join('');
    
    document.querySelectorAll('.btn-view').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const id = btn.getAttribute('data-id');
            redirectToViewDetails(id);
        });
    });
    
    document.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const id = btn.getAttribute('data-id');
            redirectToEditForm(id);
        });
    });
    
    document.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const id = btn.getAttribute('data-id');
            const title = btn.getAttribute('data-title');
            showDeleteModal({ id, nombre: title });
        });
    });
};

// ============================================
// 🗑️ MOSTRAR MODAL DE ELIMINACIÓN
// ============================================
const showDeleteModal = (evento) => {
    Swal.fire({
        title: '¿Eliminar Evento?',
        html: `¿Estás seguro de eliminar el evento <strong>${evento.nombre}</strong>?<br>Esta acción no se puede deshacer.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ff007a',
        cancelButtonColor: '#4db8ff',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
    }).then(async (result) => {
        if (result.isConfirmed) {
            Swal.fire({
                title: 'Eliminando...',
                text: 'Por favor espera',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });
            
            const success = await deleteEventoFromFirestore(evento.id);
            Swal.close();
            
            if (success) {
                await Swal.fire({
                    title: '¡Evento Eliminado!',
                    text: 'El evento ha sido eliminado correctamente',
                    icon: 'success',
                    confirmButtonText: 'OK'
                });
                await loadAndRenderEvents();
            } else {
                Swal.fire({
                    title: 'Error',
                    text: 'No se pudo eliminar el evento',
                    icon: 'error',
                    confirmButtonText: 'OK'
                });
            }
        }
    });
};

// ============================================
// 🔀 REDIRECCIONES
// ============================================
const redirectToEditForm = (eventoId) => {
    localStorage.setItem('eventoParaEditar', eventoId);
    if (typeof navigateTo === 'function') {
        navigateTo(`/host/event-edit?id=${eventoId}`);
    } else {
        window.location.href = `/host/event-edit?id=${eventoId}`;
    }
};

const redirectToViewDetails = (eventoId) => {
    if (typeof navigateTo === 'function') {
        navigateTo(`/host/event-details?id=${eventoId}`);
    } else {
        window.location.href = `/host/event-details?id=${eventoId}`;
    }
};

const redirectToCreateForm = () => {
    localStorage.removeItem('eventoParaEditar');
    if (typeof navigateTo === 'function') {
        navigateTo('/host/create-event');
    } else {
        window.location.href = '/host/create-event';
    }
};

// ============================================
// 📥 CARGAR Y RENDERIZAR EVENTOS
// ============================================
let allEventos = [];

const loadAndRenderEvents = async () => {
    if (!userService.isAuthenticated()) {
        console.warn('⚠️ Usuario no autenticado');
        window.location.href = '/login';
        return;
    }
    
    allEventos = await loadEventosFromFirestore();
    
    const searchTerm = document.getElementById('searchInput')?.value || '';
    renderEventosList(allEventos, searchTerm);
};

// ============================================
// 🚀 CONTROLADOR PRINCIPAL
// ============================================
export async function eventCrudController() {
    console.log('🔥 Controlador eventCrudController iniciado');

    if (!userService.isAuthenticated()) {
        console.warn('⚠️ Usuario no autenticado, redirigiendo a login');
        window.location.href = '/login';
        return;
    }

    await loadAndRenderEvents();
    
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            renderEventosList(allEventos, e.target.value);
        });
    }
    
    const btnCrearEvento = document.getElementById('btnCrearEvento');
    if (btnCrearEvento) {
        btnCrearEvento.addEventListener('click', (e) => {
            e.preventDefault();
            redirectToCreateForm();
        });
    }
    
    console.log('✅ EventCRUD Controller finalizado');
}

export default eventCrudController;