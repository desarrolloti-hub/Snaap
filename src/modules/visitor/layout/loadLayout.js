
import { navbarController } from './navbarController.js';
import { footerController } from './footerController.js';
import { navbarHostController } from '../../host/layout/navbarHostController.js';
import { navbarSysadminController } from '../../sysadmin/layout/navbarSysadminController.js';

export async function loadLayout() {
    const navbarContainer = document.getElementById('navbar');
    const currentPath = window.location.pathname;
    
    // Determinar qué navbar cargar según la ruta
    if (currentPath.startsWith('/sysadmin')) {
        // Navbar para SysAdmin
        if (navbarContainer) {
            await navbarSysadminController.render(navbarContainer);
        }
    } else if (currentPath.startsWith('/host')) {
        // Navbar para Host
        if (navbarContainer) {
            await navbarHostController.render(navbarContainer);
        }
    } else {
        // Navbar para Visitante
        if (navbarContainer) {
            await navbarController.render(navbarContainer);
        }
    }
    
    // Footer - solo para visitante y host, ocultar en sysadmin
    const footerContainer = document.getElementById('footer');
    if (footerContainer) {
        if (currentPath.startsWith('/sysadmin')) {
            footerContainer.style.display = 'none';
        } else {
            footerContainer.style.display = '';
            await footerController.render(footerContainer);
        }
    }
}