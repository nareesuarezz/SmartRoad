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

  // Nuevo endpoint para calcular la distancia total recorrida por los vehículos de un administrador
  router.get("/distance/admin/:Admin_UID", tracks.calculateTotalDistance);

  // Retrieve a single Car with type and id
  router.get("/:type/:id", tracks.timeCar);

  // Nuevo endpoint para obtener el tiempo del coche
  router.get("/timeCar/:Vehicle_UID", tracks.timeCar);




  app.use("/api/tracks", router);
}