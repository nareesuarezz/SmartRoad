const db = require("../models");
const Admin = db.Admin;
const Op = db.Sequelize.Op;
const utils = require("../utils");
const  bcrypt  =  require('bcryptjs');

// Create and Save a new Admin
exports.create = (req, res) => {
  //Validate request
  if (!req.body.password || !req.body.username) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
    return;
  }

  // Create an Admin
  let admin = {
    Username: req.body.Username,
    Password: req.body.Password,
    filename: req.body.file ? req.body.filename : ""
  };

  Admin.findOne({ where: { username: admin.Username } })
    .then(data => {
      if (data) {
        const result = bcrypt.compareSync(admin.Password, data.Password);
        if (!result) return res.status(401).send('Password not valid!');
        const token = utils.generateToken(data);
        // get basic Admin details
        const userObj = utils.getCleanUser(data);
        // return the token along with Admin details
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

// Retrieve all Admins from the database.
exports.findAll = (req, res) => {

  Admin.findAll()
    .then(data => {
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

  Admin.findByPk(id)
    .then(data => {
      res.send(data);
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

  Admin.update(req.body, {
    where: { UID: id }
  })
    .then(num => {
      if (num == 1) {
        res.send({
          message: "Admin was updated successfully."
        });
      } else {
        res.send({
          message: `Cannot update Admin with id=${id}. Maybe Admin was not found or req.body is empty!`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Error updating Admin with id=" + id
      });
    });
};

// // Delete a Admin with the specified id in the request
exports.delete = (req, res) => {
  const id = req.params.id;

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
};

// Delete all Admin from the database.
exports.deleteAll = (req, res) => {
  Admin.destroy({
    where: {},
    truncate: false
  })
    .then(nums => {
      res.send({ message: `${nums} Admins were deleted successfully!` });
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