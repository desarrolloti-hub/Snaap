import { homeController } from '/src/modules/visitor/home/homeController.js';
import { aboutUsController } from '/src/modules/visitor/aboutUs/aboutUsController.js';
import { loginController } from '/src/modules/visitor/login/loginController.js';
import { packagesController } from '/src/modules/visitor/packages/packagesController.js';
import { init404Controller } from '/src/modules/shared/errors/404Controller.js';
import { termsController } from '/src/modules/visitor/terms/termsController.js';

// Controladores del panel de administración (nuevos, separados)
import { adminDashboardController } from '/src/modules/user/admin/adminDashboardController.js';
import { adminCreateEventController } from '/src/modules/user/admin/adminCreateEventController.js';
import { adminEventHistoryController } from '/src/modules/user/admin/adminEventHistoryController.js';
import { adminEventDetailController } from '/src/modules/user/admin/adminEventDetailController.js';

export const routes = {
    "/": {
        view: "/src/modules/visitor/home/home.html",
        controller: homeController
    },
    "/nosotros": {
        view: "/src/modules/visitor/aboutUs/aboutUs.html",
        controller: aboutUsController
    },
    "/login": {
        view: "/src/modules/visitor/login/login.html",
        controller: loginController
    },
    "/paquetes": {
        view: "/src/modules/visitor/packages/packages.html",
        controller: packagesController
    },
    "/404": {
        view: "/src/modules/shared/errors/404.html",
        controller: init404Controller
    },
    "/terms": {
        controller: termsController
    },
    "/admin": {
        controller: adminDashboardController
    },
    "/admin/crear": {
        controller: adminCreateEventController
    },
    "/admin/historial": {
        controller: adminEventHistoryController
    },
    "/admin/evento/:id": {
        controller: adminEventDetailController
    }
};