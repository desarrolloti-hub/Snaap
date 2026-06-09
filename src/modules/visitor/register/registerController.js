export async function registerController() {
    const form = document.getElementById('register-form');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const name = document.getElementById('register-name').value.trim();
            const email = document.getElementById('register-email').value.trim();
            const password = document.getElementById('register-password').value;
            const confirmPassword = document.getElementById('register-confirm-password').value;
            const acceptTerms = document.getElementById('acceptTermsRegister').checked;

            if (!name || !email || !password || !confirmPassword) {
                alert('❌ Por favor completa todos los campos');
                return;
            }

            if (password !== confirmPassword) {
                alert('❌ Las contraseñas no coinciden');
                return;
            }

            if (password.length < 6) {
                alert('❌ La contraseña debe tener al menos 6 caracteres');
                return;
            }

            if (!acceptTerms) {
                alert('⚠️ Debes aceptar los términos y condiciones');
                return;
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                alert('❌ Correo electrónico inválido');
                return;
            }

            console.log('Registro:', { name, email, password });
            alert(`✅ ¡Bienvenido ${name}! Cuenta creada.`);
            
            if (typeof window.navigateTo === 'function') {
                window.navigateTo('/login');
            } else {
                window.location.href = '/login';
            }
        });
    }

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
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', registerController);
} else {
    registerController();
}