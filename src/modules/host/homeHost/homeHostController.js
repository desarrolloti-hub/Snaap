export function homeHostController() {
    console.log('Home Host Controller cargado');
    
    // Datos de ejemplo para el dashboard
    const stats = {
        totalEvents: 12,
        totalPhotos: 847,
        totalAttendees: 2450,
        activeEvents: 3
    };
    
    const recentEvents = [
        {
            id: 1,
            title: "Los XV de Rusi",
            date: "15 Marzo 2024",
            photos: 45,
            attendees: 120,
            status: "completado"
        },
        {
            id: 2,
            title: "Boda Legendaria",
            date: "22 Febrero 2024",
            photos: 128,
            attendees: 250,
            status: "completado"
        },
        {
            id: 3,
            title: "Fiesta Locura Total",
            date: "10 Enero 2024",
            photos: 92,
            attendees: 180,
            status: "completado"
        },
        {
            id: 4,
            title: "Graduación UNI",
            date: "05 Abril 2024",
            photos: 67,
            attendees: 95,
            status: "activo"
        }
    ];
    
    // Actualizar estadísticas en el DOM
    const updateStats = () => {
        const totalEventsEl = document.getElementById('totalEvents');
        const totalPhotosEl = document.getElementById('totalPhotos');
        const totalAttendeesEl = document.getElementById('totalAttendees');
        const activeEventsEl = document.getElementById('activeEvents');
        
        if (totalEventsEl) totalEventsEl.textContent = stats.totalEvents;
        if (totalPhotosEl) totalPhotosEl.textContent = stats.totalPhotos;
        if (totalAttendeesEl) totalAttendeesEl.textContent = stats.totalAttendees;
        if (activeEventsEl) activeEventsEl.textContent = stats.activeEvents;
    };
    
    // Renderizar eventos recientes
    const renderRecentEvents = () => {
        const container = document.getElementById('recentEventsList');
        if (!container) return;
        
        container.innerHTML = recentEvents.map(event => `
            <div class="recent-event-card" data-id="${event.id}">
                <div class="event-info">
                    <h4>${event.title}</h4>
                    <div class="event-details">
                        <span><i class="fas fa-calendar-day"></i> ${event.date}</span>
                        <span><i class="fas fa-users"></i> ${event.attendees} asistentes</span>
                        <span><i class="fas fa-camera"></i> ${event.photos} fotos</span>
                    </div>
                </div>
                <div class="event-status">
                    <span class="status-badge ${event.status}">${event.status === 'activo' ? 'Activo' : 'Completado'}</span>
                    <button class="btn-view-event" data-id="${event.id}">
                        <i class="fas fa-eye"></i> Ver
                    </button>
                </div>
            </div>
        `).join('');
        
        // Agregar event listeners a los botones de ver evento
        document.querySelectorAll('.btn-view-event').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = btn.dataset.id;
                console.log(`Ver evento ${id}`);
                // Navegar al detalle del evento
                if (typeof window.navigateTo === 'function') {
                    window.navigateTo('/host/events');
                }
            });
        });
    };
    
    // Inicializar gráfica (simulada)
    const initChart = () => {
        const canvas = document.getElementById('eventsChart');
        if (!canvas) return;
        
        // Aquí puedes agregar una gráfica real con Chart.js u otra librería
        console.log('Gráfica inicializada');
    };
    
    // Configurar event listeners de botones de acción rápida
    const setupQuickActions = () => {
        const createEventBtn = document.getElementById('createEventBtn');
        const viewEventsBtn = document.getElementById('viewEventsBtn');
        const managePhotosBtn = document.getElementById('managePhotosBtn');
        
        if (createEventBtn) {
            createEventBtn.addEventListener('click', () => {
                if (typeof window.navigateTo === 'function') {
                    window.navigateTo('/host/create-event');
                }
            });
        }
        
        if (viewEventsBtn) {
            viewEventsBtn.addEventListener('click', () => {
                if (typeof window.navigateTo === 'function') {
                    window.navigateTo('/host/events');
                }
            });
        }
        
        if (managePhotosBtn) {
            managePhotosBtn.addEventListener('click', () => {
                if (typeof window.navigateTo === 'function') {
                    window.navigateTo('/host/event-crud');
                }
            });
        }
    };
    
    // Inicializar todo
    updateStats();
    renderRecentEvents();
    initChart();
    setupQuickActions();
}

export default homeHostController;