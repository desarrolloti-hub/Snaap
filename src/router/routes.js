// src/router/routes.js
import { homeController } from '../modules/visitor/home/homeController.js';
import { aboutUsController } from '../modules/visitor/aboutUs/aboutUsController.js';
import { loginController } from '../modules/visitor/login/loginController.js';
import { packagesController } from '../modules/visitor/packages/packagesController.js';
import { init404Controller } from '../modules/shared/errors/404Controller.js';
import { termsController } from '../modules/visitor/terms/termsController.js';
import { homeHostController } from '../modules/host/homeHost/homeHostController.js';
import { initCreateEvent } from '../modules/host/createEvent/createEventController.js';
import { carroucelEventsController } from '../modules/host/carroucelEvents/carroucelEventsController.js';
import { registerController } from '../modules/visitor/register/registerController.js';
import { eventCrudController } from '../modules/host/eventCrud/eventCrudController.js';
import { eventEditFormController } from '../modules/host/eventEditForm/eventEditFormController.js';
import { eventDetailsController } from '../modules/host/eventDetails/eventDetailsController.js';
import { homeSysadminController } from '../modules/sysadmin/homeSysadminController/homeSysadminController.js';
import { profileController } from '../modules/host/profile/profileController.js';
import { profileEditController } from '../modules/host/profileEdit/profileEditController.js';
import { crudHostController } from '../modules/sysadmin/crudHost/crudHostController.js';
import { hostFormController } from '../modules/sysadmin/hostForm/hostFormController.js';
import { hostEditController } from '../modules/sysadmin/hostEdit/hostEditController.js';
import { hostDetailsController } from '../modules/sysadmin/hostDetails/hostDetailsController.js';
import { crudAdminController } from '../modules/sysadmin/crudAdmin/crudAdminController.js';
import { adminFormController } from '../modules/sysadmin/adminForm/adminFormController.js';
import { adminEditController } from '../modules/sysadmin/adminEdit/adminEditController.js';
import { adminDetailsController } from '../modules/sysadmin/adminDetails/adminDetailsController.js';
import { profileAdminController } from '../modules/sysadmin/profileAdmin/profileAdminController.js';
import { profileEditController as profileAdminEditController } from '../modules/sysadmin/profileEdit/profileEditController.js';
import { carouselAdminController } from '../modules/sysadmin/carouselAdmin/carouselAdminController.js';

// ============================================
// 🔥 IMPORTS DE USUARIO
// ============================================
import { initHomeUserController } from '../modules/user/homeUser/homeUserController.js';
import { initGalleryUserController } from '../modules/user/galleryUser/galleryUserController.js';

// ============================================
// 🔥 IMPORTS DE EVENTO EN VIVO
// ============================================
import { initLiveEventController } from '../modules/host/liveEvent/liveEventController.js';

// ============================================
// 🔥 IMPORTS DE PROYECCIÓN
// ============================================
import { initProjectionController } from '../modules/host/projection/projectionController.js';

