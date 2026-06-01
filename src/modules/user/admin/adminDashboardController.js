// src/modules/visitor/admin/adminDashboardController.js

export async function adminDashboardController() {
    // Cargar CSS específico
    if (!document.querySelector('link[href="/src/css/pages/adminDashboard.css"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = '/src/css/pages/adminDashboard.css';
        document.head.appendChild(link);
    }

    const app = document.getElementById('app');
    if (!app) return;

    // Datos mock (eventos) - luego los moverás a un servicio compartido
    const eventos = [
        { id: 1, nombre: "Fiesta Electrónica", fecha: "2026-06-15", asistentes: 124, fotos: 45 },
        { id: 2, nombre: "Boda de Carlos y Laura", fecha: "2026-05-22", asistentes: 89, fotos: 23 },
        { id: 3, nombre: "Graduación ITESM", fecha: "2026-05-05", asistentes: 210, fotos: 67 }
    ];

    const today = new Date().toISOString().split('T')[0];
    const pastEvents = eventos.filter(e => e.fecha < today);
    const futureEvents = eventos.filter(e => e.fecha >= today);

    app.innerHTML = `
        <div class="admin-dashboard-container">
            <header class="dashboard-header">
                <h1>Panel de Control</h1>
                <p>Gestiona tus eventos y crea nuevas experiencias.</p>
            </header>
            <div class="dashboard-actions">
                <a href="/admin/crear" data-link class="btn-neon">+ Crear nuevo evento</a>
                <a href="/admin/historial" data-link class="btn-neon-secondary">Ver historial completo</a>
            </div>
            <div class="dashboard-grid">
                <div class="dashboard-card">
                    <h3><i class="fas fa-calendar-alt"></i> Eventos pasados</h3>
                    ${pastEvents.length === 0 ? '<p>Aún no hay eventos pasados.</p>' : `
                        <ul class="event-list">
                            ${pastEvents.map(e => `
                                <li>
                                    <strong>${e.nombre}</strong> - ${e.fecha}
                                    <span class="event-stats">
                                        <i class="fas fa-camera"></i> ${e.fotos} 
                                        <i class="fas fa-users"></i> ${e.asistentes}
                                    </span>
                                    <a href="/admin/evento/${e.id}" data-link class="btn-small">Administrar</a>
                                </li>
                            `).join('')}
                        </ul>
                    `}
                </div>
                <div class="dashboard-card">
                    <h3><i class="fas fa-calendar-check"></i> Eventos próximos</h3>
                    ${futureEvents.length === 0 ? '<p>No hay eventos programados.</p>' : `
                        <ul class="event-list">
                            ${futureEvents.map(e => `
                                <li>
                                    <strong>${e.nombre}</strong> - ${e.fecha}
                                    <span class="event-stats">
                                        <i class="fas fa-camera"></i> ${e.fotos} 
                                        <i class="fas fa-users"></i> ${e.asistentes}
                                    </span>
                                    <a href="/admin/evento/${e.id}" data-link class="btn-small">Administrar</a>
                                </li>
                            `).join('')}
                        </ul>
                    `}
                </div>
            </div>
        </div>
    `;

    // No hay eventos adicionales porque los enlaces usan data-link
}