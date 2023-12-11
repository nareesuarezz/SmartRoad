const db = require("../models");
const Vehicles = db.Vehicle;

// Create and Save a new 
exports.create = (req, res) => {
    // Create a Vehicle
    const vehicle = {
        Vehicle: req.body.Vehicle
    };

    Vehicles.create(vehicle)
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message: err.message || "Some error occurred while creating the vehicle."
            });
        });
};

// Retrieve all Vehicles from the database.
exports.findAll = (req, res) => {
    Vehicles.findAll()
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message: err.message || "Some error occurred while retrieving all vehicles."
            });
        });
};

// Find a single Vehicle with an id
exports.findOne = (req, res) => {
    const id = req.params.id;

    Vehicles.findByPk(id)
        .then(data => {
            if (data) {
                res.send(data);
            } else {
                res.status(404).send({
                    message: `Cannot find Vehicle with id=${id}.`
                });
            }
        })
        .catch(err => {
            res.status(500).send({
                message: "Error retrieving Vehicle with id=" + id
            });
        });
};

// Update a Vehicle by the id in the request
exports.update = (req, res) => {
    const id = req.params.id;
    const updateVehicle = {
        Vehicle: req.body.Vehicle
    };

    Vehicles.findByPk(id)
        .then(vehicle => {
            if (vehicle) {
                res.send({
                    message: `Vehicle was updated successfully.`
                });
                return vehicle.update(updateVehicle);
            } else {
                res.send({
                    message: `Cannot update Vehicle with id=${id}. Maybe Vehicle was not found or req.body is empty!`
                });
            }
        })
        .catch(err => {
            res.status(500).send({
                message: "Error updating Vehicle with id=" + id
            });
        });
};

// Delete a Vehicle with the specified id in the request
exports.delete = (req, res) => {
    const id = req.params.id;

    Vehicles.findByPk(id)
        .then(vehicle => {
            if (!vehicle) {
                return res.status(404).send({
                    message: `Vehicle with id=${id} not found.`
                });
            }

            // Delete the vehicle record in the database
            vehicle.destroy()
                .then(() => {
                    res.send({
                        message: 'Vehicle was deleted successfully.'
                    });
                })
                .catch(err => {
                    res.status(500).send({
                        message: `Error deleting Vehicle with id=${id}: ${err.message}`
                    });
                });
        })
        .catch(err => {
            res.status(500).send({
                message: `Error retrieving Vehicle with id=${id}: ${err.message}`
            });
        });
};

exports.deleteAll = (req, res) => {
    Vehicles.findAll()
        .then(vehicles => {
            vehicles.forEach(vehicle => {
                // Delete the vehicle record in the database
                vehicle.destroy()
                    .catch(err => {
                        console.error(`Error deleting Vehicle with id=${vehicle.id}: ${err.message}`);
                    });
            });

            // Delete all vehicle records in the database
            return Vehicles.destroy({
                where: {},
                truncate: false
            });
        })
        .then(nums => {
            res.send({
                message: `${nums} Vehicles were deleted successfully!`
            });
        })
        .catch(err => {
            res.status(500).send({
                message: `Some error occurred while removing all Vehicles: ${err.message}`
            });
        });
};
