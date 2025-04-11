"use strict";

const notificationRoutes = require("./api/routes");
const NotificationService = require("./services/NotificationService");

module.exports = {
  routes: notificationRoutes,
  service: NotificationService
}; 