// src/modules/visitor/admin/adminEventHistoryController.js

export async function adminEventHistoryController() {
    if (!document.querySelector('link[href="/src/css/pages/adminEventHistory.css"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = '/src/css/pages/adminEventHistory.css';
        document.head.appendChild(link);
    }

    const app = document.getElementById('app');
    if (!app) return;

    // Datos mock (eventos)
    const eventos = [
        { id: 1, nombre: "Fiesta Electrónica", fecha: "2026-06-15", asistentes: 124, fotos: 45, estado: "finalizado" },
        { id: 2, nombre: "Boda de Carlos y Laura", fecha: "2026-05-22", asistentes: 89, fotos: 23, estado: "finalizado" },
        { id: 3, nombre: "Graduación ITESM", fecha: "2026-05-05", asistentes: 210, fotos: 67, estado: "finalizado" }
    ];

    app.innerHTML = `
        <div class="history-container">
            <a href="/admin" data-link class="back-link"><i class="fas fa-arrow-left"></i> Volver al panel</a>
            <h1>Historial de eventos</h1>
            <p>Todos los eventos que has organizado.</p>
            <div class="history-table-wrapper">
                <table class="history-table">
                    <thead>
                        <tr><th>Evento</th><th>Fecha</th><th>Fotos</th><th>Asistentes</th><th>Acciones</th></tr>
                    </thead>
                    <tbody>
                        ${eventos.map(e => `
                            <tr>
                                <td><strong>${e.nombre}</strong></td>
                                <td>${e.fecha}</td>
                                <td><i class="fas fa-camera"></i> ${e.fotos}</td>
                                <td><i class="fas fa-users"></i> ${e.asistentes}</td>
                                <td><a href="/admin/evento/${e.id}" data-link class="btn-small">Ver detalles</a></td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}