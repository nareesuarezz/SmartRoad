const db = require("../models");
const Admins = db.Admin;
const Op = db.Sequelize.Op;
const fs = require('fs');
const path = require('path');

exports.create = (req, res) => {

  // Crea un Admin
  const admin = {
    Username: req.body.Username,
    Password: req.body.Password,
    filename: req.file ? req.file.filename : ""
  };

  // Guarda el Admin en la base de datos
  Admins.create(admin)
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Some error occurred while creating the admin"
      });
    });
};


// Retrieve all Admins from the database.
exports.findAll = (req, res) => {
  Admins.findAll()
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving all admins"
      });
    });
};

// Find a single Admin with an id
exports.findOne = (req, res) => {
  const id = req.params.id;

  Admins.findOne({
    where: { UID: id }
  })
    .then(data => {
      if (data) {
        res.send(data);
      } else {
        res.status(404).send({
          message: `Cannot find Admin with id=${id}.`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Error retrieving Admin with id=" + id
      });
    });
};

// Update an Admin by the id in the request
exports.update = (req, res) => {
  const id = req.params.id;
  const updateAdmin = {
    Username: req.body.Username,
    Password: req.body.Password
  }

  if (req.file) {
    updateAdmin.filename = req.file.filename;
  }

  console.log(updateAdmin)
  Admins.findByPk(id)
    .then(admin => {
      if (admin) {
        // Actualizar la base de datos primero
        return admin.update(updateAdmin);
      } else {
        res.send({
          message: `Cannot update Admin with id=${id}. Maybe Admin was not found or req.body is empty!`
        });
      }
    })
    .then(updatedAdmin => {
      // Enviar la respuesta después de la actualización de la base de datos
      res.send({
        message: `Admin was updated successfully.`,
        updatedAdmin: updatedAdmin
      });
    })
    .catch(err => {
      res.status(500).send({
        message: "Error updating Admin with id=" + id
      });
    });
};



// Delete an Admin with the specified id in the request
exports.delete = (req, res) => {
  const id = req.params.id;

  Admins.findByPk(id)
    .then(admin => {
      if (!admin) {
        return res.status(404).send({
          message: `Admin with id=${id} not found.`
        });
      }

      // Obtén la ruta del directorio del controlador
      const controllerDir = path.dirname(__filename);

      // Construye la ruta relativa al archivo de imagen
      const imagePath = path.join(controllerDir, '../public/images', admin.filename);

      // Elimina el archivo de imagen
      fs.unlink(imagePath, (err) => {
        if (err) {
          console.error('Error al eliminar la imagen:', err);
        }
      });

      // Delete the admin record in the database
      admin.destroy()
        .then(() => {
          res.send({
            message: 'Admin was deleted successfully.'
          });
        })
        .catch(err => {
          res.status(500).send({
            message: `Error deleting Admin with id=${id}: ${err.message}`
          });
        });
    })
    .catch(err => {
      res.status(500).send({
        message: `Error retrieving Admin with id=${id}: ${err.message}`
      });
    });
};

exports.deleteAll = (req, res) => {
  Admins.findAll()
    .then(admins => {
      admins.forEach(admin => {
        // Obtén la ruta del directorio del controlador
        const controllerDir = path.dirname(__filename);

        // Construye la ruta relativa al archivo de imagen
        const imagePath = path.join(controllerDir, '../public/images', admin.filename);

        // Elimina el archivo de imagen
        fs.unlink(imagePath, (err) => {
          if (err) {
            console.error('Error al eliminar la imagen:', err);
          }
        });

        admin.destroy()
          .catch(err => {
            console.error(`Error deleting Admin with id=${admin.UID}: ${err.message}`);
          });
      });

      // Delete all admin records in the database
      return Admins.destroy({
        where: {},
        truncate: false
      });
    })
    .then(nums => {
      res.send({ message: `${nums} Admins were deleted successfully!` });
    })
    .catch(err => {
      res.status(500).send({
        message: `Some error occurred while removing all Admins: ${err.message}`
      });
    });
};
