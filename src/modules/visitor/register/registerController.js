// src/modules/visitor/register/registerController.js
import { usuarioService } from '../../../services/userService.js';

export async function registerController() {
    const form = document.getElementById('register-form');
    const loadingOverlay = createLoadingOverlay();

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Obtener datos del formulario
            const name = document.getElementById('register-name').value.trim();
            const email = document.getElementById('register-email').value.trim();
            const password = document.getElementById('register-password').value;
            const confirmPassword = document.getElementById('register-confirm-password').value;
            const acceptTerms = document.getElementById('acceptTermsRegister').checked;

            // Validaciones locales
            if (!name || !email || !password || !confirmPassword) {
                showNotification('❌ Por favor completa todos los campos', 'error');
                return;
            }

            if (password !== confirmPassword) {
                showNotification('❌ Las contraseñas no coinciden', 'error');
                return;
            }

            if (password.length < 6) {
                showNotification('❌ La contraseña debe tener al menos 6 caracteres', 'error');
                return;
            }

            if (!acceptTerms) {
                showNotification('⚠️ Debes aceptar los términos y condiciones', 'warning');
                return;
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                showNotification('❌ Correo electrónico inválido', 'error');
                return;
            }

            // Mostrar loading
            showLoading(loadingOverlay);

            try {
                // Registrar usuario usando el servicio
                const result = await usuarioService.registrarConEmail(email, password, name);
                
                if (result.success) {
                    showNotification('✅ ' + result.message, 'success');
                    
                    // Redirigir al login después del registro exitoso
                    setTimeout(() => {
                        if (typeof window.navigateTo === 'function') {
                            window.navigateTo('/login');
                        } else {
                            window.location.href = '/login';
                        }
                    }, 1500);
                } else {
                    showNotification('❌ ' + result.error, 'error');
                }
            } catch (error) {
                console.error('Error en registro:', error);
                showNotification('❌ Error al registrar usuario', 'error');
            } finally {
                hideLoading(loadingOverlay);
            }
        });
    }

    // Botón volver al login
    const backToLoginBtn = document.getElementById('btn-back-login');
    if (backToLoginBtn) {
        backToLoginBtn.addEventListener('click', () => {
            if (typeof window.navigateTo === 'function') {
                window.navigateTo('/login');
            } else {
                window.location.href = '/login';
            }
        });
    }

    // Link de términos y condiciones
    const termsLink = document.getElementById('termsLinkRegister');
    if (termsLink) {
        termsLink.addEventListener('click', (e) => {
            e.preventDefault();
            if (typeof window.navigateTo === 'function') {
                window.navigateTo('/terms');
            } else {
                window.location.href = '/terms';
            }
        });
    }

    // Verificar si hay un usuario autenticado (redirigir si ya está logueado)
    if (usuarioService.isAuthenticated()) {
        if (typeof window.navigateTo === 'function') {
            window.navigateTo('/dashboard');
        } else {
            window.location.href = '/dashboard';
        }
    }
}

// Funciones auxiliares
function createLoadingOverlay() {
    const overlay = document.createElement('div');
    overlay.id = 'loading-overlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.7);
        display: none;
        justify-content: center;
        align-items: center;
        z-index: 9999;
        backdrop-filter: blur(4px);
    `;
    overlay.innerHTML = `
        <div style="
            background: white;
            padding: 30px;
            border-radius: 12px;
            text-align: center;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        ">
            <div style="
                border: 4px solid #f3f3f3;
                border-top: 4px solid #00d4ff;
                border-radius: 50%;
                width: 50px;
                height: 50px;
                animation: spin 1s linear infinite;
                margin: 0 auto 15px;
            "></div>
            <p style="color: #333; font-family: 'Segoe UI', sans-serif;">Creando cuenta...</p>
        </div>
        <style>
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        </style>
    `;
    document.body.appendChild(overlay);
    return overlay;
}

function showLoading(overlay) {
    if (overlay) {
        overlay.style.display = 'flex';
    }
}

function hideLoading(overlay) {
    if (overlay) {
        overlay.style.display = 'none';
    }
}

function showNotification(message, type = 'info') {
    // Crear notificación
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        border-radius: 8px;
        color: white;
        font-family: 'Segoe UI', sans-serif;
        font-weight: 500;
        z-index: 10000;
        max-width: 400px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        animation: slideIn 0.3s ease;
        background: ${type === 'error' ? '#dc3545' : type === 'success' ? '#28a745' : type === 'warning' ? '#ffc107' : '#17a2b8'};
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);

    // Eliminar después de 4 segundos
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 4000);

    // Estilos de animación
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
}

// Inicializar el controlador
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', registerController);
} else {
    registerController();
    
}