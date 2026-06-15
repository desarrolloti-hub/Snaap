export function adminFormController() {
    loadStyles();
    setupForm();
    checkAdminSession();
}

function loadStyles() {
    const styles = [
        { href: '/src/css/components/adminForm.css', id: 'admin-form-style' }
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
    const password = document.getElementById('adminPassword')?.value;
    const phone = document.getElementById('adminPhone')?.value;
    const department = document.getElementById('adminDepartment')?.value;
    const status = document.getElementById('adminStatus')?.value;
    const notes = document.getElementById('adminNotes')?.value;
    
    if (!username || !email) {
        await Swal.fire({
            title: 'Campos requeridos',
            text: 'Por favor completa el nombre de usuario y email',
            icon: 'warning',
            confirmButtonText: 'OK'
        });
        return;
    }
    
    if (!password || password.length < 6) {
        await Swal.fire({
            title: 'Contraseña inválida',
            text: 'La contraseña debe tener al menos 6 caracteres',
            icon: 'warning',
            confirmButtonText: 'OK'
        });
        return;
    }
    
    const allUsers = JSON.parse(localStorage.getItem('snaap_users') || '[]');
    
    const emailExists = allUsers.some(u => u.email === email);
    if (emailExists) {
        await Swal.fire({
            title: 'Email duplicado',
            text: 'Ya existe un usuario con este correo electrónico',
            icon: 'error',
            confirmButtonText: 'OK'
        });
        return;
    }
    
    const newAdmin = {
        id: Date.now(),
        username: username,
        email: email,
        password: password,
        phone: phone || '',
        department: department || '',
        notes: notes || '',
        role: 'sysadmin',
        status: status,
        createdAt: new Date().toISOString(),
        lastLogin: null,
        eventsCreated: 0,
        totalAttendees: 0
    };
    
    allUsers.push(newAdmin);
    localStorage.setItem('snaap_users', JSON.stringify(allUsers));
    
    await Swal.fire({
        title: '¡Creado!',
        text: 'El administrador ha sido creado correctamente',
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