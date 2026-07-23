// src/modules/sysadmin/profileAdmin/profileAdminController.js
import { userService } from '../../../services/userService.js';
import { userRepository } from '../../../repositories/userRepository.js';

export async function profileAdminController() {
    console.log('ðŸ”¥ Profile Admin Controller iniciado');

    if (!userService.isAuthenticated()) {
        console.warn('âš ï¸ Usuario no autenticado');
        window.go('');
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
            window.go('');
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
            console.warn('âš ï¸ Usuario no encontrado en Firestore');
            return;
        }

        console.log('ðŸ“¥ Datos del admin:', userData);

        const usernameEl = document.getElementById('profileUsername');
        const emailEl = document.getElementById('profileEmail');
        const phoneEl = document.getElementById('profilePhone');
        const departmentEl = document.getElementById('profileDepartment');
        const notesEl = document.getElementById('profileNotes');

        if (usernameEl) usernameEl.textContent = userData.username || '-';
        if (emailEl) emailEl.textContent = userData.email || '-';
        if (phoneEl) phoneEl.textContent = userData.phone || 'No registrado';
        if (departmentEl) departmentEl.textContent = userData.department || userData.company || 'No registrado';
        if (notesEl) notesEl.textContent = userData.bio || userData.notes || 'Sin notas';

    } catch (error) {
        console.error('âŒ Error al cargar perfil:', error);
        Swal.fire({
            title: 'Error',
            text: 'No se pudieron cargar los datos del perfil',
            icon: 'error',
            confirmButtonText: 'OK'
        });
    }
}

function setupEventListeners() {
    const editBtn = document.getElementById('editBtn');
    
    if (editBtn) {
        editBtn.addEventListener('click', () => {
            if (typeof window.navigateTo === 'function') {
                window.navigateTo('/sysadmin/profile/edit');
            } else {
                window.go('');
            }
        });
    }
}

export default profileAdminController;
