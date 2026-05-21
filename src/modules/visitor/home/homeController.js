import { tablesController } from '../../shared/errors/tablesController.js';
import { carouselController } from '../../shared/errors/carouselController.js';

export async function homeController() {
    // Cargar CSS específicos si no existen
    const carouselCSS = document.querySelector('link[href="/src/css/components/carousel.css"]');
    if (!carouselCSS) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = '/src/css/components/carousel.css';
        document.head.appendChild(link);
    }
    const tablesCSS = document.querySelector('link[href="/src/css/components/tables.css"]');
    if (!tablesCSS) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = '/src/css/components/tables.css';
        document.head.appendChild(link);
    }
    
    const tablesContainer = document.getElementById('contenedor-tablas');
    if (tablesContainer) tablesController.render(tablesContainer);
    
    const carouselContainer = document.getElementById('contenedor-carrusel');
    if (carouselContainer) carouselController.render(carouselContainer);
}