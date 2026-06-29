// src/modules/sysadmin/profileEdit/profileEditController.js
import { userService } from '../../../services/userService.js';
import { userRepository } from '../../../repositories/userRepository.js';

export async function profileEditController() {
    console.log('🔥 Profile Edit Admin Controller iniciado');

    if (!userService.isAuthenticated()) {
        console.warn('⚠️ Usuario no autenticado');
        window.location.href = '/login';
        return;
    }

    const user = userService.getCurrentUser();
    
    if (user.role !== 'sysadmin') {
        Swal.fire({
            title: 'Acceso Denegado',
            text: 'No tienes permisos de administrador',
            icon: 'error',
            confirmButtonText: 'OK'
        }).then(() => {
            window.location.href = '/';
        });
        return;
    }

    await loadProfileData(user.uid);
    setupEventListeners();
}

async function loadProfileData(uid) {
    try {
        const userData = await userRepository.getByUid(uid);
        
        if (!userData) {
            console.warn('⚠️ Usuario no encontrado en Firestore');
            return;
        }

        console.log('📥 Datos del admin para editar:', userData);

        const usernameEl = document.getElementById('editUsername');
        const emailEl = document.getElementById('editEmail');
        const phoneEl = document.getElementById('editPhone');
        const departmentEl = document.getElementById('editDepartment');
        const notesEl = document.getElementById('editNotes');

        if (usernameEl) usernameEl.value = userData.username || '';
        if (emailEl) emailEl.value = userData.email || '';
        if (phoneEl) phoneEl.value = userData.phone || '';
        if (departmentEl) departmentEl.value = userData.department || userData.company || '';
        if (notesEl) notesEl.value = userData.bio || userData.notes || '';

    } catch (error) {
        console.error('❌ Error al cargar perfil:', error);
        Swal.fire({
            title: 'Error',
            text: 'No se pudieron cargar los datos del perfil',
            icon: 'error',
            confirmButtonText: 'OK'
        });
    }
}

async function saveProfile(e) {
    e.preventDefault();

    const username = document.getElementById('editUsername').value.trim();
    const email = document.getElementById('editEmail').value.trim();
    const phone = document.getElementById('editPhone').value.trim();
    const department = document.getElementById('editDepartment').value.trim();
    const notes = document.getElementById('editNotes').value.trim();

    if (!username || username.length < 3) {
        Swal.fire({
            title: 'Nombre inválido',
            text: 'El nombre debe tener al menos 3 caracteres',
            icon: 'warning',
            confirmButtonText: 'OK'
        });
        return;
    }

    if (!email || !userService.isValidEmail(email)) {
        Swal.fire({
            title: 'Email inválido',
            text: 'Por favor ingresa un correo electrónico válido',
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
            username: username,
            email: email,
            phone: phone || '',
            company: department || '',
            bio: notes || '',
            department: department || ''
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

            if (typeof window.navigateTo === 'function') {
                window.navigateTo('/sysadmin/profile');
            } else {
                window.location.href = '/sysadmin/profile';
            }
        } else {
            Swal.fire({
                title: 'Error',
                text: result.error || 'Error al guardar los cambios',
                icon: 'error',
                confirmButtonText: 'Intentar de nuevo'
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
}

function goBack() {
    if (typeof window.navigateTo === 'function') {
        window.navigateTo('/sysadmin/profile');
    } else {
        window.location.href = '/sysadmin/profile';
    }
}

function setupEventListeners() {
    const form = document.getElementById('editProfileForm');
    if (form) {
        form.addEventListener('submit', saveProfile);
    }

    const cancelBtn = document.getElementById('cancelBtn');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', goBack);
    }

    const btnVolver = document.getElementById('btnVolver');
    if (btnVolver) {
        btnVolver.addEventListener('click', goBack);
    }
}

export default profileEditController;