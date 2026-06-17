// src/routes.js
import { homeController } from '/src/modules/visitor/home/homeController.js';
import { aboutUsController } from '/src/modules/visitor/aboutUs/aboutUsController.js';
import { loginController } from '/src/modules/visitor/login/loginController.js';
import { packagesController } from '/src/modules/visitor/packages/packagesController.js';
import { init404Controller } from '/src/modules/shared/errors/404Controller.js';
import { termsController } from '/src/modules/visitor/terms/termsController.js';
import { homeHostController } from '/src/modules/host/homeHost/homeHostController.js';
import { navbarController } from '/src/modules/visitor/layout/navbarController.js';
import { initCreateEvent } from '/src/modules/host/createEvent/createEventController.js';
import { carroucelEventsController } from '/src/modules/host/carroucelEvents/carroucelEventsController.js';
import { navbarHostController } from '/src/modules/host/layout/navbarHostController.js';
import { registerController } from '/src/modules/visitor/register/registerController.js';
import { eventCrudController } from '/src/modules/host/eventCrud/eventCrudController.js';
import { eventEditFormController } from '/src/modules/host/eventEditForm/eventEditFormController.js';
import { eventDetailsController } from '/src/modules/host/eventDetails/eventDetailsController.js';
import { homeSysadminController } from '/src/modules/sysadmin/homeSysadminController/homeSysadminController.js';
import { profileController } from '/src/modules/host/profile/profileController.js';
import { profileEditController } from '/src/modules/host/profileEdit/profileEditController.js';
import { crudHostController } from '/src/modules/sysadmin/crudHost/crudHostController.js';
import { hostFormController } from '/src/modules/sysadmin/hostForm/hostFormController.js';
import { hostEditController } from '/src/modules/sysadmin/hostEdit/hostEditController.js';
import { crudAdminController } from '/src/modules/sysadmin/crudAdmin/crudAdminController.js';
import { adminFormController } from '/src/modules/sysadmin/adminForm/adminFormController.js';
import { adminEditController } from '/src/modules/sysadmin/adminEdit/adminEditController.js';
import { profileAdminController } from '/src/modules/sysadmin/profileAdmin/profileAdminController.js';
import { profileEditController as profileAdminEditController } from '/src/modules/sysadmin/profileEdit/profileEditController.js';

export const routes = {
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
    "/terms": {
        view: "/src/modules/visitor/terms/terms.html",
        controller: termsController,
    },
    "/404": {
        view: "/public/modules/shared/errors/404.html",
        controller: init404Controller,
    },
};