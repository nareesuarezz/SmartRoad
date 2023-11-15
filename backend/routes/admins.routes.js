module.exports = app => {
    const admins = require("../controllers/admins.controller");
    var upload = require('../multer/upload');

    var router = require("express").Router();
  
    router.post("/", upload.single('filename'), admins.create);
  
    router.get("/", admins.findAll);
  
    router.get("/:id", admins.findOne);
  
    router.put("/:id", upload.single('filename'), admins.update);
  
    router.delete("/:id", admins.delete);
  
    router.delete("/", admins.deleteAll);
  
    app.use("/api/admins", router);
  }