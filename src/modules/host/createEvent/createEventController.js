// src/modules/host/createEvent/createEventController.js
// ✅ IMPORTACIÓN CORRECTA - Usar el mismo nombre que la exportación
import { eventService } from '../../../services/eventService.js';

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

export function initCreateEvent() {
    const form = document.getElementById('createEventForm');
    const packageSelect = document.getElementById('packageSelect');
    const packageDetailsDiv = document.getElementById('packageDetails');
    const packageInfo = document.getElementById('packageInfo');
    const cancelBtn = document.getElementById('cancelBtn');
    const loadingOverlay = createLoadingOverlay();
    
    if (!form) return;

    // Mostrar eventos existentes en localStorage (solo para compatibilidad)
    mostrarEventosGuardados();
    
    // Evento para mostrar detalles del paquete
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

    // Evento de envío del formulario
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const eventName = document.getElementById('eventName').value.trim();
        const selectedPackage = packageSelect.value;
        const descripcion = document.getElementById('eventDescription')?.value?.trim() || '';
        const ubicacion = document.getElementById('eventLocation')?.value?.trim() || '';
        
        // Validaciones
        if (!eventName) {
            showCustomModal('Campo Requerido', 'Por favor, ingresa el nombre del evento', 'warning');
            return;
        }
        
        if (eventName.length < 3) {
            showCustomModal('Nombre muy corto', 'El nombre del evento debe tener al menos 3 caracteres', 'warning');
            return;
        }
        
        if (!selectedPackage) {
            showCustomModal('Campo Requerido', 'Por favor, selecciona un paquete', 'warning');
            return;
        }

        // Mostrar loading
        showLoading(loadingOverlay);

        try {
            // ✅ USAR LA INSTANCIA CORRECTA
            const result = await eventService.crearEvento({
                nombre: eventName,
                paquete: selectedPackage,
                descripcion: descripcion,
                ubicacion: ubicacion,
                fechaEvento: new Date()
            });

            if (result.success) {
                // Guardar también en localStorage para compatibilidad
                guardarEventoLocal(result.evento);
                
                showCustomModal(
                    '¡Éxito!', 
                    `¡Evento "${result.evento.nombre}" creado exitosamente!<br><br>
                     <strong>Código de acceso:</strong> ${result.codigoAcceso}<br>
                     <small>Comparte este código con tus invitados</small>`, 
                    'success'
                ).then(() => {
                    form.reset();
                    packageDetailsDiv.classList.add('hidden');
                    
                    // Redirigir a la página de eventos o dashboard
                    if (typeof window.navigateTo === 'function') {
                        window.navigateTo('/mis-eventos');
                    } else {
                        // Recargar para mostrar el evento creado
                        window.location.reload();
                    }
                });
            } else {
                showCustomModal('Error', result.error || 'Error al crear el evento', 'error');
            }
        } catch (error) {
            console.error('Error en creación de evento:', error);
            showCustomModal('Error', 'Ocurrió un error al crear el evento', 'error');
        } finally {
            hideLoading(loadingOverlay);
        }
    });

    // Botón cancelar
    if (cancelBtn) {
        cancelBtn.addEventListener('click', function() {
            showCustomModal(
                '¿Cancelar creación?',
                '¿Estás seguro de que quieres cancelar? Los datos no guardados se perderán.',
                'question',
                true
            ).then((result) => {
                if (result) {
                    form.reset();
                    packageDetailsDiv.classList.add('hidden');
                    
                    if (typeof window.navigateTo === 'function') {
                        window.navigateTo('/mis-eventos');
                    }
                }
            });
        });
    }
}

// Función para guardar evento en localStorage (compatibilidad)
function guardarEventoLocal(evento) {
    try {
        let eventos = JSON.parse(localStorage.getItem('snaap_events') || '[]');
        eventos.push({
            id: evento.id,
            name: evento.nombre,
            package: evento.paquete,
            packageDetails: evento.paqueteDetalles,
            createdAt: evento.createdAt,
            status: evento.estado,
            codigoAcceso: evento.codigoAcceso
        });
        localStorage.setItem('snaap_events', JSON.stringify(eventos));
        localStorage.setItem('snaap_current_event', JSON.stringify(evento));
    } catch (error) {
        console.error('Error al guardar en localStorage:', error);
    }
}

// Función para mostrar eventos guardados (solo para referencia)
function mostrarEventosGuardados() {
    try {
        const eventos = JSON.parse(localStorage.getItem('snaap_events') || '[]');
        if (eventos.length > 0) {
            console.log(`📊 ${eventos.length} eventos guardados localmente`);
        }
    } catch (error) {
        // Ignorar errores
    }
}

// Funciones para el loading overlay
function createLoadingOverlay() {
    const overlay = document.createElement('div');
    overlay.id = 'loading-overlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.7);
        display: none;
        justify-content: center;
        align-items: center;
        z-index: 9999;
        backdrop-filter: blur(4px);
    `;
    overlay.innerHTML = `
        <div style="
            background: white;
            padding: 30px;
            border-radius: 12px;
            text-align: center;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            max-width: 300px;
        ">
            <div style="
                border: 4px solid #f3f3f3;
                border-top: 4px solid #00d4ff;
                border-radius: 50%;
                width: 50px;
                height: 50px;
                animation: spin 1s linear infinite;
                margin: 0 auto 15px;
            "></div>
            <p style="color: #333; font-family: 'Segoe UI', sans-serif;">Creando evento...</p>
        </div>
        <style>
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        </style>
    `;
    document.body.appendChild(overlay);
    return overlay;
}

function showLoading(overlay) {
    if (overlay) {
        overlay.style.display = 'flex';
    }
}

function hideLoading(overlay) {
    if (overlay) {
        overlay.style.display = 'none';
    }
}

// Función para mostrar modal personalizado
function showCustomModal(title, message, type = 'info', showCancel = false) {
    return new Promise((resolve) => {
        const modal = document.getElementById('customModal');
        const modalTitle = document.getElementById('modalTitle');
        const modalMessage = document.getElementById('modalMessage');
        const modalIcon = document.getElementById('modalIcon');
        const confirmBtn = document.getElementById('modalConfirmBtn');
        const cancelBtn = document.getElementById('modalCancelBtn');
        const closeBtn = document.getElementById('modalCloseBtn');

        if (!modal) {
            alert(`${title}\n${message}`);
            resolve(true);
            return;
        }

        const iconMap = {
            'success': '✅',
            'error': '❌',
            'warning': '⚠️',
            'question': '❓',
            'info': 'ℹ️'
        };

        modalTitle.textContent = title;
        modalMessage.innerHTML = message;
        modalIcon.innerHTML = `${iconMap[type] || 'ℹ️'} <span id="modalTitle">${title}</span>`;

        if (showCancel) {
            cancelBtn.style.display = 'inline-block';
        } else {
            cancelBtn.style.display = 'none';
        }

        const handleConfirm = () => {
            modal.style.display = 'none';
            resolve(true);
            cleanup();
        };

        const handleCancel = () => {
            modal.style.display = 'none';
            resolve(false);
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

        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                if (showCancel) {
                    handleCancel();
                } else {
                    handleConfirm();
                }
            }
        });

        modal.style.display = 'flex';
    });
}

export default { initCreateEvent };