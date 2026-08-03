// src/modules/sysadmin/hostForm/hostFormController.js
import { userService } from '../../../services/userService.js';
import { userRepository } from '../../../repositories/userRepository.js';
import { hostService } from '../../../services/hostService.js';

// ============================================
// 🧭 NAVEGACIÓN
// ============================================
const navigateTo = (path) => {
    if (typeof window.navigateTo === 'function') {
        window.navigateTo(path);
    } else {
        window.location.href = path;
    }
};

// ============================================
// 🔔 ENVIAR NOTIFICACIÓN A SYSADMINS
// ============================================
const sendNotificationToSysadmins = async (hostName, hostEmail) => {
    try {
        const { notificationService } = await import('../../../services/notificationService.js');
        const { userRepository } = await import('../../../repositories/userRepository.js');
        
        // 🔥 OBTENER TODOS LOS SYSADMINS
        const allUsers = await userRepository.getAllUsers();
        const sysadmins = allUsers.filter(u => u.role === 'sysadmin');
        
        if (sysadmins.length === 0) {
            console.warn('⚠️ No hay sysadmins para notificar');
            return;
        }
        
        // 🔥 OBTENER UIDS DE SYSADMINS
        const sysadminUids = sysadmins.map(admin => admin.uid || admin.id).filter(Boolean);
        
        if (sysadminUids.length === 0) {
            console.warn('⚠️ No hay UIDs válidos de sysadmins');
            return;
        }
        
        console.log(`📤 Enviando notificación a ${sysadminUids.length} sysadmins`);
        
        // 🔥 ENVIAR NOTIFICACIÓN A TODOS LOS SYSADMINS
        await notificationService.sendPushNotification({
            title: '👤 Nuevo Host registrado',
            body: `El host "${hostName}" (${hostEmail}) se ha registrado en la plataforma.`,
            icon: '👤',
            link: '/sysadmin/hosts',
            recipients: sysadminUids
        });
        
        console.log(`✅ Notificación enviada a sysadmins`);
        
    } catch (error) {
        console.error('❌ Error al enviar notificación a sysadmins:', error);
    }
};

// ============================================
// 🚀 EXPORTACIÓN CORRECTA
// ============================================
export async function hostFormController() {
    console.log('🔥 Host Form Controller iniciado');

    if (!userService.isAuthenticated()) {
        console.warn('⚠️ Usuario no autenticado');
        navigateTo('/login');
        return;
    }

    const user = userService.getCurrentUser();
    
    if (user.role !== 'sysadmin') {
        Swal.fire({
            title: 'Acceso Denegado',
            text: 'No tienes permisos de administrador',
            icon: 'error',
            confirmButtonText: 'Entendido'
        }).then(() => {
            navigateTo('/');
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
    
    // 🔥 CONFIRMACIÓN PARA VOLVER
    if (backBtn) {
        const newBackBtn = backBtn.cloneNode(true);
        backBtn.parentNode.replaceChild(newBackBtn, backBtn);
        
        newBackBtn.addEventListener('click', () => {
            Swal.fire({
                title: '¿Cancelar creación?',
                text: '¿Estás seguro de que quieres salir? Los datos no guardados se perderán.',
                icon: 'question',
                showCancelButton: true,
                confirmButtonColor: '#ff007a',
                cancelButtonColor: '#4db8ff',
                confirmButtonText: 'Sí, salir',
                cancelButtonText: 'Continuar'
            }).then((result) => {
                if (result.isConfirmed) {
                    navigateTo('/sysadmin/hosts');
                }
            });
        });
    }
    
    // 🔥 CONFIRMACIÓN PARA CANCELAR
    if (cancelBtn) {
        const newCancelBtn = cancelBtn.cloneNode(true);
        cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);
        
        newCancelBtn.addEventListener('click', () => {
            Swal.fire({
                title: '¿Cancelar creación?',
                text: '¿Estás seguro de que quieres cancelar? Los datos no guardados se perderán.',
                icon: 'question',
                showCancelButton: true,
                confirmButtonColor: '#ff007a',
                cancelButtonColor: '#4db8ff',
                confirmButtonText: 'Sí, cancelar',
                cancelButtonText: 'Continuar'
            }).then((result) => {
                if (result.isConfirmed) {
                    navigateTo('/sysadmin/hosts');
                }
            });
        });
    }
    
    if (hostForm) {
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
            confirmButtonText: 'Entendido'
        });
        return;
    }
    
    if (!password || password.length < 6) {
        await Swal.fire({
            title: 'Contraseña inválida',
            text: 'La contraseña debe tener al menos 6 caracteres',
            icon: 'warning',
            confirmButtonText: 'Entendido'
        });
        return;
    }
    
    const existingUser = await userRepository.getByEmail(email);
    if (existingUser) {
        await Swal.fire({
            title: 'Email duplicado',
            text: 'Ya existe un usuario con este correo electrónico',
            icon: 'error',
            confirmButtonText: 'Entendido'
        });
        return;
    }
    
    Swal.fire({
        title: 'Creando host...',
        text: 'Por favor espera un momento.',
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
            const hostName = result.host.username;
            const hostEmail = result.host.email;
            
            // 🔥 ENVIAR NOTIFICACIÓN A TODOS LOS SYSADMINS
            await sendNotificationToSysadmins(hostName, hostEmail);
            
            await Swal.fire({
                title: '¡Creado!',
                text: `El host "${hostName}" ha sido creado correctamente`,
                icon: 'success',
                confirmButtonText: 'OK'
            });
            
            navigateTo('/sysadmin/hosts');
        } else {
            await Swal.fire({
                title: 'Error',
                text: result.error || 'Error al crear el host',
                icon: 'error',
                confirmButtonText: 'Entendido'
            });
        }
    } catch (error) {
        Swal.close();
        console.error('Error al crear host:', error);
        await Swal.fire({
            title: 'Error',
            text: 'Ocurrió un error al crear el host',
            icon: 'error',
            confirmButtonText: 'Entendido'
        });
    }
}

export default hostFormController;