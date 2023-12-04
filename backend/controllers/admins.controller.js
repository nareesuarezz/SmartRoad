const db = require("../models");
const Admin = db.Admin;
const Op = db.Sequelize.Op;
const utils = require("../utils");
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

// Create and Save a new Admin
exports.create = (req, res, next) => {
  // Imprime la información del archivo
  console.log('File:', req.file);


  // Imprime el cuerpo de la solicitud
  console.log('Body:', req.body);
  req.body.Username ||= req.bodyb.Username;
  req.body.Password ||= req.bodyb.Password;

  if (!req.body.Password || !req.body.Username) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
    return;
  }

  // Create an Admin
  let admin = {
    Username: req.body.Username,
    Password: req.body.Password,
    filename: req.file ? req.file.filename : ""
  };

  Admin.findOne({ where: { Username: admin.Username } })
    .then(data => {
      if (data) {
        const result = bcrypt.compareSync(admin.Password, data.Password);
        if (!result) return res.status(401).send('Password not valid!');
        const token = utils.generateToken(data);
        const userObj = utils.getCleanUser(data);
        return res.json({ admin: userObj, access_token: token });
      }

      admin.Password = bcrypt.hashSync(req.body.Password);

      // Admin not found. Save new Admin in the database
      Admin.create(admin)
        .then(data => {
          const token = utils.generateToken(data);
          // get basic Admin details
          const userObj = utils.getCleanUser(data);
          // return the token along with Admin details
          return res.json({ admin: userObj, access_token: token });
        })
        .catch(err => {
          res.status(500).send({
            message:
              err.message || "Some error occurred while creating the Admin."
          });
        });

    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving tutorials."
      });
    });
};

exports.findAll = (req, res) => {

  Admin.findAll()
    .then(data => {
      console.log('kkkkkk',data)
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving tutorials."
      });
    });
};

// Find a single Admin with an id
exports.findOne = (req, res) => {
  const id = req.params.id;

  Admin.findByPk(id,{attributes: {exclude: ['Password']}} )
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message: "Error retrieving Admin with id=" + id
      });
    });
};

exports.update = async (req, res) => {
  const id = req.params.id;

  try {
    const admin = await Admin.findByPk(id);

    if (!admin) {
      return res.status(404).send({
        message: `Admin with id=${id} not found.`,
      });
    }

    // Update admin fields
    admin.Username = req.body.Username;

    if (req.body.Password) {
      admin.Password = bcrypt.hashSync(req.body.Password);
    }

    // Check if a new image file is provided
    if (req.file) {
      // Delete the existing image file if it exists
      if (admin.filename) {
        const imagePath = path.join(__dirname, '../public/images/', admin.filename);
        fs.unlink(imagePath, (err) => {
          if (err) {
            console.error('Error deleting image:', err);
          }
        });
      }

      admin.filename = req.file.filename;
    }

    await admin.save();

    return res.status(200).send({
      message: `Admin with id=${id} has been updated successfully.`,
    });
  } catch (error) {
    console.error(`Error updating admin with id=${id}:`, error);
    return res.status(500).send({
      message: "Internal Server Error",
    });
  }
};




// // Delete a Admin with the specified id in the request
exports.delete = (req, res) => {
  const id = req.params.id;

  Admin.findByPk(id)
    .then(admin => {
      if (!admin) {
        return res.status(404).send({
          message: `Admin with id=${id} not found.`
        });
      }

      if (admin.filename) {
        const imagePath = path.join(__dirname, '../public/images/', admin.filename);
        fs.unlink(imagePath, (err) => {
          if (err) {
            console.error('Error deleting image:', err);
          }
        });
      }

      Admin.destroy({
        where: { UID: id }
      })
        .then(num => {
          if (num == 1) {
            res.send({
              message: "Admin was deleted successfully!"
            });
          } else {
            res.send({
              message: `Cannot delete Admin with id=${id}. Maybe Admin was not found!`
            });
          }
        })
        .catch(err => {
          res.status(500).send({
            message: "Could not delete Admin with id=" + id
          });
        });
    })
    .catch(err => {
      res.status(500).send({
        message: "Error retrieving Admin with id=" + id
      });
    });
};

exports.deleteAll = (req, res) => {
  Admin.findAll()
    .then(admins => {
      const imageFileNames = [];

      admins.forEach(admin => {
        if (admin.filename) {
          imageFileNames.push(admin.filename);
        }
      });

      imageFileNames.forEach(fileName => {
        const imagePath = path.join(__dirname, '../public/images/', fileName);
        fs.unlink(imagePath, (err) => {
          if (err) {
            console.error('Error deleting image:', err);
          }
        });
      });

      return Admin.destroy({
        where: {},
        truncate: false
      });
    })
    .then(nums => {
      res.send({ message: `${nums} Admins and associated images were deleted successfully!` });
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while removing all admins."
      });
    });
};



// Find Admin by username and password
exports.findAdminByUsernameAndPassword = (req, res) => {
  const user = req.body.Username;
  const pwd = req.body.Password;

  Admin.findOne({ where: { Username: user, Password: pwd } })
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving Admins."
      });
    });
};

// Obtener información del admin logeado
exports.getLoggedInAdmin = (req, res) => {
  const adminId = req.admin.UID;

  Admin.findByPk(adminId)
    .then(admin => {
      res.json({ admin });
    })
    .catch(error => {
      res.status(500).json({ message: 'Error al obtener información del admin logeado.' });
    });
};