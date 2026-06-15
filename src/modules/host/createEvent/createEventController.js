const packagesDetails = {
    basico: {
        nombre: "Paquete Básico",
        precio: "$00 MXN",
        caracteristicas: [
            "Capacidad para 50 invitados",
            "Capacidad de almacenamiento para 200 fotos",
            "Solo puedes subir fotos, dibujos y notas",
            "Duración: 24 horas después del evento",
        ]
    },
    estandar: {
        nombre: "Paquete Estándar",
        precio: "$00 MXN",
        caracteristicas: [
            "Capacidad para 100 invitados",
            "Galería de fotos premium",
            "Música en vivo (1 hora)",
            "Soporte prioritario",
            "Duración: 48 horas después del evento",
            "Video streaming básico"
        ]
    },
    premium: {
        nombre: "Paquete Premium",
        precio: "$00 MXN",
        caracteristicas: [
            "Capacidad para 150 invitados",
            "Galería de fotos + video",
            "Música en vivo (2 horas)",
            "Soporte 24/7",
            "Duración: 72 horas después del evento",
            "Video streaming HD",
            "Fotógrafo profesional"
        ]
    },
    empresarial: {
        nombre: "Paquete Empresarial",
        precio: "$00 MXN",
        caracteristicas: [
            "Capacidad para 200 invitados",
            "Cobertura multimedia completa",
            "Soporte dedicado",
            "Duración: 7 días después del evento",
            "Streaming 4K",
            "Marca personalizada"
        ]
    }
};

// ============================================
// MODAL PERSONALIZADO
// ============================================

let pendingCallback = null;

const showModal = (title, message, icon = 'info', showCancel = false, onConfirm = null, onCancel = null) => {
    const modal = document.getElementById('customModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalIcon = document.getElementById('modalIcon').querySelector('i');
    const modalMessage = document.getElementById('modalMessage');
    const confirmBtn = document.getElementById('modalConfirmBtn');
    const cancelBtn = document.getElementById('modalCancelBtn');
    const closeBtn = document.getElementById('modalCloseBtn');
    
    // Configurar iconos según el tipo
    let iconClass = 'fas fa-info-circle';
    let iconColor = '#4db8ff';
    
    if (icon === 'success') {
        iconClass = 'fas fa-check-circle';
        iconColor = '#4db8ff';
    } else if (icon === 'error') {
        iconClass = 'fas fa-exclamation-circle';
        iconColor = '#ff4444';
    } else if (icon === 'warning') {
        iconClass = 'fas fa-exclamation-triangle';
        iconColor = '#ffaa00';
    }
    
    modalIcon.className = iconClass;
    modalIcon.style.color = iconColor;
    modalTitle.textContent = title;
    modalTitle.style.color = iconColor;
    modalMessage.textContent = message;
    
    // Configurar botones
    if (showCancel) {
        cancelBtn.style.display = 'inline-flex';
        confirmBtn.innerHTML = '<i class="fas fa-check"></i> Confirmar';
    } else {
        cancelBtn.style.display = 'none';
        confirmBtn.innerHTML = '<i class="fas fa-check"></i> Aceptar';
    }
    
    // Guardar callbacks
    pendingCallback = { onConfirm, onCancel };
    
    // Mostrar modal
    modal.style.display = 'flex';
    
    // Configurar eventos (una sola vez)
    const handleConfirm = () => {
        modal.style.display = 'none';
        if (pendingCallback && pendingCallback.onConfirm) {
            pendingCallback.onConfirm();
        }
        cleanup();
    };
    
    const handleCancel = () => {
        modal.style.display = 'none';
        if (pendingCallback && pendingCallback.onCancel) {
            pendingCallback.onCancel();
        }
        cleanup();
    };
    
    const cleanup = () => {
        confirmBtn.removeEventListener('click', handleConfirm);
        cancelBtn.removeEventListener('click', handleCancel);
        closeBtn.removeEventListener('click', handleCancel);
    };
    
    confirmBtn.addEventListener('click', handleConfirm);
    cancelBtn.addEventListener('click', handleCancel);
    closeBtn.addEventListener('click', handleCancel);
    
    // Cerrar al hacer clic fuera
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            handleCancel();
        }
    });
};

export function initCreateEvent() {
    const form = document.getElementById('createEventForm');
    const packageSelect = document.getElementById('packageSelect');
    const packageDetailsDiv = document.getElementById('packageDetails');
    const packageInfo = document.getElementById('packageInfo');
    const cancelBtn = document.getElementById('cancelBtn');
    
    if (!form) return;
    
    packageSelect.addEventListener('change', function() {
        const selectedPackage = this.value;
        
        if (selectedPackage && packagesDetails[selectedPackage]) {
            const details = packagesDetails[selectedPackage];
            
            let html = `
                <p><strong>📦 ${details.nombre}</strong></p>
                <p><strong>💰 Precio:</strong> ${details.precio}</p>
                <div>
                    <strong>✨ Características incluidas:</strong>
                    <ul>
            `;
            
            details.caracteristicas.forEach(feature => {
                html += `<li>✓ ${feature}</li>`;
            });
            
            html += `
                    </ul>
                </div>
            `;
            
            packageInfo.innerHTML = html;
            packageDetailsDiv.classList.remove('hidden');
        } else {
            packageDetailsDiv.classList.add('hidden');
        }
    });
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const eventName = document.getElementById('eventName').value.trim();
        const selectedPackage = packageSelect.value;
        
        if (!eventName) {
            showModal('Campo Requerido', 'Por favor, ingresa el nombre del evento', 'warning');
            return;
        }
        
        if (!selectedPackage) {
            showModal('Campo Requerido', 'Por favor, selecciona un paquete', 'warning');
            return;
        }
        
        const eventData = {
            id: 'EVENT-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
            name: eventName,
            package: selectedPackage,
            packageDetails: packagesDetails[selectedPackage],
            createdAt: new Date().toISOString(),
            status: 'pending'
        };
        
        let events = JSON.parse(localStorage.getItem('snaap_events') || '[]');
        events.push(eventData);
        localStorage.setItem('snaap_events', JSON.stringify(events));
        localStorage.setItem('snaap_current_event', JSON.stringify(eventData));
        
        showModal('¡Éxito!', `¡Evento "${eventName}" creado exitosamente!`, 'success', false, () => {
            form.reset();
            packageDetailsDiv.classList.add('hidden');
        });
    });
    
    if (cancelBtn) {
        cancelBtn.addEventListener('click', function() {
            showModal('Confirmar', '¿Estás seguro de que quieres cancelar? Los datos no guardados se perderán.', 'warning', true,
                () => {
                    form.reset();
                    packageDetailsDiv.classList.add('hidden');
                },
                () => {
                    console.log('Creación continuada');
                }
            );
        });
    }
}

export default { initCreateEvent };