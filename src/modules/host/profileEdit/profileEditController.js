// src/modules/host/profileEdit/profileEditController.js
import { userService } from '../../../services/userService.js';
import { userRepository } from '../../../repositories/userRepository.js';

// ============================================
// 📥 CARGAR DATOS DEL USUARIO DESDE FIRESTORE
// ============================================
const loadUserData = async () => {
    try {
        const user = userService.getCurrentUser();
        if (!user) {
            console.warn('⚠️ No hay usuario autenticado');
            return null;
        }

        const userData = await userRepository.getByUid(user.uid);
        if (!userData) {
            console.warn('⚠️ Usuario no encontrado en Firestore');
            return null;
        }

        console.log('📥 Datos del usuario para editar:', userData);
        return userData;
    } catch (error) {
        console.error('❌ Error al cargar datos:', error);
        return null;
    }
};

// ============================================
// 🖼️ RENDERIZAR FORMULARIO
// ============================================
const renderForm = (userData) => {
    if (!userData) return;

    document.getElementById('fullName').value = userData.username || '';
    document.getElementById('email').value = userData.email || '';
    document.getElementById('phone').value = userData.phone || '';
    document.getElementById('company').value = userData.company || '';
    document.getElementById('bio').value = userData.bio || '';
    document.getElementById('website').value = userData.website || '';
    document.getElementById('specialty').value = userData.specialty || '';
    document.getElementById('experience').value = userData.experience || 0;
    document.getElementById('eventsCompleted').value = userData.eventsCreated || 0;

    // Actualizar nombre en el header
    const profileName = document.getElementById('profileName');
    if (profileName) {
        profileName.textContent = userData.username || 'Nombre del Host';
    }

    // Mostrar avatar
    const avatarImg = document.getElementById('profileAvatar');
    if (avatarImg) {
        if (userData.photoURL) {
            avatarImg.src = userData.photoURL;
        } else {
            const initials = (userData.username || 'Usuario').split(' ').map(n => n[0]).join('').toUpperCase();
            avatarImg.src = `https://ui-avatars.com/api/?background=4db8ff&color=fff&size=120&bold=true&name=${encodeURIComponent(userData.username || 'Usuario')}`;
        }
    }

    // Estadísticas
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

    const memberSince = document.getElementById('memberSince');
    if (memberSince && userData.createdAt) {
        const date = new Date(userData.createdAt);
        memberSince.textContent = date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
    }

    console.log('✅ Formulario renderizado');
};

// ============================================
// 💾 GUARDAR CAMBIOS EN FIRESTORE
// ============================================
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

    // Validaciones
    if (!fullName || fullName.length < 3) {
        await Swal.fire({
            title: 'Nombre inválido',
            text: 'El nombre debe tener al menos 3 caracteres',
            icon: 'warning',
            confirmButtonText: 'OK'
        });
        return;
    }

    if (!email || !userService.isValidEmail(email)) {
        await Swal.fire({
            title: 'Email inválido',
            text: 'Por favor ingresa un correo electrónico válido',
            icon: 'warning',
            confirmButtonText: 'OK'
        });
        return;
    }

    // Mostrar loading
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
            username: fullName,
            email: email,
            phone: phone || '',
            company: company || '',
            bio: bio || '',
            website: website || '',
            specialty: specialty || '',
            experience: experience,
            eventsCreated: eventsCompleted
        };

        const result = await userService.actualizarPerfil(updateData);
        Swal.close();

        if (result.success) {
            document.dispatchEvent(new CustomEvent('auth:changed', {
                detail: {
                    user: result.user,
                    role: result.user.role,
                    isAuthenticated: true
                }
            }));

            await Swal.fire({
                title: '¡Perfil actualizado!',
                text: 'Tus datos han sido guardados correctamente',
                icon: 'success',
                confirmButtonText: 'Ver perfil'
            });

            window.location.href = '/host/profile';
        } else {
            await Swal.fire({
                title: 'Error',
                text: result.error || 'Error al guardar los cambios',
                icon: 'error',
                confirmButtonText: 'Intentar de nuevo'
            });
        }
    } catch (error) {
        Swal.close();
        console.error('❌ Error al guardar:', error);
        await Swal.fire({
            title: 'Error',
            text: 'Ocurrió un error al guardar los cambios',
            icon: 'error',
            confirmButtonText: 'OK'
        });
    }
};

// ============================================
// 🖼️ SUBIR AVATAR
// ============================================
const convertImageToBase64 = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
    });
};

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
            if (!file) return;

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

                // Actualizar vista previa
                const avatarImg = document.getElementById('profileAvatar');
                if (avatarImg) {
                    avatarImg.src = base64;
                }

                // Guardar avatar en Firestore
                const result = await userService.actualizarPerfil({
                    photoURL: base64
                });

                if (result.success) {
                    await Swal.fire({
                        title: '¡Avatar actualizado!',
                        text: 'Tu foto de perfil ha sido actualizada',
                        icon: 'success',
                        confirmButtonText: 'OK'
                    });
                }
            } catch (error) {
                console.error('Error al subir avatar:', error);
                await Swal.fire({
                    title: 'Error',
                    text: 'Error al procesar la imagen',
                    icon: 'error',
                    confirmButtonText: 'OK'
                });
            }
        });
    }
};

// ============================================
// 🔙 CANCELAR Y VOLVER
// ============================================
const cancelChanges = () => {
    Swal.fire({
        title: 'Cancelar Edición',
        text: '¿Estás seguro de que quieres cancelar? Los cambios no se guardarán.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, cancelar',
        cancelButtonText: 'Continuar editando'
    }).then((result) => {
        if (result.isConfirmed) {
            window.location.href = '/host/profile';
        }
    });
};

const goBack = () => {
    Swal.fire({
        title: 'Salir sin guardar',
        text: 'Tienes cambios sin guardar. ¿Estás seguro de que quieres salir?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, salir',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            window.location.href = '/host/profile';
        }
    });
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
// 🚀 CONTROLADOR PRINCIPAL
// ============================================
export async function profileEditController() {
    console.log('🔥 Controlador profileEditController iniciado');

    if (!userService.isAuthenticated()) {
        console.warn('⚠️ Usuario no autenticado, redirigiendo a login');
        window.location.href = '/login';
        return;
    }

    const userData = await loadUserData();
    if (!userData) {
        Swal.fire({
            title: 'Error',
            text: 'No se pudieron cargar los datos del usuario',
            icon: 'error',
            confirmButtonText: 'OK'
        }).then(() => {
            window.location.href = '/host/profile';
        });
        return;
    }

    renderForm(userData);
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

    // Vista previa del avatar al cambiar el nombre
    const fullNameInput = document.getElementById('fullName');
    if (fullNameInput) {
        fullNameInput.addEventListener('input', () => {
            const avatarPreview = document.getElementById('profileAvatar');
            const profileName = document.getElementById('profileName');
            if (avatarPreview) {
                const name = fullNameInput.value.trim() || 'Usuario';
                const initials = name.split(' ').map(n => n[0]).join('').toUpperCase();
                avatarPreview.src = `https://ui-avatars.com/api/?background=4db8ff&color=fff&size=120&bold=true&name=${encodeURIComponent(name)}`;
            }
            if (profileName) {
                profileName.textContent = fullNameInput.value.trim() || 'Nombre del Host';
            }
        });
    }

    console.log('✅ Controlador profileEditController finalizado');
}

export default profileEditController;