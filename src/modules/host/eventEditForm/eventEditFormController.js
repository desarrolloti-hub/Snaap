// src/modules/host/eventEditForm/eventEditFormController.js
import { userService } from '../../../services/userService.js';
import { eventService } from '../../../services/eventService.js';

let currentEvent = null;
let selectedImageFile = null;

// ============================================
// 🧭 NAVEGACIÓN
// ============================================
const navigateTo = (path) => {
    if (typeof window.navigateTo === 'function') {
        window.navigateTo(path);
    } else {
        window.location.href = path;
    }
};

// ============================================
// 📥 CARGAR EVENTO DESDE FIRESTORE
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
        console.error('❌ Error al cargar evento:', error);
        return null;
    }
};

// ============================================
// 🖼️ CARGAR EVENTO EN EL FORMULARIO
// ============================================
const loadEventToForm = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const eventId = urlParams.get('id');
    
    if (!eventId) {
        Swal.fire({
            title: 'Error',
            text: 'No se ha seleccionado ningún evento para editar',
            icon: 'error',
            confirmButtonText: 'OK'
        }).then(() => {
            navigateTo('/host/event-crud');
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
        const evento = await loadEventFromFirestore(eventId);
        Swal.close();
        
        if (!evento) {
            Swal.fire({
                title: 'Error',
                text: 'Evento no encontrado',
                icon: 'error',
                confirmButtonText: 'OK'
            }).then(() => {
                navigateTo('/host/event-crud');
            });
            return;
        }
        
        currentEvent = evento;
        
        // 🔥 LLENAR FORMULARIO - SOLO CAMPOS NECESARIOS
        const eventoIdEl = document.getElementById('eventoId');
        if (eventoIdEl) eventoIdEl.value = evento.id;
        
        const titleEl = document.getElementById('title');
        if (titleEl) titleEl.value = evento.nombre || '';
        
        // Fecha (solo lectura)
        let fecha = 'No especificada';
        if (evento.fechaEvento) {
            fecha = new Date(evento.fechaEvento).toLocaleDateString('es-ES', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            });
        }
        const dateEl = document.getElementById('date');
        if (dateEl) dateEl.value = fecha;
        
        // ❌ ELIMINADO: Asistentes (no se edita)
        // ❌ ELIMINADO: Fotos Subidas (no se edita)
        // ❌ ELIMINADO: Código de Acceso (no se edita)
        
        // Imagen actual
        const currentImage = document.getElementById('currentImage');
        if (currentImage) {
            const imgUrl = evento.imagenUrl || 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=600&auto=format&fit=crop';
            currentImage.src = imgUrl;
            currentImage.onerror = function() {
                this.src = 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=600&auto=format&fit=crop';
            };
        }
        
        console.log('✅ Evento cargado para editar:', evento);
    } catch (error) {
        Swal.close();
        console.error('❌ Error al cargar evento:', error);
        Swal.fire({
            title: 'Error',
            text: 'Ocurrió un error al cargar el evento',
            icon: 'error',
            confirmButtonText: 'OK'
        }).then(() => {
            navigateTo('/host/event-crud');
        });
    }
};

// ============================================
// 💾 GUARDAR CAMBIOS EN FIRESTORE
// ============================================
const updateEvento = async (event) => {
    event.preventDefault();
    
    const id = document.getElementById('eventoId')?.value;
    const nombre = document.getElementById('title')?.value?.trim();
    
    if (!nombre) {
        Swal.fire({
            title: 'Campo Requerido',
            text: 'Por favor completa el nombre del evento',
            icon: 'warning',
            confirmButtonText: 'OK'
        });
        return;
    }
    
    Swal.fire({
        title: 'Guardando cambios...',
        text: 'Por favor espera',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });
    
    try {
        const updateData = {
            nombre: nombre
        };
        
        // 🔥 SI HAY NUEVA IMAGEN, SUBIR A STORAGE (NO BASE64)
        if (selectedImageFile) {
            try {
                const { storageService } = await import('../../../services/storageService.js');
                const user = userService.getCurrentUser();
                storageService.setUsuarioActual(user);
                
                const result = await storageService.subirImagen(
                    selectedImageFile,
                    'eventos',
                    `evento_${id}_${Date.now()}`
                );
                
                if (result.success) {
                    updateData.imagenUrl = result.url;
                    updateData.imagenPath = result.path;
                } else {
                    throw new Error(result.error);
                }
            } catch (error) {
                console.error('Error al subir imagen:', error);
                Swal.close();
                Swal.fire({
                    title: 'Error',
                    text: 'Error al procesar la imagen: ' + error.message,
                    icon: 'error',
                    confirmButtonText: 'OK'
                });
                return;
            }
        }
        
        const result = await eventService.actualizarEvento(id, updateData);
        Swal.close();
        
        if (result.success) {
            await Swal.fire({
                title: '¡Éxito!',
                text: 'Evento actualizado exitosamente',
                icon: 'success',
                confirmButtonText: 'OK'
            });
            navigateTo('/host/event-crud');
        } else {
            Swal.fire({
                title: 'Error',
                text: result.error || 'Error al actualizar el evento',
                icon: 'error',
                confirmButtonText: 'OK'
            });
        }
    } catch (error) {
        Swal.close();
        console.error('❌ Error al guardar:', error);
        Swal.fire({
            title: 'Error',
            text: 'Ocurrió un error al guardar los cambios',
            icon: 'error',
            confirmButtonText: 'OK'
        });
    }
};

