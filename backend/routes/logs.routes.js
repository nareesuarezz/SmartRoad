
module.exports = app => {
    const logs = require("../controllers/logs.controller");
  
    var router = require("express").Router();
  
    // Create a new Car
    // DECOMMENT:
    router.post("/", logs.create);
  
    // Retrieve all Cars
    router.get("/", logs.findAll);
  
    // Retrieve a single Car with id
    router.get("/:id", logs.findOne);
  
    app.use("/api/logs", router);
  }