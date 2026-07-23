// src/modules/sysadmin/adminForm/adminFormController.js
import { userService } from '../../../services/userService.js';
import { userRepository } from '../../../repositories/userRepository.js';

export async function adminFormController() {
    console.log('ðŸ”¥ Admin Form Controller iniciado');

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
    setupForm();
    setupDelegation();
}

function loadStyles() {
    const styles = [
        { href: '/src/css/components/adminForm.css', id: 'admin-form-style' }
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

function setupForm() {
    const adminForm = document.getElementById('adminForm');
    if (adminForm) {
        adminForm.addEventListener('submit', saveAdmin);
        console.log('âœ… Event listener agregado al formulario');
    }
}

// ============================================
// ðŸ”¥ DELEGACIÃ“N DE EVENTOS
// ============================================
function setupDelegation() {
    console.log('ðŸ”§ Configurando delegaciÃ³n de eventos...');
    
    document.removeEventListener('click', handleDocumentClick);
    document.addEventListener('click', handleDocumentClick);
    
    console.log('âœ… DelegaciÃ³n de eventos configurada');
}

function handleDocumentClick(e) {
    // ðŸ”¥ BOTÃ“N VOLVER
    const btnVolver = e.target.closest('#btnVolver');
    if (btnVolver) {
        e.preventDefault();
        e.stopPropagation();
        console.log('ðŸ”™ Click en Volver (delegaciÃ³n)');
        
        Swal.fire({
            title: 'Â¿Cancelar creaciÃ³n?',
            text: 'Â¿EstÃ¡s seguro de que quieres salir? Los datos no guardados se perderÃ¡n.',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#ff007a',
            cancelButtonColor: '#4db8ff',
            confirmButtonText: 'SÃ­, salir',
            cancelButtonText: 'Continuar'
        }).then((result) => {
            if (result.isConfirmed) {
                if (typeof window.navigateTo === 'function') {
                    window.navigateTo('/sysadmin/admins');
                } else {
                    window.go('');
                }
            }
        });
        return;
    }
}

async function saveAdmin(e) {
    e.preventDefault();
    
    const username = document.getElementById('adminUsername')?.value.trim();
    const email = document.getElementById('adminEmail')?.value.trim();
    const password = document.getElementById('adminPassword')?.value;
    const phone = document.getElementById('adminPhone')?.value.trim();
    const department = document.getElementById('adminDepartment')?.value.trim();
    const status = document.getElementById('adminStatus')?.value;
    const notes = document.getElementById('adminNotes')?.value.trim();
    
    console.log('ðŸ“ Datos del formulario:', { username, email, password, phone, department, status, notes });
    
    if (!username || !email) {
        await Swal.fire({
            title: 'Campos requeridos',
            text: 'Por favor completa el nombre de usuario y email',
            icon: 'warning',
            confirmButtonText: 'OK'
        });
        return;
    }
    
    if (!password || password.length < 6) {
        await Swal.fire({
            title: 'ContraseÃ±a invÃ¡lida',
            text: 'La contraseÃ±a debe tener al menos 6 caracteres',
            icon: 'warning',
            confirmButtonText: 'OK'
        });
        return;
    }
    
    try {
        const existingUser = await userRepository.getByEmail(email);
        if (existingUser) {
            await Swal.fire({
                title: 'Email duplicado',
                text: 'Ya existe un usuario con este correo electrÃ³nico',
                icon: 'error',
                confirmButtonText: 'OK'
            });
            return;
        }
    } catch (error) {
        console.error('Error al verificar email:', error);
    }
    
    Swal.fire({
        title: 'Creando administrador...',
        text: 'Por favor espera',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });
    
    try {
        const result = await userService.crearUsuarioAdmin({
            username,
            email,
            password,
            phone: phone || '',
            department: department || '',
            status: status || 'active',
            notes: notes || ''
        });
        
        Swal.close();
        
        if (result.success) {
            await Swal.fire({
                title: 'Â¡Creado!',
                text: `El administrador "${result.user.username}" ha sido creado correctamente`,
                icon: 'success',
                confirmButtonText: 'OK'
            });
            
            if (typeof window.navigateTo === 'function') {
                window.navigateTo('/sysadmin/admins');
            } else {
                window.go('');
            }
        } else {
            await Swal.fire({
                title: 'Error',
                text: result.error || 'Error al crear el administrador',
                icon: 'error',
                confirmButtonText: 'OK'
            });
        }
    } catch (error) {
        Swal.close();
        console.error('âŒ Error al crear administrador:', error);
        await Swal.fire({
            title: 'Error',
            text: error.message || 'OcurriÃ³ un error al crear el administrador',
            icon: 'error',
            confirmButtonText: 'OK'
        });
    }
}

export default adminFormController;
