export function adminEditController() {
    loadStyles();
    loadAdminData();
    setupForm();
    checkAdminSession();
}

let editingAdminId = null;

function loadStyles() {
    const styles = [
        { href: '/src/css/components/adminEdit.css', id: 'admin-edit-style' }
    ];
    
    styles.forEach(style => {
        if (!document.querySelector(`link[href="${style.href}"]`)) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = style.href;
            document.head.appendChild(link);
        }
    });
}

function loadAdminData() {
    const urlParams = new URLSearchParams(window.location.search);
    const adminId = urlParams.get('id');
    
    if (!adminId) {
        Swal.fire({
            title: 'Error',
            text: 'No se especificó qué administrador editar',
            icon: 'error',
            confirmButtonText: 'OK'
        }).then(() => {
            window.location.href = '/sysadmin/admins';
        });
        return;
    }
    
    editingAdminId = parseInt(adminId);
    const allUsers = JSON.parse(localStorage.getItem('snaap_users') || '[]');
    const admin = allUsers.find(u => u.id === editingAdminId && u.role === 'sysadmin');
    
    if (!admin) {
        Swal.fire({
            title: 'Error',
            text: 'El administrador no existe',
            icon: 'error',
            confirmButtonText: 'OK'
        }).then(() => {
            window.location.href = '/sysadmin/admins';
        });
        return;
    }
    
    document.getElementById('adminUsername').value = admin.username;
    document.getElementById('adminEmail').value = admin.email;
    document.getElementById('adminPhone').value = admin.phone || '';
    document.getElementById('adminDepartment').value = admin.department || '';
    document.getElementById('adminStatus').value = admin.status;
    document.getElementById('adminNotes').value = admin.notes || '';
}

function setupForm() {
    const backBtn = document.getElementById('backBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    const adminForm = document.getElementById('adminForm');
    
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            window.location.href = '/sysadmin/admins';
        });
    }
    
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            window.location.href = '/sysadmin/admins';
        });
    }
    
    if (adminForm) {
        adminForm.addEventListener('submit', saveAdmin);
    }
}

async function saveAdmin(e) {
    e.preventDefault();
    
    const username = document.getElementById('adminUsername')?.value;
    const email = document.getElementById('adminEmail')?.value;
    const phone = document.getElementById('adminPhone')?.value;
    const department = document.getElementById('adminDepartment')?.value;
    const status = document.getElementById('adminStatus')?.value;
    const notes = document.getElementById('adminNotes')?.value;
    const newPassword = document.getElementById('adminPassword')?.value;
    
    if (!username || !email) {
        await Swal.fire({
            title: 'Campos requeridos',
            text: 'Por favor completa el nombre de usuario y email',
            icon: 'warning',
            confirmButtonText: 'OK'
        });
        return;
    }
    
    const allUsers = JSON.parse(localStorage.getItem('snaap_users') || '[]');
    const index = allUsers.findIndex(u => u.id === editingAdminId);
    
    if (index === -1) {
        await Swal.fire({
            title: 'Error',
            text: 'No se encontró el administrador',
            icon: 'error',
            confirmButtonText: 'OK'
        });
        window.location.href = '/sysadmin/admins';
        return;
    }
    
    allUsers[index].username = username;
    allUsers[index].email = email;
    allUsers[index].phone = phone;
    allUsers[index].department = department;
    allUsers[index].status = status;
    allUsers[index].notes = notes;
    
    if (newPassword && newPassword.length >= 6) {
        allUsers[index].password = newPassword;
    }
    
    localStorage.setItem('snaap_users', JSON.stringify(allUsers));
    
    await Swal.fire({
        title: '¡Actualizado!',
        text: 'El administrador ha sido actualizado correctamente',
        icon: 'success',
        confirmButtonText: 'OK'
    });
    
    window.location.href = '/sysadmin/admins';
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