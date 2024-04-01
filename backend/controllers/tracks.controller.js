const db = require("../models");
const Tracks = db.Track;
const Vehicles = db.Vehicle;
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

    // Convierte las coordenadas en un punto geográfico para la consulta
    const locationPoint = Sequelize.fn('ST_GeomFromText', `POINT(${clientLocation.lat} ${clientLocation.lng})`);

    // Calcula la distancia desde la ubicación del cliente hasta la ubicación de cada track
    const distance = Sequelize.fn(
        'ST_Distance_Sphere',
        Sequelize.col('Location'),
        locationPoint
    );

    console.log("SOCORROOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO", distance.args)

    try {
        const recentTracks = await db.Track.findAll({
            attributes: {
                include: [[distance, 'distance']]
            },
            include: [{
                model: db.Vehicle,
                as: 'Vehicles', // Coincide con el alias utilizado en la definición de la asociación
                where: { Vehicle: 'bicycle' },
                required: true
            }],
            where: {
                Date: {
                    [Op.gt]: timeAgo // Mayor que el tiempo calculado para 'hace X minutos'
                },
                [Op.and]: Sequelize.where(distance, { [Op.lte]: RADIUS_IN_METERS }) // Menor o igual al radio especificado
            },
            order: [[Sequelize.col('distance')]], // Ordena los resultados por distancia
            logging: console.log
        });

        console.log("LKFHBJDFHNKSJDHn", recentTracks)
        res.status(200).send({
            recentTracks: recentTracks
        })
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
            Date: req.body.Date,
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
            Vehicle_UID: req.body.Vehicle_UID,
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

// Asumiendo que tienes una función que puede calcular la diferencia de tiempo entre dos fechas
function calculateTimeDifference(startDate, endDate) {
    // Convertir las fechas a objetos Date de JavaScript
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Calcular la diferencia en milisegundos
    const differenceInMilliseconds = end.getTime() - start.getTime();

    // Convertir la diferencia a minutos
    const differenceInMinutes = differenceInMilliseconds / (1000 * 60 * 60);

    return differenceInMinutes;
}

exports.calculateTotalTime = async (req, res) => {
    try {
        const Admin_UID = req.params.Admin_UID;
        Vehicles.findAll({ where: { Admin_UID: Admin_UID } })
            .then(data => {
                if (data.length > 0) {
                    // Extraer solo los ID's de los vehículos
                    const vehicleIDs = data.map(vehicle => vehicle.UID);

                    // Para cada vehículo, encontrar todos los tracks y calcular el tiempo total
                    let totalTime = 0;
                    let promises = vehicleIDs.map(vehicleID => {
                        return Tracks.findAll({ where: { Vehicle_UID: vehicleID }, order: [['Date', 'ASC']] })
                            .then(tracks => {
                                for (let i = 0; i < tracks.length - 1; i++) {
                                    totalTime += calculateTimeDifference(tracks[i].Date, tracks[i + 1].Date);
                                }
                            });
                    });

                    // Esperar a que todas las promesas se resuelvan
                    Promise.all(promises).then(() => {
                        res.send(`${totalTime.toFixed(2)} horas`);
                    });
                } else {
                    res.status(404).send({
                        message: `No se pueden encontrar vehículos con Admin_UID=${Admin_UID}.`
                    });
                }
            })
    }
    catch (err) {
        res.status(500).send({
            message: `Some error occurred while retrieving tracks.`
        })
    }
}

exports.calculateCarTime = async (req, res) => {
    try {
        const Admin_UID = req.params.Admin_UID;
        Vehicles.findAll({ where: { Admin_UID: Admin_UID, Vehicle: 'car' } })
            .then(data => {
                if (data.length > 0) {
                    // Extraer solo los ID's de los vehículos
                    const vehicleIDs = data.map(vehicle => vehicle.UID);

                    // Para cada vehículo, encontrar todos los tracks y calcular el tiempo total
                    let totalTime = 0;
                    let promises = vehicleIDs.map(vehicleID => {
                        return Tracks.findAll({ where: { Vehicle_UID: vehicleID }, order: [['Date', 'ASC']] })
                            .then(tracks => {
                                for (let i = 0; i < tracks.length - 1; i++) {
                                    totalTime += calculateTimeDifference(tracks[i].Date, tracks[i + 1].Date);
                                }
                            });
                    });

                    // Esperar a que todas las promesas se resuelvan
                    Promise.all(promises).then(() => {
                        res.send(`${totalTime.toFixed(2)} horas`);
                    });
                } else {
                    res.status(404).send({
                        message: `No se pueden encontrar vehículos con Admin_UID=${Admin_UID}.`
                    });
                }
            })
    }
    catch (err) {
        res.status(500).send({
            message: `Some error occurred while retrieving tracks.`
        })
    }
}

exports.calculateBicycleTime = async (req, res) => {
    try {
        const Admin_UID = req.params.Admin_UID;
        Vehicles.findAll({ where: { Admin_UID: Admin_UID, Vehicle: 'bicycle' } })
            .then(data => {
                if (data.length > 0) {
                    // Extraer solo los ID's de los vehículos
                    const vehicleIDs = data.map(vehicle => vehicle.UID);

                    // Para cada vehículo, encontrar todos los tracks y calcular el tiempo total
                    let totalTime = 0;
                    let promises = vehicleIDs.map(vehicleID => {
                        return Tracks.findAll({ where: { Vehicle_UID: vehicleID }, order: [['Date', 'ASC']] })
                            .then(tracks => {
                                for (let i = 0; i < tracks.length - 1; i++) {
                                    totalTime += calculateTimeDifference(tracks[i].Date, tracks[i + 1].Date);
                                }
                            });
                    });

                    // Esperar a que todas las promesas se resuelvan
                    Promise.all(promises).then(() => {
                        res.send(`${totalTime.toFixed(2)} horas`);
                    });
                } else {
                    res.status(404).send({
                        message: `No se pueden encontrar vehículos con Admin_UID=${Admin_UID}.`
                    });
                }
            })
    }
    catch (err) {
        res.status(500).send({
            message: `Some error occurred while retrieving tracks.`
        })
    }
}

