// src/modules/visitor/login/loginController.js
import { userService } from '../../../services/userService.js';
import { userRepository } from '../../../repositories/userRepository.js';
import { getRedirectPathByRole } from '../../../core/permissions.js';

// 🔥 Credenciales del admin
const ADMIN_CREDENTIALS = {
    email: 'admin123@gmail.com',
    password: 'Tuya5703'
};

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
export async function loginController() {
    console.log('🔥 Login Controller iniciado');

    if (userService.isAuthenticated()) {
        const user = userService.getCurrentUser();
        const redirectPath = getRedirectPathByRole(user.role);
        navigateTo(redirectPath);
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
            navigateTo('/register');
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
            navigateTo('/terms');
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
                confirmButtonText: 'Entendido'
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

    // ============================================
    // VALIDACIONES
    // ============================================
    if (!email || !password) {
        await Swal.fire({
            title: 'Campos incompletos',
            text: 'Por favor completa todos los campos para iniciar sesión.',
            icon: 'warning',
            confirmButtonText: 'Entendido'
        });
        return;
    }

    if (!acceptTerms) {
        await Swal.fire({
            title: 'Términos y condiciones',
            text: 'Debes aceptar los términos y condiciones para iniciar sesión.',
            icon: 'warning',
            confirmButtonText: 'Entendido'
        });
        return;
    }

    const isAdmin = email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password;
    console.log('🔍 Es admin?', isAdmin);

    // Mostrar loading
    Swal.fire({
        title: 'Iniciando sesión...',
        text: 'Por favor espera un momento.',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    try {
        let result;

        // ============================================
        // LOGIN ADMIN
        // ============================================
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

        // ============================================
        // LOGIN EXITOSO
        // ============================================
        if (result.success) {
            document.dispatchEvent(new CustomEvent('auth:changed', {
                detail: {
                    user: result.user,
                    role: result.role || result.user?.role || 'host',
                    isAuthenticated: true
                }
            }));

            const userRole = result.role || result.user?.role || 'host';
            const roleNames = {
                'sysadmin': 'Administrador',
                'host': 'Host',
                'user': 'Usuario'
            };
            const roleDisplay = roleNames[userRole] || 'Usuario';

            await Swal.fire({
                title: '¡Bienvenido!',
                html: `
                    <div style="text-align: center;">
                        <p style="font-size: 1.1rem; margin: 5px 0;">${result.message}</p>
                        <p style="color: rgba(255,255,255,0.5); font-size: 0.85rem; margin: 0;">
                        </p>
                    </div>
                `,
                icon: 'success',
                confirmButtonText: 'Continuar'
            });

            const redirectPath = getRedirectPathByRole(userRole);
            console.log('🔀 Redirigiendo a:', redirectPath);
            navigateTo(redirectPath);
        } else {
            // ============================================
            // ERROR DE LOGIN
            // ============================================
            const errorMsg = result.error || 'Error al iniciar sesión';
            
            const isVerificationError = errorMsg.includes('verificado') || 
                                       errorMsg.includes('verificación') ||
                                       errorMsg.includes('verificar');

            if (isVerificationError) {
                await Swal.fire({
                    title: '⛔ Email no verificado',
                    html: `
                        <p style="text-align: center; margin-bottom: 10px;">
                            ${errorMsg}
                        </p>
                        <p style="color: rgba(255,255,255,0.5); font-size: 0.85rem; text-align: center;">
                            Revisa tu bandeja de entrada y carpeta de spam.
                        </p>
                        <div style="text-align: center; margin-top: 10px;">
                            <button id="resendVerificationBtn" class="swal2-confirm" style="margin-top:10px; padding:10px 24px; border-radius:50px; background:transparent; border:2px solid #4db8ff; color:#fff; cursor:pointer; font-family:'Poppins',sans-serif; font-weight:600; transition:all 0.3s ease;">
                                <i class="fas fa-envelope"></i> Reenviar verificación
                            </button>
                        </div>
                    `,
                    icon: 'error',
                    confirmButtonText: 'Entendido',
                    didRender: () => {
                        const resendBtn = document.getElementById('resendVerificationBtn');
                        if (resendBtn) {
                            resendBtn.addEventListener('click', async () => {
                                resendBtn.disabled = true;
                                resendBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
                                
                                const result = await userService.reenviarVerificacionEmail();
                                
                                if (result.success) {
                                    await Swal.fire({
                                        title: '📧 Enviado',
                                        text: 'Se ha enviado un nuevo enlace de verificación a tu correo.',
                                        icon: 'success',
                                        confirmButtonText: 'OK'
                                    });
                                } else {
                                    await Swal.fire({
                                        title: 'Error',
                                        text: result.error || 'No se pudo reenviar el enlace.',
                                        icon: 'error',
                                        confirmButtonText: 'OK'
                                    });
                                }
                                
                                resendBtn.disabled = false;
                                resendBtn.innerHTML = '<i class="fas fa-envelope"></i> Reenviar verificación';
                            });
                        }
                    }
                });
            } else {
                await Swal.fire({
                    title: 'Error de inicio de sesión',
                    text: errorMsg,
                    icon: 'error',
                    confirmButtonText: 'Intentar de nuevo'
                });
            }
        }
    } catch (error) {
        Swal.close();
        console.error('❌ ERROR COMPLETO:', error);
        
        let mensaje = 'Ocurrió un error al iniciar sesión.';
        if (error.code === 'auth/user-not-found') {
            mensaje = 'Usuario no encontrado. Verifica tus credenciales.';
        } else if (error.code === 'auth/wrong-password') {
            mensaje = 'Contraseña incorrecta. Intenta de nuevo.';
        } else if (error.code === 'auth/too-many-requests') {
            mensaje = 'Demasiados intentos fallidos. Intenta más tarde.';
        } else if (error.code === 'auth/invalid-email') {
            mensaje = 'El correo electrónico no es válido.';
        } else if (error.message) {
            mensaje = error.message;
        }
        
        await Swal.fire({
            title: 'Error de inicio de sesión',
            text: mensaje,
            icon: 'error',
            confirmButtonText: 'Entendido'
        });
    }
}

// ============================================
// 🔐 LOGIN CON GOOGLE
// ============================================
async function handleGoogleLogin() {
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
                title: '¡Bienvenido!',
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
                text: result.error || 'No se pudo iniciar sesión con Google.',
                icon: 'error',
                confirmButtonText: 'Intentar de nuevo'
            });
        }
    } catch (error) {
        Swal.close();
        console.error('Error en Google login:', error);
        await Swal.fire({
            title: 'Error con Google',
            text: 'Ocurrió un error al iniciar sesión con Google. Intenta de nuevo.',
            icon: 'error',
            confirmButtonText: 'Entendido'
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
        confirmButtonText: 'Enviar enlace',
        cancelButtonText: 'Cancelar',
        inputValidator: (value) => {
            if (!value) {
                return 'Por favor ingresa tu email';
            }
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                return 'El email ingresado no es válido';
            }
        }
    });

    if (email) {
        Swal.fire({
            title: 'Enviando enlace...',
            text: 'Por favor espera un momento.',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        try {
            const result = await userService.recuperarContrasena(email);
            Swal.close();

            if (result.success) {
                await Swal.fire({
                    title: '📧 ¡Enlace enviado!',
                    html: `
                        <div style="text-align: center;">
                            <p style="margin: 5px 0;">Hemos enviado un enlace de recuperación a:</p>
                            <p style="color: #4db8ff; font-weight: 600; margin: 5px 0;">${email}</p>
                            <p style="color: rgba(255,255,255,0.4); font-size: 0.85rem; margin: 5px 0;">
                                Revisa tu bandeja de entrada y carpeta de spam.
                            </p>
                        </div>
                    `,
                    icon: 'success',
                    confirmButtonText: 'Entendido'
                });
            } else {
                await Swal.fire({
                    title: 'Error',
                    text: result.error || 'No se pudo enviar el enlace de recuperación.',
                    icon: 'error',
                    confirmButtonText: 'Intentar de nuevo'
                });
            }
        } catch (error) {
            Swal.close();
            await Swal.fire({
                title: 'Error',
                text: 'Ocurrió un error al enviar el enlace. Intenta de nuevo.',
                icon: 'error',
                confirmButtonText: 'Entendido'
            });
        }
    }
}

export default loginController;