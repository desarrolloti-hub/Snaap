// src/modules/host/profile/profileController.js
import { userService } from '../../../services/userService.js';
import { userRepository } from '../../../repositories/userRepository.js';
import { eventService } from '../../../services/eventService.js';

// Datos del perfil (se cargarán desde Firebase)
let profileData = {
    fullName: '',
    email: '',
    phone: '',
    company: '',
    bio: '',
    website: '',
    specialty: 'weddings',
    experience: 0,
    eventsCompleted: 0,
    avatar: null,
    memberSince: ''
};

const specialtiesMap = {
    'weddings': 'Bodas',
    'birthdays': 'Cumpleaños',
    'corporate': 'Eventos Corporativos',
    'concerts': 'Conciertos',
    'private': 'Fiestas Privadas'
};

// ============================================
// 📥 CARGAR DATOS DEL USUARIO DESDE FIRESTORE
// ============================================
const loadUserData = async () => {
    try {
        const user = userService.getCurrentUser();
        if (!user) {
            console.warn('⚠️ No hay usuario autenticado');
            return;
        }

        const userData = await userRepository.getByUid(user.uid);
        if (!userData) {
            console.warn('⚠️ Usuario no encontrado en Firestore');
            return;
        }

        console.log('📥 Datos del usuario desde Firestore:', userData);

        profileData = {
            fullName: userData.username || user.displayName || 'Usuario',
            email: userData.email || user.email || '',
            phone: userData.phone || '',
            company: userData.company || '',
            bio: userData.bio || '',
            website: userData.website || '',
            specialty: userData.specialty || 'weddings',
            experience: userData.experience || 0,
            eventsCompleted: userData.eventsCreated || 0,
            avatar: userData.photoURL || null,
            memberSince: userData.createdAt ? new Date(userData.createdAt).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }) : 'Enero 2024'
        };

        localStorage.setItem('hostProfile', JSON.stringify(profileData));

        return profileData;
    } catch (error) {
        console.error('❌ Error al cargar datos del usuario:', error);
        return null;
    }
};

// ============================================
// 📊 CARGAR ESTADÍSTICAS DE EVENTOS DESDE FIRESTORE
// ============================================
const loadEventStats = async (uid) => {
    try {
        const result = await eventService.obtenerEstadisticasPerfil(uid);

        if (result.success) {
            const { estadisticas, eventos } = result;

            const totalEventsEl = document.getElementById('totalEvents');
            const totalGuestsEl = document.getElementById('totalGuests');
            const totalPhotosEl = document.getElementById('totalPhotos');

            if (totalEventsEl) totalEventsEl.textContent = estadisticas.totalEventos;
            if (totalGuestsEl) totalGuestsEl.textContent = estadisticas.totalInvitados.toLocaleString();
            if (totalPhotosEl) totalPhotosEl.textContent = estadisticas.totalFotos.toLocaleString();

            // Guardar eventos en localStorage para compatibilidad
            localStorage.setItem('eventos', JSON.stringify(eventos));

            return estadisticas;
        } else {
            console.error('Error al cargar estadísticas:', result.error);
            // Fallback a localStorage
            loadEventStatsFromLocalStorage();
            return null;
        }
    } catch (error) {
        console.error('❌ Error al cargar estadísticas:', error);
        loadEventStatsFromLocalStorage();
        return null;
    }
};

// ============================================
// 📊 FALLBACK: CARGAR ESTADÍSTICAS DE LOCALSTORAGE
// ============================================
const loadEventStatsFromLocalStorage = () => {
    const stored = localStorage.getItem('eventos');
    let totalEvents = 0;
    let totalGuests = 0;
    let totalPhotos = 0;

    if (stored) {
        const eventos = JSON.parse(stored);
        totalEvents = eventos.length;
        totalGuests = eventos.reduce((sum, e) => sum + (e.attendees || 0), 0);
        totalPhotos = eventos.reduce((sum, e) => sum + (e.uploadedPhotos || 0), 0);
    }

    document.getElementById('totalEvents').textContent = totalEvents;
    document.getElementById('totalGuests').textContent = totalGuests.toLocaleString();
    document.getElementById('totalPhotos').textContent = totalPhotos.toLocaleString();
};

// ============================================
// 🖼️ RENDERIZAR PERFIL
// ============================================
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
    const memberSinceEl = document.getElementById('memberSince');

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
    if (memberSinceEl) memberSinceEl.textContent = profileData.memberSince || 'Enero 2024';

    console.log('✅ Perfil renderizado correctamente');
};

// ============================================
// 🗑️ ELIMINAR CUENTA
// ============================================
const deleteAccount = () => {
    Swal.fire({
        title: 'Eliminar Cuenta',
        html: '¿Estás seguro de que deseas eliminar tu cuenta?<br>Esta acción no se puede deshacer y todos tus eventos serán eliminados.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
    }).then(async (result) => {
        if (result.isConfirmed) {
            try {
                localStorage.removeItem('eventos');
                localStorage.removeItem('hostProfile');
                localStorage.removeItem('snaap_events');
                localStorage.removeItem('snaap_current_event');

                const user = userService.getCurrentUser();
                if (user && user.id) {
                    await userRepository.delete(user.id);
                    console.log('🗑️ Usuario eliminado de Firestore');
                }

                await userService.logout();

                await Swal.fire({
                    title: 'Cuenta Eliminada',
                    text: 'Tu cuenta ha sido eliminada. Serás redirigido al inicio.',
                    icon: 'success',
                    confirmButtonText: 'OK'
                });

                window.location.href = '/';
            } catch (error) {
                console.error('❌ Error al eliminar cuenta:', error);
                Swal.fire({
                    title: 'Error',
                    text: 'Ocurrió un error al eliminar la cuenta',
                    icon: 'error',
                    confirmButtonText: 'OK'
                });
            }
        }
    });
};

// ============================================
// 🔙 VOLVER ATRÁS
// ============================================
const goBack = () => {
    window.location.href = '/host';
};

// ============================================
// 🚀 CONTROLADOR PRINCIPAL
// ============================================
export async function profileController() {
    console.log('🔥 Controlador profileController iniciado');

    if (!userService.isAuthenticated()) {
        console.warn('⚠️ Usuario no autenticado, redirigiendo a login');
        window.location.href = '/login';
        return;
    }

    const user = userService.getCurrentUser();

    // Cargar datos del usuario desde Firestore
    await loadUserData();

    // 🔥 Cargar estadísticas de eventos desde Firestore
    if (user && user.uid) {
        await loadEventStats(user.uid);
    } else {
        loadEventStatsFromLocalStorage();
    }

    // Renderizar perfil
    renderProfile();

    // Event Listeners
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