// ============================================
// 🗺️ CONFIGURACIÓN DE RUTAS
// ============================================
export const routes = {
    // ============================================
    // 🏠 RUTAS PÚBLICAS
    // ============================================
    "/": {
        view: "/modules/visitor/home/home.html",
        controller: homeController,
        title: 'Snaap - Eventos Interactivos'
    },
    "/nosotros": {
        view: "/modules/visitor/aboutUs/aboutUs.html",
        controller: aboutUsController,
        title: 'Sobre Nosotros - Snaap'
    },
    "/login": {
        view: "/modules/visitor/login/login.html",
        controller: loginController,
        title: 'Iniciar Sesión - Snaap'
    },
    "/register": {
        view: "/modules/visitor/register/register.html",
        controller: registerController,
        title: 'Registrarse - Snaap'
    },
    "/paquetes": {
        view: "/modules/visitor/packages/packages.html",
        controller: packagesController,
        title: 'Paquetes - Snaap'
    },
    "/terms": {
        view: "/modules/visitor/terms/terms.html",
        controller: termsController,
        title: 'Términos y Condiciones - Snaap'
    },

    // ============================================
    // 👤 RUTAS DE USUARIO (INVITADO)
    // ============================================
    "/user/home": {
        view: "/modules/user/homeUser/homeUser.html",
        controller: initHomeUserController,
        title: 'Evento - Snaap',
        roles: ['user', 'host', 'sysadmin']
    },
    "/user/gallery": {
        view: "/modules/user/galleryUser/galleryUser.html",
        controller: initGalleryUserController,
        title: 'Mi Galería - Snaap',
        roles: ['user', 'host', 'sysadmin']
    },

    // ============================================
    // 🎤 RUTAS DE HOST
    // ============================================
    "/host": {
        view: "/modules/host/homeHost/homeHost.html",
        controller: homeHostController,
        title: 'Dashboard - Snaap Host',
        roles: ['host', 'sysadmin']
    },
    "/host/create-event": {
        view: "/modules/host/createEvent/createEvent.html",
        controller: initCreateEvent,
        title: 'Crear Evento - Snaap Host',
        roles: ['host', 'sysadmin']
    },
    "/host/events": {
        view: "/modules/host/carroucelEvents/carroucelEvents.html",
        controller: carroucelEventsController,
        title: 'Mis Eventos - Snaap Host',
        roles: ['host', 'sysadmin']
    },
    "/host/event-crud": {
        view: "/modules/host/eventCrud/eventCrud.html",
        controller: eventCrudController,
        title: 'Gestionar Eventos - Snaap Host',
        roles: ['host', 'sysadmin']
    },
    "/host/event-edit": {
        view: "/modules/host/eventEditForm/eventEditForm.html",
        controller: eventEditFormController,
        title: 'Editar Evento - Snaap Host',
        roles: ['host', 'sysadmin']
    },
    "/host/event-details": {
        view: "/modules/host/eventDetails/eventDetails.html",
        controller: eventDetailsController,
        title: 'Detalles del Evento - Snaap Host',
        roles: ['host', 'sysadmin']
    },
    "/host/live-event": {
        view: "/modules/host/liveEvent/liveEvent.html",
        controller: initLiveEventController,
        title: 'Evento en Vivo - Snaap',
        roles: ['host', 'sysadmin']
    },
    "/host/projection": {
        view: "/modules/host/projection/projection.html",
        controller: initProjectionController,
        title: 'Proyección - Snaap',
        roles: ['host', 'sysadmin']
    },
    "/host/profile": {
        view: "/modules/host/profile/profile.html",
        controller: profileController,
        title: 'Mi Perfil - Snaap Host',
        roles: ['host', 'sysadmin']
    },
    "/host/profile/edit": {
        view: "/modules/host/profileEdit/profileEdit.html",
        controller: profileEditController,
        title: 'Editar Perfil - Snaap Host',
        roles: ['host', 'sysadmin']
    },

    // ============================================
    // 👑 RUTAS DE SYSADMIN
    // ============================================
    "/sysadmin/home": {
        view: "/modules/sysadmin/homeSysadmin/homeSysadmin.html",
        controller: homeSysadminController,
        title: 'Panel de Control - Snaap Admin',
        roles: ['sysadmin']
    },
    "/sysadmin/hosts": {
        view: "/modules/sysadmin/crudHost/crudHost.html",
        controller: crudHostController,
        title: 'Gestionar Hosts - Snaap Admin',
        roles: ['sysadmin']
    },
    "/sysadmin/hosts/create": {
        view: "/modules/sysadmin/hostForm/hostForm.html",
        controller: hostFormController,
        title: 'Crear Host - Snaap Admin',
        roles: ['sysadmin']
    },
    "/sysadmin/hosts/edit": {
        view: "/modules/sysadmin/hostEdit/hostEdit.html",
        controller: hostEditController,
        title: 'Editar Host - Snaap Admin',
        roles: ['sysadmin']
    },
    "/sysadmin/host-details": {
        view: "/modules/sysadmin/hostDetails/hostDetails.html",
        controller: hostDetailsController,
        title: 'Detalles del Host - Snaap Admin',
        roles: ['sysadmin']
    },
    "/sysadmin/admins": {
        view: "/modules/sysadmin/crudAdmin/crudAdmin.html",
        controller: crudAdminController,
        title: 'Gestionar Administradores - Snaap Admin',
        roles: ['sysadmin']
    },
    "/sysadmin/admins/create": {
        view: "/modules/sysadmin/adminForm/adminForm.html",
        controller: adminFormController,
        title: 'Crear Administrador - Snaap Admin',
        roles: ['sysadmin']
    },
    "/sysadmin/admins/edit": {
        view: "/modules/sysadmin/adminEdit/adminEdit.html",
        controller: adminEditController,
        title: 'Editar Administrador - Snaap Admin',
        roles: ['sysadmin']
    },
    "/sysadmin/admin-details": {
        view: "/modules/sysadmin/adminDetails/adminDetails.html",
        controller: adminDetailsController,
        title: 'Detalles del Administrador - Snaap Admin',
        roles: ['sysadmin']
    },
    "/sysadmin/profile": {
        view: "/modules/sysadmin/profileAdmin/profileAdmin.html",
        controller: profileAdminController,
        title: 'Mi Perfil - Snaap Admin',
        roles: ['sysadmin']
    },
    "/sysadmin/profile/edit": {
        view: "/modules/sysadmin/profileEdit/profileEdit.html",
        controller: profileAdminEditController,
        title: 'Editar Perfil - Snaap Admin',
        roles: ['sysadmin']
    },
    "/sysadmin/carousel": {
        view: "/modules/sysadmin/carouselAdmin/carouselAdmin.html",
        controller: carouselAdminController,
        title: 'Gestionar Carrusel - Snaap Admin',
        roles: ['sysadmin']
    },

    // ============================================
    // 🔴 ERROR
    // ============================================
    "/404": {
        view: "/modules/shared/errors/404.html",
        controller: init404Controller,
        title: 'Página no encontrada - Snaap'
    },
};

