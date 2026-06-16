export function profileAdminController() {
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
    
    const usernameEl = document.getElementById('profileUsername');
    const emailEl = document.getElementById('profileEmail');
    const phoneEl = document.getElementById('profilePhone');
    const departmentEl = document.getElementById('profileDepartment');
    const notesEl = document.getElementById('profileNotes');
    
    if (usernameEl) usernameEl.textContent = currentUser.username || '-';
    if (emailEl) emailEl.textContent = currentUser.email || '-';
    if (phoneEl) phoneEl.textContent = currentUser.phone || 'No registrado';
    if (departmentEl) departmentEl.textContent = currentUser.department || 'No registrado';
    if (notesEl) notesEl.textContent = currentUser.notes || 'Sin notas';
}

function setupEventListeners() {
    const editBtn = document.getElementById('editBtn');
    
    if (editBtn) {
        editBtn.addEventListener('click', () => {
            window.location.href = '/sysadmin/profile/edit';
        });
    }
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