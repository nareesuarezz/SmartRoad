const db = require("../models");
const Sounds = db.Sounds;
const Op = db.Sequelize.Op;
const path = require('path');
const fs = require('fs');


exports.create = async (req, res) => {
  try {
    const { filename } = req.file;

    const sound = await Sounds.create({
      filename,
    });

    res.status(201).send(sound);
  } catch (error) {
    console.error(error);
    res.status(500).send({
      message: "Error creating sound",
    });
  }
};

exports.getAll = async (req, res) => {
  try {
    const sounds = await Sounds.findAll();
    res.send(sounds); 
  } catch (error) {
    console.error(error);
    res.status(500).send({
      message: "Error retrieving sounds",
    });
  }
};


exports.getOne = async (req, res) => {
  try {
    const sound = await Sounds.findByPk(req.params.id);

    if (!sound) {
      return res.status(404).send({
        message: "Sound not found",
      });
    }

    // Define la ruta al archivo de sonido
    const filePath = path.join(__dirname, '../public/sounds/', sound.filename);

    // Envía el archivo de sonido como respuesta
    res.sendFile(filePath);
  } catch (error) {
    console.error(error);
    res.status(500).send({
      message: "Error retrieving sound",
    });
  }
};




exports.update = async (req, res) => {
  try {
    const { filename } = req.file;

    const sound = await Sounds.findByPk(req.params.id);

    if (!sound) {
      return res.status(404).send({
        message: "Sound not found",
      });
    }

    await sound.update({
      filename,
    });

    res.send(sound);
  } catch (error) {
    console.error(error);
    res.status(500).send({
      message: "Error updating sound",
    });
  }
};

exports.delete = async (req, res) => {
  try {
    const sound = await Sounds.findByPk(req.params.id);

    if (!sound) {
      return res.status(404).send({
        message: "Sound not found",
      });
    }

    const filePath = path.join(__dirname, '../public/sounds/', sound.filename);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    await sound.destroy();

    res.send({ message: "Sound deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      message: "Error deleting sound",
    });
  }
};
