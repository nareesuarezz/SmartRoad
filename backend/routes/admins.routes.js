// admins.routes.js
module.exports = app => {
  const admins = require("../controllers/admins.controller");
  const auth = require("../controllers/auth"); // Import auth module

  const isAuthenticated = auth.isAuthenticated;

  var router = require("express").Router();

  var upload = require('../multer/upload');

  router.post("/", upload, admins.create);

  router.get("/", isAuthenticated, admins.findAll);

  router.get("/:id", isAuthenticated, admins.findOne); 

  router.put("/:id", upload, isAuthenticated, admins.update); 

  router.delete("/:id", admins.delete);

  router.delete("/", admins.deleteAll);

  router.post("/signin", auth.signin);

  app.use("/api/admins", router);
};
