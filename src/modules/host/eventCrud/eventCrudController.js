// src/modules/host/eventCrud/eventCrudController.js
import { userService } from '../../../services/userService.js';
import { eventService } from '../../../services/eventService.js';
import { eventoRepository } from '../../../repositories/eventRepository.js';

// âœ… EXPORTACIÃ“N CORRECTA
export async function eventCrudController() {
    console.log('ðŸ”¥ Event CRUD Controller iniciado');

    if (!userService.isAuthenticated()) {
        console.warn('âš ï¸ Usuario no autenticado');
        import('../../../utils/navigation.js').then(({ navigateOrHref }) => navigateOrHref('/login'));
        return;
    }

    // ðŸ”¥ Establecer el usuario actual en el servicio
    const user = userService.getCurrentUser();
    eventService.setUsuarioActual(user);

    loadStyles();
    await loadAndRenderEvents();
    setupEventListeners();
}

let allEventos = [];

function loadStyles() {
    const styles = [
        { href: '/src/css/components/eventCrud.css', id: 'event-crud-style' }
    ];
    
    styles.forEach(style => {
        if (!document.querySelector(`link[href="${style.href}"]`)) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = style.href;
            document.head.appendChild(link);
        }
    });
}

// ============================================
// ðŸ“¥ CARGAR EVENTOS DESDE FIRESTORE
// ============================================
async function loadEventosFromFirestore() {
    try {
        const user = userService.getCurrentUser();
        if (!user) {
            console.warn('âš ï¸ No hay usuario autenticado');
            return [];
        }

        console.log('ðŸ‘¤ Usuario actual:', user);
        console.log('ðŸŽ¯ Rol del usuario:', user.role);

        // ðŸ”¥ OBTENER EVENTOS SEGÃšN EL ROL
        const result = await eventService.obtenerEventosPorRol(user.uid, user.role);

        if (result.success) {
            const eventos = result.eventos;
            console.log(`ðŸ“Š ${eventos.length} eventos encontrados para el rol ${user.role}`);

            // Guardar en localStorage para compatibilidad
            localStorage.setItem('eventos', JSON.stringify(eventos));
            localStorage.setItem('snaap_events', JSON.stringify(eventos));
            return eventos;
        } else {
            console.error('Error al cargar eventos:', result.error);
            return loadEventosFromLocalStorage();
        }
    } catch (error) {
        console.error('âŒ Error al cargar eventos:', error);
        return loadEventosFromLocalStorage();
    }
}

// ============================================
// ðŸ“¥ FALLBACK: CARGAR EVENTOS DE LOCALSTORAGE
// ============================================
function loadEventosFromLocalStorage() {
    const stored = localStorage.getItem('snaap_events');
    if (stored) {
        try {
            const eventos = JSON.parse(stored);
            if (eventos.length > 0) {
                console.log('ðŸ“Š Eventos cargados desde localStorage:', eventos.length);
                return eventos;
            }
        } catch (e) {
            console.warn('Error al parsear localStorage:', e);
        }
    }
    return [];
}

// ============================================
// ðŸ–¼ï¸ RENDERIZAR LISTA DE EVENTOS
// ============================================
function renderEventosList(eventos, filter = '') {
    const container = document.getElementById('eventosList');
    if (!container) return;
    
    console.log('ðŸ–¼ï¸ Renderizando eventos:', eventos.length);
    
    const filteredEventos = eventos.filter(evento => {
        const nombre = evento.nombre || evento.title || '';
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
        const imgUrl = evento.imagenUrl || evento.img || 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=600&auto=format&fit=crop';
        const nombre = evento.nombre || evento.title || 'Evento sin nombre';
        
        let fecha = 'Fecha no definida';
        if (evento.fechaEvento) {
            fecha = new Date(evento.fechaEvento).toLocaleDateString('es-ES', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            });
        } else if (evento.date) {
            fecha = evento.date;
        }
        
        const attendees = evento.attendees || evento.invitados?.length || 0;
        const photos = evento.uploadedPhotos || 0;
        const estado = evento.estado || 'pending';
        const estadoText = estado === 'active' ? 'âœ… Activo' : 
                          estado === 'completed' ? 'ðŸ“Œ Completado' : 
                          estado === 'cancelled' ? 'âŒ Cancelado' : 'â³ Pendiente';
        
        return `
            <div class="evento-card" data-id="${evento.id}">
                <img src="${imgUrl}" alt="${nombre}" class="evento-img" onerror="this.src='https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=600&auto=format&fit=crop'">
                <div class="evento-info">
                    <h3>${nombre}</h3>
                    <p><i class="fas fa-calendar-day"></i> ${fecha}</p>
                    <p><i class="fas fa-users"></i> ${attendees} asistentes</p>
                    <p><i class="fas fa-camera"></i> ${photos} fotos</p>
                    <p><i class="fas fa-tag"></i> ${estadoText}</p>
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
    
    // Agregar event listeners usando delegaciÃ³n
    setupButtonListeners(container);
}

// ============================================
// ðŸ”§ CONFIGURAR EVENT LISTENERS DE LOS BOTONES
// ============================================
function setupButtonListeners(container) {
    // Ver detalles
    container.querySelectorAll('.btn-view').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const id = btn.getAttribute('data-id');
            console.log('ðŸ” Ver detalles del evento:', id);
            redirectToViewDetails(id);
        });
    });
    
    // Editar
    container.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const id = btn.getAttribute('data-id');
            console.log('âœï¸ Editar evento:', id);
            redirectToEditForm(id);
        });
    });
    
    // Eliminar
    container.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const id = btn.getAttribute('data-id');
            const title = btn.getAttribute('data-title');
            showDeleteModal({ id, nombre: title });
        });
    });
}

// ============================================
// ðŸ—‘ï¸ MOSTRAR MODAL DE ELIMINACIÃ“N
// ============================================
function showDeleteModal(evento) {
    Swal.fire({
        title: 'Â¿Eliminar Evento?',
        html: `Â¿EstÃ¡s seguro de eliminar el evento <strong>${evento.nombre}</strong>?<br>Esta acciÃ³n no se puede deshacer.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ff007a',
        cancelButtonColor: '#4db8ff',
        confirmButtonText: 'SÃ­, eliminar',
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
            
            try {
                await deleteEventoFromFirestore(evento.id);
                Swal.close();
                
                await Swal.fire({
                    title: 'Â¡Evento Eliminado!',
                    text: 'El evento ha sido eliminado correctamente',
                    icon: 'success',
                    confirmButtonText: 'OK'
                });
                await loadAndRenderEvents();
            } catch (error) {
                Swal.close();
                Swal.fire({
                    title: 'Error',
                    text: error.message || 'No se pudo eliminar el evento',
                    icon: 'error',
                    confirmButtonText: 'OK'
                });
            }
        }
    });
}

