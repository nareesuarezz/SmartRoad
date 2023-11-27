const db = require("../models");
const Tracks = db.Track;
const Logs = db.Log;
const Op = db.Sequelize.Op;

exports.create = (req, res) => {
    const adminId = req.user.UID;
    
    // Create a Track
    const track = {
        Location: req.body.Location,
        Status: req.body.Status,
        Speed: req.body.Speed,
        Extra: req.body.Extra,
        Vehicle_UID: req.body.Vehicle_UID,
        Admin_UID: adminId, 
    };

    // Save Track in the database
    db.Track.create(track)
        .then(data => {
            const trackId = data.ID;
            console.log("Admin ID:", adminId);
            console.log("Track ID:", trackId);

            const logEntry = {
                Track_ID: trackId,
                Admin_UID: adminId,
            };

            return Logs.create(logEntry);
        })
        .then(() => {
            res.status(201).send({ message: "Track created successfully." });
        })
        .catch(err => {
            console.error(err);
            res.status(500).send({
                message: err.message || "Some error occurred while creating the track."
            });
        });
};


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