// ============================================
// 🖼️ CONVERTIR IMAGEN A BASE64 (TEMPORAL PARA PREVIEW)
// ============================================
const convertImageToBase64 = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
    });
};

// ============================================
// 🖼️ CONFIGURAR VISTA PREVIA DE IMAGEN
// ============================================
const setupImagePreview = () => {
    const imageInput = document.getElementById('eventImage');
    const newImagePreviewGroup = document.getElementById('newImagePreviewGroup');
    const newImagePreview = document.getElementById('newImagePreview');
    
    if (imageInput) {
        imageInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                if (file.size > 5 * 1024 * 1024) {
                    Swal.fire({
                        title: 'Error',
                        text: 'La imagen es demasiado grande. Máximo 5MB.',
                        icon: 'error',
                        confirmButtonText: 'OK'
                    });
                    imageInput.value = '';
                    return;
                }
                
                const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
                if (!validTypes.includes(file.type)) {
                    Swal.fire({
                        title: 'Error',
                        text: 'Formato no permitido. Usa JPG, PNG o WEBP.',
                        icon: 'error',
                        confirmButtonText: 'OK'
                    });
                    imageInput.value = '';
                    return;
                }
                
                selectedImageFile = file;
                const reader = new FileReader();
                reader.onload = (event) => {
                    newImagePreview.src = event.target.result;
                    newImagePreviewGroup.style.display = 'block';
                };
                reader.readAsDataURL(file);
            } else {
                selectedImageFile = null;
                newImagePreviewGroup.style.display = 'none';
                newImagePreview.src = '';
            }
        });
    }
};

// ============================================
// 🔙 CANCELAR Y VOLVER
// ============================================
const cancelEdit = () => {
    Swal.fire({
        title: '¿Cancelar edición?',
        text: '¿Estás seguro de que deseas cancelar la edición?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ff007a',
        cancelButtonColor: '#4db8ff',
        confirmButtonText: 'Sí, cancelar',
        cancelButtonText: 'Continuar editando'
    }).then((result) => {
        if (result.isConfirmed) {
            navigateTo('/host/event-crud');
        }
    });
};

const goBack = () => {
    Swal.fire({
        title: '¿Volver atrás?',
        text: '¿Estás seguro de que deseas volver? Los cambios no se guardarán.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ff007a',
        cancelButtonColor: '#4db8ff',
        confirmButtonText: 'Sí, volver',
        cancelButtonText: 'Continuar editando'
    }).then((result) => {
        if (result.isConfirmed) {
            navigateTo('/host/event-crud');
        }
    });
};

// ============================================
// 🚀 CONTROLADOR PRINCIPAL
// ============================================
export async function eventEditFormController() {
    console.log('🔥 Controlador eventEditFormController iniciado');

    if (!userService.isAuthenticated()) {
        console.warn('⚠️ Usuario no autenticado, redirigiendo a login');
        navigateTo('/login');
        return;
    }

    await loadEventToForm();
    setupImagePreview();
    
    const form = document.getElementById('eventoEditForm');
    if (form) {
        form.addEventListener('submit', updateEvento);
    }
    
    const cancelarBtn = document.getElementById('cancelarBtn');
    if (cancelarBtn) {
        cancelarBtn.addEventListener('click', cancelEdit);
    }
    
    const btnVolver = document.getElementById('btnVolver');
    if (btnVolver) {
        btnVolver.addEventListener('click', goBack);
    }
    
    console.log('✅ EventEditForm Controller finalizado');
}

export default eventEditFormController;