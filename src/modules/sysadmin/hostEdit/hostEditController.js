export function hostEditController() {
    loadStyles();
    loadHostData();
    setupForm();
    checkAdminSession();
}

let editingHostId = null;

function loadStyles() {
    const styles = [
        { href: '/src/css/components/hostEdit.css', id: 'host-edit-style' }
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

function loadHostData() {
    const urlParams = new URLSearchParams(window.location.search);
    const hostId = urlParams.get('id');
    
    if (!hostId) {
        Swal.fire({
            title: 'Error',
            text: 'No se especificó qué host editar',
            icon: 'error',
            confirmButtonText: 'OK'
        }).then(() => {
            window.location.href = '/sysadmin/hosts';
        });
        return;
    }
    
    editingHostId = parseInt(hostId);
    const allUsers = JSON.parse(localStorage.getItem('snaap_users') || '[]');
    const host = allUsers.find(u => u.id === editingHostId && u.role === 'host');
    
    if (!host) {
        Swal.fire({
            title: 'Error',
            text: 'El host no existe',
            icon: 'error',
            confirmButtonText: 'OK'
        }).then(() => {
            window.location.href = '/sysadmin/hosts';
        });
        return;
    }
    
    document.getElementById('hostUsername').value = host.username;
    document.getElementById('hostEmail').value = host.email;
    document.getElementById('hostPhone').value = host.phone || '';
    document.getElementById('hostCompany').value = host.company || '';
    document.getElementById('hostStatus').value = host.status;
    document.getElementById('hostBio').value = host.bio || '';
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
    const phone = document.getElementById('hostPhone')?.value;
    const company = document.getElementById('hostCompany')?.value;
    const status = document.getElementById('hostStatus')?.value;
    const bio = document.getElementById('hostBio')?.value;
    const newPassword = document.getElementById('hostPassword')?.value;
    
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
    const index = allUsers.findIndex(u => u.id === editingHostId);
    
    if (index === -1) {
        await Swal.fire({
            title: 'Error',
            text: 'No se encontró el host',
            icon: 'error',
            confirmButtonText: 'OK'
        });
        window.location.href = '/sysadmin/hosts';
        return;
    }
    
    allUsers[index].username = username;
    allUsers[index].email = email;
    allUsers[index].phone = phone;
    allUsers[index].company = company;
    allUsers[index].status = status;
    allUsers[index].bio = bio;
    
    if (newPassword && newPassword.length >= 6) {
        allUsers[index].password = newPassword;
    }
    
    localStorage.setItem('snaap_users', JSON.stringify(allUsers));
    
    await Swal.fire({
        title: '¡Actualizado!',
        text: 'El host ha sido actualizado correctamente',
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