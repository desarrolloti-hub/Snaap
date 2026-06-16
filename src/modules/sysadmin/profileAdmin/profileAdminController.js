export function profileAdminController() {
    loadProfileData();
    setupEventListeners();
    checkAdminSession();
    setReadOnlyMode(true);
}

let isEditing = false;

function setReadOnlyMode(readonly) {
    const phoneInput = document.getElementById('profilePhone');
    const departmentInput = document.getElementById('profileDepartment');
    const notesInput = document.getElementById('profileNotes');
    const editBtn = document.getElementById('editBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    const saveBtn = document.getElementById('saveBtn');
    
    if (readonly) {
        // Modo lectura
        if (phoneInput) phoneInput.readOnly = true;
        if (departmentInput) departmentInput.readOnly = true;
        if (notesInput) notesInput.readOnly = true;
        if (editBtn) editBtn.style.display = 'inline-flex';
        if (cancelBtn) cancelBtn.style.display = 'none';
        if (saveBtn) saveBtn.style.display = 'none';
        isEditing = false;
    } else {
        // Modo edición
        if (phoneInput) phoneInput.readOnly = false;
        if (departmentInput) departmentInput.readOnly = false;
        if (notesInput) notesInput.readOnly = false;
        if (editBtn) editBtn.style.display = 'none';
        if (cancelBtn) cancelBtn.style.display = 'inline-flex';
        if (saveBtn) saveBtn.style.display = 'inline-flex';
        isEditing = true;
    }
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
    const editBtn = document.getElementById('editBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    const profileForm = document.getElementById('profileForm');
    
    if (editBtn) {
        editBtn.addEventListener('click', () => {
            setReadOnlyMode(false);
        });
    }
    
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            // Recargar datos originales
            loadProfileData();
            setReadOnlyMode(true);
        });
    }
    
    if (profileForm) {
        profileForm.addEventListener('submit', saveProfile);
    }
}

async function saveProfile(e) {
    e.preventDefault();
    
    if (!isEditing) return;
    
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
    
    setReadOnlyMode(true);
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