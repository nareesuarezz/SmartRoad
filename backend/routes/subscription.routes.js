module.exports = app => {
    const subscriptions = require("../controllers/subscription.controller");
  
    var router = require("express").Router();
  
    router.post("/subscribe", subscriptions.create);
  
    router.post("/sendNotificationToSubscriptionName", subscriptions.sendNotificationToSubscriptionName);
  
    router.post("/deleteByEndpoint", subscriptions.deleteByEndpoint);
  
    router.get("/", subscriptions.findAll);
  
    app.use("/api/subscriptions", router);
  }