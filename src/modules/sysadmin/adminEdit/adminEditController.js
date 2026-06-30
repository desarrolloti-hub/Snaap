// src/modules/sysadmin/adminEdit/adminEditController.js
import { userService } from '../../../services/userService.js';
import { userRepository } from '../../../repositories/userRepository.js';

export async function adminEditController() {
    console.log('🔥 Admin Edit Controller iniciado');

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
    await loadAdminData();
    setupForm();
    // 🔥 Agregar delegación de eventos
    setupDelegation();
}

let editingAdminId = null;

function loadStyles() {
    const styles = [
        { href: '/src/css/components/adminEdit.css', id: 'admin-edit-style' }
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

async function loadAdminData() {
    const urlParams = new URLSearchParams(window.location.search);
    const adminId = urlParams.get('id');
    
    if (!adminId) {
        Swal.fire({
            title: 'Error',
            text: 'No se especificó qué administrador editar',
            icon: 'error',
            confirmButtonText: 'OK'
        }).then(() => {
            window.location.href = '/sysadmin/admins';
        });
        return;
    }
    
    editingAdminId = adminId;
    
    Swal.fire({
        title: 'Cargando...',
        text: 'Por favor espera',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });
    
    try {
        const admin = await userRepository.getById(adminId);
        Swal.close();
        
        if (!admin) {
            Swal.fire({
                title: 'Error',
                text: 'El administrador no existe',
                icon: 'error',
                confirmButtonText: 'OK'
            }).then(() => {
                window.location.href = '/sysadmin/admins';
            });
            return;
        }
        
        document.getElementById('adminUsername').value = admin.username || '';
        document.getElementById('adminEmail').value = admin.email || '';
        document.getElementById('adminPhone').value = admin.phone || '';
        document.getElementById('adminDepartment').value = admin.department || admin.company || '';
        document.getElementById('adminStatus').value = admin.status || 'active';
        document.getElementById('adminNotes').value = admin.notes || admin.bio || '';
        
        console.log('📥 Datos del administrador cargados:', admin);
    } catch (error) {
        Swal.close();
        console.error('Error al cargar administrador:', error);
        Swal.fire({
            title: 'Error',
            text: 'No se pudo cargar el administrador',
            icon: 'error',
            confirmButtonText: 'OK'
        }).then(() => {
            window.location.href = '/sysadmin/admins';
        });
    }
}

function setupForm() {
    // 🔥 FORMULARIO
    const adminForm = document.getElementById('adminForm');
    if (adminForm) {
        adminForm.addEventListener('submit', saveAdmin);
        console.log('✅ Event listener agregado al formulario');
    }
}

// ============================================
// 🔥 DELEGACIÓN DE EVENTOS
// ============================================
function setupDelegation() {
    console.log('🔧 Configurando delegación de eventos...');
    
    // Remover listeners anteriores
    document.removeEventListener('click', handleDocumentClick);
    document.addEventListener('click', handleDocumentClick);
    
    console.log('✅ Delegación de eventos configurada');
}

function handleDocumentClick(e) {
    // 🔥 BOTÓN VOLVER
    const btnVolver = e.target.closest('#btnVolver');
    if (btnVolver) {
        e.preventDefault();
        e.stopPropagation();
        console.log('🔙 Click en Volver (delegación)');
        
        Swal.fire({
            title: '¿Cancelar edición?',
            text: '¿Estás seguro de que quieres salir? Los cambios no guardados se perderán.',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#ff007a',
            cancelButtonColor: '#4db8ff',
            confirmButtonText: 'Sí, salir',
            cancelButtonText: 'Continuar editando'
        }).then((result) => {
            if (result.isConfirmed) {
                if (typeof window.navigateTo === 'function') {
                    window.navigateTo('/sysadmin/admins');
                } else {
                    window.location.href = '/sysadmin/admins';
                }
            }
        });
        return;
    }
    
    // 🔥 BOTÓN GUARDAR (por si acaso)
    const btnSave = e.target.closest('.btn-save');
    if (btnSave) {
        // El formulario ya maneja el submit
        return;
    }
}

async function saveAdmin(e) {
    e.preventDefault();
    
    const username = document.getElementById('adminUsername')?.value.trim();
    const email = document.getElementById('adminEmail')?.value.trim();
    const phone = document.getElementById('adminPhone')?.value.trim();
    const department = document.getElementById('adminDepartment')?.value.trim();
    const status = document.getElementById('adminStatus')?.value;
    const notes = document.getElementById('adminNotes')?.value.trim();
    
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
        const admin = await userRepository.getById(editingAdminId);
        if (!admin) {
            Swal.close();
            Swal.fire({
                title: 'Error',
                text: 'Administrador no encontrado',
                icon: 'error',
                confirmButtonText: 'OK'
            });
            return;
        }
        
        admin.username = username;
        admin.email = email;
        admin.phone = phone || admin.phone;
        admin.department = department || admin.department;
        admin.company = department || admin.company;
        admin.status = status || admin.status;
        admin.notes = notes || admin.notes;
        admin.bio = notes || admin.bio;
        admin.updatedAt = new Date();
        
        await userRepository.update(admin);
        Swal.close();
        
        await Swal.fire({
            title: '¡Actualizado!',
            text: 'El administrador ha sido actualizado correctamente',
            icon: 'success',
            confirmButtonText: 'OK'
        });
        
        if (typeof window.navigateTo === 'function') {
            window.navigateTo('/sysadmin/admins');
        } else {
            window.location.href = '/sysadmin/admins';
        }
    } catch (error) {
        Swal.close();
        console.error('Error al actualizar administrador:', error);
        Swal.fire({
            title: 'Error',
            text: 'No se pudo actualizar el administrador',
            icon: 'error',
            confirmButtonText: 'OK'
        });
    }
}

export default adminEditController;