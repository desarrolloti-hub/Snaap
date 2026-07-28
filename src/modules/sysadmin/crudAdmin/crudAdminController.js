// src/modules/sysadmin/crudAdmin/crudAdminController.js
import { userService } from '../../../services/userService.js';
import { userRepository } from '../../../repositories/userRepository.js';

let isInitialized = false;

// ============================================
// 🧭 NAVEGACIÓN
// ============================================
const navigateTo = (path) => {
    if (typeof window.navigateTo === 'function') {
        window.navigateTo(path);
    } else {
        window.location.href = path;
    }
};

export async function crudAdminController() {
    console.log('🔥 CRUD Admin Controller iniciado');

    if (isInitialized) {
        console.log('⏭️ Controlador ya inicializado');
        return;
    }

    if (!userService.isAuthenticated()) {
        console.warn('⚠️ Usuario no autenticado');
        navigateTo('/login');
        return;
    }

    const user = userService.getCurrentUser();
    
    if (user.role !== 'sysadmin') {
        await Swal.fire({
            title: 'Acceso Denegado',
            text: 'No tienes permisos de administrador',
            icon: 'error',
            confirmButtonText: 'Entendido'
        });
        navigateTo('/');
        return;
    }

    isInitialized = true;
    loadStyles();
    await loadAdmins();
    setupDelegation();
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

// ============================================
// 📥 CARGAR ADMINS DESDE FIRESTORE
// ============================================
async function loadAdmins() {
    const tbody = document.getElementById('adminsTableBody');
    if (tbody) {
        tbody.innerHTML = '<tr><td colspan="8" class="loading-text">Cargando administradores...</td></tr>';
    }

    try {
        const allUsers = await userRepository.getAllUsers();
        currentAdmins = allUsers.filter(u => u.role === 'sysadmin');
        renderAdminsTable();
    } catch (error) {
        console.error('Error al cargar administradores:', error);
        if (tbody) {
            tbody.innerHTML = '<tr><td colspan="8" class="loading-text error">Error al cargar administradores</td></tr>';
        }
    }
}

// ============================================
// 🖼️ RENDERIZAR TABLA DE ADMINS
// ============================================
function renderAdminsTable() {
    const searchTerm = document.getElementById('searchAdmin')?.value.toLowerCase() || '';
    const tbody = document.getElementById('adminsTableBody');
    
    let filteredAdmins = currentAdmins.filter(admin => 
        admin.username?.toLowerCase().includes(searchTerm) ||
        admin.email?.toLowerCase().includes(searchTerm)
    );
    
    if (!tbody) return;
    
    if (filteredAdmins.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="loading-text">No hay administradores registrados</td></tr>';
        return;
    }
    
    tbody.innerHTML = filteredAdmins.map(admin => {
        const isActive = admin.status === 'active';
        const statusText = isActive ? 'Activo' : 'Inactivo';
        const statusClass = isActive ? 'active' : 'inactive';
        
        return `
        <tr>
            <td>${admin.id?.substring(0, 8) || admin.uid?.substring(0, 8) || 'N/A'}</td>
            <td><i class="fas fa-shield-alt"></i> ${escapeHtml(admin.username || 'Sin nombre')}</td>
            <td>${escapeHtml(admin.email || '')}</td>
            <td>${admin.eventsCreated || 0}</td>
            <td>${admin.totalAttendees || 0}</td>
            <td><span class="status-badge status-${statusClass}">${statusText}</span></td>
            <td>${admin.createdAt ? new Date(admin.createdAt).toLocaleDateString() : 'No registrado'}</td>
            <td class="actions-cell">
                <button class="btn-action view-admin" data-id="${admin.id || admin.uid}" title="Ver detalles">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn-action edit-admin" data-id="${admin.id || admin.uid}" title="Editar">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-action toggle-status" data-id="${admin.id || admin.uid}" data-status="${admin.status}" title="${isActive ? 'Inhabilitar' : 'Habilitar'}">
                    <i class="fas ${isActive ? 'fa-ban' : 'fa-check-circle'}"></i>
                </button>
            </td>
        </tr>
    `}).join('');
}

// ============================================
// 🔥 DELEGACIÓN DE EVENTOS PARA BOTONES DE ACCIÓN
// ============================================
function setupDelegation() {
    console.log('🔧 Configurando delegación de eventos...');
    
    document.removeEventListener('click', handleDocumentClick);
    document.addEventListener('click', handleDocumentClick);
    
    const searchAdmin = document.getElementById('searchAdmin');
    if (searchAdmin) {
        const newSearch = searchAdmin.cloneNode(true);
        searchAdmin.parentNode.replaceChild(newSearch, searchAdmin);
        newSearch.addEventListener('input', () => renderAdminsTable());
        console.log('✅ Event listener agregado al buscador');
    }
    
    console.log('✅ Delegación de eventos configurada');
}

// ============================================
// 🖱️ MANEJADOR DE CLICKS POR DELEGACIÓN
// ============================================
function handleDocumentClick(e) {
    const viewBtn = e.target.closest('.view-admin');
    if (viewBtn) {
        e.preventDefault();
        e.stopPropagation();
        const id = viewBtn.dataset.id;
        console.log('👁️ Ver admin:', id);
        viewAdmin(id);
        return;
    }
    
    const editBtn = e.target.closest('.edit-admin');
    if (editBtn) {
        e.preventDefault();
        e.stopPropagation();
        const id = editBtn.dataset.id;
        console.log('✏️ Editar admin:', id);
        editAdmin(id);
        return;
    }
    
    const toggleBtn = e.target.closest('.toggle-status');
    if (toggleBtn) {
        e.preventDefault();
        e.stopPropagation();
        const id = toggleBtn.dataset.id;
        const status = toggleBtn.dataset.status;
        console.log('🔄 Toggle admin:', id, status);
        toggleAdminStatus(id, status);
        return;
    }
}

// ============================================
// 👁️ VER ADMIN
// ============================================
function viewAdmin(adminId) {
    if (!adminId) {
        Swal.fire({
            title: 'Error',
            text: 'ID de administrador no válido',
            icon: 'error',
            confirmButtonText: 'Entendido'
        });
        return;
    }
    localStorage.setItem('adminDetailId', adminId);
    navigateTo(`/sysadmin/admin-details?id=${adminId}`);
}

// ============================================
// ✏️ EDITAR ADMIN
// ============================================
function editAdmin(adminId) {
    navigateTo(`/sysadmin/admins/edit?id=${adminId}`);
}

// ============================================
// 🔄 HABILITAR/INHABILITAR ADMIN
// ============================================
async function toggleAdminStatus(adminId, currentStatus) {
    try {
        if (!adminId) {
            await Swal.fire({
                title: 'Error',
                text: 'ID de administrador no válido',
                icon: 'error',
                confirmButtonText: 'Entendido'
            });
            return;
        }

        const admin = await userRepository.getById(adminId);
        if (!admin) {
            await Swal.fire({
                title: 'Error',
                text: 'Administrador no encontrado',
                icon: 'error',
                confirmButtonText: 'Entendido'
            });
            return;
        }

        const currentUser = userService.getCurrentUser();
        if (currentUser && currentUser.id === adminId) {
            await Swal.fire({
                title: 'Acción no permitida',
                text: 'No puedes inhabilitar tu propia cuenta',
                icon: 'warning',
                confirmButtonText: 'Entendido'
            });
            return;
        }

        const isActive = currentStatus === 'active';
        const newStatus = isActive ? 'inactive' : 'active';
        const actionText = isActive ? 'inhabilitar' : 'habilitar';
        const actionEmoji = isActive ? '🚫' : '✅';

        const result = await Swal.fire({
            title: `${actionEmoji} ¿${actionText.charAt(0).toUpperCase() + actionText.slice(1)} Administrador?`,
            text: `¿Estás seguro de ${actionText} al administrador "${admin.username}"?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: `Sí, ${actionText}`,
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#4db8ff',
            cancelButtonColor: '#ff007a'
        });

        if (result.isConfirmed) {
            Swal.fire({
                title: 'Actualizando...',
                text: 'Por favor espera un momento.',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            admin.status = newStatus;
            admin.updatedAt = new Date();
            await userRepository.update(admin);
            
            Swal.close();
            
            await Swal.fire({
                title: '¡Actualizado!',
                text: `El administrador ha sido ${actionText}do correctamente`,
                icon: 'success',
                confirmButtonText: 'OK'
            });
            
            await loadAdmins();
        }
    } catch (error) {
        Swal.close();
        console.error('Error:', error);
        await Swal.fire({
            title: 'Error',
            text: 'No se pudo cambiar el estado: ' + error.message,
            icon: 'error',
            confirmButtonText: 'Entendido'
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

export default crudAdminController;