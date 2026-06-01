import { navbarController } from './navbarController.js';
import { footerController } from './footerController.js';

export async function loadLayout() {
    const navbarContainer = document.getElementById('navbar');
    if (navbarContainer) {
        navbarController.render(navbarContainer);
        navbarController.attachEvents();
    }
    
    const footerContainer = document.getElementById('footer');
    if (footerContainer) {
        footerController.render(footerContainer);
    }
}