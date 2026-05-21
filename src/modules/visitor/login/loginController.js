const SnaapLoginComponent = (() => {
    const init = () => {
        const target = document.getElementById("contenedor-login");
        if (!target) return;

        const section = document.createElement("section");
        section.className = "snaap-login-section";

        section.innerHTML = `
            <div class="login-logo-side">
                <div class="big-snaap-logo">
                    Sn<span class="neon-aa">aa</span>p
                </div>
            </div>

            <div class="login-card">
                <h2>Inicio de sesión.</h2>
                <form class="login-form" onsubmit="event.preventDefault()">
                    
                    <div class="input-group">
                        <i class="fas fa-envelope"></i>
                        <input type="email" class="snaap-input" placeholder="correo">
                    </div>
                    
                    <div class="input-group">
                        <i class="fas fa-user"></i>
                        <input type="text" class="snaap-input" placeholder="nombre">
                    </div>
                    
                    <div class="input-group">
                        <i class="fas fa-lock"></i>
                        <input type="password" class="snaap-input" placeholder="contraseña">
                    </div>
                    
                    <div class="login-actions">
                        <button class="btn-login">Inicio</button>
                        <button class="btn-login">Crear cuenta</button>
                    </div>
                </form>
            </div>
        `;

        target.appendChild(section);
    };

    return { init };
})();

document.addEventListener("DOMContentLoaded", SnaapLoginComponent.init);