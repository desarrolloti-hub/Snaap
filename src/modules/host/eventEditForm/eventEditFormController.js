// Cargar eventos del localStorage
let eventos = [];
let selectedImageFile = null;
let pendingCallback = null;

const loadEventos = () => {
    const stored = localStorage.getItem('eventos');
    if (stored) {
        eventos = JSON.parse(stored);
    } else {
        eventos = [
            { 
                id: 1,
                title: "Los XV de Rusi", 
                img: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=600&auto=format&fit=crop", 
                date: "15 Marzo 2024",
                attendees: 120,
                uploadedPhotos: 45,
                description: "Fiesta de 15 años con música en vivo y buffet",
                location: "Salón Eventos Plaza",
                time: "20:00"
            },
            { 
                id: 2,
                title: "Boda Legendaria", 
                img: "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=600&auto=format&fit=crop", 
                date: "22 Febrero 2024",
                attendees: 250,
                uploadedPhotos: 128,
                description: "Boda civil y religiosa con recepción",
                location: "Hacienda Los Sueños",
                time: "18:30"
            },
            { 
                id: 3,
                title: "Fiesta Locura Total", 
                img: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=600&auto=format&fit=crop", 
                date: "10 Enero 2024",
                attendees: 180,
                uploadedPhotos: 92,
                description: "Fiesta electrónica con los mejores DJs",
                location: "Club Night",
                time: "22:00"
            },
        ];
        saveEventos();
    }
};

const saveEventos = () => {
    localStorage.setItem('eventos', JSON.stringify(eventos));
};

// ============================================
// MODAL PERSONALIZADO
// ============================================

const showModal = (title, message, icon = 'info-circle', showCancel = false, onConfirm = null, onCancel = null) => {
    const modal = document.getElementById('customModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalIcon = document.getElementById('modalIcon').querySelector('i');
    const modalMessage = document.getElementById('modalMessage');
    const confirmBtn = document.getElementById('modalConfirmBtn');
    const cancelBtn = document.getElementById('modalCancelBtn');
    const closeBtn = document.getElementById('modalCloseBtn');
    
    // Configurar iconos según el tipo
    let iconClass = 'fas fa-info-circle';
    let titleColor = 'white';
    if (icon === 'success') {
        iconClass = 'fas fa-check-circle';
        titleColor = '#4db8ff';
    } else if (icon === 'error') {
        iconClass = 'fas fa-exclamation-circle';
        titleColor = '#ff4444';
    } else if (icon === 'warning') {
        iconClass = 'fas fa-exclamation-triangle';
        titleColor = '#ffaa00';
    }
    
    modalIcon.className = iconClass;
    modalIcon.style.color = titleColor;
    modalTitle.textContent = title;
    modalTitle.style.color = titleColor;
    modalMessage.textContent = message;
    
    // Configurar botones
    if (showCancel) {
        cancelBtn.style.display = 'inline-flex';
        confirmBtn.textContent = 'Confirmar';
        confirmBtn.innerHTML = '<i class="fas fa-check"></i> Confirmar';
    } else {
        cancelBtn.style.display = 'none';
        confirmBtn.textContent = 'Aceptar';
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

// Convertir imagen a Base64
const convertImageToBase64 = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
    });
};

// Mostrar vista previa de la nueva imagen
const setupImagePreview = () => {
    const imageInput = document.getElementById('eventImage');
    const newImagePreviewGroup = document.getElementById('newImagePreviewGroup');
    const newImagePreview = document.getElementById('newImagePreview');
    
    if (imageInput) {
        imageInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                // Validar tamaño (máximo 5MB)
                if (file.size > 5 * 1024 * 1024) {
                    showModal('Error', 'La imagen es demasiado grande. El tamaño máximo es 5MB.', 'error');
                    imageInput.value = '';
                    return;
                }
                
                // Validar tipo
                const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
                if (!validTypes.includes(file.type)) {
                    showModal('Error', 'Formato no permitido. Usa JPG, PNG o WEBP.', 'error');
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

const getEventoToEdit = () => {
    const eventoId = localStorage.getItem('eventoParaEditar');
    
    if (eventoId) {
        const evento = eventos.find(e => e.id === parseInt(eventoId));
        if (evento) {
            document.getElementById('eventoId').value = evento.id;
            document.getElementById('title').value = evento.title;
            
            // Mostrar datos de solo lectura (NO EDITABLES)
            document.getElementById('date').value = evento.date;
            document.getElementById('attendees').value = `${evento.attendees} asistentes`;
            document.getElementById('uploadedPhotos').value = `${evento.uploadedPhotos} fotos`;
            
            // Mostrar la imagen actual
            const currentImage = document.getElementById('currentImage');
            if (currentImage) {
                currentImage.src = evento.img;
            }
        } else {
            showModal('Error', 'Evento no encontrado', 'error', false, () => {
                window.location.href = '/host/event-crud';
            });
        }
        localStorage.removeItem('eventoParaEditar');
    } else {
        showModal('Error', 'No se ha seleccionado ningún evento para editar', 'error', false, () => {
            window.location.href = '/host/event-crud';
        });
    }
};

const updateEvento = async (event) => {
    event.preventDefault();
    
    const id = parseInt(document.getElementById('eventoId').value);
    const title = document.getElementById('title').value.trim();
    
    if (!title) {
        showModal('Campo Requerido', 'Por favor completa el nombre del evento', 'warning');
        return;
    }
    
    if (id) {
        const index = eventos.findIndex(e => e.id === id);
        if (index !== -1) {
            // Actualizar nombre
            eventos[index].title = title;
            
            // Actualizar imagen si se seleccionó una nueva
            if (selectedImageFile) {
                try {
                    const base64Image = await convertImageToBase64(selectedImageFile);
                    eventos[index].img = base64Image;
                } catch (error) {
                    console.error('Error al convertir la imagen:', error);
                    showModal('Error', 'Error al procesar la imagen. Por favor intenta de nuevo.', 'error');
                    return;
                }
            }
            
            saveEventos();
            showModal('Éxito', ' Evento actualizado exitosamente', 'success', false, () => {
                window.location.href = '/host/event-crud';
            });
        } else {
            showModal('Error', 'No se encontró el evento', 'error');
        }
    }
};

const cancelEdit = () => {
    showModal('Confirmar', '¿Estás seguro de que deseas cancelar la edición?', 'warning', true, 
        () => {
            window.location.href = '/host/event-crud';
        },
        () => {
            console.log('Edición continuada');
        }
    );
};

const goBack = () => {
    showModal('Confirmar', '¿Estás seguro de que deseas volver? Los cambios no se guardarán.', 'warning', true,
        () => {
            window.location.href = '/host/event-crud';
        },
        () => {
            console.log('Edición continuada');
        }
    );
};

export function eventEditFormController() {
    loadEventos();
    getEventoToEdit();
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
}

export default eventEditFormController;