// ============================================
// 🔍 OBTENER RUTAS POR ROL
// ============================================
export function getRoutesByRole(role) {
    const allRoutes = Object.keys(routes);
    const routePermissions = {
        'user': ['/', '/nosotros', '/paquetes', '/terms', '/user/home', '/user/gallery'],
        'host': ['/', '/nosotros', '/paquetes', '/terms', '/host', '/host/*', '/user/home', '/user/gallery'],
        'sysadmin': ['/', '/nosotros', '/paquetes', '/terms', '/sysadmin/*', '/host/*', '/user/home', '/user/gallery'],
    };
    
    const allowed = routePermissions[role] || [];
    return allRoutes.filter(route => {
        return allowed.some(pattern => {
            if (pattern.endsWith('/*')) {
                const base = pattern.slice(0, -2);
                return route === base || route.startsWith(base + '/');
            }
            return route === pattern;
        });
    });
}

// ============================================
// 🔍 OBTENER TÍTULO DE RUTA
// ============================================
export function getRouteTitle(path) {
    const route = routes[path];
    return route?.title || 'Snaap - Eventos Interactivos';
}

// ============================================
// 🔍 VERIFICAR SI RUTA REQUIERE AUTENTICACIÓN
// ============================================
export function isProtectedRoute(path) {
    const route = routes[path];
    return route?.roles !== undefined;
}

// ============================================
// 🔍 VERIFICAR SI USUARIO TIENE ACCESO
// ============================================
export function hasRouteAccess(path, userRole) {
    const route = routes[path];
    if (!route) return false;
    if (!route.roles) return true;
    return route.roles.includes(userRole);
}