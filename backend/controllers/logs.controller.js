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


