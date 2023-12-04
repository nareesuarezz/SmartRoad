const db = require("../models");
const Logs = db.Log;

// Create and Save a new Log
exports.create = (req, res) => {
    // Create a Log
    const log = {
        Log_ID: req.body.Log_ID,
        Admin_UID: req.body.Admin_UID,
        Track_ID: req.body.Track_ID,
        Action: req.body.Action
    };

    // Save Log in the database
    Logs.create(log)
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message: err.message || "Some error occurred while creating the log."
            });
        });
};

// Retrieve all Logs from the database.
exports.findAll = (req, res) => {
    Logs.findAll()
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message: err.message || "Some error occurred while retrieving all logs."
            });
        });
};

// Find a single Log with an id
exports.findOne = (req, res) => {
    const id = req.params.id;

    Logs.findByPk(id)
        .then(data => {
            if (data) {
                res.send(data);
            } else {
                res.status(404).send({
                    message: `Cannot find Log with id=${id}.`
                });
            }
        })
        .catch(err => {
            res.status(500).send({
                message: "Error retrieving Log with id=" + id
            });
        });
};
// Update a Log by the ID in the request
exports.update = (req, res) => {
    const id = req.params.id;
  
    Logs.update(req.body, {
      where: { Log_ID: id }
    })
      .then(num => {
        if (num == 1) {
          res.send({
            message: "Log was updated successfully."
          });
        } else {
          res.send({
            message: `Cannot update Log with id=${id}. Maybe Log was not found or req.body is empty!`
          });
        }
      })
      .catch(err => {
        res.status(500).send({
          message: "Error updating Log with id=" + id
        });
      });
  };
  
  // Delete a Log with the specified ID in the request
  exports.delete = (req, res) => {
    const id = req.params.id;
  
    Logs.destroy({
      where: { Log_ID: id }
    })
      .then(num => {
        if (num == 1) {
          res.send({
            message: "Log was deleted successfully."
          });
        } else {
          res.send({
            message: `Cannot delete Log with id=${id}. Maybe Log was not found!`
          });
        }
      })
      .catch(err => {
        res.status(500).send({
          message: "Could not delete Log with id=" + id
        });
      });
  };
  
  // Delete all Logs from the database
  exports.deleteAll = (req, res) => {
    Logs.destroy({
      where: {},
      truncate: false
    })
      .then(nums => {
        res.send({ message: `${nums} Logs were deleted successfully.` });
      })
      .catch(err => {
        res.status(500).send({
          message: err.message || "Some error occurred while removing all logs."
        });
      });
  };


