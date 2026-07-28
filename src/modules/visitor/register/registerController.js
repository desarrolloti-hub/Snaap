// src/modules/visitor/register/registerController.js
import { userService } from '../../../services/userService.js';
import { getRedirectPathByRole } from '../../../core/permissions.js';

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
// 🚀 CONTROLADOR PRINCIPAL
// ============================================
export async function registerController() {
    console.log('🔥 Register Controller iniciado');

    if (userService.isAuthenticated()) {
        const user = userService.getCurrentUser();
        const redirectPath = getRedirectPathByRole(user.role);
        navigateTo(redirectPath);
        return;
    }

    const form = document.getElementById('register-form');
    if (form) {
        form.addEventListener('submit', handleRegister);
    }

    const backToLoginBtn = document.getElementById('btn-back-login');
    if (backToLoginBtn) {
        backToLoginBtn.addEventListener('click', (e) => {
            e.preventDefault();
            navigateTo('/login');
        });
    }

    const termsLink = document.getElementById('termsLinkRegister');
    if (termsLink) {
        termsLink.addEventListener('click', (e) => {
            e.preventDefault();
            navigateTo('/terms');
        });
    }

    const googleIcon = document.getElementById('google-register');
    if (googleIcon) {
        googleIcon.addEventListener('click', handleGoogleRegister);
    }

    const socialIcons = document.querySelectorAll('.social-icon:not([data-social="google"])');
    socialIcons.forEach(icon => {
        icon.addEventListener('click', () => {
            const social = icon.getAttribute('data-social') || 'red social';
            Swal.fire({
                title: 'Próximamente',
                text: `Registro con ${social} estará disponible pronto.`,
                icon: 'info',
                confirmButtonText: 'Entendido'
            });
        });
    });
}

