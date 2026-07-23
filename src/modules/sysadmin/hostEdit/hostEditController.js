// src/modules/sysadmin/hostEdit/hostEditController.js
import { userService } from '../../../services/userService.js';
import { userRepository } from '../../../repositories/userRepository.js';

export async function hostEditController() {
    console.log('ðŸ”¥ Host Edit Controller iniciado');

    // Verificar autenticaciÃ³n
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
    await loadHostData();
    setupForm();
}

let editingHostId = null;

function loadStyles() {
    const styles = [
        { href: '/src/css/components/hostEdit.css', id: 'host-edit-style' }
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
// ðŸ“¥ CARGAR DATOS DEL HOST DESDE FIRESTORE
// ============================================
async function loadHostData() {
    const urlParams = new URLSearchParams(window.location.search);
    const hostId = urlParams.get('id');
    
    if (!hostId) {
        Swal.fire({
            title: 'Error',
            text: 'No se especificÃ³ quÃ© host editar',
            icon: 'error',
            confirmButtonText: 'OK'
        }).then(() => {
            window.go('');
        });
        return;
    }
    
    editingHostId = hostId;
    
    Swal.fire({
        title: 'Cargando...',
        text: 'Por favor espera',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });
    
    try {
        const host = await userRepository.getById(hostId);
        Swal.close();
        
        if (!host) {
            Swal.fire({
                title: 'Error',
                text: 'El host no existe',
                icon: 'error',
                confirmButtonText: 'OK'
            }).then(() => {
                window.go('');
            });
            return;
        }
        
        document.getElementById('hostUsername').value = host.username || '';
        document.getElementById('hostEmail').value = host.email || '';
        document.getElementById('hostPhone').value = host.phone || '';
        document.getElementById('hostCompany').value = host.company || '';
        document.getElementById('hostStatus').value = host.status || 'active';
        document.getElementById('hostBio').value = host.bio || '';
        
        console.log('ðŸ“¥ Datos del host cargados:', host);
    } catch (error) {
        Swal.close();
        console.error('Error al cargar host:', error);
        Swal.fire({
            title: 'Error',
            text: 'No se pudo cargar el host',
            icon: 'error',
            confirmButtonText: 'OK'
        }).then(() => {
            window.go('');
        });
    }
}

function setupForm() {
    const backBtn = document.getElementById('backBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    const hostForm = document.getElementById('hostForm');
    
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            if (typeof window.navigateTo === 'function') {
                window.navigateTo('/sysadmin/hosts');
            } else {
                window.go('');
            }
        });
    }
    
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            if (typeof window.navigateTo === 'function') {
                window.navigateTo('/sysadmin/hosts');
            } else {
                window.go('');
            }
        });
    }
    
    if (hostForm) {
        hostForm.addEventListener('submit', saveHost);
    }
}

// ============================================
// ðŸ’¾ GUARDAR CAMBIOS EN FIRESTORE
// ============================================
async function saveHost(e) {
    e.preventDefault();
    
    const username = document.getElementById('hostUsername')?.value.trim();
    const email = document.getElementById('hostEmail')?.value.trim();
    const phone = document.getElementById('hostPhone')?.value.trim();
    const company = document.getElementById('hostCompany')?.value.trim();
    const status = document.getElementById('hostStatus')?.value;
    const bio = document.getElementById('hostBio')?.value.trim();
    const newPassword = document.getElementById('hostPassword')?.value;
    
    if (!username || !email) {
        await Swal.fire({
            title: 'Campos requeridos',
            text: 'Por favor completa el nombre de usuario y email',
            icon: 'warning',
            confirmButtonText: 'OK'
        });
        return;
    }
    
    Swal.fire({
        title: 'Actualizando...',
        text: 'Por favor espera',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });
    
    try {
        // ðŸ”¥ Obtener host actual
        const host = await userRepository.getById(editingHostId);
        if (!host) {
            Swal.close();
            Swal.fire({
                title: 'Error',
                text: 'Host no encontrado',
                icon: 'error',
                confirmButtonText: 'OK'
            });
            return;
        }
        
        // Actualizar campos
        host.username = username;
        host.email = email;
        host.phone = phone || host.phone;
        host.company = company || host.company;
        host.status = status || host.status;
        host.bio = bio || host.bio;
        host.updatedAt = new Date();
        
        await userRepository.update(host);
        Swal.close();
        
        await Swal.fire({
            title: 'Â¡Actualizado!',
            text: 'El host ha sido actualizado correctamente',
            icon: 'success',
            confirmButtonText: 'OK'
        });
        
        if (typeof window.navigateTo === 'function') {
            window.navigateTo('/sysadmin/hosts');
        } else {
            window.go('');
        }
    } catch (error) {
        Swal.close();
        console.error('Error al actualizar host:', error);
        Swal.fire({
            title: 'Error',
            text: 'No se pudo actualizar el host',
            icon: 'error',
            confirmButtonText: 'OK'
        });
    }
}

export default hostEditController;
