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
                        <p>Primera línea con texto suave. Segunda línea que continúa la idea. Tercera línea para mantener la forma. Cuarta línea sin mensaje específico. Quinta línea para completar las cinco.</p>
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