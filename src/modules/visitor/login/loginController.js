// src/modules/visitor/login/loginController.js
import { userService } from '../../../services/userService.js';
import { userRepository } from '../../../repositories/userRepository.js';
import { getRedirectPathByRole } from '../../../core/permissions.js';

// 🔥 Credenciales del admin
const ADMIN_CREDENTIALS = {
    email: 'admin123@gmail.com',
    password: 'Tuya5703'
};

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

    const btnRegister = document.getElementById('btn-register');
    if (btnRegister) {
        btnRegister.addEventListener('click', (e) => {
            e.preventDefault();
            redirectTo('/register');
        });
    }

    const forgotLink = document.getElementById('forgot-password');
    if (forgotLink) {
        forgotLink.addEventListener('click', (e) => {
            e.preventDefault();
            handleForgotPassword();
        });
    }

    const termsLinkInline = document.getElementById('termsLinkInline');
    if (termsLinkInline) {
        termsLinkInline.addEventListener('click', (e) => {
            e.preventDefault();
            redirectTo('/terms');
        });
    }

    const googleIcon = document.getElementById('google-login');
    if (googleIcon) {
        googleIcon.addEventListener('click', handleGoogleLogin);
    }

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

    console.log('🔍 Email ingresado:', email);

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

    const isAdmin = email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password;
    console.log('🔍 Es admin?', isAdmin);

    Swal.fire({
        title: 'Iniciando sesión...',
        text: 'Por favor espera',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    try {
        let result;

        if (isAdmin) {
            console.log('👑 Iniciando sesión como ADMIN');
            result = await userService.loginUsuario(email, password);
            
            if (result.success) {
                console.log('✅ Admin autenticado correctamente');
                await userService.actualizarPerfil({ role: 'sysadmin' });
                const userDoc = await userRepository.getByUid(result.user.uid);
                userService.setUsuarioActual(userDoc);
                result.user = userDoc;
                result.role = 'sysadmin';
                console.log('✅ Admin configurado como sysadmin correctamente');
            }
        } else {
            result = await userService.loginUsuario(email, password);
        }

        Swal.close();

        if (result.success) {
            document.dispatchEvent(new CustomEvent('auth:changed', {
                detail: {
                    user: result.user,
                    role: result.role || result.user?.role || 'host',
                    isAuthenticated: true
                }
            }));

            await Swal.fire({
                title: '¡Bienvenido!',
                text: result.message,
                icon: 'success',
                confirmButtonText: 'Continuar'
            });

            const redirectPath = getRedirectPathByRole(result.role || result.user?.role || 'host');
            console.log('🔀 Redirigiendo a:', redirectPath);
            redirectTo(redirectPath);
        } else {
            const errorMsg = result.error || 'Error al iniciar sesión';
            
            // 🔥 DETECTAR SI ES ERROR DE VERIFICACIÓN DE EMAIL
            const isVerificationError = errorMsg.includes('verificado') || errorMsg.includes('verificación');
            
            if (isVerificationError) {
                Swal.fire({
                    title: '⛔ Email no verificado',
                    html: `${errorMsg}<br><br>
                           <small>Revisa tu bandeja de entrada y carpeta de spam.<br>
                           <button id="resendVerificationBtn" class="swal2-confirm" style="margin-top:10px; padding:8px 20px; border-radius:50px; background:transparent; border:2px solid #4db8ff; color:#fff; cursor:pointer;">
                               Reenviar verificación
                           </button></small>`,
                    icon: 'error',
                    confirmButtonText: 'OK',
                    didRender: () => {
                        const resendBtn = document.getElementById('resendVerificationBtn');
                        if (resendBtn) {
                            resendBtn.addEventListener('click', async () => {
                                const result = await userService.reenviarVerificacionEmail();
                                Swal.fire({
                                    title: result.success ? '📧 Enviado!' : 'Error',
                                    text: result.success ? result.message : result.error,
                                    icon: result.success ? 'success' : 'error',
                                    confirmButtonText: 'OK'
                                });
                            });
                        }
                    }
                });
            } else {
                Swal.fire({
                    title: 'Error',
                    text: errorMsg,
                    icon: 'error',
                    confirmButtonText: 'OK'
                });
            }
        }
    } catch (error) {
        Swal.close();
        console.error('❌ ERROR COMPLETO:', error);
        
        let mensaje = 'Ocurrió un error al iniciar sesión';
        if (error.code === 'auth/user-not-found') {
            mensaje = 'Usuario no encontrado. Verifica tus credenciales.';
        } else if (error.code === 'auth/wrong-password') {
            mensaje = 'Contraseña incorrecta. Intenta de nuevo.';
        } else if (error.code === 'auth/too-many-requests') {
            mensaje = 'Demasiados intentos. Intenta más tarde.';
        } else if (error.message) {
            mensaje = error.message;
        }
        
        Swal.fire({
            title: 'Error',
            text: mensaje,
            icon: 'error',
            confirmButtonText: 'OK'
        });
    }
}

// ============================================
// 🔐 LOGIN CON GOOGLE
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
            const errorMsg = result.error || 'Error al iniciar sesión con Google';
            
            Swal.fire({
                title: 'Error',
                text: errorMsg,
                icon: 'error',
                confirmButtonText: 'OK'
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

export default loginController;