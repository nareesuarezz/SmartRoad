module.exports = app => {
  const vehicles = require("../controllers/vehicles.controller");

  var router = require("express").Router();

  router.post("/", vehicles.create);

  router.get("/", vehicles.findAll);

  router.get("/:id", vehicles.findOne);

  router.put("/:id", vehicles.update);

  router.delete("/:id", vehicles.delete);

  router.delete("/", vehicles.deleteAll);

  router.get("/findByVehicleType/:Vehicle", vehicles.findByVehicleType)

  app.use("/api/vehicles", router);
}