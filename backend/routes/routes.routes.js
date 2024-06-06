module.exports = app => {
  const routes = require("../controllers/routes.controller");

  var router = require("express").Router();

  router.post("/", routes.create);

  router.get("/", routes.findAll);

  router.get("/:id", routes.findOne);

  router.put("/:id", routes.update);

  router.delete("/:id", routes.delete);

  router.delete("/", routes.deleteAll);
  
  router.get("/findByAdminUID/:Admin_UID", routes.findByAdminId)

  app.use("/api/routes", router);
}