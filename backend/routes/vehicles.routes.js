module.exports = app => {
    const vehicles = require("../controllers/vehicles.controller");
  
    var router = require("express").Router();
  
    // Create a new Car
    // DECOMMENT:
    router.post("/", vehicles.create);
    // router.post("/", bicycles.create);
  
    // Retrieve all Cars
    router.get("/", vehicles.findAll);
  
    // Retrieve a single Car with id
    router.get("/:id", vehicles.findOne);
  
    // Update a Car with id
    router.put("/:id", vehicles.update);
  
    // Delete a Car with id
    router.delete("/:id", vehicles.delete);
  
    // Delete all Cars
    router.delete("/", vehicles.deleteAll);
  
    app.use("/api/vehicles", router);
  }