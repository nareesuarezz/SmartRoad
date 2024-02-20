const db = require("../models");
const Tracks = db.Track;
const Logs = db.Log;
const Op = db.Sequelize.Op;
const Sequelize = db.Sequelize;

// Variables para ajustes de desarrollo
const MINUTES_AGO = 10; // Encuentra tracks subidos en los últimos 10 minutos
const RADIUS_IN_METERS = 500; // Encuentra tracks dentro de un radio de 500 metros

exports.findRecentTracksWithinRadius = async (req, res) => {
    // Calcula el tiempo mínimo (hace X minutos desde ahora)
    const timeAgo = new Date(new Date() - MINUTES_AGO * 60000);



    const clientLocation = {
        lat: parseFloat(req.query.lat), // Asume que recibes la latitud como query param
        lng: parseFloat(req.query.lng), // Asume que recibes la longitud como query param
    };
    console.log(clientLocation)


    // Verifica que lat y lng sean números válidos
    if (isNaN(clientLocation.lat) || isNaN(clientLocation.lng)) {
        return res.status(400).send({ message: "Latitud y/o longitud inválidas." });
    }

    // Convierte las coordenadas en un punto geográfico para la consulta
    const locationPoint = Sequelize.fn('ST_GeomFromText', `POINT(${clientLocation.lng} ${clientLocation.lat})`);

    console.log(locationPoint)

    // Calcula la distancia desde la ubicación del cliente hasta la ubicación de cada track
    const distance = Sequelize.fn(
        'ST_Distance_Sphere',
        Sequelize.col('Location'),
        locationPoint
    );

    try {
        const recentTracks = await db.Track.findAll({
            attributes: {
                include: [[distance, 'distance']]
            },
            where: {
                Date: {
                    [Op.gt]: timeAgo // Mayor que el tiempo calculado para 'hace X minutos'
                },
                // Asegúrate de tener la columna Location correctamente configurada para utilizar funciones geoespaciales
                [Op.and]: Sequelize.where(distance, { [Op.lte]: RADIUS_IN_METERS }) // Menor o igual al radio especificado
            },
            order: Sequelize.col('distance'), // Ordena los resultados por distancia
            logging: console.log // Opcional: para ver la consulta generada
        });

        console.log('Tracks encontrados:', recentTracks);
        res.status(200).json(recentTracks).send({
            message: "AAAAAAAAAAAAAAAAAAAAAAAAAA"
        });
    } catch (error) {
        console.error('Error al buscar tracks recientes dentro del radio:', error);
        res.status(500).send({
            message: "Error al recuperar tracks recientes dentro del radio especificado."
        });
    }
};

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
            Date: req.body.Date
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
