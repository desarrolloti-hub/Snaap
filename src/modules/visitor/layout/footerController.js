/**
 * Controlador para cargar y gestionar el footer de manera dinámica
 */
export const footerController = {
    /**
     * Renderiza el footer en el contenedor especificado
     * @param {HTMLElement} container - Elemento DOM donde se inyectará el footer
     */
    async render(container) {
        if (!container) {
            console.error('footerController: No se proporcionó un contenedor válido');
            return;
        }

        try {
            const response = await fetch('/modules/visitor/layout/footer.html');
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const html = await response.text();
            container.innerHTML = html;
        } catch (error) {
            console.error('Error loading footer:', error);
            container.innerHTML = this.getFallbackFooter();
        }
    },

    /**
     * Footer de respaldo en caso de error de carga
     * @returns {string} HTML del footer alternativo
     */
    getFallbackFooter() {
        return `
            <footer class="snaap-footer">
                <div class="footer-container">
                    <div class="footer-info-section">
                        <p>© ${new Date().getFullYear()} Snaap - Todos los derechos reservados</p>
                    </div>
                </div>
            </footer>
        `;
    }
};