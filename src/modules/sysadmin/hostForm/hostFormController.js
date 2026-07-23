// src/modules/sysadmin/hostForm/hostFormController.js
import { userService } from '../../../services/userService.js';
import { userRepository } from '../../../repositories/userRepository.js';
import { hostService } from '../../../services/hostService.js';

// âœ… EXPORTACIÃ“N CORRECTA
export async function hostFormController() {
    console.log('ðŸ”¥ Host Form Controller iniciado');

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
}

function loadStyles() {
    const styles = [
        { href: '/src/css/components/hostForm.css', id: 'host-form-style' }
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
    const backBtn = document.getElementById('backBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    const hostForm = document.getElementById('hostForm');
    
    // ðŸ”¥ CONFIRMACIÃ“N PARA VOLVER
    if (backBtn) {
        // Eliminar event listeners anteriores clonando el botÃ³n
        const newBackBtn = backBtn.cloneNode(true);
        backBtn.parentNode.replaceChild(newBackBtn, backBtn);
        
        newBackBtn.addEventListener('click', () => {
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
                        window.navigateTo('/sysadmin/hosts');
                    } else {
                        window.go('');
                    }
                }
            });
        });
    }
    
    // ðŸ”¥ CONFIRMACIÃ“N PARA CANCELAR
    if (cancelBtn) {
        const newCancelBtn = cancelBtn.cloneNode(true);
        cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);
        
        newCancelBtn.addEventListener('click', () => {
            Swal.fire({
                title: 'Â¿Cancelar creaciÃ³n?',
                text: 'Â¿EstÃ¡s seguro de que quieres cancelar? Los datos no guardados se perderÃ¡n.',
                icon: 'question',
                showCancelButton: true,
                confirmButtonColor: '#ff007a',
                cancelButtonColor: '#4db8ff',
                confirmButtonText: 'SÃ­, cancelar',
                cancelButtonText: 'Continuar'
            }).then((result) => {
                if (result.isConfirmed) {
                    if (typeof window.navigateTo === 'function') {
                        window.navigateTo('/sysadmin/hosts');
                    } else {
                        window.go('');
                    }
                }
            });
        });
    }
    
    if (hostForm) {
        // Eliminar event listeners anteriores del formulario
        const newForm = hostForm.cloneNode(true);
        hostForm.parentNode.replaceChild(newForm, hostForm);
        newForm.addEventListener('submit', saveHost);
    }
}

async function saveHost(e) {
    e.preventDefault();
    
    const username = document.getElementById('hostUsername')?.value.trim();
    const email = document.getElementById('hostEmail')?.value.trim();
    const password = document.getElementById('hostPassword')?.value;
    const phone = document.getElementById('hostPhone')?.value.trim();
    const company = document.getElementById('hostCompany')?.value.trim();
    const status = document.getElementById('hostStatus')?.value;
    const bio = document.getElementById('hostBio')?.value.trim();
    
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
    
    Swal.fire({
        title: 'Creando host...',
        text: 'Por favor espera',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });
    
    try {
        const result = await hostService.crearHost({
            username,
            email,
            password,
            phone: phone || '',
            company: company || '',
            status: status || 'active',
            bio: bio || ''
        });
        
        Swal.close();
        
        if (result.success) {
            await Swal.fire({
                title: 'Â¡Creado!',
                text: `El host "${result.host.username}" ha sido creado correctamente`,
                icon: 'success',
                confirmButtonText: 'OK'
            });
            
            if (typeof window.navigateTo === 'function') {
                window.navigateTo('/sysadmin/hosts');
            } else {
                window.go('');
            }
        } else {
            await Swal.fire({
                title: 'Error',
                text: result.error || 'Error al crear el host',
                icon: 'error',
                confirmButtonText: 'OK'
            });
        }
    } catch (error) {
        Swal.close();
        console.error('Error al crear host:', error);
        await Swal.fire({
            title: 'Error',
            text: 'OcurriÃ³ un error al crear el host',
            icon: 'error',
            confirmButtonText: 'OK'
        });
    }
}

export default hostFormController;
