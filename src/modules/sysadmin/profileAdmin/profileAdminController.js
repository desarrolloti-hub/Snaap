export function profileAdminController() {
    console.log('ProfileAdmin Controller cargado');
    loadProfileData();
    setupEventListeners();
    checkAdminSession();
}

function loadProfileData() {
    console.log('Cargando datos del perfil...');
    const currentUser = JSON.parse(localStorage.getItem('snaap_current_user') || 'null');
    
    if (!currentUser) {
        Swal.fire({
            title: 'Error',
            text: 'No has iniciado sesión',
            icon: 'error',
            confirmButtonText: 'OK'
        }).then(() => {
            window.location.href = '/';
        });
        return;
    }
    
    const usernameInput = document.getElementById('profileUsername');
    const emailInput = document.getElementById('profileEmail');
    const phoneInput = document.getElementById('profilePhone');
    const departmentInput = document.getElementById('profileDepartment');
    const notesInput = document.getElementById('profileNotes');
    
    if (usernameInput) usernameInput.value = currentUser.username || '';
    if (emailInput) emailInput.value = currentUser.email || '';
    if (phoneInput) phoneInput.value = currentUser.phone || '';
    if (departmentInput) departmentInput.value = currentUser.department || '';
    if (notesInput) notesInput.value = currentUser.notes || '';
    
    console.log('Datos del perfil cargados');
}

function setupEventListeners() {
    const cancelBtn = document.getElementById('cancelBtn');
    const profileForm = document.getElementById('profileForm');
    
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            window.location.href = '/sysadmin/home';
        });
    }
    
    if (profileForm) {
        profileForm.addEventListener('submit', saveProfile);
    }
}

async function saveProfile(e) {
    e.preventDefault();
    
    const currentPassword = document.getElementById('profileCurrentPassword')?.value;
    const newPassword = document.getElementById('profileNewPassword')?.value;
    const confirmPassword = document.getElementById('profileConfirmPassword')?.value;
    const phone = document.getElementById('profilePhone')?.value;
    const department = document.getElementById('profileDepartment')?.value;
    const notes = document.getElementById('profileNotes')?.value;
    
    const currentUser = JSON.parse(localStorage.getItem('snaap_current_user') || 'null');
    
    if (!currentUser) {
        await Swal.fire({
            title: 'Error',
            text: 'No has iniciado sesión',
            icon: 'error',
            confirmButtonText: 'OK'
        });
        return;
    }
    
    if (newPassword || confirmPassword || currentPassword) {
        if (!currentPassword || !newPassword || !confirmPassword) {
            await Swal.fire({
                title: 'Campos incompletos',
                text: 'Para cambiar la contraseña debes completar todos los campos',
                icon: 'warning',
                confirmButtonText: 'OK'
            });
            return;
        }
        
        if (currentPassword !== currentUser.password) {
            await Swal.fire({
                title: 'Contraseña incorrecta',
                text: 'La contraseña actual no coincide',
                icon: 'error',
                confirmButtonText: 'OK'
            });
            return;
        }
        
        if (newPassword.length < 6) {
            await Swal.fire({
                title: 'Contraseña muy corta',
                text: 'La nueva contraseña debe tener al menos 6 caracteres',
                icon: 'warning',
                confirmButtonText: 'OK'
            });
            return;
        }
        
        if (newPassword !== confirmPassword) {
            await Swal.fire({
                title: 'Las contraseñas no coinciden',
                text: 'La nueva contraseña y su confirmación deben ser iguales',
                icon: 'error',
                confirmButtonText: 'OK'
            });
            return;
        }
        
        currentUser.password = newPassword;
    }
    
    currentUser.phone = phone || '';
    currentUser.department = department || '';
    currentUser.notes = notes || '';
    
    const allUsers = JSON.parse(localStorage.getItem('snaap_users') || '[]');
    const userIndex = allUsers.findIndex(u => u.id === currentUser.id);
    
    if (userIndex !== -1) {
        allUsers[userIndex] = currentUser;
        localStorage.setItem('snaap_users', JSON.stringify(allUsers));
        localStorage.setItem('snaap_current_user', JSON.stringify(currentUser));
    }
    
    await Swal.fire({
        title: '¡Perfil actualizado!',
        text: 'Tus datos han sido guardados correctamente',
        icon: 'success',
        confirmButtonText: 'OK'
    });
    
    const currentPassInput = document.getElementById('profileCurrentPassword');
    const newPassInput = document.getElementById('profileNewPassword');
    const confirmPassInput = document.getElementById('profileConfirmPassword');
    
    if (currentPassInput) currentPassInput.value = '';
    if (newPassInput) newPassInput.value = '';
    if (confirmPassInput) confirmPassInput.value = '';
}

async function checkAdminSession() {
    const currentUser = JSON.parse(localStorage.getItem('snaap_current_user') || 'null');
    if (!currentUser || currentUser.role !== 'sysadmin') {
        await Swal.fire({
            title: 'Acceso Denegado',
            text: 'No tienes permisos de administrador',
            icon: 'error',
            confirmButtonText: 'OK'
        });
        window.location.href = '/';
    }
}