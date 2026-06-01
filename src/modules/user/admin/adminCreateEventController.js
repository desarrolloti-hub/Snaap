// src/modules/user/admin/adminCreateEventController.js

export async function adminCreateEventController() {
    // Cargar CSS
    if (!document.querySelector('link[href="/src/css/pages/adminCreateEvent.css"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = '/src/css/pages/adminCreateEvent.css';
        document.head.appendChild(link);
    }

    const app = document.getElementById('app');
    if (!app) return;

    app.innerHTML = `
        <div class="create-event-container">
            <!-- Botón Volver al panel (estilo neón) -->
            <div class="back-button-wrapper">
                <button id="backToAdminBtn" class="btn-neon back-btn"><i class="fas fa-arrow-left"></i> Volver al panel</button>
            </div>
            <div class="create-event-card">
                <h2><i class="fas fa-plus-circle"></i> Crear nuevo evento</h2>
                <form id="createEventForm">
                    <div class="input-group">
                        <input type="text" id="eventName" placeholder="Nombre del evento" required>
                    </div>
                    <div class="input-group">
                        <input type="date" id="eventDate" required>
                    </div>
                    
                    <div class="form-actions">
                        <button type="submit" class="btn-neon">Guardar evento</button>
                        <button type="button" id="cancelBtn" class="btn-neon cancel-btn">Cancelar</button>
                    </div>
                </form>
            </div>
        </div>
    `;

    // Lógica del botón Volver al panel (navegación SPA)
    const backBtn = document.getElementById('backToAdminBtn');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            if (typeof window.navigateTo === 'function') {
                window.navigateTo('/admin');
            } else {
                window.location.href = '/admin';
            }
        });
    }

    const form = document.getElementById('createEventForm');
    const cancelBtn = document.getElementById('cancelBtn');

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('eventName').value.trim();
        const date = document.getElementById('eventDate').value;
        if (!name || !date) {
            alert('⚠️ Nombre y fecha son obligatorios');
            return;
        }
        // Aquí tu lógica para guardar (simulada)
        alert(`🎉 Evento "${name}" creado correctamente.`);
        // Redirige al panel
        if (typeof window.navigateTo === 'function') {
            window.navigateTo('/admin');
        } else {
            window.location.href = '/admin';
        }
    });

    cancelBtn.addEventListener('click', () => {
        if (typeof window.navigateTo === 'function') {
            window.navigateTo('/admin');
        } else {
            window.location.href = '/admin';
        }
    });
}