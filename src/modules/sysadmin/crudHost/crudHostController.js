// src/modules/sysadmin/crudHost/crudHostController.js
import { userService } from '../../../services/userService.js';
import { userRepository } from '../../../repositories/userRepository.js';

export async function crudHostController() {
    console.log('ðŸ”¥ CRUD Host Controller iniciado');

    if (!userService.isAuthenticated()) {
        console.warn('âš ï¸ Usuario no autenticado');
        window.go('');
        return;
    }

    const user = userService.getCurrentUser();
    
    if (user.role !== 'sysadmin') {
        Swal.fire({
            title: 'Acceso Denegado',
            text: 'No tienes permisos de administrador',
            icon: 'error',
            confirmButtonText: 'OK'
        }).then(() => {
            window.go('');
        });
        return;
    }

    loadStyles();
    await loadHosts();
    setupEventListeners();
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

// ============================================
// ðŸ“¥ CARGAR HOSTS DESDE FIRESTORE
// ============================================
async function loadHosts() {
    const tbody = document.getElementById('hostsTableBody');
    if (tbody) {
        tbody.innerHTML = '<tr><td colspan="8" class="loading-text">Cargando hosts...</td></tr>';
    }

    try {
        const allUsers = await userRepository.getAllUsers();
        console.log('ðŸ“Š Todos los usuarios:', allUsers);
        
        currentHosts = allUsers.filter(u => u.role === 'host');
        
        console.log(`ðŸ“Š ${currentHosts.length} hosts encontrados en Firestore`);
        renderHostsTable();
    } catch (error) {
        console.error('Error al cargar hosts:', error);
        if (tbody) {
            tbody.innerHTML = '<tr><td colspan="8" class="loading-text error">Error al cargar hosts</td></tr>';
        }
    }
}

// ============================================
// ðŸ–¼ï¸ RENDERIZAR TABLA DE HOSTS
// ============================================
function renderHostsTable() {
    const searchTerm = document.getElementById('searchHost')?.value.toLowerCase() || '';
    const tbody = document.getElementById('hostsTableBody');
    
    let filteredHosts = currentHosts.filter(host => 
        host.username?.toLowerCase().includes(searchTerm) ||
        host.email?.toLowerCase().includes(searchTerm)
    );
    
    if (!tbody) return;
    
    if (filteredHosts.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="loading-text">No hay hosts registrados</td></tr>';
        return;
    }
    
    tbody.innerHTML = filteredHosts.map(host => {
        const isActive = host.status === 'active';
        const statusText = isActive ? 'Activo' : 'Inactivo';
        const statusClass = isActive ? 'active' : 'inactive';
        
        return `
        <tr>
            <td>${host.id?.substring(0, 8) || host.uid?.substring(0, 8) || 'N/A'}</td>
            <td><i class="fas fa-user-circle"></i> ${escapeHtml(host.username || 'Sin nombre')}</td>
            <td>${escapeHtml(host.email || '')}</td>
            <td>${host.eventsCreated || 0}</td>
            <td>${host.totalAttendees || 0}</td>
            <td><span class="status-badge status-${statusClass}">${statusText}</span></td>
            <td>${host.createdAt ? new Date(host.createdAt).toLocaleDateString() : 'No registrado'}</td>
            <td class="actions-cell">
                <button class="btn-action view-host" data-id="${host.id || host.uid}" title="Ver detalles">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn-action edit-host" data-id="${host.id || host.uid}" title="Editar">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-action toggle-status" data-id="${host.id || host.uid}" data-status="${host.status}" title="${isActive ? 'Inhabilitar' : 'Habilitar'}">
                    <i class="fas ${isActive ? 'fa-ban' : 'fa-check-circle'}"></i>
                </button>
            </td>
        </tr>
    `}).join('');
    
    document.querySelectorAll('.view-host').forEach(btn => {
        btn.addEventListener('click', () => viewHost(btn.dataset.id));
    });
    document.querySelectorAll('.edit-host').forEach(btn => {
        btn.addEventListener('click', () => editHost(btn.dataset.id));
    });
    document.querySelectorAll('.toggle-status').forEach(btn => {
        btn.addEventListener('click', () => toggleHostStatus(btn.dataset.id, btn.dataset.status));
    });
}

// ============================================
// ðŸ”§ CONFIGURAR EVENTOS
// ============================================
function setupEventListeners() {
    document.getElementById('createHostBtn')?.addEventListener('click', () => {
        if (typeof window.navigateTo === 'function') {
            window.navigateTo('/sysadmin/hosts/create');
        } else {
            window.go('');
        }
    });
    
    document.getElementById('searchHost')?.addEventListener('input', () => renderHostsTable());
}

// ============================================
// ðŸ‘ï¸ VER HOST - REDIRIGE A PÃGINA DE DETALLES
// ============================================
function viewHost(hostId) {
    console.log('ðŸ” Ver detalles del host con ID:', hostId);
    
    if (!hostId) {
        console.error('âŒ ID de host no vÃ¡lido');
        Swal.fire({
            title: 'Error',
            text: 'ID de host no vÃ¡lido',
            icon: 'error',
            confirmButtonText: 'OK'
        });
        return;
    }
    
    const url = `/sysadmin/host-details?id=${hostId}`;
    console.log('ðŸ”€ Redirigiendo a:', url);
    
    if (typeof window.navigateTo === 'function') {
        window.navigateTo(url);
    } else {
        window.go(url);
    }
}

// ============================================
// âœï¸ EDITAR HOST
// ============================================
function editHost(hostId) {
    if (typeof window.navigateTo === 'function') {
        window.navigateTo(`/sysadmin/hosts/edit?id=${hostId}`);
    } else {
        window.go(`/sysadmin/hosts/edit?id=${hostId}`);
    }
}

// ============================================
// ðŸ”„ HABILITAR/INHABILITAR HOST
// ============================================
async function toggleHostStatus(hostId, currentStatus) {
    try {
        console.log('ðŸ”„ Cambiando estado del host:', hostId, 'Estado actual:', currentStatus);
        
        if (!hostId) {
            Swal.fire({
                title: 'Error',
                text: 'ID de host no vÃ¡lido',
                icon: 'error',
                confirmButtonText: 'OK'
            });
            return;
        }

        const host = await userRepository.getById(hostId);
        if (!host) {
            Swal.fire({
                title: 'Error',
                text: 'Host no encontrado',
                icon: 'error',
                confirmButtonText: 'OK'
            });
            return;
        }

        const isActive = currentStatus === 'active';
        const newStatus = isActive ? 'inactive' : 'active';
        const actionText = isActive ? 'inhabilitar' : 'habilitar';
        const actionEmoji = isActive ? 'ðŸš«' : 'âœ…';

        const result = await Swal.fire({
            title: `${actionEmoji} Â¿${actionText.charAt(0).toUpperCase() + actionText.slice(1)} Host?`,
            text: `Â¿EstÃ¡s seguro de ${actionText} al host "${host.username}"?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: `SÃ­, ${actionText}`,
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            Swal.fire({
                title: 'Actualizando...',
                text: 'Por favor espera',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            // ðŸ”¥ ACTUALIZAR ESTADO EN FIRESTORE
            host.status = newStatus;
            host.updatedAt = new Date();
            await userRepository.update(host);
            
            console.log(`âœ… Host ${host.username} ${actionText}do correctamente`);
            
            Swal.close();
            
            await Swal.fire({
                title: 'Â¡Actualizado!',
                text: `El host ha sido ${actionText}do correctamente`,
                icon: 'success',
                confirmButtonText: 'OK'
            });
            
            // ðŸ”¥ RECARGAR LISTA
            await loadHosts();
        }
    } catch (error) {
        Swal.close();
        console.error('Error al cambiar estado del host:', error);
        Swal.fire({
            title: 'Error',
            text: 'No se pudo cambiar el estado del host: ' + error.message,
            icon: 'error',
            confirmButtonText: 'OK'
        });
    }
}

// ============================================
// ðŸ”§ UTILIDADES
// ============================================
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

export default crudHostController;