// ============================================
// 📧 REGISTRO CON EMAIL
// ============================================
async function handleRegister(e) {
    e.preventDefault();

    const name = document.getElementById('register-name').value.trim();
    const email = document.getElementById('register-email').value.trim();
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm-password').value;
    const acceptTerms = document.getElementById('acceptTermsRegister').checked;

    // ============================================
    // VALIDACIONES
    // ============================================
    if (!name || !email || !password || !confirmPassword) {
        await Swal.fire({
            title: 'Campos incompletos',
            text: 'Por favor completa todos los campos para registrarte.',
            icon: 'warning',
            confirmButtonText: 'Entendido'
        });
        return;
    }

    if (password !== confirmPassword) {
        await Swal.fire({
            title: 'Contraseñas no coinciden',
            text: 'Las contraseñas ingresadas no son iguales. Verifica e inténtalo de nuevo.',
            icon: 'warning',
            confirmButtonText: 'Entendido'
        });
        return;
    }

    if (password.length < 6) {
        await Swal.fire({
            title: 'Contraseña muy corta',
            text: 'La contraseña debe tener al menos 6 caracteres para mayor seguridad.',
            icon: 'warning',
            confirmButtonText: 'Entendido'
        });
        return;
    }

    if (!acceptTerms) {
        await Swal.fire({
            title: 'Términos y condiciones',
            text: 'Debes aceptar los términos y condiciones para registrarte.',
            icon: 'warning',
            confirmButtonText: 'Entendido'
        });
        return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        await Swal.fire({
            title: 'Email inválido',
            text: 'Por favor ingresa un correo electrónico válido.',
            icon: 'warning',
            confirmButtonText: 'Entendido'
        });
        return;
    }

    // Mostrar loading
    Swal.fire({
        title: 'Creando cuenta...',
        text: 'Por favor espera un momento.',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    try {
        const result = await userService.registrarUsuario(email, password, name);
        Swal.close();

        if (result.success) {
            document.dispatchEvent(new CustomEvent('auth:changed', {
                detail: {
                    user: result.user,
                    role: result.role,
                    isAuthenticated: true
                }
            }));

            // 🔥 MENSAJE DE REGISTRO EXITOSO CON VERIFICACIÓN
            await Swal.fire({
                title: '🎉 ¡Registro exitoso!',
                html: `
                    <div style="text-align: center;">
                        <p style="font-size: 1.1rem; margin: 5px 0;">${result.message}</p>
                        <div style="margin: 15px 0; padding: 12px; background: rgba(77,184,255,0.1); border-radius: 12px; border: 1px solid rgba(77,184,255,0.2);">
                            <strong style="color: #4db8ff;">📧 Revisa tu correo electrónico</strong><br>
                            <p style="color: rgba(255,255,255,0.6); font-size: 0.85rem; margin: 5px 0;">
                                Hemos enviado un enlace de verificación a:<br>
                                <span style="color: #4db8ff; font-weight: 600;">${email}</span>
                            </p>
                            <p style="color: rgba(255,255,255,0.4); font-size: 0.8rem; margin: 5px 0;">
                                Debes verificarlo antes de iniciar sesión.
                            </p>
                        </div>
                    </div>
                `,
                icon: 'success',
                confirmButtonText: 'Ir a Iniciar Sesión'
            });

            navigateTo('/login');
        } else {
            await Swal.fire({
                title: 'Error al registrarse',
                text: result.error || 'Ocurrió un error al crear tu cuenta.',
                icon: 'error',
                confirmButtonText: 'Intentar de nuevo'
            });
        }
    } catch (error) {
        Swal.close();
        console.error('Error en registro:', error);
        
        let mensaje = 'Ocurrió un error al registrar el usuario.';
        if (error.code === 'auth/email-already-in-use') {
            mensaje = 'Este correo electrónico ya está registrado. Intenta iniciar sesión.';
        } else if (error.code === 'auth/weak-password') {
            mensaje = 'La contraseña es demasiado débil. Usa al menos 6 caracteres.';
        } else if (error.code === 'auth/invalid-email') {
            mensaje = 'El correo electrónico no es válido.';
        } else if (error.message) {
            mensaje = error.message;
        }
        
        await Swal.fire({
            title: 'Error al registrarse',
            text: mensaje,
            icon: 'error',
            confirmButtonText: 'Entendido'
        });
    }
}

// ============================================
// 🔐 REGISTRO CON GOOGLE
// ============================================
async function handleGoogleRegister() {
    Swal.fire({
        title: 'Conectando con Google...',
        text: 'Por favor espera un momento.',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    try {
        const result = await userService.loginConGoogle();
        Swal.close();

        if (result.success) {
            document.dispatchEvent(new CustomEvent('auth:changed', {
                detail: {
                    user: result.user,
                    role: result.role,
                    isAuthenticated: true
                }
            }));

            const roleNames = {
                'sysadmin': 'Administrador',
                'host': 'Host',
                'user': 'Usuario'
            };
            const roleDisplay = roleNames[result.role] || 'Usuario';

            await Swal.fire({
                title: '🎉 ¡Registro exitoso!',
                html: `
                    <div style="text-align: center;">
                        <i class="fas fa-google" style="color: #ea4335; font-size: 3rem; margin-bottom: 10px;"></i>
                        <p style="font-size: 1.1rem; margin: 5px 0;">${result.message}</p>
                        <p style="color: rgba(255,255,255,0.5); font-size: 0.85rem; margin: 0;">
                            <i class="fas fa-user-tag"></i> Rol: ${roleDisplay}
                        </p>
                    </div>
                `,
                icon: 'success',
                confirmButtonText: 'Continuar'
            });

            const redirectPath = getRedirectPathByRole(result.role);
            navigateTo(redirectPath);
        } else {
            await Swal.fire({
                title: 'Error con Google',
                text: result.error || 'No se pudo completar el registro con Google.',
                icon: 'error',
                confirmButtonText: 'Intentar de nuevo'
            });
        }
    } catch (error) {
        Swal.close();
        console.error('Error en Google register:', error);
        await Swal.fire({
            title: 'Error con Google',
            text: 'Ocurrió un error al registrar con Google. Intenta de nuevo.',
            icon: 'error',
            confirmButtonText: 'Entendido'
        });
    }
}

export default registerController;