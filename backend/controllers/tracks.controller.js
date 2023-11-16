const db = require("../models");
const Tracks = db.Track;
const Op = db.Sequelize.Op;

// Create and Save a new Track
exports.create = (req, res) => {
    // Create a Track
    const track = {
        Location: req.body.Location,
        Status: req.body.Status,
        Speed: req.body.Speed,
        Extra: req.body.Extra,
        Vehicle_UID: req.body.Vehicle_UID
    };

    // Save Track in the database
    Tracks.create(track)
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message: err.message || "Some error occurred while creating the track."
            });
        });
};

// Retrieve all Tracks from the database.
exports.findAll = (req, res) => {
    Tracks.findAll()
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message: err.message || "Some error occurred while retrieving all tracks."
            });
        });
};

// Find a single Track with an id
exports.findOne = (req, res) => {
    const id = req.params.id;

    Tracks.findByPk(id)
        .then(data => {
            if (data) {
                res.send(data);
            } else {
                res.status(404).send({
                    message: `Cannot find Track with id=${id}.`
                });
            }
        })
        .catch(err => {
            res.status(500).send({
                message: "Error retrieving Track with id=" + id
            });
        });
};

// Update a Track by the id in the request
exports.update = (req, res) => {
    const id = req.params.id;
    const updateTrack = {
        Location: req.body.Location,
        Status: req.body.Status,
        Speed: req.body.Speed,
        Extra: req.body.Extra,
        Vehicle_UID: req.body.Vehicle_UID
    };

    Tracks.findByPk(id)
        .then(track => {
            if (!track) {
                return res.status(404).send({
                    message: `Cannot update Track with id=${id}. Track not found!`
                });
            }

            return track.update(updateTrack);
        })
        .then(updatedTrack => {
            res.send({
                message: `Track with id=${id} was updated successfully.`,
                updatedTrack: updatedTrack
            });
        })
        .catch(err => {
            res.status(500).send({
                message: `Error updating Track with id=${id}: ${err.message}`
            });
        });
};


// Delete a Track with the specified id in the request
exports.delete = (req, res) => {
    const id = req.params.id;

    Tracks.findByPk(id)
        .then(track => {
            if (!track) {
                return res.status(404).send({
                    message: `Track with id=${id} not found.`
                });
            }

            // Delete the track record in the database
            track.destroy()
                .then(() => {
                    res.send({
                        message: 'Track was deleted successfully.'
                    });
                })
                .catch(err => {
                    res.status(500).send({
                        message: `Error deleting Track with id=${id}: ${err.message}`
                    });
                });
        })
        .catch(err => {
            res.status(500).send({
                message: `Error retrieving Track with id=${id}: ${err.message}`
            });
        });
};

exports.deleteAll = (req, res) => {
    Tracks.findAll()
        .then(tracks => {
            tracks.forEach(track => {
                // Delete the track record in the database
                track.destroy()
                    .catch(err => {
                        console.error(`Error deleting Track with id=${track.id}: ${err.message}`);
                    });
            });

            // Delete all track records in the database
            return Tracks.destroy({
                where: {},
                truncate: false
            });
        })
        .then(nums => {
            res.send({
                message: `${nums} Tracks were deleted successfully!`
            });
        })
        .catch(err => {
            res.status(500).send({
                message: `Some error occurred while removing all Tracks: ${err.message}`
            });
        });
};
