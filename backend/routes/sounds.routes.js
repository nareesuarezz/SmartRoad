module.exports = (app) => {
  const sounds = require("../controllers/sounds.controller");
  const uploadSound = require("../multer/uploadSound");

  var router = require("express").Router();

  router.post("/", uploadSound, sounds.create);

  router.get("/", sounds.getAll);

  router.get("/:id", sounds.getOne);

  router.put("/:id", uploadSound, sounds.update);

  router.delete("/:id", sounds.delete);

  router.get("/findBySound/:letters", sounds.findByLetters)

  app.use("/api/sounds", router);
};