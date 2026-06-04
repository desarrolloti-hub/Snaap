// src/routes.js
import { homeController } from '/src/modules/visitor/home/homeController.js';
import { aboutUsController } from '/src/modules/visitor/aboutUs/aboutUsController.js';
import { loginController } from '/src/modules/visitor/login/loginController.js';
import { packagesController } from '/src/modules/visitor/packages/packagesController.js';
import { init404Controller } from '/src/modules/shared/errors/404Controller.js';
import { termsController } from '/src/modules/visitor/terms/termsController.js';
import { homeHostController } from '/src/modules/host/homeHost/homeHostController.js';
import { navbarController } from '/src/modules/visitor/layout/navbarController.js';
import { navbarHostController } from '/src/modules/host/layout/navbarHostController.js';

export const routes = {
    "/": {
        view: "/public/modules/visitor/home/home.html",
        controller: homeController,
        navbar: navbarController  // ← Agregar navbar específico
    },
    "/nosotros": {
        view: "/public/modules/visitor/aboutUs/aboutUs.html",
        controller: aboutUsController,
        navbar: navbarController  // ← Mismo navbar para visitante
    },
    "/login": {
        view: "/src/modules/visitor/login/login.html",
        controller: loginController,
        navbar: navbarController  // ← Navbar de visitante
    },
    "/paquetes": {
        view: "/public/modules/visitor/packages/packages.html",  
        controller: packagesController,
        navbar: navbarController  // ← Navbar de visitante
    },
    "/host": {
        view: "/public/modules/host/homeHost/homeHost.html", 
        controller: homeHostController,
        navbar: navbarHostController   // ← Aquí luego irá navbarHostController
    },
    "/terms": {
        view: "/src/modules/visitor/terms/terms.html",
        controller: termsController,
        navbar: navbarController
    },
    "/404": {
        view: "/public/modules/shared/errors/404.html",
        controller: init404Controller,
        navbar: null  // Error 404 sin navbar o con navbar genérico
    }
};