module.exports = app => {
  const tracks = require("../controllers/tracks.controller");

  var router = require("express").Router();

  // Create a new Car
  router.post("/", tracks.create);

  // Retrieve all Cars
  router.get("/", tracks.findAll);

  // Procesa las capas GeoJSON de coches y bicicletas
  router.post("/processTracks", tracks.processTracks);

  // Ruta para obtener tracks recientes dentro de un radio
  router.get('/recent-within-radius', tracks.findRecentTracksWithinRadius);

  router.get('/within-bounds', tracks.findTracksWithinBounds);

  router.get('/in-time-interval', tracks.findTracksInTimeInterval);

  // Nuevo endpoint para obtener el último viaje de un administrador
  router.get("/lastJourney/admin/:Admin_UID", tracks.getLastJourney);

  // Nuevo endpoint para calcular la distancia total recorrida por los vehículos de un administrador
  router.get("/distance/admin/:Admin_UID", tracks.calculateTotalDistance);

  // Retrieve the total time for the vehicles
  router.get("/totalTime/:Admin_UID", tracks.calculateTotalTime);

  // Retrieve the time for the car
  router.get("/carTime/:Admin_UID", tracks.calculateCarTime);

  // Retrieve the time fot the bicycle
  router.get("/bicycleTime/:Admin_UID", tracks.calculateBicycleTime);

  // Retrieve a single Car with id
  router.get("/:id", tracks.findOne);

  // Update a Car with id
  router.put("/:id", tracks.update);

  // Delete a Car with id
  router.delete("/:id", tracks.delete);

  // Delete all Cars
  router.delete("/", tracks.deleteAll);

  app.use("/api/tracks", router);
}
