// src/router/routes.js
import { homeController } from '../modules/visitor/home/homeController.js';
import { aboutUsController } from '../modules/visitor/aboutUs/aboutUsController.js';
import { loginController } from '../modules/visitor/login/loginController.js';
import { packagesController } from '../modules/visitor/packages/packagesController.js';
import { init404Controller } from '../modules/shared/errors/404Controller.js';
import { termsController } from '../modules/visitor/terms/termsController.js';
import { homeHostController } from '../modules/host/homeHost/homeHostController.js';
// ❌ ELIMINADA: import { navbarController } from '../modules/visitor/layout/navbarController.js';
import { initCreateEvent } from '../modules/host/createEvent/createEventController.js';
import { carroucelEventsController } from '../modules/host/carroucelEvents/carroucelEventsController.js';
// ❌ ELIMINADA: import { navbarHostController } from '../modules/host/layout/navbarHostController.js';
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
import { crudAdminController } from '../modules/sysadmin/crudAdmin/crudAdminController.js';
import { adminFormController } from '../modules/sysadmin/adminForm/adminFormController.js';
import { adminEditController } from '../modules/sysadmin/adminEdit/adminEditController.js';
import { profileAdminController } from '../modules/sysadmin/profileAdmin/profileAdminController.js';
import { profileEditController as profileAdminEditController } from '../modules/sysadmin/profileEdit/profileEditController.js';


export const routes = {
    // ============================================
    // RUTAS PÚBLICAS
    // ============================================
    "/": {
        view: "/public/modules/visitor/home/home.html",
        controller: homeController,
    },
    "/nosotros": {
        view: "/public/modules/visitor/aboutUs/aboutUs.html",
        controller: aboutUsController,
    },
    "/login": {
        view: "/public/modules/visitor/login/login.html",
        controller: loginController,
    },
    "/register": {
        view: "/public/modules/visitor/register/register.html",
        controller: registerController,
    },
    "/paquetes": {
        view: "/public/modules/visitor/packages/packages.html",
        controller: packagesController,
    },
    "/terms": {
        view: "/public/modules/visitor/terms/terms.html",
        controller: termsController,
    },

    // ============================================
    //  RUTAS DE HOST
    // ============================================
    "/host": {
        view: "/public/modules/host/homeHost/homeHost.html",
        controller: homeHostController,
    },
    "/host/create-event": {
        view: "/public/modules/host/createEvent/createEvent.html",
        controller: initCreateEvent,
    },
    "/host/events": {
        view: "/public/modules/host/carroucelEvents/carroucelEvents.html",
        controller: carroucelEventsController,
    },
    "/host/event-crud": {
        view: "/public/modules/host/eventCrud/eventCrud.html",
        controller: eventCrudController,
    },
    "/host/event-edit": {
        view: "/public/modules/host/eventEditForm/eventEditForm.html",
        controller: eventEditFormController,
    },
    "/host/event-details": {
        view: "/public/modules/host/eventDetails/eventDetails.html",
        controller: eventDetailsController,
    },
    "/host/profile": {
        view: "/public/modules/host/profile/profile.html",
        controller: profileController,
    },
    "/host/profile/edit": {
        view: "/public/modules/host/profileEdit/profileEdit.html",
        controller: profileEditController,
    },

    // ============================================
    //  RUTAS DE SYSADMIN
    // ============================================
    "/sysadmin/home": {
        view: "/public/modules/sysadmin/homeSysadmin/homeSysadmin.html",
        controller: homeSysadminController,
    },
    "/sysadmin/hosts": {
        view: "/public/modules/sysadmin/crudHost/crudHost.html",
        controller: crudHostController,
    },
    "/sysadmin/hosts/create": {
        view: "/public/modules/sysadmin/hostForm/hostForm.html",
        controller: hostFormController,
    },
    "/sysadmin/hosts/edit": {
        view: "/public/modules/sysadmin/hostEdit/hostEdit.html",
        controller: hostEditController,
    },
    "/sysadmin/admins": {
        view: "/public/modules/sysadmin/crudAdmin/crudAdmin.html",
        controller: crudAdminController,
    },
    "/sysadmin/admins/create": {
        view: "/public/modules/sysadmin/adminForm/adminForm.html",
        controller: adminFormController,
    },
    "/sysadmin/admins/edit": {
        view: "/public/modules/sysadmin/adminEdit/adminEdit.html",
        controller: adminEditController,
    },
    "/sysadmin/profile": {
        view: "/public/modules/sysadmin/profileAdmin/profileAdmin.html",
        controller: profileAdminController,
    },
    "/sysadmin/profile/edit": {
        view: "/public/modules/sysadmin/profileEdit/profileEdit.html",
        controller: profileAdminEditController,
    },

    // ============================================
    // 🔴 ERROR
    // ============================================
    "/404": {
        view: "/public/modules/shared/errors/404.html",
        controller: init404Controller,
    },
};

// ============================================
// 🔧 FUNCIÓN AUXILIAR PARA OBTENER RUTAS POR ROL
// ============================================
export function getRoutesByRole(role) {
    const allRoutes = Object.keys(routes);
    const routePermissions = {
        'user': ['/', '/nosotros', '/paquetes', '/terms', '/dashboard'],
        'host': ['/', '/nosotros', '/paquetes', '/terms', '/host', '/host/*'],
        'sysadmin': ['/', '/nosotros', '/paquetes', '/terms', '/sysadmin/*', '/host/*'],
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