﻿// src/modules/sysadmin/adminDetails/adminDetailsController.js
import { userService } from '../../../services/userService.js';
import { userRepository } from '../../../repositories/userRepository.js';

let currentAdminId = null;

export async function adminDetailsController() {
    console.log('🔥 Admin Details Controller iniciado');

    if (!userService.isAuthenticated()) {
        console.warn('⚠️ Usuario no autenticado');
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
            text: 'No se especificó qué administrador ver',
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

// ¡AQUÍ ESTÁ LA CORRECCIÓN! Eliminado el div.detail-content
function buildAdminDetailsHTML(admin) {
    const isActive = admin.status === 'active';
    
    return `
        <!-- CABECERA: Nombre grande y rol -->
        <div class="profile-header">
            <h2 class="profile-name">${escapeHtml(admin.username || 'Sin nombre')}</h2>
            <p class="profile-role"><i class="fas fa-certificate"></i> Administrador</p>
        </div>

        <!-- CUERPO: Lista vertical de datos -->
        <div class="details-body">
            
            <div class="detail-row">
                <span class="detail-label"><i class="fas fa-envelope"></i> Correo Electrónico</span>
                <span class="detail-value">${escapeHtml(admin.email || 'No registrado')}</span>
            </div>

            <div class="detail-row">
                <span class="detail-label"><i class="fas fa-phone"></i> Teléfono</span>
                <span class="detail-value">${admin.phone || 'No registrado'}</span>
            </div>

            <div class="detail-row">
                <span class="detail-label"><i class="fas fa-toggle-on"></i> Estado</span>
                <span class="detail-value">
                    <span class="status-badge status-${admin.status || 'active'}">${isActive ? 'Activo' : 'Inactivo'}</span>
                </span>
            </div>

            <div class="detail-row">
                <span class="detail-label"><i class="fas fa-check-circle"></i> Email Verificado</span>
                <span class="detail-value">${admin.emailVerified ? '✅ Sí' : '❌ No'}</span>
            </div>

            <div class="detail-row">
                <span class="detail-label"><i class="fas fa-calendar-day"></i> Fecha de Registro</span>
                <span class="detail-value">${admin.createdAt ? new Date(admin.createdAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }) : 'No registrado'}</span>
            </div>

            <div class="detail-row">
                <span class="detail-label"><i class="fas fa-clock"></i> Último Acceso</span>
                <span class="detail-value">${admin.lastLogin ? new Date(admin.lastLogin).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Nunca'}</span>
            </div>

            ${admin.notes || admin.bio ? `
            <div class="detail-row bio-row">
                <span class="detail-label"><i class="fas fa-info-circle"></i> Notas</span>
                <span class="detail-value">${escapeHtml(admin.notes || admin.bio)}</span>
            </div>
            ` : ''}
        </div>

        <!-- ACCIONES: Botones -->
        <div class="detail-actions">
            <button type="button" class="btn-back-detail" id="btnVolverDetail">
                <i class="fas fa-arrow-left"></i> Volver
            </button>
            <button type="button" class="btn-edit-admin" id="btnEditarAdmin">
                <i class="fas fa-edit"></i> Editar Administrador
            </button>
        </div>
    `;
}

function setupEventListeners() {
    console.log('🔧 Configurando event listeners...');
    
    // BOTÓN VOLVER
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
                            import('../../../utils/navigation.js').then(({ navigateOrHref }) => navigateOrHref('/sysadmin/admins'));
                }
            });
        });
        console.log('✅ Event listener agregado al botón Volver');
    }
    
    // BOTÓN EDITAR
    const btnEditar = document.getElementById('btnEditarAdmin');
    if (btnEditar) {
        const newBtn = btnEditar.cloneNode(true);
        btnEditar.parentNode.replaceChild(newBtn, btnEditar);
        
        newBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('✏️ Editar administrador:', currentAdminId);
        import('../../../utils/navigation.js').then(({ navigateOrHref }) => navigateOrHref(`/sysadmin/admins/edit?id=${currentAdminId}`));
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