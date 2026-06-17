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

const specialtiesMap = {
    'weddings': 'Bodas',
    'birthdays': 'Cumpleaños',
    'corporate': 'Eventos Corporativos',
    'concerts': 'Conciertos',
    'private': 'Fiestas Privadas'
};

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

// Renderizar perfil (vista solo lectura)
const renderProfile = () => {
    const avatarImg = document.getElementById('profileAvatar');
    const profileNameEl = document.getElementById('profileName');
    const viewFullName = document.getElementById('viewFullName');
    const viewEmail = document.getElementById('viewEmail');
    const viewPhone = document.getElementById('viewPhone');
    const viewCompany = document.getElementById('viewCompany');
    const viewBio = document.getElementById('viewBio');
    const viewWebsite = document.getElementById('viewWebsite');
    const viewSpecialty = document.getElementById('viewSpecialty');
    const viewExperience = document.getElementById('viewExperience');
    const viewEventsCompleted = document.getElementById('viewEventsCompleted');
    const totalEventsEl = document.getElementById('totalEvents');
    const totalGuestsEl = document.getElementById('totalGuests');
    const totalPhotosEl = document.getElementById('totalPhotos');
    const memberSinceEl = document.getElementById('memberSince');
    
    // Avatar
    if (avatarImg) {
        if (profileData.avatar) {
            avatarImg.src = profileData.avatar;
        } else {
            const initials = (profileData.fullName || 'Usuario').split(' ').map(n => n[0]).join('').toUpperCase();
            avatarImg.src = `https://ui-avatars.com/api/?background=4db8ff&color=fff&size=120&bold=true&name=${encodeURIComponent(profileData.fullName || 'Usuario')}`;
        }
    }
    
    if (profileNameEl) profileNameEl.textContent = profileData.fullName || 'Usuario';
    if (viewFullName) viewFullName.textContent = profileData.fullName || '-';
    if (viewEmail) viewEmail.textContent = profileData.email || '-';
    if (viewPhone) viewPhone.textContent = profileData.phone || 'No registrado';
    if (viewCompany) viewCompany.textContent = profileData.company || 'No registrada';
    if (viewBio) viewBio.textContent = profileData.bio || 'Sin descripción';
    if (viewWebsite) viewWebsite.textContent = profileData.website || 'No registrado';
    if (viewSpecialty) viewSpecialty.textContent = specialtiesMap[profileData.specialty] || 'No especificada';
    if (viewExperience) viewExperience.textContent = profileData.experience || 0;
    if (viewEventsCompleted) viewEventsCompleted.textContent = profileData.eventsCompleted || 0;
    
    if (totalEventsEl) totalEventsEl.textContent = totalEvents;
    if (totalGuestsEl) totalGuestsEl.textContent = totalGuests.toLocaleString();
    if (totalPhotosEl) totalPhotosEl.textContent = totalPhotos.toLocaleString();
    if (memberSinceEl) memberSinceEl.textContent = profileData.memberSince || 'Enero 2024';
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

// Volver atrás
const goBack = () => {
    window.location.href = '/host';
};

// Controlador principal
export function profileController() {
    console.log('Controlador profileController iniciado');
    loadEventStats();
    loadProfile();
    renderProfile();
    
    const btnVolver = document.getElementById('btnVolver');
    if (btnVolver) {
        btnVolver.addEventListener('click', goBack);
    }
    
    const btnEditarPerfil = document.getElementById('btnEditarPerfil');
    if (btnEditarPerfil) {
        btnEditarPerfil.addEventListener('click', () => {
            window.location.href = '/host/profile/edit';
        });
    }
    
    const deleteAccountBtn = document.getElementById('deleteAccountBtn');
    if (deleteAccountBtn) {
        deleteAccountBtn.addEventListener('click', deleteAccount);
    }
}

export default profileController;