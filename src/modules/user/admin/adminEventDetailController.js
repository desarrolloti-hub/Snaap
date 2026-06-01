// src/modules/visitor/admin/adminEventDetailController.js

export async function adminEventDetailController(params) {
    // params contiene { id } (lo pasa el router)
    const eventId = parseInt(params.id);
    if (isNaN(eventId)) {
        window.location.href = '/admin';
        return;
    }

    // Cargar CSS específico
    if (!document.querySelector('link[href="/src/css/pages/adminEventDetail.css"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = '/src/css/pages/adminEventDetail.css';
        document.head.appendChild(link);
    }

    const app = document.getElementById('app');
    if (!app) return;

    // Obtener evento (mock - luego desde servicio)
    const eventos = [
        { id: 1, nombre: "Fiesta Electrónica", fecha: "2026-06-15", asistentes: 124, fotos: 45 },
        { id: 2, nombre: "Boda de Carlos y Laura", fecha: "2026-05-22", asistentes: 89, fotos: 23 },
        { id: 3, nombre: "Graduación ITESM", fecha: "2026-05-05", asistentes: 210, fotos: 67 }
    ];
    const evento = eventos.find(e => e.id === eventId);
    if (!evento) {
        window.location.href = '/admin';
        return;
    }

    // Contenido pendiente (mock)
    let contenidoPendiente = [
        { id: 101, usuario: "Ana", tipo: "foto", preview: "https://picsum.photos/80/80?random=1" },
        { id: 102, usuario: "Luis", tipo: "texto", contenido: "¡Qué buena fiesta!" },
        { id: 103, usuario: "Mía", tipo: "dibujo", preview: "https://picsum.photos/80/80?random=2" }
    ];

    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://snaap.app/evento/${evento.id}`;

    function renderPendingItems() {
        const pendingGrid = document.getElementById('pendingGrid');
        if (!pendingGrid) return;
        pendingGrid.innerHTML = contenidoPendiente.map(c => `
            <div class="pending-item" data-id="${c.id}">
                <div class="user">${c.usuario}</div>
                <div class="content-preview">
                    ${c.tipo === 'foto' || c.tipo === 'dibujo' 
                        ? `<img src="${c.preview}" width="60" height="60">` 
                        : `<p>${c.contenido}</p>`}
                </div>
                <div class="actions">
                    <button class="approve-btn" data-id="${c.id}"><i class="fas fa-check-circle"></i> Aprobar</button>
                    <button class="reject-btn" data-id="${c.id}"><i class="fas fa-times-circle"></i> Rechazar</button>
                </div>
            </div>
        `).join('');
        document.querySelector('.stat-card:last-child span').textContent = contenidoPendiente.length;
        attachEvents();
    }

    function attachEvents() {
        document.querySelectorAll('.approve-btn').forEach(btn => {
            btn.onclick = () => {
                const id = parseInt(btn.dataset.id);
                contenidoPendiente = contenidoPendiente.filter(c => c.id !== id);
                renderPendingItems();
                alert('✅ Contenido aprobado');
            };
        });
        document.querySelectorAll('.reject-btn').forEach(btn => {
            btn.onclick = () => {
                const id = parseInt(btn.dataset.id);
                contenidoPendiente = contenidoPendiente.filter(c => c.id !== id);
                renderPendingItems();
                alert('❌ Contenido rechazado');
            };
        });
    }

    app.innerHTML = `
        <div class="detail-container">
            <a href="/admin" data-link class="back-link"><i class="fas fa-arrow-left"></i> Volver al panel</a>
            <div class="detail-header">
                <h1>${evento.nombre}</h1>
                <div class="stats-row">
                    <div class="stat-card"><i class="fas fa-users"></i><span>${evento.asistentes}</span><label>Asistentes</label></div>
                    <div class="stat-card"><i class="fas fa-camera"></i><span>${evento.fotos}</span><label>Fotos</label></div>
                    <div class="stat-card"><i class="fas fa-hourglass-half"></i><span>${contenidoPendiente.length}</span><label>Pendientes</label></div>
                </div>
            </div>
            <div class="detail-grid">
                <div class="qr-card">
                    <h3><i class="fas fa-qrcode"></i> Código QR</h3>
                    <img src="${qrUrl}" alt="QR">
                    <button class="btn-neon" id="descargarQR">Descargar QR</button>
                </div>
                <div class="moderation-card">
                    <h3><i class="fas fa-shield-alt"></i> Moderación en vivo</h3>
                    <div class="pending-grid" id="pendingGrid"></div>
                </div>
                <div class="mural-card">
                    <h3><i class="fas fa-film"></i> Mural en vivo (vista previa)</h3>
                    <div class="live-mural">
                        <div class="mural-item"><img src="https://picsum.photos/100/100?random=10"></div>
                        <div class="mural-item"><img src="https://picsum.photos/100/100?random=11"></div>
                        <div class="mural-item"><p>¡Increíble noche!</p></div>
                    </div>
                </div>
            </div>
        </div>
    `;
    renderPendingItems();
    document.getElementById('descargarQR')?.addEventListener('click', () => {
        const link = document.createElement('a');
        link.download = 'qr_snaap.png';
        link.href = qrUrl;
        link.click();
    });
}