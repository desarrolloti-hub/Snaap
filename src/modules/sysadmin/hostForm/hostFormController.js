// src/modules/sysadmin/hostForm/hostFormController.js
import { userService } from '../../../services/userService.js';
import { userRepository } from '../../../repositories/userRepository.js';
import { hostService } from '../../../services/hostService.js';

export async function hostFormController() {
    console.log('🔥 Host Form Controller iniciado');

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
    
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            if (typeof window.navigateTo === 'function') {
                window.navigateTo('/sysadmin/hosts');
            } else {
                window.location.href = '/sysadmin/hosts';
            }
        });
    }
    
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            if (typeof window.navigateTo === 'function') {
                window.navigateTo('/sysadmin/hosts');
            } else {
                window.location.href = '/sysadmin/hosts';
            }
        });
    }
    
    if (hostForm) {
        hostForm.addEventListener('submit', saveHost);
    }
}

// ============================================
// 💾 GUARDAR HOST EN FIRESTORE
// ============================================
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
            title: 'Contraseña inválida',
            text: 'La contraseña debe tener al menos 6 caracteres',
            icon: 'warning',
            confirmButtonText: 'OK'
        });
        return;
    }
    
    // Verificar si ya existe un usuario con este email
    const existingUser = await userRepository.getByEmail(email);
    if (existingUser) {
        await Swal.fire({
            title: 'Email duplicado',
            text: 'Ya existe un usuario con este correo electrónico',
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
        // 🔥 Crear host usando hostService
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
                title: '¡Creado!',
                text: `El host "${result.host.username}" ha sido creado correctamente`,
                icon: 'success',
                confirmButtonText: 'OK'
            });
            
            if (typeof window.navigateTo === 'function') {
                window.navigateTo('/sysadmin/hosts');
            } else {
                window.location.href = '/sysadmin/hosts';
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
            text: 'Ocurrió un error al crear el host',
            icon: 'error',
            confirmButtonText: 'OK'
        });
    }
}

export default hostFormController;