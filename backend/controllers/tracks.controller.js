const db = require("../models");
const Tracks = db.Track;
const Logs = db.Log;
const Op = db.Sequelize.Op;

const createLogEntry = async (action, trackId, adminId) => {
    try {
        const logEntry = {
            Track_ID: trackId,
            Admin_UID: adminId,
            Action: action,
        };
        await Logs.create(logEntry);
    } catch (error) {
        console.error(`Error creating log entry: ${error.message}`);
    }
};

exports.create = async (req, res) => {
    try {
        const track = {
            Location: req.body.Location,
            Status: req.body.Status,
            Speed: req.body.Speed,
            Extra: req.body.Extra,
            Vehicle_UID: req.body.Vehicle_UID,
        };

        const createdTrack = await Tracks.create(track);

        res.status(201).send({ message: "Track created successfully." });
    } catch (error) {
        console.error(error);
        res.status(500).send({
            message: error.message || "Some error occurred while creating the track.",
        });
    }
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

exports.update = async (req, res) => {
    const adminId = req.user.UID;
    const id = req.params.id;

    try {
        const updateTrack = {
            Location: req.body.Location,
            Status: req.body.Status,
            Speed: req.body.Speed,
            Extra: req.body.Extra,
            Vehicle_UID: req.body.Vehicle_UID
        };

        const track = await Tracks.findByPk(id);

        if (!track) {
            return res.status(404).send({
                message: `Cannot update Track with id=${id}. Track not found!`
            });
        }



        if (!adminId) {
            console.error(`Admin ID is undefined. Request user: ${JSON.stringify(req.user)}`);
            return res.status(500).send({
                message: `Error updating Track with id=${id}: Admin ID is undefined.`
            });
        }

        const updatedTrack = await track.update(updateTrack);
        await createLogEntry('UPDATE', updatedTrack.ID, adminId);

        res.send({
            message: `Track with id=${id} was updated successfully.`,
            updatedTrack: updatedTrack
        });
    } catch (err) {
        console.error(`Error updating Track with id=${id}: ${err.message}`);
        res.status(500).send({
            message: `Error updating Track with id=${id}: ${err.message}`
        });
    }
};


exports.delete = async (req, res) => {
    const id = req.params.id;

    try {
        const trackToDelete = await Tracks.findByPk(id);

        if (!trackToDelete) {
            return res.status(404).send({
                message: `Track with id=${id} not found.`
            });
        }

        await trackToDelete.destroy();

        res.send({
            message: 'Track was deleted successfully.'
        });
    } catch (err) {
        res.status(500).send({
            message: `Error deleting Track with id=${id}: ${err.message}`
        });
    }
};


exports.deleteAll = async (req, res) => {
    try {
        const tracks = await Tracks.findAll();

        tracks.forEach(async (track) => {
            await track.destroy();
        });

        await Tracks.destroy({
            where: {},
            truncate: false
        });

        res.send({
            message: `${tracks.length} Tracks were deleted successfully!`
        });
    } catch (err) {
        res.status(500).send({
            message: `Some error occurred while removing all Tracks: ${err.message}`
        });
    }
};
