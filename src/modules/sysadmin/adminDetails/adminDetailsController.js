// src/modules/sysadmin/adminDetails/adminDetailsController.js
import { userService } from '../../../services/userService.js';
import { userRepository } from '../../../repositories/userRepository.js';

let currentAdminId = null;

export async function adminDetailsController() {
    console.log('🔥 Admin Details Controller iniciado');

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
            text: 'No se especificó qué administrador ver',
            icon: 'error',
            confirmButtonText: 'OK'
        }).then(() => {
            localStorage.removeItem('adminDetailId');
            window.location.href = '/sysadmin/admins';
        });
        return;
    }

    currentAdminId = adminId;
    
    await loadAdminDetails(adminId);
}

async function loadAdminDetails(adminId) {
    const card = document.getElementById('adminDetailsCard');
    
    if (!card) {
        console.error('❌ No se encontró el elemento adminDetailsCard');
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
        console.error('❌ Error al cargar detalles:', error);
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
                    <label><i class="fas fa-envelope"></i> Correo Electrónico</label>
                    <div class="detail-value"><strong>${escapeHtml(admin.email || 'No registrado')}</strong></div>
                </div>
                <div class="detail-group">
                    <label><i class="fas fa-phone"></i> Teléfono</label>
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
                    <div class="detail-value">${admin.emailVerified ? '✅ Sí' : '❌ No'}</div>
                </div>
                <div class="detail-group">
                    <label><i class="fas fa-calendar-day"></i> Fecha de Registro</label>
                    <div class="detail-value">${admin.createdAt ? new Date(admin.createdAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }) : 'No registrado'}</div>
                </div>
                <div class="detail-group">
                    <label><i class="fas fa-clock"></i> Último Acceso</label>
                    <div class="detail-value">${admin.lastLogin ? new Date(admin.lastLogin).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Nunca'}</div>
                </div>
                ${admin.notes || admin.bio ? `
                <div class="detail-group full-width">
                    <label><i class="fas fa-info-circle"></i> Notas</label>
                    <div class="detail-value detail-bio">${escapeHtml(admin.notes || admin.bio)}</div>
                </div>
                ` : ''}
            </div>

            <!-- 🔥 ACCIONES: Botón Volver y Editar juntos -->
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
    console.log('🔧 Configurando event listeners...');
    
    // 🔥 BOTÓN VOLVER (nuevo, junto a editar)
    const btnVolver = document.getElementById('btnVolverDetail');
    if (btnVolver) {
        const newBtn = btnVolver.cloneNode(true);
        btnVolver.parentNode.replaceChild(newBtn, btnVolver);
        
        newBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('🔙 Click en Volver');
            
            Swal.fire({
                title: '¿Volver atrás?',
                text: '¿Estás seguro de que quieres salir de los detalles?',
                icon: 'question',
                showCancelButton: true,
                confirmButtonColor: '#ff007a',
                cancelButtonColor: '#4db8ff',
                confirmButtonText: 'Sí, volver',
                cancelButtonText: 'Cancelar'
            }).then((result) => {
                if (result.isConfirmed) {
                    localStorage.removeItem('adminDetailId');
                    if (typeof window.navigateTo === 'function') {
                        window.navigateTo('/sysadmin/admins');
                    } else {
                        window.location.href = '/sysadmin/admins';
                    }
                }
            });
        });
        console.log('✅ Event listener agregado al botón Volver');
    }
    
    // 🔥 BOTÓN EDITAR
    const btnEditar = document.getElementById('btnEditarAdmin');
    if (btnEditar) {
        const newBtn = btnEditar.cloneNode(true);
        btnEditar.parentNode.replaceChild(newBtn, btnEditar);
        
        newBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('✏️ Editar administrador:', currentAdminId);
            window.location.href = `/sysadmin/admins/edit?id=${currentAdminId}`;
        });
        console.log('✅ Event listener agregado al botón Editar');
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