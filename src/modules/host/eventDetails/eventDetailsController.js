// src/modules/host/eventDetails/eventDetailsController.js
import { userService } from '../../../services/userService.js';
import { eventService } from '../../../services/eventService.js';
import { qrService } from '../../../services/qrService.js';

let currentEvent = null;
let currentQrImage = null;
let currentEventId = null;

// ============================================
// ðŸ“¥ CARGAR EVENTO DESDE FIRESTORE
// ============================================
const loadEventFromFirestore = async (id) => {
    try {
        const result = await eventService.obtenerEventoPorId(id);
        if (result.success) {
            return result.evento;
        } else {
            console.error('Error al cargar evento:', result.error);
            return null;
        }
    } catch (error) {
        console.error('âŒ Error al cargar evento:', error);
        return null;
    }
};

// ============================================
// ðŸ“¥ CARGAR QR DEL EVENTO
// ============================================
const loadQrFromFirestore = async (eventoId) => {
    try {
        const result = await qrService.obtenerQrEvento(eventoId);
        if (result.success && result.qrCode) {
            return result.qrCode.qrImage;
        }
        return null;
    } catch (error) {
        console.error('âŒ Error al cargar QR:', error);
        return null;
    }
};

// ============================================
// ðŸ“¤ GENERAR QR
// ============================================
const generateQR = async (eventoId, evento) => {
    try {
        const user = userService.getCurrentUser();
        const qrData = {
            eventName: evento.nombre || 'Evento',
            eventDate: evento.fechaEvento || new Date().toISOString(),
            hostName: user?.displayName || user?.email || 'Host',
            package: evento.paquete || 'basico'
        };

        const result = await qrService.generarQr(eventoId, qrData);
        if (result.success) {
            return result.qrImage;
        }
        return null;
    } catch (error) {
        console.error('âŒ Error al generar QR:', error);
        return null;
    }
};

// ============================================
// ðŸ–¼ï¸ RENDERIZAR DETALLES DEL EVENTO (CON QR)
// ============================================
const renderEventDetails = (evento, qrImage) => {
    if (!evento) return;
    
    currentEvent = evento;
    currentQrImage = qrImage;
    
    const titleEl = document.getElementById('eventTitle');
    const dateEl = document.getElementById('eventDate');
    const locationEl = document.getElementById('eventLocation');
    const attendeesEl = document.getElementById('eventAttendees');
    const photosEl = document.getElementById('eventPhotos');
    const descriptionEl = document.getElementById('eventDescription');
    const packageEl = document.getElementById('eventPackage');
    const imageEl = document.getElementById('eventImage');
    const codigoEl = document.getElementById('eventCodigo');
    const estadoEl = document.getElementById('eventEstado');
    
    // ðŸ”¥ USAR CAMPOS DE FIRESTORE
    const nombre = evento.nombre || 'Evento sin nombre';
    
    let fecha = 'No especificada';
    if (evento.fechaEvento) {
        fecha = new Date(evento.fechaEvento).toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    }
    
    const ubicacion = evento.ubicacion || 'No especificada';
    const attendees = evento.attendees || evento.invitados?.length || 0;
    const photos = evento.uploadedPhotos || 0;
    const descripcion = evento.descripcion || 'Sin descripciÃ³n';
    const paquete = evento.paquete || 'No especificado';
    const codigoAcceso = evento.codigoAcceso || 'No generado';
    
    const estadoMap = {
        'active': 'âœ… Activo',
        'pending': 'â³ Pendiente',
        'completed': 'ðŸ“Œ Completado',
        'cancelled': 'âŒ Cancelado'
    };
    const estado = estadoMap[evento.estado] || evento.estado || 'Desconocido';
    
    const imgUrl = evento.imagenUrl || 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=600&auto=format&fit=crop';
    
    if (titleEl) titleEl.textContent = nombre;
    if (dateEl) dateEl.textContent = fecha;
    if (locationEl) locationEl.textContent = ubicacion;
    if (attendeesEl) attendeesEl.textContent = attendees;
    if (photosEl) photosEl.textContent = photos;
    if (descriptionEl) descriptionEl.textContent = descripcion;
    if (packageEl) packageEl.textContent = paquete;
    if (codigoEl) codigoEl.textContent = codigoAcceso;
    if (estadoEl) estadoEl.textContent = estado;
    
    if (imageEl) {
        imageEl.src = imgUrl;
        imageEl.alt = nombre;
        imageEl.onerror = function() {
            this.src = 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=600&auto=format&fit=crop';
        };
    }

    // ðŸ”¥ RENDERIZAR QR EN LA SECCIÃ“N
    renderQrSection(qrImage, evento);
};

