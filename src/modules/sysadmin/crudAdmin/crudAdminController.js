export function crudAdminController() {
    loadStyles();
    loadAdmins();
    setupEventListeners();
    checkAdminSession();
}

let currentAdmins = [];

function loadStyles() {
    const styles = [
        { href: '/src/css/components/crudAdmin.css', id: 'crud-admin-style' }
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

function loadAdmins() {
    const allUsers = JSON.parse(localStorage.getItem('snaap_users') || '[]');
    currentAdmins = allUsers.filter(user => user.role === 'sysadmin');
    renderAdminsTable();
}

function renderAdminsTable() {
    const searchTerm = document.getElementById('searchAdmin')?.value.toLowerCase() || '';
    const tbody = document.getElementById('adminsTableBody');
    
    let filteredAdmins = currentAdmins.filter(admin => 
        admin.username.toLowerCase().includes(searchTerm) ||
        admin.email.toLowerCase().includes(searchTerm)
    );
    
    if (!tbody) return;
    
    if (filteredAdmins.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="loading-text">No hay administradores registrados</td</tr>';
        return;
    }
    
    tbody.innerHTML = filteredAdmins.map(admin => `
        <tr>
            <td>${admin.id}</td>
            <td><i class="fas fa-shield-alt"></i> ${escapeHtml(admin.username)}</td>
            <td>${escapeHtml(admin.email)}</td>
            <td>${admin.eventsCreated || 0}</td>
            <td>${admin.totalAttendees || 0}</td>
            <td><span class="status-badge status-${admin.status}">${getStatusText(admin.status)}</span></td>
            <td>${new Date(admin.createdAt).toLocaleDateString()}</td>
            <td class="actions-cell">
                <button class="btn-action view-admin" data-id="${admin.id}" title="Ver">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn-action edit-admin" data-id="${admin.id}" title="Editar">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-action delete-admin" data-id="${admin.id}" title="Eliminar">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
    
    document.querySelectorAll('.view-admin').forEach(btn => {
        btn.addEventListener('click', () => viewAdmin(parseInt(btn.dataset.id)));
    });
    document.querySelectorAll('.edit-admin').forEach(btn => {
        btn.addEventListener('click', () => editAdmin(parseInt(btn.dataset.id)));
    });
    document.querySelectorAll('.delete-admin').forEach(btn => {
        btn.addEventListener('click', () => deleteAdmin(parseInt(btn.dataset.id)));
    });
}

function setupEventListeners() {
    document.getElementById('createAdminBtn')?.addEventListener('click', () => {
        window.location.href = '/sysadmin/admins/create';
    });
    document.getElementById('searchAdmin')?.addEventListener('input', () => renderAdminsTable());
}

async function viewAdmin(adminId) {
    const admin = currentAdmins.find(a => a.id === adminId);
    if (!admin) return;
    
    await Swal.fire({
        title: 'Detalles del Administrador',
        html: `
            Usuario: ${escapeHtml(admin.username)}
            Email: ${escapeHtml(admin.email)}
            Eventos gestionados: ${admin.eventsCreated || 0}
            Asistentes totales: ${admin.totalAttendees || 0}
            Estado: ${getStatusText(admin.status)}
            Registro: ${new Date(admin.createdAt).toLocaleDateString()}
        `,
        icon: 'info',
        confirmButtonText: 'Cerrar'
    });
}

function editAdmin(adminId) {
    window.location.href = `/sysadmin/admins/edit?id=${adminId}`;
}

async function deleteAdmin(adminId) {
    const admin = currentAdmins.find(a => a.id === adminId);
    if (!admin) return;
    
    const currentUser = JSON.parse(localStorage.getItem('snaap_current_user') || 'null');
    
    if (currentUser && currentUser.id === adminId) {
        await Swal.fire({
            title: 'No puedes eliminarte a ti mismo',
            text: 'No puedes eliminar tu propia cuenta de administrador',
            icon: 'error',
            confirmButtonText: 'OK'
        });
        return;
    }
    
    const result = await Swal.fire({
        title: '¿Eliminar Administrador?',
        text: `¿Estás seguro de eliminar al administrador ${admin.username}? Esta acción no se puede deshacer.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
    });
    
    if (result.isConfirmed) {
        const allUsers = JSON.parse(localStorage.getItem('snaap_users') || '[]');
        const filteredUsers = allUsers.filter(u => u.id !== adminId);
        localStorage.setItem('snaap_users', JSON.stringify(filteredUsers));
        
        await Swal.fire({
            title: 'Eliminado',
            text: 'El administrador ha sido eliminado correctamente',
            icon: 'success',
            confirmButtonText: 'OK'
        });
        
        loadAdmins();
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

function getStatusText(status) {
    const statuses = {
        active: 'Activo',
        inactive: 'Inactivo',
        suspended: 'Suspendido'
    };
    return statuses[status] || status;
}

function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}