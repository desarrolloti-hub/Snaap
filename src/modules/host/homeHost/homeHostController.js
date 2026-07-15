// src/modules/host/homeHost/homeHostController.js
import { userService } from '../../../services/userService.js';
import { userRepository } from '../../../repositories/userRepository.js';
import { eventService } from '../../../services/eventService.js';
import { carroucelEventsController } from '../carroucelEvents/carroucelEventsController.js';

let carouselLoaded = false;

export async function homeHostController() {
    console.log('🔥 Home Host Controller cargado');

    if (!userService.isAuthenticated()) {
        console.warn('⚠️ Usuario no autenticado, redirigiendo a login');
        window.location.href = '/login';
        return;
    }

    const user = userService.getCurrentUser();
    if (!user) {
        console.warn('⚠️ No se pudo obtener el usuario');
        return;
    }

    updateWelcomeMessage(user);

    if (!carouselLoaded) {
        await carroucelEventsController();
        carouselLoaded = true;
        console.log('✅ Carrusel cargado correctamente');
    }

    await loadStats(user.uid);
    await loadRecentEvents(user.uid);
    setupQuickActions();

    console.log('✅ Home Host Controller finalizado');
}

const updateWelcomeMessage = (user) => {
    const heroTitle = document.querySelector('.dashboard-hero h1');
    if (heroTitle) {
        const name = user.username || user.email?.split('@')[0] || 'Host';
        heroTitle.innerHTML = `
            <i class="fas fa-chalkboard-user"></i>
            Bienvenido, <span id="hostName">${name}</span>
        `;
    }
};

const loadStats = async (uid) => {
    try {
        const result = await eventService.obtenerEstadisticasPerfil(uid);

        if (result.success) {
            const { estadisticas } = result;

            console.log('📊 Estadísticas recibidas:', estadisticas);

            const totalEventsEl = document.getElementById('totalEvents');
            if (totalEventsEl) {
                totalEventsEl.textContent = estadisticas.totalEventos || 0;
                console.log(`📊 Total eventos: ${estadisticas.totalEventos}`);
            }

            const totalPhotosEl = document.getElementById('totalPhotos');
            if (totalPhotosEl) {
                totalPhotosEl.textContent = estadisticas.totalFotos || 0;
            }

            const activeEventsEl = document.getElementById('activeEvents');
            if (activeEventsEl) {
                activeEventsEl.textContent = estadisticas.eventosActivos || 0;
            }

            const user = userService.getCurrentUser();
            if (user) {
                const userData = await userRepository.getByUid(user.uid);
                if (userData) {
                    const eventsCompletedEl = document.querySelector('.stat-card .events-completed');
                    if (eventsCompletedEl) {
                        eventsCompletedEl.textContent = userData.eventsCreated || 0;
                    }
                }
            }

        } else {
            console.error('Error al cargar estadísticas:', result.error);
            loadStatsFromLocalStorage();
        }
    } catch (error) {
        console.error('❌ Error al cargar estadísticas:', error);
        loadStatsFromLocalStorage();
    }
};

const loadStatsFromLocalStorage = () => {
    const stored = localStorage.getItem('snaap_events');
    let totalEvents = 0;
    let totalPhotos = 0;
    let activeEvents = 0;

    if (stored) {
        const eventos = JSON.parse(stored);
        totalEvents = eventos.length;
        totalPhotos = eventos.reduce((sum, e) => sum + (e.uploadedPhotos || 0), 0);
        activeEvents = eventos.filter(e => e.status === 'active' || e.estado === 'active').length;
    }

    const totalEventsEl = document.getElementById('totalEvents');
    const totalPhotosEl = document.getElementById('totalPhotos');
    const activeEventsEl = document.getElementById('activeEvents');

    if (totalEventsEl) totalEventsEl.textContent = totalEvents;
    if (totalPhotosEl) totalPhotosEl.textContent = totalPhotos;
    if (activeEventsEl) activeEventsEl.textContent = activeEvents;

    console.log(`📊 Fallback - Total eventos: ${totalEvents}`);
};