// ============================================
// ðŸŽ¨ RENDERIZAR SECCIÃ“N QR
// ============================================
const renderQrSection = (qrImage, evento) => {
    const qrContainer = document.getElementById('qrContainer');
    if (!qrContainer) return;

    const eventLink = `${window.location.origin}/user/home?eventId=${evento.id}`;

    if (qrImage) {
        qrContainer.innerHTML = `
            <div class="qr-display">
                <img src="${qrImage}" alt="CÃ³digo QR del evento" class="qr-image-large">
                <div class="qr-actions">
                    <button class="btn-snaap-small" id="downloadQrBtn">ðŸ“¥ Descargar QR</button>
                    <button class="btn-snaap-small" id="shareQrBtn">ðŸ”— Compartir QR</button>
                    <button class="btn-snaap-small" id="regenerateQrBtn">ðŸ”„ Regenerar</button>
                </div>
            </div>
            <div class="qr-link-box">
                <p class="qr-link-label">ðŸ”— Enlace directo al evento:</p>
                <div class="qr-link-wrapper">
                    <input type="text" id="eventLink" class="qr-link-input" value="${eventLink}" readonly>
                    <button class="btn-copy" id="copyLinkBtn">ðŸ“‹ Copiar</button>
                </div>
            </div>
        `;
    } else {
        qrContainer.innerHTML = `
            <div class="qr-loading">
                <div class="spinner"></div>
                <p>Generando cÃ³digo QR...</p>
            </div>
        `;
    }

    // ðŸ”¥ CONFIGURAR EVENTOS DEL QR
    setupQrEvents(qrImage, evento);
};

// ============================================
// ðŸŽ¯ CONFIGURAR EVENTOS DEL QR
// ============================================
const setupQrEvents = (qrImage, evento) => {
    // Descargar QR
    const downloadBtn = document.getElementById('downloadQrBtn');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', () => {
            if (!qrImage) {
                Swal.fire('Error', 'No hay QR para descargar', 'error');
                return;
            }
            const link = document.createElement('a');
            link.download = `qr-${evento.nombre || 'evento'}.png`;
            link.href = qrImage;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            Swal.fire('Ã‰xito', 'QR descargado exitosamente', 'success');
        });
    }

    // Compartir QR
    const shareBtn = document.getElementById('shareQrBtn');
    if (shareBtn) {
        shareBtn.addEventListener('click', async () => {
            if (!qrImage) {
                Swal.fire('Error', 'No hay QR para compartir', 'error');
                return;
            }
            try {
                const response = await fetch(qrImage);
                const blob = await response.blob();
                const shareData = {
                    title: `QR para ${evento.nombre || 'Evento'}`,
                    text: `Â¡Escanea este QR para acceder al evento ${evento.nombre || 'Evento'}!`,
                    files: [new File([blob], `qr-${evento.nombre || 'evento'}.png`, { type: 'image/png' })]
                };
                if (navigator.share && navigator.canShare(shareData)) {
                    await navigator.share(shareData);
                } else {
                    const url = `${window.location.origin}/user/home?eventId=${evento.id}`;
                    await navigator.clipboard.writeText(url);
                    Swal.fire('Ã‰xito', `âœ… Enlace copiado: ${url}`, 'success');
                }
            } catch (error) {
                if (error.name !== 'AbortError') {
                    Swal.fire('Error', 'Error al compartir el QR', 'error');
                }
            }
        });
    }

    // Regenerar QR
    const regenerateBtn = document.getElementById('regenerateQrBtn');
    if (regenerateBtn) {
        regenerateBtn.addEventListener('click', async () => {
            Swal.fire({
                title: 'Regenerando QR...',
                text: 'Por favor espera',
                allowOutsideClick: false,
                didOpen: () => Swal.showLoading()
            });
            try {
                const newQr = await generateQR(evento.id, evento);
                if (newQr) {
                    currentQrImage = newQr;
                    renderQrSection(newQr, evento);
                    Swal.close();
                    Swal.fire('Ã‰xito', 'QR regenerado exitosamente', 'success');
                } else {
                    Swal.close();
                    Swal.fire('Error', 'Error al regenerar el QR', 'error');
                }
            } catch (error) {
                Swal.close();
                Swal.fire('Error', 'Error al regenerar el QR', 'error');
            }
        });
    }

    // Copiar enlace
    const copyBtn = document.getElementById('copyLinkBtn');
    if (copyBtn) {
        copyBtn.addEventListener('click', async () => {
            const input = document.getElementById('eventLink');
            if (!input) return;
            try {
                await navigator.clipboard.writeText(input.value);
                Swal.fire('Ã‰xito', 'âœ… Enlace copiado al portapapeles', 'success');
            } catch {
                input.select();
                document.execCommand('copy');
                Swal.fire('Ã‰xito', 'âœ… Enlace copiado al portapapeles', 'success');
            }
        });
    }
};

