export function profileEditController() {
    loadProfileData();
    setupEventListeners();
    checkAdminSession();
}

function loadProfileData() {
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
}

function setupEventListeners() {
    const cancelBtn = document.getElementById('cancelBtn');
    const profileForm = document.getElementById('profileForm');
    
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            window.location.href = '/sysadmin/profile';
        });
    }
    
    if (profileForm) {
        profileForm.addEventListener('submit', saveProfile);
    }
}

async function saveProfile(e) {
    e.preventDefault();
    
    const username = document.getElementById('profileUsername')?.value.trim();
    const email = document.getElementById('profileEmail')?.value.trim();
    const phone = document.getElementById('profilePhone')?.value.trim();
    const department = document.getElementById('profileDepartment')?.value.trim();
    const notes = document.getElementById('profileNotes')?.value.trim();
    
    // Validaciones
    if (!username || !email) {
        await Swal.fire({
            title: 'Campos requeridos',
            text: 'El nombre de usuario y el correo electrónico son obligatorios',
            icon: 'warning',
            confirmButtonText: 'OK'
        });
        return;
    }
    
    if (!email.includes('@') || !email.includes('.')) {
        await Swal.fire({
            title: 'Email inválido',
            text: 'Por favor ingresa un correo electrónico válido',
            icon: 'warning',
            confirmButtonText: 'OK'
        });
        return;
    }
    
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
    
    const allUsers = JSON.parse(localStorage.getItem('snaap_users') || '[]');
    
    // Verificar si el email ya existe en otro usuario
    const emailExists = allUsers.some(u => u.email === email && u.id !== currentUser.id);
    if (emailExists) {
        await Swal.fire({
            title: 'Email duplicado',
            text: 'Este correo electrónico ya está registrado por otro usuario',
            icon: 'error',
            confirmButtonText: 'OK'
        });
        return;
    }
    
    // Verificar si el username ya existe en otro usuario
    const usernameExists = allUsers.some(u => u.username === username && u.id !== currentUser.id);
    if (usernameExists) {
        await Swal.fire({
            title: 'Usuario duplicado',
            text: 'Este nombre de usuario ya está registrado por otro usuario',
            icon: 'error',
            confirmButtonText: 'OK'
        });
        return;
    }
    
    // Actualizar datos del usuario
    currentUser.username = username;
    currentUser.email = email;
    currentUser.phone = phone || '';
    currentUser.department = department || '';
    currentUser.notes = notes || '';
    
    // Actualizar en la lista de usuarios
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
    
    window.location.href = '/sysadmin/profile';
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