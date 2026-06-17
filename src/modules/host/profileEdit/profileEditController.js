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
    const fullNameEl = document.getElementById('fullName');
    const emailEl = document.getElementById('email');
    const phoneEl = document.getElementById('phone');
    const companyEl = document.getElementById('company');
    const bioEl = document.getElementById('bio');
    const websiteEl = document.getElementById('website');
    const specialtyEl = document.getElementById('specialty');
    const experienceEl = document.getElementById('experience');
    const eventsCompletedEl = document.getElementById('eventsCompleted');
    const profileNameEl = document.getElementById('profileName');
    const avatarImg = document.getElementById('profileAvatar');
    const totalEventsEl = document.getElementById('totalEvents');
    const totalGuestsEl = document.getElementById('totalGuests');
    const totalPhotosEl = document.getElementById('totalPhotos');
    const memberSinceEl = document.getElementById('memberSince');
    
    if (fullNameEl) fullNameEl.value = profileData.fullName || '';
    if (emailEl) emailEl.value = profileData.email || '';
    if (phoneEl) phoneEl.value = profileData.phone || '';
    if (companyEl) companyEl.value = profileData.company || '';
    if (bioEl) bioEl.value = profileData.bio || '';
    if (websiteEl) websiteEl.value = profileData.website || '';
    if (specialtyEl) specialtyEl.value = profileData.specialty || '';
    if (experienceEl) experienceEl.value = profileData.experience || 0;
    if (eventsCompletedEl) eventsCompletedEl.value = profileData.eventsCompleted || 0;
    if (profileNameEl) profileNameEl.textContent = profileData.fullName || 'Usuario';
    
    if (avatarImg) {
        if (profileData.avatar) {
            avatarImg.src = profileData.avatar;
        } else {
            const initials = (profileData.fullName || 'Usuario').split(' ').map(n => n[0]).join('').toUpperCase();
            avatarImg.src = `https://ui-avatars.com/api/?background=4db8ff&color=fff&size=120&bold=true&name=${encodeURIComponent(profileData.fullName || 'Usuario')}`;
        }
    }
    
    if (totalEventsEl) totalEventsEl.textContent = totalEvents;
    if (totalGuestsEl) totalGuestsEl.textContent = totalGuests.toLocaleString();
    if (totalPhotosEl) totalPhotosEl.textContent = totalPhotos.toLocaleString();
    if (memberSinceEl) memberSinceEl.textContent = profileData.memberSince || 'Enero 2024';
};

// Guardar cambios
const saveChanges = async () => {
    const fullName = document.getElementById('fullName')?.value.trim();
    const email = document.getElementById('email')?.value.trim();
    const phone = document.getElementById('phone')?.value.trim();
    const company = document.getElementById('company')?.value.trim();
    const bio = document.getElementById('bio')?.value.trim();
    const website = document.getElementById('website')?.value.trim();
    const specialty = document.getElementById('specialty')?.value;
    const experience = parseInt(document.getElementById('experience')?.value) || 0;
    const eventsCompleted = parseInt(document.getElementById('eventsCompleted')?.value) || 0;
    
    if (!fullName || !email) {
        await Swal.fire({
            title: 'Campos Requeridos',
            text: 'Por favor completa tu nombre y correo electrónico',
            icon: 'warning',
            confirmButtonText: 'OK'
        });
        return;
    }
    
    profileData = {
        ...profileData,
        fullName: fullName,
        email: email,
        phone: phone || '',
        company: company || '',
        bio: bio || '',
        website: website || '',
        specialty: specialty || '',
        experience: experience,
        eventsCompleted: eventsCompleted
    };
    
    saveProfile();
    renderProfile();
    
    await Swal.fire({
        title: '¡Éxito!',
        text: 'Tu perfil ha sido actualizado correctamente',
        icon: 'success',
        confirmButtonText: 'OK'
    });
    
    window.location.href = '/host/profile';
};

// Subir avatar
const setupAvatarUpload = () => {
    const btnChangeAvatar = document.getElementById('btnChangeAvatar');
    const avatarInput = document.getElementById('avatarInput');
    
    if (btnChangeAvatar) {
        btnChangeAvatar.addEventListener('click', () => {
            if (avatarInput) avatarInput.click();
        });
    }
    
    if (avatarInput) {
        avatarInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (file) {
                if (file.size > 5 * 1024 * 1024) {
                    await Swal.fire({
                        title: 'Error',
                        text: 'La imagen es demasiado grande. Máximo 5MB',
                        icon: 'error',
                        confirmButtonText: 'OK'
                    });
                    return;
                }
                
                const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
                if (!validTypes.includes(file.type)) {
                    await Swal.fire({
                        title: 'Error',
                        text: 'Formato no permitido. Usa JPG, PNG o WEBP',
                        icon: 'error',
                        confirmButtonText: 'OK'
                    });
                    return;
                }
                
                try {
                    const base64 = await convertImageToBase64(file);
                    profileData.avatar = base64;
                    saveProfile();
                    renderProfile();
                    await Swal.fire({
                        title: '¡Éxito!',
                        text: 'Foto de perfil actualizada',
                        icon: 'success',
                        confirmButtonText: 'OK'
                    });
                } catch (error) {
                    await Swal.fire({
                        title: 'Error',
                        text: 'Error al procesar la imagen',
                        icon: 'error',
                        confirmButtonText: 'OK'
                    });
                }
            }
        });
    }
};

// Cancelar cambios
const cancelChanges = () => {
    Swal.fire({
        title: 'Cancelar Edición',
        text: '¿Estás seguro de que quieres cancelar? Los cambios no se guardarán.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ff007a',
        cancelButtonColor: '#4db8ff',
        confirmButtonText: 'Sí, cancelar',
        cancelButtonText: 'Continuar editando'
    }).then((result) => {
        if (result.isConfirmed) {
            window.location.href = '/host/profile';
        }
    });
};

// Volver atrás
const goBack = () => {
    Swal.fire({
        title: 'Salir sin guardar',
        text: 'Tienes cambios sin guardar. ¿Estás seguro de que quieres salir?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ff007a',
        cancelButtonColor: '#4db8ff',
        confirmButtonText: 'Sí, salir',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            window.location.href = '/host/profile';
        }
    });
};

// Eliminar cuenta
const deleteAccount = () => {
    Swal.fire({
        title: 'Eliminar Cuenta',
        html: '¿Estás seguro de que deseas eliminar tu cuenta?<br>Esta acción no se puede deshacer y todos tus eventos serán eliminados.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ff007a',
        cancelButtonColor: '#4db8ff',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
    }).then(async (result) => {
        if (result.isConfirmed) {
            localStorage.removeItem('eventos');
            localStorage.removeItem('hostProfile');
            localStorage.removeItem('snaap_events');
            localStorage.removeItem('snaap_current_event');
            
            await Swal.fire({
                title: 'Cuenta Eliminada',
                text: 'Tu cuenta ha sido eliminada. Serás redirigido al inicio.',
                icon: 'success',
                confirmButtonText: 'OK'
            });
            window.location.href = '/';
        }
    });
};

// Controlador principal
export function profileEditController() {
    console.log('Controlador profileEditController iniciado');
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
    
    const btnVolver = document.getElementById('btnVolver');
    if (btnVolver) {
        btnVolver.addEventListener('click', goBack);
    }
    
    const deleteAccountBtn = document.getElementById('deleteAccountBtn');
    if (deleteAccountBtn) {
        deleteAccountBtn.addEventListener('click', deleteAccount);
    }
}

export default profileEditController;