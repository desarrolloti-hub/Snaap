export const footerController = {
    render(container) {
        container.innerHTML = `
            <footer class="snaap-footer">
                <div class="footer-container">
                    <div class="footer-logo-section">
                        <a href="/" class="footer-logo" data-link>Sn<span class="neon-aa">aa</span>p</a>
                    </div>
                    <div class="footer-info-section">
                        <h3>Términos y Condiciones.</h3>
                        <p>
                        Tú eres el autor: Al subir fotos, videos, notas o dibujos,
                        confirmas que son tuyos y nos das permiso para proyectarlos en
                        la pantalla gigante durante el evento.
                        </p>
                        <p>
                        Cero Tolerancia: Está estrictamente prohibido compartir
                        contenido ofensivo, vulgar, violento, inapropiado, sexual o
                        publicitario.
                        </p>
                        <p>Snaap no se hace responsable en ningún caso
                        por el contenido ofensivo o ilegal que los usuarios decidan
                        subir.
                        </p>
                        <p>
                        Moderación del Organizador: La pantalla es controlada por el
                        anfitrión del evento.
                        </p>
                        <p> 
                        El organizador tiene el poder y la obligación
                        de moderar y eliminar de inmediato cualquier contenido que
                        considere inadecuado.</p>
                        <p>
                        Responsabilidad: Tú eres el único responsable legal de lo que compartas en la pantalla.
                        </p>
                        <p>
                        Conectividad: La velocidad de proyección en tiempo real
                        depende de la señal de internet del lugar.
                        </p>
                        <p>
                        leer más en <a href="/terms" data-link>nuestros términos y condiciones</a>.
                        </p>
                        <div class="social-title">NUESTR<span>aa</span>S REDES SOCI<span>aa</span>LES</div>
                        <div class="social-icons">
                            <a href="#" class="social-link"><i class="fab fa-x-twitter"></i></a>
                            <a href="#" class="social-link"><i class="fab fa-facebook-f"></i></a>
                            <a href="#" class="social-link"><i class="fab fa-instagram"></i></a>
                            <a href="#" class="social-link"><i class="fab fa-whatsapp"></i></a>
                        </div>
                    </div>
                </div>
                <div class="footer-bottom">
                    <a href="https://rsienterprise.com/" target="_blank" class="rsi-link">Desarrollado por RSI Enterprise México</a>
                </div>
            </footer>
        `;
    }
};