export async function loginController() {
    // Ya no necesitamos cargar CSS ni insertar HTML porque ya existe en el DOM
    // Solo nos encargamos de la lógica
    
    const app = document.getElementById('app');
    if (!app) return;

    // --- LÓGICA DEL FORMULARIO (con redirección a admin) ---
    const form = document.getElementById('login-form');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            const acceptTerms = document.getElementById('acceptTerms').checked;

            if (!email || !password) {
                alert('❌ Por favor completa todos los campos');
                return;
            }
            if (!acceptTerms) {
                alert('⚠️ Debes aceptar los términos y condiciones para iniciar sesión.');
                return;
            }
            console.log('Intento de login:', { email, password });
            alert(`✅ Bienvenido, redirigiendo al panel de control...`);

            // Redirigir al dashboard de organizador (simulación)
            if (typeof window.navigateTo === 'function') {
                window.navigateTo('/admin');
            } else {
                window.location.href = '/admin';
            }
        });
    }

    // Botón "Crear cuenta" - Ahora redirige al registro
    const btnRegister = document.getElementById('btn-register');
    if (btnRegister) {
        btnRegister.addEventListener('click', () => {
            // Redirigir al formulario de registro
            if (typeof window.navigateTo === 'function') {
                window.navigateTo('/register');
            } else {
                window.location.href = '/register';
            }
        });
    }

    // Enlace "Olvidé mi contraseña"
    const forgotLink = document.getElementById('forgot-password');
    if (forgotLink) {
        forgotLink.addEventListener('click', (e) => {
            e.preventDefault();
            alert('🔐 Se enviará un enlace de recuperación a tu correo electrónico.');
        });
    }

    // Botón "Ver términos"
    const viewTermsBtn = document.getElementById('viewTermsBtn');
    if (viewTermsBtn) {
        viewTermsBtn.addEventListener('click', () => {
            if (typeof window.navigateTo === 'function') {
                window.navigateTo('/terms');
            } else {
                window.location.href = '/terms';
            }
        });
    }

    // Enlace inline de términos
    const termsLinkInline = document.getElementById('termsLinkInline');
    if (termsLinkInline) {
        termsLinkInline.addEventListener('click', (e) => {
            e.preventDefault();
            if (typeof window.navigateTo === 'function') {
                window.navigateTo('/terms');
            } else {
                window.location.href = '/terms';
            }
        });
    }

    // Botones de redes sociales
    const socialIcons = document.querySelectorAll('.social-icon');
    socialIcons.forEach(icon => {
        icon.addEventListener('click', () => {
            const social = icon.getAttribute('data-social') || 'red social';
            alert(`🔑 Inicio de sesión con ${social} (demo). Próximamente.`);
        });
    });
}

// Auto-inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loginController);
} else {
    loginController();
}