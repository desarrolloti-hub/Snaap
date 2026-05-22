export async function loginController() {
    // Cargar CSS específico
    const cssLink = document.querySelector('link[href="/src/css/components/login.css"]');
    if (!cssLink) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = '/src/css/components/login.css';
        document.head.appendChild(link);
    }

    const app = document.getElementById('app');
    if (!app) return;

    app.innerHTML = `
        <section class="snaap-login-section">
            <div class="login-logo-side">
                <div class="big-snaap-logo">Sn<span class="neon-aa">aa</span>p</div>
            </div>
            <div class="login-card">
                <h2>Inicio de sesión.</h2>
                <form class="login-form" id="login-form">
                    <div class="input-group">
                        <i class="fas fa-envelope"></i>
                        <input type="email" class="snaap-input" id="login-email" placeholder="correo electrónico" required>
                    </div>
                    <div class="input-group">
                        <i class="fas fa-user"></i>
                        <input type="text" class="snaap-input" id="login-nombre" placeholder="nombre de usuario" required>
                    </div>
                    <div class="input-group">
                        <i class="fas fa-lock"></i>
                        <input type="password" class="snaap-input" id="login-password" placeholder="contraseña" required>
                    </div>
                    <div class="login-actions">
                        <button type="submit" class="btn-login" id="btn-login">Iniciar sesión</button>
                        <button type="button" class="btn-login" id="btn-register">Crear cuenta</button>
                    </div>
                    <div class="register-link">
                        ¿Olvidaste tu contraseña? <a href="#" id="forgot-password">Recupérala aquí</a>
                    </div>
                    <div class="social-login">
                        <i class="fab fa-google social-icon" data-social="google"></i>
                        <i class="fab fa-facebook-f social-icon" data-social="facebook"></i>
                        <i class="fab fa-apple social-icon" data-social="apple"></i>
                    </div>
                </form>
            </div>
        </section>
    `;

    // Evento del formulario de login
    const form = document.getElementById('login-form');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value;
            const nombre = document.getElementById('login-nombre').value;
            const password = document.getElementById('login-password').value;

            if (!email || !nombre || !password) {
                alert('❌ Por favor completa todos los campos');
                return;
            }
            console.log('Intento de login:', { email, nombre, password });
            alert(`✅ Bienvenido ${nombre}, pronto serás redirigido. (Demo)`);
            // Aquí podrías redirigir o guardar sesión
        });
    }

    // Botón "Crear cuenta"
    const btnRegister = document.getElementById('btn-register');
    if (btnRegister) {
        btnRegister.addEventListener('click', () => {
            alert('📝 Funcionalidad de registro en desarrollo. Pronto estará disponible.');
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

    // Botones de redes sociales
    const socialIcons = document.querySelectorAll('.social-icon');
    socialIcons.forEach(icon => {
        icon.addEventListener('click', () => {
            const social = icon.getAttribute('data-social') || 'red social';
            alert(`🔑 Inicio de sesión con ${social} (demo). Próximamente.`);
        });
    });
}