const SnaapPaquetesComponent = (() => {
    const init = () => {
        const target = document.getElementById("contenedor-paquetes");
        if (!target) return;

        const container = document.createElement("div");
        container.className = "snaap-paquetes-section";

        container.innerHTML = `
            <div class="paquete-header">
                <h2>Artist<span>aa</span> Emergente.</h2>
            </div>

            <div class="paquete-main-content">
                <div class="paquete-logo-frame">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/b/bd/Rolling_Stones_logo.svg" alt="Icono Artista">
                </div>

                <div class="paquete-info">
                    <h3>det<span>aa</span>lles del p<span>aaa</span>quete.</h3>
                    <p>
                        Primera línea con texto suave. Segunda línea que continúa la idea. Tercera línea para mantener la forma Cuarta línea sin mensaje específico. Quinta línea para completar las cinco. 
                        Branding neón personalizado, iluminación reactiva y una experiencia sonora de primer nivel para tu evento Snaap!.
                    </p>
                </div>

                <div class="paquete-acciones">
                    <button class="btn-snaap-pkg">
                        <i class="fas fa-heart"></i> agregar a favoritos
                    </button>
                    <button class="btn-snaap-pkg">
                        <i class="fas fa-shopping-cart"></i> rentar
                    </button>
                    <button class="btn-snaap-pkg">
                        <i class="fas fa-credit-card"></i> formas de pago
                    </button>
                </div>
            </div>
        `;

        target.appendChild(container);
    };

    return { init };
})();

document.addEventListener("DOMContentLoaded", SnaapPaquetesComponent.init);