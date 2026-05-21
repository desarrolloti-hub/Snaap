export async function loginController() {
    const cssLink = document.querySelector('link[href="/src/css/components/login.css"]');
    if (!cssLink) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = '/src/css/components/login.css';
        document.head.appendChild(link);
    }
    
    const form = document.getElementById('login-form');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value;
            const nombre = document.getElementById('login-nombre').value;
            const password = document.getElementById('login-password').value;
            console.log('Intento de login:', { email, nombre, password });
            alert('Funcionalidad de login por implementar');
        });
    }
    
    const btnCrear = document.getElementById('btn-crear-cuenta');
    if (btnCrear) {
        btnCrear.addEventListener('click', () => {
            alert('Funcionalidad de crear cuenta por implementar');
        });
    }
}