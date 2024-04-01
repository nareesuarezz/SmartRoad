module.exports = app => {
  const admins = require("../controllers/admins.controller");
  const auth = require("../controllers/auth");

  const upload = require('../multer/upload');

  var router = require("express").Router();

  router.post("/", upload, admins.create);

  router.get("/", admins.findAll);

  router.get("/:id", admins.findOne);

  router.put("/:id", upload, admins.update);

  router.delete("/:id", admins.delete);

  router.delete("/", admins.deleteAll);

  router.post("/signin", auth.signin);

  router.post("/signup", upload, auth.signup);

  app.use("/api/admins", router);
};
