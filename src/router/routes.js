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
// 🔥 IMPORT DE USUARIO
// ============================================
import { initHomeUserController } from '../modules/user/homeUser/homeUserController.js';

// ============================================
// 🗺️ CONFIGURACIÓN DE RUTAS
// ============================================
export const routes = {
    // ============================================
    // 🏠 RUTAS PÚBLICAS
    // ============================================
    "/": {
        view: "/public/modules/visitor/home/home.html",
        controller: homeController,
        title: 'Snaap - Eventos Interactivos'
    },
    "/nosotros": {
        view: "/public/modules/visitor/aboutUs/aboutUs.html",
        controller: aboutUsController,
        title: 'Sobre Nosotros - Snaap'
    },
    "/login": {
        view: "/public/modules/visitor/login/login.html",
        controller: loginController,
        title: 'Iniciar Sesión - Snaap'
    },
    "/register": {
        view: "/public/modules/visitor/register/register.html",
        controller: registerController,
        title: 'Registrarse - Snaap'
    },
    "/paquetes": {
        view: "/public/modules/visitor/packages/packages.html",
        controller: packagesController,
        title: 'Paquetes - Snaap'
    },
    "/terms": {
        view: "/public/modules/visitor/terms/terms.html",
        controller: termsController,
        title: 'Términos y Condiciones - Snaap'
    },

    // ============================================
    // 👤 RUTAS DE USUARIO
    // ============================================
    "/user/home": {
        view: "/public/modules/user/homeUser/homeUser.html",
        controller: initHomeUserController,
        title: 'Inicio - Snaap',
        roles: ['user', 'host', 'sysadmin']
    },

    // ============================================
    // 🔥 RUTA DEL EVENTO (para el QR)
    // ============================================
    "/event/:id": {
        view: "/public/modules/user/homeUser/homeUser.html",
        controller: initHomeUserController,
        title: 'Evento - Snaap',
        roles: ['user', 'host', 'sysadmin']
    },

    // ============================================
    // 🎤 RUTAS DE HOST
    // ============================================
    "/host": {
        view: "/public/modules/host/homeHost/homeHost.html",
        controller: homeHostController,
        title: 'Dashboard - Snaap Host',
        roles: ['host', 'sysadmin']
    },
    "/host/create-event": {
        view: "/public/modules/host/createEvent/createEvent.html",
        controller: initCreateEvent,
        title: 'Crear Evento - Snaap Host',
        roles: ['host', 'sysadmin']
    },
    "/host/events": {
        view: "/public/modules/host/carroucelEvents/carroucelEvents.html",
        controller: carroucelEventsController,
        title: 'Mis Eventos - Snaap Host',
        roles: ['host', 'sysadmin']
    },
    "/host/event-crud": {
        view: "/public/modules/host/eventCrud/eventCrud.html",
        controller: eventCrudController,
        title: 'Gestionar Eventos - Snaap Host',
        roles: ['host', 'sysadmin']
    },
    "/host/event-edit": {
        view: "/public/modules/host/eventEditForm/eventEditForm.html",
        controller: eventEditFormController,
        title: 'Editar Evento - Snaap Host',
        roles: ['host', 'sysadmin']
    },
    "/host/event-details": {
        view: "/public/modules/host/eventDetails/eventDetails.html",
        controller: eventDetailsController,
        title: 'Detalles del Evento - Snaap Host',
        roles: ['host', 'sysadmin']
    },
    "/host/profile": {
        view: "/public/modules/host/profile/profile.html",
        controller: profileController,
        title: 'Mi Perfil - Snaap Host',
        roles: ['host', 'sysadmin']
    },
    "/host/profile/edit": {
        view: "/public/modules/host/profileEdit/profileEdit.html",
        controller: profileEditController,
        title: 'Editar Perfil - Snaap Host',
        roles: ['host', 'sysadmin']
    },

    // ============================================
    // 👑 RUTAS DE SYSADMIN
    // ============================================
    "/sysadmin/home": {
        view: "/public/modules/sysadmin/homeSysadmin/homeSysadmin.html",
        controller: homeSysadminController,
        title: 'Panel de Control - Snaap Admin',
        roles: ['sysadmin']
    },
    "/sysadmin/hosts": {
        view: "/public/modules/sysadmin/crudHost/crudHost.html",
        controller: crudHostController,
        title: 'Gestionar Hosts - Snaap Admin',
        roles: ['sysadmin']
    },
    "/sysadmin/hosts/create": {
        view: "/public/modules/sysadmin/hostForm/hostForm.html",
        controller: hostFormController,
        title: 'Crear Host - Snaap Admin',
        roles: ['sysadmin']
    },
    "/sysadmin/hosts/edit": {
        view: "/public/modules/sysadmin/hostEdit/hostEdit.html",
        controller: hostEditController,
        title: 'Editar Host - Snaap Admin',
        roles: ['sysadmin']
    },
    "/sysadmin/host-details": {
        view: "/public/modules/sysadmin/hostDetails/hostDetails.html",
        controller: hostDetailsController,
        title: 'Detalles del Host - Snaap Admin',
        roles: ['sysadmin']
    },
    "/sysadmin/admins": {
        view: "/public/modules/sysadmin/crudAdmin/crudAdmin.html",
        controller: crudAdminController,
        title: 'Gestionar Administradores - Snaap Admin',
        roles: ['sysadmin']
    },
    "/sysadmin/admins/create": {
        view: "/public/modules/sysadmin/adminForm/adminForm.html",
        controller: adminFormController,
        title: 'Crear Administrador - Snaap Admin',
        roles: ['sysadmin']
    },
    "/sysadmin/admins/edit": {
        view: "/public/modules/sysadmin/adminEdit/adminEdit.html",
        controller: adminEditController,
        title: 'Editar Administrador - Snaap Admin',
        roles: ['sysadmin']
    },
    "/sysadmin/admin-details": {
        view: "/public/modules/sysadmin/adminDetails/adminDetails.html",
        controller: adminDetailsController,
        title: 'Detalles del Administrador - Snaap Admin',
        roles: ['sysadmin']
    },
    "/sysadmin/profile": {
        view: "/public/modules/sysadmin/profileAdmin/profileAdmin.html",
        controller: profileAdminController,
        title: 'Mi Perfil - Snaap Admin',
        roles: ['sysadmin']
    },
    "/sysadmin/profile/edit": {
        view: "/public/modules/sysadmin/profileEdit/profileEdit.html",
        controller: profileAdminEditController,
        title: 'Editar Perfil - Snaap Admin',
        roles: ['sysadmin']
    },
    "/sysadmin/carousel": {
        view: "/public/modules/sysadmin/carouselAdmin/carouselAdmin.html",
        controller: carouselAdminController,
        title: 'Gestionar Carrusel - Snaap Admin',
        roles: ['sysadmin']
    },

    // ============================================
    // 🔴 ERROR
    // ============================================
    "/404": {
        view: "/public/modules/shared/errors/404.html",
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
        'user': ['/', '/nosotros', '/paquetes', '/terms', '/user/home'],
        'host': ['/', '/nosotros', '/paquetes', '/terms', '/host', '/host/*', '/user/home'],
        'sysadmin': ['/', '/nosotros', '/paquetes', '/terms', '/sysadmin/*', '/host/*', '/user/home'],
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