const loadRecentEvents = async (uid) => {
    const container = document.getElementById('recentEventsList');
    if (!container) return;

    try {
        const result = await eventService.obtenerEventosPorUsuario(uid);

        if (result.success) {
            const eventos = result.eventos;

            const sortedEvents = eventos.sort((a, b) => {
                const dateA = new Date(a.createdAt);
                const dateB = new Date(b.createdAt);
                return dateB - dateA;
            });

            const recentEvents = sortedEvents.slice(0, 5);

            if (recentEvents.length === 0) {
                container.innerHTML = `
                    <div class="no-events">
                        <i class="fas fa-calendar-plus"></i>
                        <p>No tienes eventos aún</p>
                        <small>Crea tu primer evento</small>
                    </div>
                `;
                return;
            }

            container.innerHTML = recentEvents.map(event => {
                const statusText = event.estado === 'active' ? 'Activo' : 
                                  event.estado === 'completed' ? 'Completado' : 
                                  event.estado === 'cancelled' ? 'Cancelado' : 'Pendiente';
                
                const statusClass = event.estado === 'active' ? 'activo' : 
                                   event.estado === 'completed' ? 'completado' : 
                                   event.estado === 'cancelled' ? 'cancelado' : 'pendiente';

                const fecha = event.fechaEvento ? new Date(event.fechaEvento).toLocaleDateString('es-ES', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                }) : 'Fecha no definida';

                const invitados = event.invitados?.length || 0;
                const fotos = event.uploadedPhotos || 0;

                return `
                    <div class="recent-event-card" data-id="${event.id}">
                        <div class="event-info">
                            <h4>${event.nombre || 'Evento sin nombre'}</h4>
                            <div class="event-details">
                                <span><i class="fas fa-calendar-day"></i> ${fecha}</span>
                                <span><i class="fas fa-users"></i> ${invitados} invitados</span>
                                <span><i class="fas fa-camera"></i> ${fotos} fotos</span>
                            </div>
                        </div>
                        <div class="event-status">
                            <span class="status-badge ${statusClass}">${statusText}</span>
                            <button class="btn-view-event" data-id="${event.id}">
                                <i class="fas fa-eye"></i> Ver
                            </button>
                        </div>
                    </div>
                `;
            }).join('');

            document.querySelectorAll('.btn-view-event').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const id = btn.dataset.id;
                    console.log(`🔍 Ver evento ${id}`);
                    if (typeof window.navigateTo === 'function') {
                        window.navigateTo(`/host/event-details?id=${id}`);
                    } else {
                        window.location.href = `/host/event-details?id=${id}`;
                    }
                });
            });

        } else {
            console.error('Error al cargar eventos:', result.error);
            loadRecentEventsFromLocalStorage();
        }
    } catch (error) {
        console.error('❌ Error al cargar eventos recientes:', error);
        loadRecentEventsFromLocalStorage();
    }
};

const loadRecentEventsFromLocalStorage = () => {
    const container = document.getElementById('recentEventsList');
    if (!container) return;

    const stored = localStorage.getItem('snaap_events');
    let eventos = [];

    if (stored) {
        eventos = JSON.parse(stored);
    }

    if (eventos.length === 0) {
        container.innerHTML = `
            <div class="no-events">
                <i class="fas fa-calendar-plus"></i>
                <p>No tienes eventos aún</p>
                <small>Crea tu primer evento</small>
            </div>
        `;
        return;
    }

    const recentEvents = eventos.slice(0, 5);
    container.innerHTML = recentEvents.map(event => `
        <div class="recent-event-card" data-id="${event.id}">
            <div class="event-info">
                <h4>${event.name || 'Evento sin nombre'}</h4>
                <div class="event-details">
                    <span><i class="fas fa-calendar-day"></i> ${event.date || 'Fecha no definida'}</span>
                    <span><i class="fas fa-users"></i> ${event.attendees || 0} invitados</span>
                    <span><i class="fas fa-camera"></i> ${event.photos || 0} fotos</span>
                </div>
            </div>
            <div class="event-status">
                <span class="status-badge ${event.status === 'active' ? 'activo' : 'completado'}">
                    ${event.status === 'active' ? 'Activo' : 'Completado'}
                </span>
                <button class="btn-view-event" data-id="${event.id}">
                    <i class="fas fa-eye"></i> Ver
                </button>
            </div>
        </div>
    `).join('');

    document.querySelectorAll('.btn-view-event').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const id = btn.dataset.id;
            if (typeof window.navigateTo === 'function') {
                window.navigateTo(`/host/event-details?id=${id}`);
            }
        });
    });
};

const setupQuickActions = () => {
    const createEventBtn = document.getElementById('createEventBtn');
    const viewEventsBtn = document.getElementById('viewEventsBtn');
    const managePhotosBtn = document.getElementById('managePhotosBtn');

    if (createEventBtn) {
        createEventBtn.addEventListener('click', () => {
            if (typeof window.navigateTo === 'function') {
                window.navigateTo('/host/create-event');
            } else {
                window.location.href = '/host/create-event';
            }
        });
    }

    if (viewEventsBtn) {
        viewEventsBtn.addEventListener('click', () => {
            if (typeof window.navigateTo === 'function') {
                window.navigateTo('/host/event-crud');
            } else {
                window.location.href = '/host/event-crud';
            }
        });
    }

    if (managePhotosBtn) {
        managePhotosBtn.addEventListener('click', () => {
            if (typeof window.navigateTo === 'function') {
                window.navigateTo('/host/event-crud');
            } else {
                window.location.href = '/host/event-crud';
            }
        });
    }
};

export default homeHostController;