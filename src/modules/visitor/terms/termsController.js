// src/modules/visitor/layout/terms/termsController.js

export async function termsController() {
    // Cambiar título de la página
    document.title = 'Términos y Condiciones | Snaap';

    // Cargar CSS específico si no existe
    if (!document.querySelector('link[href="/src/css/pages/terms.css"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = '/src/css/pages/terms.css';
        document.head.appendChild(link);
    }

    const app = document.getElementById('app');
    if (!app) return;

    const termsContent = `
        <div class="snaap-terms-container">
            <div class="snaap-terms-header">
                <h1>Términos y Condiciones</h1>
                <p>Última actualización: <strong>1 de mayo de 2026</strong></p>
                <p>Bienvenido a Snaap. Los presentes Términos y Condiciones de Uso regulan el
                acceso y uso de la Plataforma Web Snaap, propiedad de Rsi ENTERPRISES.</p>
                <p>Al acceder, escanear el código QR o interactuar con la Plataforma, usted acepta de manera expresa, voluntaria y sin reservas la totalidad de estos Términos. Si no está de acuerdo con alguna de las disposiciones, deberá abstenerse de utilizar el servicio de inmediato.</p>
                <div class="terms-neon-divider"></div>
            </div>

            <div class="snaap-terms-content">
                <section>
                    <h2>1. Objeto del Servicio</h2>
                    <p>Snaap proporciona una solución tecnológica de interacción visual en tiempo real para eventos. La Plataforma permite a los Usuarios capturar o cargar imágenes, videos, notas de texto y realizar intervenciones de dibujo creativo para ser proyectados de forma colectiva en pantallas dentro de un evento específico.</p>
                </section>

                <section>
                    <h2>2. Acceso y Uso del Servicio</h2>
                    <p>El acceso a la Plataforma se realiza de forma directa mediante el escaneo de un código QR, sin necesidad de descargas en tiendas de aplicaciones de terceros. El Usuario es responsable de contar con un dispositivo móvil compatible y con la conexión a internet (datos móviles o Wi-Fi) necesaria para el correcto funcionamiento de la interfaz.</p>
                </section>

                <section>
                    <h2>3. Propiedad Intelectual y Licencia de Contenido</h2>
                    <h3>Contenido del Usuario:</h3>
                    <p>Al cargar, capturar o crear fotos, videos, textos o dibujos en la Plataforma, el Usuario declara y garantiza que es el autor original de dicho material o que posee los derechos y autorizaciones necesarias para su difusión.</p>
                    <h3>Licencia de uso temporal:</h3>
                    <p>El Usuario otorga a Snaap y al Organizador del evento una licencia no exclusiva y temporal para reproducir, transmitir, adaptar y proyectar el Contenido públicamente de forma exclusiva dentro del marco y duración del evento.</p>
                    <h3>Propiedad de Snaap:</h3>
                    <p>Todos los derechos de propiedad intelectual sobre el software, código fuente, interfaz gráfica, herramientas de dibujo, logotipos y marcas son propiedad exclusiva de Snaap.</p>
                </section>

                <section>
                    <h2>4. Política de Cero Tolerancia frente a Contenido Prohibido</h2>
                    <p>Queda estrictamente prohibido subir o compartir contenido que sea:</p>
                    <p>Difamatorio, obsceno, pornográfico, sexualmente explícito o vulgar.</p>
                    <p>Que incite al odio, la violencia, la discriminación o el acoso de cualquier tipo.</p>
                    <p>Que infrinja los derechos de propiedad intelectual, marcas registradas o derechos de privacidad de terceros.</p>
                    <p>Que constituya publicidad no autorizada, spam, contenido político o actividades comerciales ajenas al evento.</p>
                </section>

                <section>
                    <h2>5. Exclusión de Responsabilidad por Contenido de Terceros</h2>
                    <p>Snaap actúa única y exclusivamente como un proveedor de infraestructura tecnológica e intermediario pasivo. Snaap no genera, no edita, no pre-aprueba ni se solidariza con el Contenido compartido por los Usuarios. Cláusula de Limitación Extrema: Snaap no se hace responsable, bajo ninguna circunstancia (civil, penal o administrativa), por cualquier daño, perjuicio, ofensa, agravio o reclamo que se derive de Contenido ofensivo, inapropiado, difamatorio o ilegal subido por los Usuarios a la Plataforma. El Usuario emisor del Contenido será el único y exclusivo responsable legal de sus acciones.</p>
                </section>

                <section>
                    <h2>6. Sistema de Moderación a cargo del Cliente/Organizador</h2>
                    <p>Snaap proporciona herramientas tecnológicas para la gestión del contenido, pero la operación, filtrado y moderación en vivo de la pantalla gigante corresponden única y exclusivamente al Organizador del evento (la persona física o moral que contrató el servicio de Snaap).</p>
                    <p>El Organizador tiene la facultad, la obligación y el control absoluto para rechazar, bloquear o eliminar de forma inmediata y sin previo aviso cualquier Contenido que considere inapropiado o que viole estos Términos.</p>
                    <p>Snaap queda eximida de cualquier reclamo por la omisión de moderación o por la eliminación de contenido realizada por el Organizador.</p>
                </section>

                <section>
                    <h2>7. Limitaciones Técnicas y de Rendimiento</h2>
                    <p>Snaap implementa tecnología de vanguardia para garantizar una latencia óptima (menor a 2 segundos) y soportar hasta 500 interacciones simultáneas. No obstante, el Usuario reconoce que el procesamiento en tiempo real depende de factores externos, incluyendo la calidad de la señal de internet del recinto del evento y la red de datos del propio Usuario. Snaap no garantiza el servicio ininterrumpido ante fallas de infraestructura ajenas a su control.</p>
                </section>

                <section>
                    <h2>8. Modificaciones a los Términos</h2>
                    <p>Snaap se reserva el derecho de modificar estos Términos en cualquier momento para adaptarlos a mejoras técnicas, cambios regulatorios o nuevas funciones. Las modificaciones serán efectivas desde el momento de su publicación en la Plataforma.</p>
                </section>
            </div>

            <div class="snaap-terms-footer">
                <button class="snaap-btn" id="backToHome">Volver al inicio</button>
            </div>
        </div>
    `;

    app.innerHTML = termsContent;

    // Forzar scroll arriba (para que no se quede en la posición anterior)
    window.scrollTo(0, 0);

    // Evento para volver al home usando navegación SPA (si existe) o fallback
    const backBtn = document.getElementById('backToHome');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            // Intenta usar la navegación del router SPA
            if (typeof window.navigateTo === 'function') {
                window.navigateTo('/');
            } else {
                // Fallback: recarga completa (menos elegante pero seguro)
                window.location.href = '/';
            }
        });
    }
}