// src/modules/visitor/terms/termsController.js

export async function termsController() {
    // Cambiar título de la página
    document.title = 'Aviso de Privacidad y Términos | Snaap';

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
                <h1>Aviso de Privacidad y Términos de Uso</h1>
                <p>Última actualización: <strong>28 de mayo de 2026</strong></p>
                <div class="terms-neon-divider"></div>
            </div>

            <div class="snaap-terms-content">
                <!-- ========== AVISO DE PRIVACIDAD ========== -->
                <section>
                    <h2>Aviso de Privacidad (Snaap)</h2>
                    <p>En cumplimiento con la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP) y su Reglamento, RSI ENTERPRISE – SNAAP (en adelante, "Snaap"), con domicilio en C. 31 110, El Sol, 57200 Ciudad Nezahualcóyotl, Estado de México, y correo electrónico de contacto <strong>soportetecnico@rhafasoluciones.com</strong>, pone a su disposición el presente Aviso de Privacidad.</p>
                </section>

                <section>
                    <h3>1. Datos Personales que se recaban</h3>
                    <p>Snaap recabará los siguientes datos personales de sus usuarios (Organizadores e Invitados por igual al momento de su registro):</p>
                    <ul>
                        <li>Nombre completo o pseudónimo.</li>
                        <li>Edad y fecha de nacimiento.</li>
                        <li>Correo electrónico.</li>
                        <li>Número de teléfono (móvil).</li>
                        <li>Fotografías, videos o imágenes cargadas a la plataforma.</li>
                        <li>Datos de facturación y pago (exclusivo para Organizadores, procesados de forma cifrada por terceros).</li>
                    </ul>
                    <p><strong>Nota sobre Menores de Edad:</strong> Snaap no busca recabar datos de menores de edad de forma intencional. Si el usuario es menor de 18 años, el registro y carga de fotos debe realizarse bajo la supervisión y consentimiento de sus padres o tutores legales.</p>
                </section>

                <section>
                    <h3>2. Finalidad del Tratamiento de Datos</h3>
                    <p>Sus datos personales serán utilizados para las siguientes finalidades necesarias para el servicio:</p>
                    <ul>
                        <li>Creación, validación y administración de su cuenta en Snaap.</li>
                        <li>Vinculación de sus fotografías con su perfil para ser proyectadas en tiempo real en la pantalla del evento mediante el código QR.</li>
                        <li>Permitir al Organizador del evento identificar quién subió cada fotografía en su álbum digital.</li>
                        <li>Enviar notificaciones relacionadas con el servicio, actualizaciones o códigos de acceso.</li>
                        <li>Atender solicitudes de soporte técnico y aclaraciones.</li>
                    </ul>
                </section>

                <section>
                    <h3>3. Transferencia de Datos y Retención</h3>
                    <p>Snaap no vende ni transfiere sus datos personales a terceros, salvo proveedores tecnológicos esenciales (servicios de hosting y pasarelas de pago) bajo estrictas cláusulas de confidencialidad. Las fotografías de los eventos se almacenarán en nuestros servidores por un periodo de <strong>15 días naturales en planes gratuitos</strong> y hasta <strong>6 meses en planes Premium</strong>, tras lo cual serán eliminadas definitivamente.</p>
                </section>

                <section>
                    <h3>4. Medios para ejercer los Derechos ARCO</h3>
                    <p>Usted tiene derecho a Acceder, Rectificar, Cancelar u Oponerse (ARCO) al tratamiento de sus datos. Para solicitar que se borre su cuenta, su número de teléfono, correo o una foto específica de nuestros servidores, deberá enviar un correo a <strong>soportetecnico@rhafasoluciones.com</strong>. Su solicitud será resuelta en un plazo máximo de 20 días hábiles conforme a la ley.</p>
                </section>

                <!-- ========== TÉRMINOS Y CONDICIONES DE USO ========== -->
                <section>
                    <h2>Términos y Condiciones de Uso</h2>
                    <p>Bienvenido a Snaap. Los presentes Términos y Condiciones regulan el acceso y uso de la aplicación y sitio web de Snaap (en adelante, la "Plataforma"), propiedad de RSI ENTERPRISE. Al registrarse y utilizar nuestros servicios, usted acepta estos términos en su totalidad.</p>
                </section>

                <section>
                    <h3>1. Registro de Cuenta y Veracidad de la Información</h3>
                    <p>Para utilizar Snaap para subir fotos o crear eventos, el usuario debe crear una cuenta proporcionando datos verídicos como su nombre, edad, fecha de nacimiento, correo electrónico y número de teléfono. El usuario es responsable de mantener la confidencialidad de sus datos de acceso y de toda la actividad que ocurra en su cuenta.</p>
                </section>

                <section>
                    <h3>2. Mayoría de Edad y Menores</h3>
                    <p>El uso de la Plataforma por parte de menores de 18 años está condicionado al consentimiento de sus padres o tutores. Snaap se reserva el derecho de dar de baja cualquier cuenta si se sospecha que se proporcionó una fecha de nacimiento falsa o si un menor está utilizando la app sin supervisión de un adulto.</p>
                </section>

                <section>
                    <h3>3. Propiedad Intelectual y Licencia de Imágenes</h3>
                    <p>Conforme a la Ley Federal del Derecho de Autor en México, usted conserva los derechos sobre las fotos que suba. Sin embargo, al cargarlas en Snaap, otorga a la Plataforma y al Organizador del evento una licencia gratuita, no exclusiva y temporal para mostrar dicha imagen en las pantallas del evento y guardarla en el álbum digital del mismo. Snaap no genera, no edita, no pre-aprueba ni se solidariza con el Contenido compartido por los Usuarios.</p>
                </section>

                <section>
                    <h3>4. Responsabilidad del Contenido y Comportamiento</h3>
                    <ul>
                        <li>El usuario es el único responsable legal del contenido (fotos y videos) que suba y de que este no viole derechos de terceros.</li>
                        <li>Queda prohibido subir imágenes de carácter pornográfico, de desnudez, que promuevan la violencia, el acoso, el consumo de sustancias ilegales, o que muestren a menores de edad en situaciones inapropiadas.</li>
                        <li><strong>Deslinde de Snaap:</strong> Snaap es solo el proveedor de la herramienta tecnológica. La moderación en vivo de las imágenes corre por cuenta del Organizador del evento. Snaap se deslinda de cualquier responsabilidad civil, penal o administrativa derivada de las imágenes exhibidas por los usuarios. El usuario emisor del Contenido será el único y exclusivo responsable legal de sus acciones.</li>
                    </ul>
                </section>

                <section>
                    <h3>5. Uso de Datos para Contacto</h3>
                    <p>Al proporcionar su correo electrónico y número de teléfono, el usuario acepta que Snaap pueda contactarle para enviar alertas del estado de su evento, actualizaciones de seguridad de su cuenta o soporte técnico. No se enviará publicidad masiva (SPAM) a menos que el usuario lo autorice explícitamente.</p>
                </section>

                <section>
                    <h3>6. Limitaciones Técnicas y de Rendimiento</h3>
                    <p>Snaap implementa tecnología de vanguardia para ofrecer una latencia óptima (menor a 2 segundos) y soportar hasta 500 interacciones simultáneas. No obstante, el Usuario reconoce que el procesamiento en tiempo real depende de factores externos, incluyendo la calidad de la señal de internet del recinto del evento y la red de datos del propio Usuario. Snaap no garantiza el servicio ininterrumpido ante fallas de infraestructura ajenas a su control.</p>
                </section>

                <section>
                    <h3>7. Modificaciones a los Términos</h3>
                    <p>Snaap se reserva el derecho de modificar estos Términos en cualquier momento para adaptarlos a mejoras técnicas, cambios regulatorios o nuevas funciones. Las modificaciones serán efectivas desde el momento de su publicación en la Plataforma.</p>
                </section>

                <section>
                    <p><strong>Contacto:</strong> Calle 31 #110, Col. El Sol, CP 57200 Nezahualcóyotl, Méx. Teléfono: 55 76 90 82 48</p>
                </section>
            </div>

            <div class="snaap-terms-footer">
                <button class="snaap-btn" id="backToHome">Volver al inicio</button>
            </div>
        </div>
    `;

    app.innerHTML = termsContent;

    // Forzar scroll arriba
    window.scrollTo(0, 0);

    // Evento para volver al home usando navegación SPA o fallback
    const backBtn = document.getElementById('backToHome');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            if (typeof window.navigateTo === 'function') {
                window.navigateTo('/');
            } else {
                window.location.href = '/';
            }
        });
    }
}