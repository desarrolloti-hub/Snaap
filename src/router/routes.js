// src/routes.js
import { homeController } from '/src/modules/visitor/home/homeController.js';
import { aboutUsController } from '/src/modules/visitor/aboutUs/aboutUsController.js';
import { loginController } from '/src/modules/visitor/login/loginController.js';
import { packagesController } from '/src/modules/visitor/packages/packagesController.js';
import { init404Controller } from '/src/modules/shared/errors/404Controller.js';
import { termsController } from '/src/modules/visitor/terms/termsController.js';
import { homeHostController } from '/src/modules/host/homeHost/homeHostController.js';
import { navbarController } from '/src/modules/visitor/layout/navbarController.js';
import { initNavbarHost } from '/src/modules/host/layout/navbarHostController.js';
import { initCreateEvent } from '/src/modules/host/createEvent/createEventController.js';
import { carroucelEventsController } from '/src/modules/host/carroucelEvents/carroucelEventsController.js';
export const routes = {
    "/": {
        view: "/public/modules/visitor/home/home.html",
        controller: homeController,
        navbar: navbarController
    },
    "/nosotros": {
        view: "/public/modules/visitor/aboutUs/aboutUs.html",
        controller: aboutUsController,
        navbar: navbarController
    },
    "/login": {
        view: "/src/modules/visitor/login/login.html",
        controller: loginController,
        navbar: navbarController
    },
    "/paquetes": {
        view: "/public/modules/visitor/packages/packages.html",  
        controller: packagesController,
        navbar: navbarController
    },
    "/host": {
        view: "/public/modules/host/homeHost/homeHost.html", 
        controller: homeHostController,
        navbar: initNavbarHost
    },
    "/host/create-event": {
        view: "/public/modules/host/createEvent/createEvent.html",
        controller: initCreateEvent,
        navbar: initNavbarHost
    },
    "/host/events": {
        view: "/public/modules/host/carroucelEvents/carroucelEvents.html",
        controller: carroucelEventsController,
        navbar: initNavbarHost
    },
    "/terms": {
        view: "/src/modules/visitor/terms/terms.html",
        controller: termsController,
        navbar: navbarController
    },
    "/404": {
        view: "/public/modules/shared/errors/404.html",
        controller: init404Controller,
        navbar: null
    }
};