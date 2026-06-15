export function hostFormController() {
    loadStyles();
    setupForm();
    checkAdminSession();
}

function loadStyles() {
    const styles = [
        { href: '/src/css/components/hostForm.css', id: 'host-form-style' }
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
    const hostForm = document.getElementById('hostForm');
    
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            window.location.href = '/sysadmin/hosts';
        });
    }
    
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            window.location.href = '/sysadmin/hosts';
        });
    }
    
    if (hostForm) {
        hostForm.addEventListener('submit', saveHost);
    }
}

async function saveHost(e) {
    e.preventDefault();
    
    const username = document.getElementById('hostUsername')?.value;
    const email = document.getElementById('hostEmail')?.value;
    const password = document.getElementById('hostPassword')?.value;
    const phone = document.getElementById('hostPhone')?.value;
    const company = document.getElementById('hostCompany')?.value;
    const status = document.getElementById('hostStatus')?.value;
    const bio = document.getElementById('hostBio')?.value;
    
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
    
    const usernameExists = allUsers.some(u => u.username === username);
    if (usernameExists) {
        await Swal.fire({
            title: 'Usuario duplicado',
            text: 'Ya existe un usuario con este nombre',
            icon: 'error',
            confirmButtonText: 'OK'
        });
        return;
    }
    
    const newHost = {
        id: Date.now(),
        username: username,
        email: email,
        password: password,
        phone: phone || '',
        company: company || '',
        bio: bio || '',
        role: 'host',
        status: status,
        createdAt: new Date().toISOString(),
        lastLogin: null,
        eventsCreated: 0,
        totalAttendees: 0
    };
    
    allUsers.push(newHost);
    localStorage.setItem('snaap_users', JSON.stringify(allUsers));
    
    await Swal.fire({
        title: '¡Creado!',
        text: 'El host ha sido creado correctamente',
        icon: 'success',
        confirmButtonText: 'OK'
    });
    
    window.location.href = '/sysadmin/hosts';
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