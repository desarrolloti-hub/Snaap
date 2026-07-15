// src/modules/host/createEvent/createEventController.js
import { eventService } from '../../../services/eventService.js';
import { userService } from '../../../services/userService.js';
import { qrService } from '../../../services/qrService.js';

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

    if (!form) return;

    // 🔥 Verificar autenticación
    if (!userService.isAuthenticated()) {
        Swal.fire({
            title: 'Acceso Denegado',
            text: 'Debes iniciar sesión para crear un evento',
            icon: 'error',
            confirmButtonText: 'OK'
        }).then(() => {
            window.location.href = '/login';
        });
        return;
    }

    // 🔥 Obtener usuario actual y configurar servicios
    const user = userService.getCurrentUser();
    if (user) {
        qrService.setUsuarioActual(user);
        eventService.setUsuarioActual(user);
    }

    // Mostrar eventos existentes en localStorage (solo para compatibilidad)
    mostrarEventosGuardados();

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

    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        const eventName = document.getElementById('eventName').value.trim();
        const selectedPackage = packageSelect.value;
        const descripcion = document.getElementById('eventDescription')?.value?.trim() || '';
        const ubicacion = document.getElementById('eventLocation')?.value?.trim() || '';

        if (!eventName) {
            Swal.fire({
                title: 'Campo Requerido',
                text: 'Por favor, ingresa el nombre del evento',
                icon: 'warning',
                confirmButtonText: 'OK'
            });
            return;
        }

        if (eventName.length < 3) {
            Swal.fire({
                title: 'Nombre muy corto',
                text: 'El nombre del evento debe tener al menos 3 caracteres',
                icon: 'warning',
                confirmButtonText: 'OK'
            });
            return;
        }

        if (!selectedPackage) {
            Swal.fire({
                title: 'Campo Requerido',
                text: 'Por favor, selecciona un paquete',
                icon: 'warning',
                confirmButtonText: 'OK'
            });
            return;
        }

        // 🔥 Obtener usuario actual
        const user = userService.getCurrentUser();
        if (!user) {
            Swal.fire({
                title: 'Error',
                text: 'No se pudo obtener la información del usuario',
                icon: 'error',
                confirmButtonText: 'OK'
            });
            return;
        }

        // Mostrar loading
        Swal.fire({
            title: 'Creando evento...',
            text: 'Por favor espera',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        try {
            // 🔥 Establecer el usuario actual en el servicio
            eventService.setUsuarioActual(user);
            qrService.setUsuarioActual(user);

            // 🔥 Crear evento con datos del host
            const result = await eventService.crearEvento({
                nombre: eventName,
                paquete: selectedPackage,
                paqueteDetalles: packagesDetails[selectedPackage],
                descripcion: descripcion,
                ubicacion: ubicacion,
                fechaEvento: new Date(),
                estado: 'active',
                attendees: 0,
                uploadedPhotos: 0,
                tipo: 'evento'
            });

            Swal.close();

            if (result.success) {
                const evento = result.evento;
                const eventoId = evento.id;

                console.log(`✅ Evento creado con ID: ${eventoId}`);

                // 🔥 2. GENERAR QR AUTOMÁTICAMENTE
                await generarQrAutomatico(eventoId, evento, user);

                // Guardar también en localStorage para compatibilidad
                guardarEventoLocal(evento);

                // 🔥 MOSTRAR ÉXITO CON OPCIÓN A VER QR
                Swal.fire({
                    title: '¡Evento creado!',
                    html: `
                        El evento <strong>${evento.nombre}</strong> ha sido creado exitosamente.<br><br>
                        <i class="fas fa-qrcode" style="color: #4db8ff; font-size: 2rem;"></i><br>
                        <small>Se ha generado automáticamente el código QR para este evento.</small>
                    `,
                    icon: 'success',
                    confirmButtonText: 'Ver QR',
                    cancelButtonText: 'Ir a Mis Eventos',
                    showCancelButton: true,
                    confirmButtonColor: '#4db8ff',
                    cancelButtonColor: '#ff007a'
                }).then((result) => {
                    if (result.isConfirmed) {
                        if (typeof window.navigateTo === 'function') {
                            window.navigateTo(`/host/qr-generator?id=${eventoId}`);
                        } else {
                            window.location.href = `/host/qr-generator?id=${eventoId}`;
                        }
                    } else {
                        if (typeof window.navigateTo === 'function') {
                            window.navigateTo('/host/event-crud');
                        } else {
                            window.location.href = '/host/event-crud';
                        }
                    }
                });

                form.reset();
                packageDetailsDiv.classList.add('hidden');

            } else {
                Swal.fire({
                    title: 'Error',
                    text: result.error || 'Error al crear el evento',
                    icon: 'error',
                    confirmButtonText: 'OK'
                });
            }
        } catch (error) {
            Swal.close();
            console.error('Error en creación de evento:', error);
            Swal.fire({
                title: 'Error',
                text: 'Ocurrió un error al crear el evento',
                icon: 'error',
                confirmButtonText: 'OK'
            });
        }
    });

    if (cancelBtn) {
        cancelBtn.addEventListener('click', function() {
            Swal.fire({
                title: '¿Cancelar creación?',
                text: '¿Estás seguro de que quieres cancelar? Los datos no guardados se perderán.',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Sí, cancelar',
                cancelButtonText: 'Continuar'
            }).then((result) => {
                if (result.isConfirmed) {
                    form.reset();
                    packageDetailsDiv.classList.add('hidden');
                }
            });
        });
    }
}

// ============================================
// 📤 GENERAR QR AUTOMÁTICAMENTE
// ============================================
async function generarQrAutomatico(eventoId, evento, user) {
    try {
        console.log(`📤 Generando QR automático para evento: ${eventoId}`);

        const qrData = {
            eventName: evento.nombre || 'Evento',
            eventDate: evento.fechaEvento || new Date().toISOString(),
            hostName: user.displayName || user.email || 'Host',
            package: evento.paquete || 'basico'
        };

        const result = await qrService.generarQr(eventoId, qrData);

        if (result.success) {
            console.log(`✅ QR generado automáticamente para: ${evento.nombre}`);
            console.log(`   📊 Token: ${result.qrCode?.token || 'N/A'}`);
        } else {
            console.error(`❌ Error al generar QR automático:`, result.error);
        }

        return result;

    } catch (error) {
        console.error('❌ Error en generarQrAutomatico:', error);
        return { success: false, error: error.message };
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

export default { initCreateEvent };