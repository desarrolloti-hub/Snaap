// src/modules/sysadmin/hostDetails/hostDetailsController.js
import { userService } from '../../../services/userService.js';
import { userRepository } from '../../../repositories/userRepository.js';

let currentHostId = null;

export async function hostDetailsController() {
    console.log('🔥 Host Details Controller iniciado');

    // Verificar autenticación
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

    // Obtener ID del host desde la URL
    const urlParams = new URLSearchParams(window.location.search);
    const hostId = urlParams.get('id');
    
    console.log('🔍 ID del host desde URL:', hostId);
    
    if (!hostId) {
        Swal.fire({
            title: 'Error',
            text: 'No se especificó qué host ver',
            icon: 'error',
            confirmButtonText: 'OK'
        }).then(() => {
            window.location.href = '/sysadmin/hosts';
        });
        return;
    }

    currentHostId = hostId;
    
    // Cargar datos del host
    await loadHostDetails(hostId);
    
    // Configurar eventos
    setupEventListeners();
}

// ============================================
// 📥 CARGAR DETALLES DEL HOST
// ============================================
async function loadHostDetails(hostId) {
    const card = document.getElementById('hostDetailsCard');
    
    if (!card) {
        console.error('❌ No se encontró el elemento hostDetailsCard');
        return;
    }
    
    try {
        console.log('📥 Buscando host con ID:', hostId);
        
        // 🔥 Intentar obtener el host por ID
        const host = await userRepository.getById(hostId);
        
        console.log('📊 Host encontrado:', host);
        
        if (!host) {
            console.error('❌ Host no encontrado en Firestore');
            card.innerHTML = `
                <div class="details-loading" style="color: #ff007a;">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Host no encontrado</p>
                    <p style="font-size: 0.8rem; margin-top: 10px;">El host con ID ${hostId} no existe</p>
                </div>
            `;
            return;
        }

        // Verificar que sea un host
        if (host.role !== 'host') {
            console.warn('⚠️ El usuario no es un host, rol:', host.role);
            card.innerHTML = `
                <div class="details-loading" style="color: #ff007a;">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>El usuario no es un host</p>
                    <p style="font-size: 0.8rem; margin-top: 10px;">Rol actual: ${host.role}</p>
                </div>
            `;
            return;
        }

        console.log('✅ Host encontrado correctamente:', host.username);

        // Construir HTML con los detalles
        card.innerHTML = buildHostDetailsHTML(host);

        // Event listener para el botón de editar
        const btnEditar = document.getElementById('btnEditarHost');
        if (btnEditar) {
            btnEditar.addEventListener('click', () => {
                if (typeof window.navigateTo === 'function') {
                    window.navigateTo(`/sysadmin/hosts/edit?id=${currentHostId}`);
                } else {
                    window.location.href = `/sysadmin/hosts/edit?id=${currentHostId}`;
                }
            });
        }

    } catch (error) {
        console.error('❌ Error al cargar detalles del host:', error);
        card.innerHTML = `
            <div class="details-loading" style="color: #ff007a;">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Error al cargar los detalles del host</p>
                <p style="font-size: 0.8rem; margin-top: 10px;">${error.message}</p>
            </div>
        `;
    }
}

// ============================================
// 🏗️ CONSTRUIR HTML DE DETALLES
// ============================================
function buildHostDetailsHTML(host) {
    return `
        <div class="detail-content">
            <!-- Avatar -->
            <div class="detail-avatar">
                <i class="fas fa-user-circle"></i>
                <h2>${escapeHtml(host.username || 'Sin nombre')}</h2>
                <p class="detail-role"><i class="fas fa-certificate"></i> Host</p>
            </div>

            <!-- Grid de información -->
            <div class="detail-grid">
                <div class="detail-group">
                    <label><i class="fas fa-envelope"></i> Correo Electrónico</label>
                    <div class="detail-value"><strong>${escapeHtml(host.email || 'No registrado')}</strong></div>
                </div>
                <div class="detail-group">
                    <label><i class="fas fa-phone"></i> Teléfono</label>
                    <div class="detail-value">${host.phone || 'No registrado'}</div>
                </div>
                <div class="detail-group">
                    <label><i class="fas fa-building"></i> Empresa / Organización</label>
                    <div class="detail-value">${host.company || 'No registrada'}</div>
                </div>
                <div class="detail-group">
                    <label><i class="fas fa-toggle-on"></i> Estado</label>
                    <div class="detail-value">
                        <span class="status-badge status-${host.status || 'active'}">${getStatusText(host.status || 'active')}</span>
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
                    <div class="detail-value">${host.emailVerified ? '✅ Sí' : '❌ No'}</div>
                </div>
                <div class="detail-group">
                    <label><i class="fas fa-calendar-day"></i> Fecha de Registro</label>
                    <div class="detail-value">${host.createdAt ? new Date(host.createdAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }) : 'No registrado'}</div>
                </div>
                <div class="detail-group">
                    <label><i class="fas fa-clock"></i> Último Acceso</label>
                    <div class="detail-value">${host.lastLogin ? new Date(host.lastLogin).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Nunca'}</div>
                </div>
                ${host.bio ? `
                <div class="detail-group full-width">
                    <label><i class="fas fa-info-circle"></i> Biografía</label>
                    <div class="detail-value detail-bio">${escapeHtml(host.bio)}</div>
                </div>
                ` : ''}
                ${host.id ? `
                <div class="detail-group">
                    <label><i class="fas fa-id-card"></i> ID del Host</label>
                    <div class="detail-value" style="font-size: 0.75rem; color: rgba(255,255,255,0.5);">${host.id}</div>
                </div>
                ` : ''}
            </div>

            <!-- Acciones -->
            <div class="detail-actions">
                <button type="button" class="btn-edit-host" id="btnEditarHost">
                    <i class="fas fa-edit"></i> Editar Host
                </button>
            </div>
        </div>
    `;
}

// ============================================
// 🔧 CONFIGURAR EVENTOS
// ============================================
function setupEventListeners() {
    const btnVolver = document.getElementById('btnVolver');
    if (btnVolver) {
        btnVolver.addEventListener('click', () => {
            if (typeof window.navigateTo === 'function') {
                window.navigateTo('/sysadmin/hosts');
            } else {
                window.location.href = '/sysadmin/hosts';
            }
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

export default hostDetailsController;