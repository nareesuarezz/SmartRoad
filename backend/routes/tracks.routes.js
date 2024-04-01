module.exports = app => {
  const tracks = require("../controllers/tracks.controller");

  var router = require("express").Router();

  // Create a new Car
  router.post("/", tracks.create);

  // Retrieve all Cars
  router.get("/", tracks.findAll);

  // Ruta para obtener tracks recientes dentro de un radio
  router.get('/recent-within-radius', tracks.findRecentTracksWithinRadius);

  // Retrieve a single Car with id
  router.get("/:id", tracks.findOne);

  // Update a Car with id
  router.put("/:id", tracks.update);

  // Delete a Car with id
  router.delete("/:id", tracks.delete);

  // Delete all Cars
  router.delete("/", tracks.deleteAll);

  // Retrieve the total time for the vehicles
  router.get("/totalTime/:Admin_UID", tracks.calculateTotalTime);

  // Retrieve the time for the car
  router.get("/carTime/:Admin_UID", tracks.calculateCarTime);

  // Retrieve the time fot the bicycle
  router.get("/bicycleTime/:Admin_UID", tracks.calculateBicycleTime);

  app.use("/api/tracks", router);
}
