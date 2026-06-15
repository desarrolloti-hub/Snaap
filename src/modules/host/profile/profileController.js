// Datos del perfil
let profileData = {
    fullName: 'Juan Pérez',
    email: 'juan.perez@example.com',
    phone: '+52 555 123 4567',
    company: 'Eventos SNAAP',
    bio: 'Organizador profesional de eventos con más de 5 años de experiencia. Especializado en bodas y eventos corporativos.',
    website: 'https://www.eventossnaap.com',
    specialty: 'weddings',
    experience: 5,
    eventsCompleted: 47,
    avatar: null,
    memberSince: 'Enero 2024'
};

let totalEvents = 0;
let totalGuests = 0;
let totalPhotos = 0;
let pendingCallback = null;

// Cargar eventos para calcular estadísticas
const loadEventStats = () => {
    const stored = localStorage.getItem('eventos');
    if (stored) {
        const eventos = JSON.parse(stored);
        totalEvents = eventos.length;
        totalGuests = eventos.reduce((sum, e) => sum + (e.attendees || 0), 0);
        totalPhotos = eventos.reduce((sum, e) => sum + (e.uploadedPhotos || 0), 0);
    }
};

// Modal personalizado
const showModal = (title, message, icon = 'info', showCancel = false, onConfirm = null, onCancel = null) => {
    const modal = document.getElementById('customModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalIcon = document.getElementById('modalTitle').parentElement.querySelector('i');
    const modalMessage = document.getElementById('modalMessage');
    const confirmBtn = document.getElementById('modalConfirmBtn');
    const cancelBtn = document.getElementById('modalCancelBtn');
    const closeBtn = document.getElementById('modalCloseBtn');
    
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
    
    if (showCancel) {
        cancelBtn.style.display = 'inline-flex';
        confirmBtn.innerHTML = '<i class="fas fa-check"></i> Confirmar';
    } else {
        cancelBtn.style.display = 'none';
        confirmBtn.innerHTML = '<i class="fas fa-check"></i> Aceptar';
    }
    
    pendingCallback = { onConfirm, onCancel };
    modal.style.display = 'flex';
    
    const handleConfirm = () => {
        modal.style.display = 'none';
        if (pendingCallback && pendingCallback.onConfirm) pendingCallback.onConfirm();
        cleanup();
    };
    
    const handleCancel = () => {
        modal.style.display = 'none';
        if (pendingCallback && pendingCallback.onCancel) pendingCallback.onCancel();
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
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) handleCancel();
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

// Guardar perfil
const saveProfile = () => {
    localStorage.setItem('hostProfile', JSON.stringify(profileData));
};

// Cargar perfil
const loadProfile = () => {
    const stored = localStorage.getItem('hostProfile');
    if (stored) {
        profileData = JSON.parse(stored);
    }
};

// Renderizar perfil
const renderProfile = () => {
    document.getElementById('fullName').value = profileData.fullName || '';
    document.getElementById('email').value = profileData.email || '';
    document.getElementById('phone').value = profileData.phone || '';
    document.getElementById('company').value = profileData.company || '';
    document.getElementById('bio').value = profileData.bio || '';
    document.getElementById('website').value = profileData.website || '';
    document.getElementById('specialty').value = profileData.specialty || '';
    document.getElementById('experience').value = profileData.experience || 0;
    document.getElementById('eventsCompleted').value = profileData.eventsCompleted || 0;
    document.getElementById('profileName').textContent = profileData.fullName || 'Usuario';
    
    const avatarImg = document.getElementById('profileAvatar');
    if (profileData.avatar) {
        avatarImg.src = profileData.avatar;
    } else {
        const initials = (profileData.fullName || 'Usuario').split(' ').map(n => n[0]).join('').toUpperCase();
        avatarImg.src = `https://ui-avatars.com/api/?background=4db8ff&color=fff&size=120&bold=true&name=${encodeURIComponent(profileData.fullName || 'Usuario')}`;
    }
    
    document.getElementById('totalEvents').textContent = totalEvents;
    document.getElementById('totalGuests').textContent = totalGuests.toLocaleString();
    document.getElementById('totalPhotos').textContent = totalPhotos.toLocaleString();
    document.getElementById('memberSince').textContent = profileData.memberSince || 'Enero 2024';
};

// Guardar cambios
const saveChanges = () => {
    const newData = {
        fullName: document.getElementById('fullName').value.trim(),
        email: document.getElementById('email').value.trim(),
        phone: document.getElementById('phone').value.trim(),
        company: document.getElementById('company').value.trim(),
        bio: document.getElementById('bio').value.trim(),
        website: document.getElementById('website').value.trim(),
        specialty: document.getElementById('specialty').value,
        experience: parseInt(document.getElementById('experience').value) || 0,
        eventsCompleted: parseInt(document.getElementById('eventsCompleted').value) || 0,
        avatar: profileData.avatar,
        memberSince: profileData.memberSince
    };
    
    if (!newData.fullName || !newData.email) {
        showModal('Campos Requeridos', 'Por favor completa tu nombre y correo electrónico', 'warning');
        return;
    }
    
    profileData = newData;
    saveProfile();
    renderProfile();
    showModal('Éxito', 'Tu perfil ha sido actualizado correctamente', 'success');
};

// Cancelar cambios
const cancelChanges = () => {
    const currentName = document.getElementById('fullName').value;
    if (currentName !== profileData.fullName) {
        showModal('Descartar Cambios', '¿Estás seguro de que quieres descartar los cambios?', 'warning', true,
            () => renderProfile(),
            () => {}
        );
    } else {
        renderProfile();
    }
};

// Subir avatar
const setupAvatarUpload = () => {
    const btnChangeAvatar = document.getElementById('btnChangeAvatar');
    const avatarInput = document.getElementById('avatarInput');
    
    btnChangeAvatar.addEventListener('click', () => {
        avatarInput.click();
    });
    
    avatarInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                showModal('Error', 'La imagen es demasiado grande. Máximo 5MB', 'error');
                return;
            }
            
            const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
            if (!validTypes.includes(file.type)) {
                showModal('Error', 'Formato no permitido. Usa JPG, PNG o WEBP', 'error');
                return;
            }
            
            try {
                const base64 = await convertImageToBase64(file);
                profileData.avatar = base64;
                saveProfile();
                renderProfile();
                showModal('Éxito', 'Foto de perfil actualizada', 'success');
            } catch (error) {
                showModal('Error', 'Error al procesar la imagen', 'error');
            }
        }
    });
};

