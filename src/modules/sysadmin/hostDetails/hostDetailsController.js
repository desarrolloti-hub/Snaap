// src/modules/sysadmin/hostDetails/hostDetailsController.js
import { userService } from '../../../services/userService.js';
import { userRepository } from '../../../repositories/userRepository.js';

let currentHostId = null;

export async function hostDetailsController() {
    console.log('ðŸ”¥ Host Details Controller iniciado');

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

    let hostId = localStorage.getItem('hostDetailId');
    
    if (!hostId) {
        const urlParams = new URLSearchParams(window.location.search);
        hostId = urlParams.get('id');
        if (hostId) {
            localStorage.setItem('hostDetailId', hostId);
        }
    }
    
    if (!hostId) {
        Swal.fire({
            title: 'Error',
            text: 'No se especificÃ³ quÃ© host ver',
            icon: 'error',
            confirmButtonText: 'OK'
        }).then(() => {
            localStorage.removeItem('hostDetailId');
            window.go('');
        });
        return;
    }

    currentHostId = hostId;
    
    await loadHostDetails(hostId);
    setupEventListeners();
}

async function loadHostDetails(hostId) {
    const card = document.getElementById('hostDetailsCard');
    
    if (!card) {
        console.error('âŒ No se encontrÃ³ el elemento hostDetailsCard');
        return;
    }
    
    try {
        const host = await userRepository.getById(hostId);
        
        if (!host) {
            card.innerHTML = `
                <div class="details-loading" style="color: #ff007a;">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Host no encontrado</p>
                </div>
            `;
            return;
        }

        if (host.role !== 'host') {
            card.innerHTML = `
                <div class="details-loading" style="color: #ff007a;">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>El usuario no es un host</p>
                </div>
            `;
            return;
        }

        card.innerHTML = buildHostDetailsHTML(host);
        setupDetailEvents(host);

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

function setupDetailEvents(host) {
    const btnEditar = document.getElementById('btnEditarHost');
    if (btnEditar) {
        const newBtn = btnEditar.cloneNode(true);
        btnEditar.parentNode.replaceChild(newBtn, btnEditar);
        
        newBtn.addEventListener('click', function() {
            console.log('âœï¸ Editar host:', currentHostId);
            window.go(`/sysadmin/hosts/edit?id=${currentHostId}`);
        });
    }
}

function buildHostDetailsHTML(host) {
    return `
        <div class="detail-content">
            <div class="detail-avatar">
                <i class="fas fa-user-circle"></i>
                <h2>${escapeHtml(host.username || 'Sin nombre')}</h2>
                <p class="detail-role"><i class="fas fa-certificate"></i> Host</p>
            </div>

            <div class="detail-grid">
                <div class="detail-group">
                    <label><i class="fas fa-envelope"></i> Correo ElectrÃ³nico</label>
                    <div class="detail-value"><strong>${escapeHtml(host.email || 'No registrado')}</strong></div>
                </div>
                <div class="detail-group">
                    <label><i class="fas fa-phone"></i> TelÃ©fono</label>
                    <div class="detail-value">${host.phone || 'No registrado'}</div>
                </div>
                <div class="detail-group">
                    <label><i class="fas fa-building"></i> Empresa</label>
                    <div class="detail-value">${host.company || 'No registrada'}</div>
                </div>
                <div class="detail-group">
                    <label><i class="fas fa-toggle-on"></i> Estado</label>
                    <div class="detail-value">
                        <span class="status-badge status-${host.status || 'active'}">${host.status === 'active' ? 'Activo' : 'Inactivo'}</span>
                    </div>
                </div>
                <div class="detail-group">
                    <label><i class="fas fa-calendar-alt"></i> Eventos Creados</label>
                    <div class="detail-value"><strong>${host.eventsCreated || 0}</strong></div>
                </div>
                <div class="detail-group">
                    <label><i class="fas fa-users"></i> Total Asistentes</label>
                    <div class="detail-value"><strong>${host.totalAttendees || 0}</strong></div>
                </div>
                <div class="detail-group">
                    <label><i class="fas fa-check-circle"></i> Email Verificado</label>
                    <div class="detail-value">${host.emailVerified ? 'âœ… SÃ­' : 'âŒ No'}</div>
                </div>
                <div class="detail-group">
                    <label><i class="fas fa-calendar-day"></i> Fecha de Registro</label>
                    <div class="detail-value">${host.createdAt ? new Date(host.createdAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }) : 'No registrado'}</div>
                </div>
                <div class="detail-group">
                    <label><i class="fas fa-clock"></i> Ãšltimo Acceso</label>
                    <div class="detail-value">${host.lastLogin ? new Date(host.lastLogin).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Nunca'}</div>
                </div>
                ${host.bio ? `
                <div class="detail-group full-width">
                    <label><i class="fas fa-info-circle"></i> BiografÃ­a</label>
                    <div class="detail-value detail-bio">${escapeHtml(host.bio)}</div>
                </div>
                ` : ''}
            </div>

            <div class="detail-actions">
                <button type="button" class="btn-edit-host" id="btnEditarHost">
                    <i class="fas fa-edit"></i> Editar Host
                </button>
            </div>
        </div>
    `;
}

// ============================================
// ðŸ”§ CONFIGURAR EVENTOS (BOTÃ“N VOLVER)
// ============================================
function setupEventListeners() {
    const btnVolver = document.getElementById('btnVolver');
    
    if (btnVolver) {
        const newBtn = btnVolver.cloneNode(true);
        btnVolver.parentNode.replaceChild(newBtn, btnVolver);
        
        newBtn.addEventListener('click', function(e) {
            e.preventDefault();
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
                    localStorage.removeItem('hostDetailId');
                    if (typeof window.navigateTo === 'function') {
                        window.navigateTo('/sysadmin/hosts');
                    } else {
                        window.go('');
                    }
                }
            });
        });
        console.log('âœ… Event listener agregado al botÃ³n Volver');
    } else {
        console.error('âŒ BotÃ³n Volver no encontrado');
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

export default hostDetailsController;
