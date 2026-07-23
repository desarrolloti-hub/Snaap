// src/modules/visitor/register/registerController.js
import { userService } from '../../../services/userService.js';
import { getRedirectPathByRole } from '../../../core/permissions.js';

export async function registerController() {
    console.log('ðŸ”¥ Register Controller iniciado');

    if (userService.isAuthenticated()) {
        const user = userService.getCurrentUser();
        const redirectPath = getRedirectPathByRole(user.role);
        redirectTo(redirectPath);
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
            redirectTo('/login');
        });
    }

    const termsLink = document.getElementById('termsLinkRegister');
    if (termsLink) {
        termsLink.addEventListener('click', (e) => {
            e.preventDefault();
            redirectTo('/terms');
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
                title: 'PrÃ³ximamente',
                text: `Registro con ${social} estarÃ¡ disponible pronto.`,
                icon: 'info',
                confirmButtonText: 'OK'
            });
        });
    });
}

// ============================================
// ðŸ“§ REGISTRO CON EMAIL
// ============================================
async function handleRegister(e) {
    e.preventDefault();

    const name = document.getElementById('register-name').value.trim();
    const email = document.getElementById('register-email').value.trim();
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm-password').value;
    const acceptTerms = document.getElementById('acceptTermsRegister').checked;

    if (!name || !email || !password || !confirmPassword) {
        Swal.fire({
            title: 'Campos incompletos',
            text: 'Por favor completa todos los campos',
            icon: 'warning',
            confirmButtonText: 'OK'
        });
        return;
    }

    if (password !== confirmPassword) {
        Swal.fire({
            title: 'ContraseÃ±as no coinciden',
            text: 'Las contraseÃ±as ingresadas no son iguales',
            icon: 'warning',
            confirmButtonText: 'OK'
        });
        return;
    }

    if (password.length < 6) {
        Swal.fire({
            title: 'ContraseÃ±a muy corta',
            text: 'La contraseÃ±a debe tener al menos 6 caracteres',
            icon: 'warning',
            confirmButtonText: 'OK'
        });
        return;
    }

    if (!acceptTerms) {
        Swal.fire({
            title: 'TÃ©rminos y condiciones',
            text: 'Debes aceptar los tÃ©rminos y condiciones para registrarte.',
            icon: 'warning',
            confirmButtonText: 'OK'
        });
        return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        Swal.fire({
            title: 'Email invÃ¡lido',
            text: 'Por favor ingresa un correo electrÃ³nico vÃ¡lido',
            icon: 'warning',
            confirmButtonText: 'OK'
        });
        return;
    }

    Swal.fire({
        title: 'Creando cuenta...',
        text: 'Por favor espera',
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

            // ðŸ”¥ MENSAJE CON VERIFICACIÃ“N DE EMAIL
            await Swal.fire({
                title: 'Â¡Registro exitoso!',
                html: `${result.message}<br><br>
                       <strong>ðŸ“§ Revisa tu correo electrÃ³nico</strong><br>
                       <small>Hemos enviado un enlace de verificaciÃ³n a ${email}.<br>
                       Debes verificarlo antes de iniciar sesiÃ³n.</small>`,
                icon: 'success',
                confirmButtonText: 'Entendido'
            });

            redirectTo('/login');
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
        console.error('Error en registro:', error);
        Swal.fire({
            title: 'Error',
            text: 'OcurriÃ³ un error al registrar el usuario',
            icon: 'error',
            confirmButtonText: 'OK'
        });
    }
}

// ============================================
// ðŸ” REGISTRO CON GOOGLE (desde Ã­cono)
// ============================================
async function handleGoogleRegister() {
    Swal.fire({
        title: 'Registrando con Google...',
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
            document.dispatchEvent(new CustomEvent('auth:changed', {
                detail: {
                    user: result.user,
                    role: result.role,
                    isAuthenticated: true
                }
            }));

            await Swal.fire({
                title: 'Â¡Registro exitoso!',
                text: `âœ… ${result.message}`,
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
        console.error('Error en Google register:', error);
        Swal.fire({
            title: 'Error',
            text: 'OcurriÃ³ un error al registrar con Google',
            icon: 'error',
            confirmButtonText: 'OK'
        });
    }
}

function redirectTo(path) {
    if (typeof window.navigateTo === 'function') {
        window.navigateTo(path);
    } else {
        window.go(path);
    }
}
