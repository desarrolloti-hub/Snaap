// src/modules/sysadmin/crudAdmin/crudAdminController.js
import { userService } from '../../../services/userService.js';
import { userRepository } from '../../../repositories/userRepository.js';

// ✅ Variable para evitar ejecuciones múltiples
let isInitialized = false;

export async function crudAdminController() {
    console.log('🔥 CRUD Admin Controller iniciado');

    // ✅ Evitar ejecuciones múltiples
    if (isInitialized) {
        console.log('⏭️ Controlador ya inicializado');
        return;
    }

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

    isInitialized = true;
    loadStyles();
    await loadAdmins();
    setupEventListeners();
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
    
    // ✅ NO AGREGAR EVENT LISTENERS DIRECTOS AQUÍ
    // Los eventos se manejan por delegación en setupEventListeners
}

// ============================================
// 🔧 CONFIGURAR EVENTOS CON DELEGACIÓN
// ============================================
function setupEventListeners() {
    console.log('🔧 Configurando event listeners con delegación...');
    
    // 🔥 BOTÓN CREAR ADMINISTRADOR - Evento directo
    const createAdminBtn = document.getElementById('createAdminBtn');
    if (createAdminBtn) {
        // Clonar para eliminar listeners anteriores
        const newBtn = createAdminBtn.cloneNode(true);
        createAdminBtn.parentNode.replaceChild(newBtn, createAdminBtn);
        
        newBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('🖱️ Click en Nuevo Administrador');
            window.location.href = '/sysadmin/admins/create';
        });
    }
    
    // 🔥 BUSCADOR
    const searchAdmin = document.getElementById('searchAdmin');
    if (searchAdmin) {
        const newSearch = searchAdmin.cloneNode(true);
        searchAdmin.parentNode.replaceChild(newSearch, searchAdmin);
        newSearch.addEventListener('input', () => renderAdminsTable());
    }
    
    // 🔥 DELEGACIÓN DE EVENTOS PARA LOS BOTONES DE ACCIÓN
    // El event listener se pone en el tbody, que siempre existe
    const tbody = document.getElementById('adminsTableBody');
    if (tbody) {
        // Clonar para eliminar listeners anteriores
        const newTbody = tbody.cloneNode(true);
        tbody.parentNode.replaceChild(newTbody, tbody);
        
        newTbody.addEventListener('click', function(e) {
            // Ver detalles
            const viewBtn = e.target.closest('.view-admin');
            if (viewBtn) {
                e.preventDefault();
                const id = viewBtn.dataset.id;
                console.log('👁️ Ver admin:', id);
                viewAdmin(id);
                return;
            }
            
            // Editar
            const editBtn = e.target.closest('.edit-admin');
            if (editBtn) {
                e.preventDefault();
                const id = editBtn.dataset.id;
                console.log('✏️ Editar admin:', id);
                editAdmin(id);
                return;
            }
            
            // Habilitar/Inhabilitar
            const toggleBtn = e.target.closest('.toggle-status');
            if (toggleBtn) {
                e.preventDefault();
                const id = toggleBtn.dataset.id;
                const status = toggleBtn.dataset.status;
                console.log('🔄 Toggle admin:', id, status);
                toggleAdminStatus(id, status);
                return;
            }
        });
        console.log('✅ Delegación de eventos configurada');
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
            confirmButtonText: 'OK'
        });
        return;
    }
    localStorage.setItem('adminDetailId', adminId);
    window.location.href = `/sysadmin/admin-details?id=${adminId}`;
}

// ============================================
// ✏️ EDITAR ADMIN
// ============================================
function editAdmin(adminId) {
    window.location.href = `/sysadmin/admins/edit?id=${adminId}`;
}

// ============================================
// 🔄 HABILITAR/INHABILITAR ADMIN
// ============================================
async function toggleAdminStatus(adminId, currentStatus) {
    try {
        if (!adminId) {
            Swal.fire({
                title: 'Error',
                text: 'ID de administrador no válido',
                icon: 'error',
                confirmButtonText: 'OK'
            });
            return;
        }

        const admin = await userRepository.getById(adminId);
        if (!admin) {
            Swal.fire({
                title: 'Error',
                text: 'Administrador no encontrado',
                icon: 'error',
                confirmButtonText: 'OK'
            });
            return;
        }

        const currentUser = userService.getCurrentUser();
        if (currentUser && currentUser.id === adminId) {
            Swal.fire({
                title: 'Acción no permitida',
                text: 'No puedes inhabilitar tu propia cuenta',
                icon: 'warning',
                confirmButtonText: 'OK'
            });
            return;
        }

        const isActive = currentStatus === 'active';
        const newStatus = isActive ? 'inactive' : 'active';
        const actionText = isActive ? 'inhabilitar' : 'habilitar';

        const result = await Swal.fire({
            title: `${isActive ? '🚫' : '✅'} ¿${actionText.charAt(0).toUpperCase() + actionText.slice(1)} Administrador?`,
            text: `¿Estás seguro de ${actionText} al administrador "${admin.username}"?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#ff007a',
            cancelButtonColor: '#4db8ff',
            confirmButtonText: `Sí, ${actionText}`,
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
        Swal.fire({
            title: 'Error',
            text: 'No se pudo cambiar el estado: ' + error.message,
            icon: 'error',
            confirmButtonText: 'OK'
        });
    }
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