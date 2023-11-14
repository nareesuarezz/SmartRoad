const db = require("../models");
const Logs = db.Log;

// Create and Save a new Log
exports.create = (req, res) => {
    // Create a Log
    const log = {
        Log_ID: req.body.Log_ID,
        Admin_UID: req.body.Admin_UID,
        Track_ID: req.body.Track_ID
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

// Update a Log by the id in the request
exports.update = (req, res) => {
    const id = req.params.id;
    const updateLog = {
        Log_ID: req.body.Log_ID,
        Admin_UID: req.body.Admin_UID,
        Track_ID: req.body.Track_ID
    };

    Logs.findByPk(id)
        .then(log => {
            if (log) {
                res.send({
                    message: `Log was updated successfully.`
                });
                return log.update(updateLog);
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

// Delete a Log with the specified id in the request
exports.delete = (req, res) => {
    const id = req.params.id;

    Logs.findByPk(id)
        .then(log => {
            if (!log) {
                return res.status(404).send({
                    message: `Log with id=${id} not found.`
                });
            }

            // Delete the log record in the database
            log.destroy()
                .then(() => {
                    res.send({
                        message: 'Log was deleted successfully.'
                    });
                })
                .catch(err => {
                    res.status(500).send({
                        message: `Error deleting Log with id=${id}: ${err.message}`
                    });
                });
        })
        .catch(err => {
            res.status(500).send({
                message: `Error retrieving Log with id=${id}: ${err.message}`
            });
        });
};

exports.deleteAll = (req, res) => {
    Logs.findAll()
        .then(logs => {
            logs.forEach(log => {
                // Delete the log record in the database
                log.destroy()
                    .catch(err => {
                        console.error(`Error deleting Log with id=${log.id}: ${err.message}`);
                    });
            });

            // Delete all log records in the database
            return Logs.destroy({
                where: {},
                truncate: false
            });
        })
        .then(nums => {
            res.send({
                message: `${nums} Logs were deleted successfully!`
            });
        })
        .catch(err => {
            res.status(500).send({
                message: `Some error occurred while removing all Logs: ${err.message}`
            });
        });
};
