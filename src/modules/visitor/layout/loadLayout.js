import { navbarController } from './navbarController.js';
import { footerController } from './footerController.js';
import { navbarHostController } from '../../host/layout/navbarHostController.js'; 

export async function loadLayout() {
    const navbarContainer = document.getElementById('navbar');
    const isHostPath = window.location.pathname.startsWith('/host');
    
    if (isHostPath) {
        // Usar el controller del host
        await navbarHostController.render(navbarContainer);
    } else {
        // Usar el controller del visitante
        await navbarController.render(navbarContainer);
    }
    
    // Footer para ambos
    const footerContainer = document.getElementById('footer');
    if (footerContainer) {
        await footerController.render(footerContainer);
    }
}
