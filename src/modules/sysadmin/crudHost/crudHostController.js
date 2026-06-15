export function crudHostController() {
    loadStyles();
    loadHosts();
    setupEventListeners();
    checkAdminSession();
}

let currentHosts = [];

function loadStyles() {
    const styles = [
        { href: '/src/css/components/crudHost.css', id: 'crud-host-style' }
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

function loadHosts() {
    const allUsers = JSON.parse(localStorage.getItem('snaap_users') || '[]');
    currentHosts = allUsers.filter(user => user.role === 'host');
    renderHostsTable();
}

function renderHostsTable() {
    const searchTerm = document.getElementById('searchHost')?.value.toLowerCase() || '';
    const tbody = document.getElementById('hostsTableBody');
    
    let filteredHosts = currentHosts.filter(host => 
        host.username.toLowerCase().includes(searchTerm) ||
        host.email.toLowerCase().includes(searchTerm)
    );
    
    if (!tbody) return;
    
    if (filteredHosts.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="loading-text">No hay hosts registrados</td></tr>';
        return;
    }
    
    tbody.innerHTML = filteredHosts.map(host => `
        <tr>
            <td>${host.id}</td>
            <td><i class="fas fa-user-circle"></i> ${escapeHtml(host.username)}</td>
            <td>${escapeHtml(host.email)}</td>
            <td>${host.eventsCreated || 0}</td>
            <td>${host.totalAttendees || 0}</td>
            <td><span class="status-badge status-${host.status}">${getStatusText(host.status)}</span></td>
            <td>${new Date(host.createdAt).toLocaleDateString()}</td>
            <td class="actions-cell">
                <button class="btn-action view-host" data-id="${host.id}" title="Ver">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn-action edit-host" data-id="${host.id}" title="Editar">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-action delete-host" data-id="${host.id}" title="Eliminar">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
    
    document.querySelectorAll('.view-host').forEach(btn => {
        btn.addEventListener('click', () => viewHost(parseInt(btn.dataset.id)));
    });
    document.querySelectorAll('.edit-host').forEach(btn => {
        btn.addEventListener('click', () => editHost(parseInt(btn.dataset.id)));
    });
    document.querySelectorAll('.delete-host').forEach(btn => {
        btn.addEventListener('click', () => deleteHost(parseInt(btn.dataset.id)));
    });
}

function setupEventListeners() {
    document.getElementById('createHostBtn')?.addEventListener('click', () => {
        window.location.href = '/sysadmin/hosts/create';
    });
    document.getElementById('searchHost')?.addEventListener('input', () => renderHostsTable());
}

async function viewHost(hostId) {
    const host = currentHosts.find(h => h.id === hostId);
    if (!host) return;
    
    await Swal.fire({
        title: 'Detalles del Host',
        html: `
            Usuario: ${escapeHtml(host.username)}
            Email: ${escapeHtml(host.email)}
            Teléfono: ${host.phone || 'No registrado'}
            Empresa: ${host.company || 'No registrada'}
            Eventos: ${host.eventsCreated || 0}
            Asistentes: ${host.totalAttendees || 0}
            Estado: ${getStatusText(host.status)}
            Registro: ${new Date(host.createdAt).toLocaleDateString()}
        `,
        icon: 'info',
        confirmButtonText: 'Cerrar'
    });
}

function editHost(hostId) {
    window.location.href = `/sysadmin/hosts/edit?id=${hostId}`;
}

async function deleteHost(hostId) {
    const host = currentHosts.find(h => h.id === hostId);
    if (!host) return;
    
    const result = await Swal.fire({
        title: '¿Eliminar Host?',
        text: `¿Estás seguro de eliminar al host ${host.username}? Esta acción no se puede deshacer.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
    });
    
    if (result.isConfirmed) {
        const allUsers = JSON.parse(localStorage.getItem('snaap_users') || '[]');
        const filteredUsers = allUsers.filter(u => u.id !== hostId);
        localStorage.setItem('snaap_users', JSON.stringify(filteredUsers));
        
        await Swal.fire({
            title: 'Eliminado',
            text: 'El host ha sido eliminado correctamente',
            icon: 'success',
            confirmButtonText: 'OK'
        });
        
        loadHosts();
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