// ============================================
// ðŸ—‘ï¸ ELIMINAR EVENTO DE FIRESTORE
// ============================================
async function deleteEventoFromFirestore(id) {
    try {
        const user = userService.getCurrentUser();
        if (!user) {
            throw new Error('No hay usuario autenticado');
        }

        const evento = await eventoRepository.getById(id);
        if (!evento) {
            throw new Error('Evento no encontrado');
        }

        // Solo el creador o el admin pueden eliminar
        if (user.role !== 'sysadmin' && evento.creadoPor !== user.uid) {
            throw new Error('No tienes permiso para eliminar este evento');
        }

        await eventoRepository.delete(id);
        console.log(`ðŸ—‘ï¸ Evento ${id} eliminado de Firestore`);

        // Actualizar localStorage
        const eventos = JSON.parse(localStorage.getItem('eventos') || '[]');
        const filtered = eventos.filter(e => e.id !== id);
        localStorage.setItem('eventos', JSON.stringify(filtered));
        localStorage.setItem('snaap_events', JSON.stringify(filtered));

        return true;
    } catch (error) {
        console.error('Error al eliminar evento:', error);
        throw error;
    }
}

// ============================================
// ðŸ”€ REDIRECCIONES
// ============================================
function redirectToEditForm(eventoId) {
    localStorage.setItem('eventoParaEditar', eventoId);
    if (typeof window.navigateTo === 'function') {
        window.navigateTo(`/host/event-edit?id=${eventoId}`);
    } else {
        window.go(`/host/event-edit?id=${eventoId}`);
    }
}

function redirectToViewDetails(eventoId) {
    if (typeof window.navigateTo === 'function') {
        window.navigateTo(`/host/event-details?id=${eventoId}`);
    } else {
        window.go(`/host/event-details?id=${eventoId}`);
    }
}

function redirectToCreateForm() {
    localStorage.removeItem('eventoParaEditar');
    if (typeof window.navigateTo === 'function') {
        window.navigateTo('/host/create-event');
    } else {
        window.go('');
    }
}

// ============================================
// ðŸ“¥ CARGAR Y RENDERIZAR EVENTOS
// ============================================
async function loadAndRenderEvents() {
    // Verificar autenticaciÃ³n
    if (!userService.isAuthenticated()) {
        console.warn('âš ï¸ Usuario no autenticado');
        import('../../../utils/navigation.js').then(({ navigateOrHref }) => navigateOrHref('/login'));
        return;
    }
    
    // Cargar eventos desde Firestore
    allEventos = await loadEventosFromFirestore();
    
    // Renderizar lista
    const searchTerm = document.getElementById('searchInput')?.value || '';
    renderEventosList(allEventos, searchTerm);
}

// ============================================
// ðŸ”§ CONFIGURAR EVENTOS DEL CRUD
// ============================================
function setupEventListeners() {
    console.log('ðŸ”§ Configurando event listeners...');
    
    // BÃºsqueda
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            renderEventosList(allEventos, e.target.value);
        });
    }
    
    // BotÃ³n crear nuevo evento
    const btnCrearEvento = document.getElementById('btnCrearEvento');
    if (btnCrearEvento) {
        btnCrearEvento.addEventListener('click', (e) => {
            e.preventDefault();
            redirectToCreateForm();
        });
    }
    
    console.log('âœ… Event CRUD Controller finalizado');
}

// âœ… EXPORTACIÃ“N POR DEFECTO (para compatibilidad)
export default eventCrudController;