// Eliminar cuenta
const deleteAccount = () => {
    showModal('Eliminar Cuenta', '¿Estás seguro de que deseas eliminar tu cuenta? Esta acción no se puede deshacer y todos tus eventos serán eliminados.', 'warning', true,
        () => {
            localStorage.removeItem('eventos');
            localStorage.removeItem('hostProfile');
            localStorage.removeItem('snaap_events');
            localStorage.removeItem('snaap_current_event');
            
            showModal('Cuenta Eliminada', 'Tu cuenta ha sido eliminada. Serás redirigido al inicio.', 'success', false, () => {
                window.location.href = '/';
            });
        },
        () => {}
    );
};

// Volver atrás
const goBack = () => {
    const currentName = document.getElementById('fullName').value;
    if (currentName !== profileData.fullName) {
        showModal('Salir sin guardar', 'Tienes cambios sin guardar. ¿Estás seguro de que quieres salir?', 'warning', true,
            () => window.location.href = '/host',
            () => {}
        );
    } else {
        window.location.href = '/host';
    }
};

// Controlador principal
export function profileController() {
    console.log('Controlador profileController iniciado');
    loadEventStats();
    loadProfile();
    renderProfile();
    setupAvatarUpload();
    
    const form = document.getElementById('profileForm');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            saveChanges();
        });
    }
    
    const cancelBtn = document.getElementById('cancelBtn');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', cancelChanges);
    }
    
    const deleteAccountBtn = document.getElementById('deleteAccountBtn');
    if (deleteAccountBtn) {
        deleteAccountBtn.addEventListener('click', deleteAccount);
    }
    
    const btnVolver = document.getElementById('btnVolver');
    if (btnVolver) {
        btnVolver.addEventListener('click', goBack);
    }
}

export default profileController;