// ============================================
// ðŸ”€ REDIRECCIONES
// ============================================
const goBack = () => {
    window.go('');
};

const goToEdit = () => {
    if (currentEvent) {
        localStorage.setItem('eventoParaEditar', currentEvent.id);
        window.go(`/host/event-edit?id=${currentEvent.id}`);
    }
};

// ============================================
// ðŸ“º IR A EVENTO EN VIVO (NUEVO)
// ============================================
const goToLiveEvent = () => {
    if (currentEvent) {
        window.go(`/host/live-event?id=${currentEvent.id}`);
    }
};

// ============================================
// ðŸš€ CONTROLADOR PRINCIPAL
// ============================================
export async function eventDetailsController() {
    console.log('ðŸ”¥ Controlador eventDetailsController iniciado');

    if (!userService.isAuthenticated()) {
        console.warn('âš ï¸ Usuario no autenticado, redirigiendo a login');
        window.go('');
        return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const eventId = urlParams.get('id');
    currentEventId = eventId;
    
    if (!eventId) {
        Swal.fire({
            title: 'Error',
            text: 'No se especificÃ³ quÃ© evento ver',
            icon: 'error',
            confirmButtonText: 'OK'
        }).then(() => {
            window.go('');
        });
        return;
    }
    
    Swal.fire({
        title: 'Cargando evento...',
        text: 'Por favor espera',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });
    
    try {
        // ðŸ”¥ CARGAR EVENTO
        const evento = await loadEventFromFirestore(eventId);
        if (!evento) {
            Swal.close();
            Swal.fire({
                title: 'Error',
                text: 'El evento no existe',
                icon: 'error',
                confirmButtonText: 'OK'
            }).then(() => {
                window.go('');
            });
            return;
        }

        // ðŸ”¥ CARGAR QR
        let qrImage = await loadQrFromFirestore(eventId);
        if (!qrImage) {
            // Si no hay QR, generarlo
            qrImage = await generateQR(eventId, evento);
        }
        
        Swal.close();
        
        // ðŸ”¥ RENDERIZAR
        renderEventDetails(evento, qrImage);
        
        // ðŸ”¥ CONFIGURAR EVENTOS DE NAVEGACIÃ“N
        const btnVolver = document.getElementById('btnVolver');
        if (btnVolver) {
            btnVolver.addEventListener('click', goBack);
        }
        
        const btnEditar = document.getElementById('btnEditar');
        if (btnEditar) {
            btnEditar.addEventListener('click', goToEdit);
        }

        // ðŸ”¥ NUEVO: CONFIGURAR BOTÃ“N DE EVENTO EN VIVO
        const btnLiveEvent = document.getElementById('btnLiveEvent');
        if (btnLiveEvent) {
            btnLiveEvent.addEventListener('click', goToLiveEvent);
        }
        
        console.log('âœ… EventDetails Controller finalizado');
    } catch (error) {
        Swal.close();
        console.error('âŒ Error al cargar evento:', error);
        Swal.fire({
            title: 'Error',
            text: 'OcurriÃ³ un error al cargar el evento',
            icon: 'error',
            confirmButtonText: 'OK'
        }).then(() => {
            window.go('');
        });
    }
}

export default eventDetailsController;
