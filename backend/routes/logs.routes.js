
module.exports = app => {
    const logs = require("../controllers/logs.controller");
  
    var router = require("express").Router();
  
    // Create a new Car
    // DECOMMENT:
    router.post("/", logs.create);
    // router.post("/", bicycles.create);
  
    // Retrieve all Cars
    router.get("/", logs.findAll);
  
    // Retrieve a single Car with id
    router.get("/:id", logs.findOne);
  
    // Update a Car with id
    router.put("/:id", logs.update);
  
    // Delete a Car with id
    router.delete("/:id", logs.delete);
  
    // Delete all Cars
    router.delete("/", logs.deleteAll);
  
    app.use("/api/logs", router);
  }