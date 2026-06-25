// src/modules/visitor/login/loginController.js
import { userService } from '../../../services/userService.js';
import { getRedirectPathByRole } from '../../../core/permissions.js';

export async function loginController() {
    console.log('🔥 Login Controller iniciado');

    if (userService.isAuthenticated()) {
        const user = userService.getCurrentUser();
        const redirectPath = getRedirectPathByRole(user.role);
        redirectTo(redirectPath);
        return;
    }

    const form = document.getElementById('login-form');
    if (form) {
        form.addEventListener('submit', handleLogin);
    }

    // ✅ Botón "Crear cuenta"
    const btnRegister = document.getElementById('btn-register');
    if (btnRegister) {
        btnRegister.addEventListener('click', (e) => {
            e.preventDefault();
            redirectTo('/register');
        });
    }

    // ✅ Enlace "Olvidé mi contraseña"
    const forgotLink = document.getElementById('forgot-password');
    if (forgotLink) {
        forgotLink.addEventListener('click', (e) => {
            e.preventDefault();
            handleForgotPassword();
        });
    }

    // ✅ Enlace de términos
    const termsLinkInline = document.getElementById('termsLinkInline');
    if (termsLinkInline) {
        termsLinkInline.addEventListener('click', (e) => {
            e.preventDefault();
            redirectTo('/terms');
        });
    }

    // ✅ Google como ícono (no botón)
    const googleIcon = document.getElementById('google-login');
    if (googleIcon) {
        googleIcon.addEventListener('click', handleGoogleLogin);
    }

    // ✅ Otros íconos sociales (Facebook, Apple)
    const socialIcons = document.querySelectorAll('.social-icon:not([data-social="google"])');
    socialIcons.forEach(icon => {
        icon.addEventListener('click', () => {
            const social = icon.getAttribute('data-social') || 'red social';
            Swal.fire({
                title: 'Próximamente',
                text: `Inicio de sesión con ${social} estará disponible pronto.`,
                icon: 'info',
                confirmButtonText: 'OK'
            });
        });
    });
}

// ============================================
// 📧 LOGIN CON EMAIL
// ============================================
async function handleLogin(e) {
    e.preventDefault();

    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    const acceptTerms = document.getElementById('acceptTerms').checked;

    if (!email || !password) {
        Swal.fire({
            title: 'Campos incompletos',
            text: 'Por favor completa todos los campos',
            icon: 'warning',
            confirmButtonText: 'OK'
        });
        return;
    }

    if (!acceptTerms) {
        Swal.fire({
            title: 'Términos y condiciones',
            text: 'Debes aceptar los términos y condiciones para iniciar sesión.',
            icon: 'warning',
            confirmButtonText: 'OK'
        });
        return;
    }

    Swal.fire({
        title: 'Iniciando sesión...',
        text: 'Por favor espera',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    try {
        const result = await userService.loginUsuario(email, password);
        Swal.close();

        if (result.success) {
            // ✅ Disparar evento de autenticación
            document.dispatchEvent(new CustomEvent('auth:changed', {
                detail: {
                    user: result.user,
                    role: result.role,
                    isAuthenticated: true
                }
            }));

            await Swal.fire({
                title: '¡Bienvenido!',
                text: result.message,
                icon: 'success',
                confirmButtonText: 'Continuar'
            });

            const redirectPath = getRedirectPathByRole(result.role);
            redirectTo(redirectPath);
        } else {
            Swal.fire({
                title: 'Error',
                text: result.error,
                icon: 'error',
                confirmButtonText: 'Intentar de nuevo'
            });
        }
    } catch (error) {
        Swal.close();
        console.error('Error en login:', error);
        Swal.fire({
            title: 'Error',
            text: 'Ocurrió un error al iniciar sesión',
            icon: 'error',
            confirmButtonText: 'OK'
        });
    }
}

// ============================================
// 🔐 LOGIN CON GOOGLE (desde ícono)
// ============================================
async function handleGoogleLogin() {
    Swal.fire({
        title: 'Iniciando sesión con Google...',
        text: 'Por favor espera',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    try {
        const result = await userService.loginConGoogle();
        Swal.close();

        if (result.success) {
            // ✅ Disparar evento de autenticación
            document.dispatchEvent(new CustomEvent('auth:changed', {
                detail: {
                    user: result.user,
                    role: result.role,
                    isAuthenticated: true
                }
            }));

            await Swal.fire({
                title: '¡Bienvenido!',
                text: result.message,
                icon: 'success',
                confirmButtonText: 'Continuar'
            });

            const redirectPath = getRedirectPathByRole(result.role);
            redirectTo(redirectPath);
        } else {
            Swal.fire({
                title: 'Error',
                text: result.error,
                icon: 'error',
                confirmButtonText: 'Intentar de nuevo'
            });
        }
    } catch (error) {
        Swal.close();
        console.error('Error en Google login:', error);
        Swal.fire({
            title: 'Error',
            text: 'Ocurrió un error al iniciar sesión con Google',
            icon: 'error',
            confirmButtonText: 'OK'
        });
    }
}

// ============================================
// 🔐 RECUPERAR CONTRASEÑA
// ============================================
async function handleForgotPassword() {
    const { value: email } = await Swal.fire({
        title: 'Recuperar Contraseña',
        text: 'Ingresa tu correo electrónico y te enviaremos un enlace de recuperación.',
        input: 'email',
        inputPlaceholder: 'tu@email.com',
        showCancelButton: true,
        confirmButtonText: 'Enviar',
        cancelButtonText: 'Cancelar',
        inputValidator: (value) => {
            if (!value) {
                return 'Por favor ingresa tu email';
            }
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                return 'Email inválido';
            }
        }
    });

    if (email) {
        Swal.fire({
            title: 'Enviando...',
            text: 'Por favor espera',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        try {
            const result = await userService.recuperarContrasena(email);
            Swal.close();

            if (result.success) {
                Swal.fire({
                    title: '¡Enviado!',
                    text: result.message,
                    icon: 'success',
                    confirmButtonText: 'OK'
                });
            } else {
                Swal.fire({
                    title: 'Error',
                    text: result.error,
                    icon: 'error',
                    confirmButtonText: 'OK'
                });
            }
        } catch (error) {
            Swal.close();
            Swal.fire({
                title: 'Error',
                text: 'Ocurrió un error al enviar el enlace',
                icon: 'error',
                confirmButtonText: 'OK'
            });
        }
    }
}

function redirectTo(path) {
    if (typeof window.navigateTo === 'function') {
        window.navigateTo(path);
    } else {
        window.location.href = path;
    }
}