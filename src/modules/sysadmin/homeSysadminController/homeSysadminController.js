// src/modules/sysadmin/homeSysadminController/homeSysadminController.js
import { userService } from '../../../services/userService.js';
import { userRepository } from '../../../repositories/userRepository.js';
import { eventService } from '../../../services/eventService.js';

export async function homeSysadminController() {
    console.log('ðŸ”¥ Home Sysadmin Controller iniciado');

    // Verificar autenticaciÃ³n
    if (!userService.isAuthenticated()) {
        console.warn('âš ï¸ Usuario no autenticado');
        window.go('');
        return;
    }

    const user = userService.getCurrentUser();
    
    // Verificar que sea admin
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

    // Cargar estilos
    loadStyles();
    
    // Cargar datos desde Firestore
    await loadRecentUsers();
    await loadRolesDistribution();
}

// Cargar estilos necesarios
function loadStyles() {
    const styles = [
        { href: '/src/css/components/homeSysadmin.css', id: 'home-sysadmin-style' }
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
// ðŸ“¥ CARGAR USUARIOS RECIENTES (CUENTAS NUEVAS)
// ============================================
async function loadRecentUsers() {
    const container = document.getElementById('recentUsers');
    if (!container) return;

    try {
        // Obtener todos los usuarios de Firestore
        const users = await userRepository.getAllUsers();
        
        if (!users || users.length === 0) {
            container.innerHTML = `
                <div class="activity-item">
                    <div class="activity-icon">
                        <i class="fas fa-user-plus"></i>
                    </div>
                    <div class="activity-detail">
                        <div class="activity-message">No hay usuarios registrados</div>
                    </div>
                </div>
            `;
            return;
        }

        // Ordenar por fecha de creaciÃ³n (mÃ¡s recientes primero)
        const sortedUsers = users.sort((a, b) => {
            const dateA = new Date(a.createdAt);
            const dateB = new Date(b.createdAt);
            return dateB - dateA;
        });

        // Tomar los 8 mÃ¡s recientes
        const recentUsers = sortedUsers.slice(0, 8);

        container.innerHTML = recentUsers.map(user => {
            const fecha = user.createdAt ? new Date(user.createdAt).toLocaleDateString('es-ES', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            }) : 'Fecha desconocida';

            const rolIcon = user.role === 'sysadmin' ? 'fa-shield-alt' : 
                           user.role === 'host' ? 'fa-calendar-plus' : 'fa-user';
            
            const rolNombre = user.role === 'sysadmin' ? 'Administrador' : 
                             user.role === 'host' ? 'Host' : 'Usuario';

            return `
                <div class="activity-item">
                    <div class="activity-icon">
                        <i class="fas ${rolIcon}"></i>
                    </div>
                    <div class="activity-detail">
                        <div class="activity-message">
                            <strong>${escapeHtml(user.username || 'Usuario')}</strong> 
                            <span style="color: rgba(255,255,255,0.5); font-size: 0.8rem;">
                                (${rolNombre})
                            </span>
                            <br>
                            <small style="color: rgba(255,255,255,0.4); font-size: 0.7rem;">
                                <i class="fas fa-envelope"></i> ${escapeHtml(user.email || '')}
                            </small>
                        </div>
                        <div class="activity-time">
                            <i class="fas fa-calendar-alt"></i> Se uniÃ³ el ${fecha}
                        </div>
                    </div>
                </div>
            `;
        }).join('');

    } catch (error) {
        console.error('âŒ Error al cargar usuarios recientes:', error);
        container.innerHTML = `
            <div class="activity-item">
                <div class="activity-icon">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
                <div class="activity-detail">
                    <div class="activity-message" style="color: #ff007a;">
                        Error al cargar usuarios
                    </div>
                </div>
            </div>
        `;
    }
}

// ============================================
// ðŸ“Š CARGAR DISTRIBUCIÃ“N DE USUARIOS (SOLO HOSTS Y ADMINS)
// ============================================
async function loadRolesDistribution() {
    try {
        // Obtener todos los usuarios
        const users = await userRepository.getAllUsers();
        
        if (!users) {
            console.warn('âš ï¸ No se pudieron obtener usuarios');
            return;
        }

        // Contar solo admins y hosts
        const adminCount = users.filter(u => u.role === 'sysadmin').length;
        const hostCount = users.filter(u => u.role === 'host').length;

        const adminEl = document.getElementById('adminCount');
        const hostEl = document.getElementById('hostCount');

        if (adminEl) adminEl.textContent = adminCount;
        if (hostEl) hostEl.textContent = hostCount;

        console.log(`ðŸ“Š Administradores: ${adminCount}, Hosts: ${hostCount}`);

    } catch (error) {
        console.error('âŒ Error al cargar distribuciÃ³n de roles:', error);
    }
}

// ============================================
// ðŸ”§ UTILIDADES
// ============================================
function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

export default homeSysadminController;
