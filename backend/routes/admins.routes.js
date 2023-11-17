module.exports = app => {
  const admins = require("../controllers/admins.controller");
  var router = require("express").Router();

  var upload = require('../multer/upload');

  router.post("/", upload, admins.create);

  router.get("/", admins.findAll);

  router.get("/:id", admins.findOne);

  router.put("/:id", upload, admins.update);

  router.delete("/:id", admins.delete);

  router.delete("/", admins.deleteAll);

  app.use("/api/admins", router);
}
