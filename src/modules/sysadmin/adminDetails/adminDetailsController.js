// src/modules/sysadmin/adminDetails/adminDetailsController.js
import { userService } from '../../../services/userService.js';
import { userRepository } from '../../../repositories/userRepository.js';

let currentAdminId = null;

export async function adminDetailsController() {
    console.log('ðŸ”¥ Admin Details Controller iniciado');

    if (!userService.isAuthenticated()) {
        console.warn('âš ï¸ Usuario no autenticado');
        import('../../../utils/navigation.js').then(({ navigateOrHref }) => navigateOrHref('/login'));
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
            import('../../../utils/navigation.js').then(({ navigateOrHref }) => navigateOrHref('/'));
        });
        return;
    }

    let adminId = localStorage.getItem('adminDetailId');
    
    if (!adminId) {
        const urlParams = new URLSearchParams(window.location.search);
        adminId = urlParams.get('id');
        if (adminId) {
            localStorage.setItem('adminDetailId', adminId);
        }
    }
    
    if (!adminId) {
        Swal.fire({
            title: 'Error',
            text: 'No se especificÃ³ quÃ© administrador ver',
            icon: 'error',
            confirmButtonText: 'OK'
        }).then(() => {
            localStorage.removeItem('adminDetailId');
            window.go('');
        });
        return;
    }

    currentAdminId = adminId;
    
    await loadAdminDetails(adminId);
}

async function loadAdminDetails(adminId) {
    const card = document.getElementById('adminDetailsCard');
    
    if (!card) {
        console.error('âŒ No se encontrÃ³ el elemento adminDetailsCard');
        return;
    }
    
    try {
        const admin = await userRepository.getById(adminId);
        
        if (!admin) {
            card.innerHTML = `
                <div class="details-loading" style="color: #ff007a;">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Administrador no encontrado</p>
                </div>
            `;
            return;
        }

        if (admin.role !== 'sysadmin') {
            card.innerHTML = `
                <div class="details-loading" style="color: #ff007a;">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>El usuario no es un administrador</p>
                </div>
            `;
            return;
        }

        card.innerHTML = buildAdminDetailsHTML(admin);
        setupEventListeners();

    } catch (error) {
        console.error('âŒ Error al cargar detalles:', error);
        card.innerHTML = `
            <div class="details-loading" style="color: #ff007a;">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Error al cargar los detalles</p>
            </div>
        `;
    }
}

function buildAdminDetailsHTML(admin) {
    const isActive = admin.status === 'active';
    
    return `
        <div class="detail-content">
            <div class="detail-avatar">
                <i class="fas fa-user-shield"></i>
                <h2>${escapeHtml(admin.username || 'Sin nombre')}</h2>
                <p class="detail-role"><i class="fas fa-certificate"></i> Administrador</p>
            </div>

            <div class="detail-grid">
                <div class="detail-group">
                    <label><i class="fas fa-envelope"></i> Correo ElectrÃ³nico</label>
                    <div class="detail-value"><strong>${escapeHtml(admin.email || 'No registrado')}</strong></div>
                </div>
                <div class="detail-group">
                    <label><i class="fas fa-phone"></i> TelÃ©fono</label>
                    <div class="detail-value">${admin.phone || 'No registrado'}</div>
                </div>
                <div class="detail-group">
                    <label><i class="fas fa-building"></i> Departamento</label>
                    <div class="detail-value">${admin.department || admin.company || 'No registrado'}</div>
                </div>
                <div class="detail-group">
                    <label><i class="fas fa-toggle-on"></i> Estado</label>
                    <div class="detail-value">
                        <span class="status-badge status-${admin.status || 'active'}">${isActive ? 'Activo' : 'Inactivo'}</span>
                    </div>
                </div>
                <div class="detail-group">
                    <label><i class="fas fa-calendar-alt"></i> Eventos Gestionados</label>
                    <div class="detail-value"><strong>${admin.eventsCreated || 0}</strong></div>
                </div>
                <div class="detail-group">
                    <label><i class="fas fa-users"></i> Total Asistentes</label>
                    <div class="detail-value"><strong>${admin.totalAttendees || 0}</strong></div>
                </div>
                <div class="detail-group">
                    <label><i class="fas fa-check-circle"></i> Email Verificado</label>
                    <div class="detail-value">${admin.emailVerified ? 'âœ… SÃ­' : 'âŒ No'}</div>
                </div>
                <div class="detail-group">
                    <label><i class="fas fa-calendar-day"></i> Fecha de Registro</label>
                    <div class="detail-value">${admin.createdAt ? new Date(admin.createdAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }) : 'No registrado'}</div>
                </div>
                <div class="detail-group">
                    <label><i class="fas fa-clock"></i> Ãšltimo Acceso</label>
                    <div class="detail-value">${admin.lastLogin ? new Date(admin.lastLogin).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Nunca'}</div>
                </div>
                ${admin.notes || admin.bio ? `
                <div class="detail-group full-width">
                    <label><i class="fas fa-info-circle"></i> Notas</label>
                    <div class="detail-value detail-bio">${escapeHtml(admin.notes || admin.bio)}</div>
                </div>
                ` : ''}
            </div>

            <!-- ðŸ”¥ ACCIONES: BotÃ³n Volver y Editar juntos -->
            <div class="detail-actions">
                <button type="button" class="btn-back-detail" id="btnVolverDetail">
                    <i class="fas fa-arrow-left"></i> Volver
                </button>
                <button type="button" class="btn-edit-admin" id="btnEditarAdmin">
                    <i class="fas fa-edit"></i> Editar Administrador
                </button>
            </div>
        </div>
    `;
}

function setupEventListeners() {
    console.log('ðŸ”§ Configurando event listeners...');
    
    // ðŸ”¥ BOTÃ“N VOLVER (nuevo, junto a editar)
    const btnVolver = document.getElementById('btnVolverDetail');
    if (btnVolver) {
        const newBtn = btnVolver.cloneNode(true);
        btnVolver.parentNode.replaceChild(newBtn, btnVolver);
        
        newBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('ðŸ”™ Click en Volver');
            
            Swal.fire({
                title: 'Â¿Volver atrÃ¡s?',
                text: 'Â¿EstÃ¡s seguro de que quieres salir de los detalles?',
                icon: 'question',
                showCancelButton: true,
                confirmButtonColor: '#ff007a',
                cancelButtonColor: '#4db8ff',
                confirmButtonText: 'SÃ­, volver',
                cancelButtonText: 'Cancelar'
            }).then((result) => {
                if (result.isConfirmed) {
                    localStorage.removeItem('adminDetailId');
                            import('../../../utils/navigation.js').then(({ navigateOrHref }) => navigateOrHref('/sysadmin/admins'));
                }
            });
        });
        console.log('âœ… Event listener agregado al botÃ³n Volver');
    }
    
    // ðŸ”¥ BOTÃ“N EDITAR
    const btnEditar = document.getElementById('btnEditarAdmin');
    if (btnEditar) {
        const newBtn = btnEditar.cloneNode(true);
        btnEditar.parentNode.replaceChild(newBtn, btnEditar);
        
        newBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('âœï¸ Editar administrador:', currentAdminId);
        import('../../../utils/navigation.js').then(({ navigateOrHref }) => navigateOrHref(`/sysadmin/admins/edit?id=${currentAdminId}`));
        });
        console.log('âœ… Event listener agregado al botÃ³n Editar');
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

export default adminDetailsController;
