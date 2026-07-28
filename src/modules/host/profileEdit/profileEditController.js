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

    // 🔥 VERIFICAR QUE CADA ELEMENTO EXISTA ANTES DE ASIGNAR VALOR
    const fullNameEl = document.getElementById('fullName');
    if (fullNameEl) fullNameEl.value = userData.username || '';

    const emailEl = document.getElementById('email');
    if (emailEl) emailEl.value = userData.email || '';

    const phoneEl = document.getElementById('phone');
    if (phoneEl) phoneEl.value = userData.phone || '';

    const bioEl = document.getElementById('bio');
    if (bioEl) bioEl.value = userData.bio || '';

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

    if (stored) {
        try {
            const eventos = JSON.parse(stored);
            totalEvents = eventos.length;
            totalGuests = eventos.reduce((sum, e) => sum + (e.attendees || 0), 0);
        } catch (e) {
            console.warn('Error al parsear eventos:', e);
        }
    }

    const totalEventsEl = document.getElementById('totalEvents');
    if (totalEventsEl) totalEventsEl.textContent = totalEvents;

    const totalGuestsEl = document.getElementById('totalGuests');
    if (totalGuestsEl) totalGuestsEl.textContent = totalGuests.toLocaleString();

    const memberSinceEl = document.getElementById('memberSince');
    if (memberSinceEl && userData.createdAt) {
        const date = new Date(userData.createdAt);
        memberSinceEl.textContent = date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
    }

    console.log('✅ Formulario renderizado correctamente');
};

// ============================================
// 💾 GUARDAR CAMBIOS EN FIRESTORE
// ============================================
const saveChanges = async () => {
    const fullName = document.getElementById('fullName')?.value?.trim() || '';
    const email = document.getElementById('email')?.value?.trim() || '';
    const phone = document.getElementById('phone')?.value?.trim() || '';
    const bio = document.getElementById('bio')?.value?.trim() || '';

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
            bio: bio || ''
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

            navigateTo('/host/profile');
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
            navigateTo('/host/profile');
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
            navigateTo('/host/profile');
        }
    });
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

                const avatarImg = document.getElementById('profileAvatar');
                if (avatarImg) {
                    avatarImg.src = base64;
                }

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
// 🚀 CONTROLADOR PRINCIPAL
// ============================================
export async function profileEditController() {
    console.log('🔥 Controlador profileEditController iniciado');

    if (!userService.isAuthenticated()) {
        console.warn('⚠️ Usuario no autenticado, redirigiendo a login');
        navigateTo('/login');
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
            navigateTo('/host/profile');
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