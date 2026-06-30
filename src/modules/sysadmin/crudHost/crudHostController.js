// src/modules/sysadmin/crudHost/crudHostController.js
import { userService } from '../../../services/userService.js';
import { userRepository } from '../../../repositories/userRepository.js';

export async function crudHostController() {
    console.log('🔥 CRUD Host Controller iniciado');

    if (!userService.isAuthenticated()) {
        console.warn('⚠️ Usuario no autenticado');
        window.location.href = '/login';
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
            window.location.href = '/';
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
// 📥 CARGAR HOSTS DESDE FIRESTORE
// ============================================
async function loadHosts() {
    const tbody = document.getElementById('hostsTableBody');
    if (tbody) {
        tbody.innerHTML = '<tr><td colspan="8" class="loading-text">Cargando hosts...</td></tr>';
    }

    try {
        const allUsers = await userRepository.getAllUsers();
        console.log('📊 Todos los usuarios:', allUsers);
        
        currentHosts = allUsers.filter(u => u.role === 'host');
        
        console.log(`📊 ${currentHosts.length} hosts encontrados en Firestore`);
        renderHostsTable();
    } catch (error) {
        console.error('Error al cargar hosts:', error);
        if (tbody) {
            tbody.innerHTML = '<tr><td colspan="8" class="loading-text error">Error al cargar hosts</td></tr>';
        }
    }
}

// ============================================
// 🖼️ RENDERIZAR TABLA DE HOSTS
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
    
    tbody.innerHTML = filteredHosts.map(host => `
        <tr>
            <td>${host.id?.substring(0, 8) || host.uid?.substring(0, 8) || 'N/A'}</td>
            <td><i class="fas fa-user-circle"></i> ${escapeHtml(host.username || 'Sin nombre')}</td>
            <td>${escapeHtml(host.email || '')}</td>
            <td>${host.eventsCreated || 0}</td>
            <td>${host.totalAttendees || 0}</td>
            <td><span class="status-badge status-${host.status || 'active'}">${getStatusText(host.status || 'active')}</span></td>
            <td>${host.createdAt ? new Date(host.createdAt).toLocaleDateString() : 'No registrado'}</td>
            <td class="actions-cell">
                <!-- 🔥 Botón Ver - Redirige a host-details -->
                <button class="btn-action view-host" data-id="${host.id || host.uid}" title="Ver detalles">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn-action edit-host" data-id="${host.id || host.uid}" title="Editar">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-action delete-host" data-id="${host.id || host.uid}" title="Eliminar">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
    
    document.querySelectorAll('.view-host').forEach(btn => {
        btn.addEventListener('click', () => viewHost(btn.dataset.id));
    });
    document.querySelectorAll('.edit-host').forEach(btn => {
        btn.addEventListener('click', () => editHost(btn.dataset.id));
    });
    document.querySelectorAll('.delete-host').forEach(btn => {
        btn.addEventListener('click', () => deleteHost(btn.dataset.id));
    });
}

// ============================================
// 🔧 CONFIGURAR EVENTOS
// ============================================
function setupEventListeners() {
    document.getElementById('createHostBtn')?.addEventListener('click', () => {
        if (typeof window.navigateTo === 'function') {
            window.navigateTo('/sysadmin/hosts/create');
        } else {
            window.location.href = '/sysadmin/hosts/create';
        }
    });
    
    document.getElementById('searchHost')?.addEventListener('input', () => renderHostsTable());
}

// ============================================
// 👁️ VER HOST - REDIRIGE A PÁGINA DE DETALLES
// ============================================
function viewHost(hostId) {
    console.log('🔍 Ver detalles del host con ID:', hostId);
    
    if (!hostId) {
        console.error('❌ ID de host no válido');
        Swal.fire({
            title: 'Error',
            text: 'ID de host no válido',
            icon: 'error',
            confirmButtonText: 'OK'
        });
        return;
    }
    
    // 🔥 REDIRIGIR A LA PÁGINA DE DETALLES
    const url = `/sysadmin/host-details?id=${hostId}`;
    console.log('🔀 Redirigiendo a:', url);
    
    if (typeof window.navigateTo === 'function') {
        window.navigateTo(url);
    } else {
        window.location.href = url;
    }
}

// ============================================
// ✏️ EDITAR HOST
// ============================================
function editHost(hostId) {
    if (typeof window.navigateTo === 'function') {
        window.navigateTo(`/sysadmin/hosts/edit?id=${hostId}`);
    } else {
        window.location.href = `/sysadmin/hosts/edit?id=${hostId}`;
    }
}

// ============================================
// 🗑️ ELIMINAR HOST
// ============================================
async function deleteHost(hostId) {
    try {
        console.log('🔍 ID del host a eliminar:', hostId);
        
        if (!hostId) {
            Swal.fire({
                title: 'Error',
                text: 'ID de host no válido',
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
        
        const result = await Swal.fire({
            title: '¿Eliminar Host?',
            text: `¿Estás seguro de eliminar al host ${host.username}? Esta acción no se puede deshacer.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        });
        
        if (result.isConfirmed) {
            Swal.fire({
                title: 'Eliminando...',
                text: 'Por favor espera',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });
            
            await userRepository.delete(hostId);
            console.log('✅ Host eliminado correctamente');
            
            Swal.close();
            
            await Swal.fire({
                title: 'Eliminado',
                text: 'El host ha sido eliminado correctamente',
                icon: 'success',
                confirmButtonText: 'OK'
            });
            
            await loadHosts();
        }
    } catch (error) {
        Swal.close();
        console.error('Error al eliminar host:', error);
        Swal.fire({
            title: 'Error',
            text: 'No se pudo eliminar el host: ' + error.message,
            icon: 'error',
            confirmButtonText: 'OK'
        });
    }
}

// ============================================
// 🔧 UTILIDADES
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