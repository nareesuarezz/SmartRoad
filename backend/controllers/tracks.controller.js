const db = require("../models");
const Tracks = db.Track;
const Vehicles = db.Vehicle;
const Logs = db.Log;
const Op = db.Sequelize.Op;
const Sequelize = db.Sequelize;
const socket = require('../socket');
const _ = require('lodash'); // Importa la biblioteca lodash


// Variables para ajustes de desarrollo
const MINUTES_AGO = 10; // Encuentra tracks subidos en los últimos 10 minutos
const RADIUS_IN_METERS = 500; // Encuentra tracks dentro de un radio de 500 metros


function calculateDistance(lat1, lon1, lat2, lon2) {
    var R = 6371; // Radio de la tierra en km
    var dLat = (lat2 - lat1) * Math.PI / 180;
    var dLon = (lon2 - lon1) * Math.PI / 180;
    var a =
        0.5 - Math.cos(dLat) / 2 +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        (1 - Math.cos(dLon)) / 2;

    return R * 2 * Math.asin(Math.sqrt(a));
}

exports.processTracks = (req, res) => {
    const allTracks = req.body.allTracks;

    // Agrupa los tracks por tipo de vehículo
    const groupedTracks = groupTracksByVehicle(allTracks);

    // Transforma los tracks agrupados a GeoJSON
    const carTracksGeoJSON = tracksToGeoJSON(groupedTracks.car || []);
    const bicycleTracksGeoJSON = tracksToGeoJSON(groupedTracks.bicycle || []);

    // Devuelve las capas GeoJSON en la respuesta
    res.json({ carTracksGeoJSON, bicycleTracksGeoJSON });
};

// Función para agrupar los tracks por tipo de vehículo
function groupTracksByVehicle(tracks) {
    return tracks.reduce((grouped, track) => {
        (grouped[track.Vehicles.Vehicle] = grouped[track.Vehicles.Vehicle] || []).push(track);
        return grouped;
    }, {});
}

// Función para transformar los tracks a GeoJSON
function tracksToGeoJSON(tracks) {
    return {
        type: 'FeatureCollection',
        features: tracks.map(track => ({
            type: 'Feature',
            geometry: {
                type: 'Point',
                coordinates: track.Location.coordinates
            },
            properties: {
                trackId: track.ID,
                vehicleId: track.Vehicle_UID,
                status: track.Status,
                vehicleType: track.Vehicles.Vehicle
            }
        }))
    };
}


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

async function correctTrack(track) {
    if (!track || !Array.isArray(track.Location.coordinates) || track.Location.coordinates.length < 2) {
        console.error('Invalid track data:', track);
        return track;
    }

    const lat = track.Location.coordinates[0];
    const lon = track.Location.coordinates[1];

    try {
        const response = await axios.get(`https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lon}&apiKey=90862c7baea8498aae344555b76ab034`);

        if (response.data.features[0].properties.category !== 'road') {
            const roadAddress = response.data.features[0].properties.street;
            const roadResponse = await axios.get(`https://api.geoapify.com/v1/geocode/search?apiKey=90862c7baea8498aae344555b76ab034&text=${roadAddress}`);

            let closestRoad;
            let minDistance = Infinity;

            for (let i = 0; i < roadResponse.data.features.length; i++) {
                const road = roadResponse.data.features[i];
                const roadLat = road.geometry.coordinates[1];
                const roadLon = road.geometry.coordinates[0];
                const distance = getDistance(lat, lon, roadLat, roadLon);

                if (distance < minDistance) {
                    minDistance = distance;
                    closestRoad = road;
                }
            }

            if (closestRoad) {
                console.log('Original track location:', lat, lon);
                track.Location.coordinates[0] = closestRoad.geometry.coordinates[1];
                track.Location.coordinates[1] = closestRoad.geometry.coordinates[0];
                console.log('New track location:', track.Location.coordinates[0], track.Location.coordinates[1]);
            }
        }

        return track;
    } catch (error) {
        console.error('Error in reverse geocoding API:', error);
    }
}

function getDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radio de la tierra en km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distancia en km
    return distance;
}

function deg2rad(deg) {
    return deg * (Math.PI / 180);
}

exports.create = async (req, res) => {
    try {
        const track = {
            Location: req.body.Location,
            Status: req.body.Status,
            Speed: req.body.Speed,
            Type: req.body.Type,
            Extra: req.body.Extra,
            Vehicle_UID: req.body.Vehicle_UID,
            Date: req.body.Date,
        };

        // Buscar el último track para este vehículo
        const lastTrack = await Tracks.findOne({ where: { Vehicle_UID: track.Vehicle_UID }, order: [['createdAt', 'DESC']] });

        if (lastTrack) {
            // Calcular la distancia y el tiempo
            const distance = calculateDistance(lastTrack.Location.coordinates[0], lastTrack.Location.coordinates[1], track.Location.coordinates[0], track.Location.coordinates[1]);
            const time = (new Date(track.Date) - new Date(lastTrack.Date)) / 1000 / 60 / 60; // en horas

            // Calcular la velocidad
            const speed = distance / time;

            // Guardar la velocidad en el track
            track.Speed = speed;
        }

        const originalTrack = await Tracks.create({ ...trackData, Method: 'GPS' });


        // Emitir el evento 'trackCreated' con el track creado como dato
        const io = socket.getIo();
        io.emit('trackCreated', originalTrack);

        // Corrige el track
        const correctedTrackData = await correctTrack(trackData);

        // Crea el track corregido con el método 'Geoapify'
        const correctedTrack = await Tracks.create({ ...correctedTrackData, Method: 'Geoapify' });

        res.status(201).send({ message: "Tracks created successfully.", originalTrack, correctedTrack });
    } catch (error) {
        console.error(error);
        res.status(500).send({
            message: error.message || "Some error occurred while creating the tracks.",
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
            Type: req.body.Type,
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

exports.findTracksWithinBounds = async (req, res) => {
    const swLat = parseFloat(req.query.swLat);
    const swLng = parseFloat(req.query.swLng);
    const neLat = parseFloat(req.query.neLat);
    const neLng = parseFloat(req.query.neLng);
    const userId = req.query.userId;

    const boundsPolygon = Sequelize.fn('ST_GeomFromText', `POLYGON((${swLat} ${swLng}, ${neLat} ${swLng}, ${neLat} ${neLng}, ${swLat} ${neLng}, ${swLat} ${swLng}))`);

    try {
        let whereClause = {
            [Sequelize.Op.or]: [
                { Vehicle: 'bicycle' },
                { Vehicle: 'car' }
            ]
        };

        if (userId) {
            whereClause.Admin_UID = userId;
        }

        let tracksWithinBounds = await db.Track.findAll({
            where: Sequelize.where(
                Sequelize.fn('ST_Contains', boundsPolygon, Sequelize.col('Location')),
                true
            ),
            include: [{
                model: db.Vehicle,
                as: 'Vehicles',
                where: whereClause,
                required: true
            }],
            logging: console.log
        });

        console.log("LKFHBJDFHNKSJDHn", tracksWithinBounds)
        res.status(200).send({
            tracksWithinBounds: tracksWithinBounds
        })
    } catch (error) {
        console.error('Error al buscar tracks recientes dentro del radio:', error);
        res.status(500).send({
            message: "Error al recuperar tracks recientes dentro del radio especificado."
        });
    }
};



exports.findTracksInTimeInterval = async (req, res) => {
    // Assume you receive the start and end times as query params in ISO 8601 format
    const startTime = new Date(req.query.startTime);
    const endTime = new Date(req.query.endTime);

    try {
        let tracksInTimeInterval = await db.Track.findAll({
            where: {
                Date: {
                    [Op.gte]: startTime, // Greater than or equal to the start time
                    [Op.lte]: endTime    // Less than or equal to the end time
                }
            },
            include: [{
                model: db.Vehicle, // Use the Vehicles model
                as: 'Vehicles', // Change this to match the name of the model
                attributes: ['Vehicle'] // Include the 'Vehicle' field which contains the type of vehicle
            }],
            logging: console.log
        });

        res.status(200).send({
            tracksInTimeInterval: tracksInTimeInterval
        });
    } catch (error) {
        console.error('Error fetching tracks in time interval:', error);
        res.status(500).send({
            message: "Error retrieving tracks in the specified time interval."
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

function calculateDistance(location1, location2) {
    const R = 6371e3; // radio medio de la Tierra en metros
    const lat1 = location1[0] * Math.PI / 180; // convertir a radianes
    const lat2 = location2[0] * Math.PI / 180;
    const deltaLat = (location2[0] - location1[0]) * Math.PI / 180;
    const deltaLng = (location2[1] - location1[1]) * Math.PI / 180;

    const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
        Math.cos(lat1) * Math.cos(lat2) *
        Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const distance = R * c; // en metros
    return distance;
}

exports.calculateTotalDistance = async (req, res) => {
    const adminId = req.params.Admin_UID; // Asume que recibes el ID del administrador como parámetro

    try {
        // Encuentra todos los vehículos para el administrador dado
        const vehicles = await Vehicles.findAll({
            where: { Admin_UID: adminId }
        });

        let totalDistance = 0;
        let carDistance = 0;
        let bicycleDistance = 0;

        // Itera sobre los vehículos
        for (let vehicle of vehicles) {
            // Encuentra todos los tracks para el vehículo dado, ordenados por fecha
            const tracks = await Tracks.findAll({
                where: { Vehicle_UID: vehicle.UID },
                order: [['Date', 'ASC']]
            });

            // Itera sobre los tracks y suma la distancia entre cada par de tracks consecutivos
            for (let i = 0; i < tracks.length - 1; i++) {
                const location1 = tracks[i].Location.coordinates;
                const location2 = tracks[i + 1].Location.coordinates;
                const distance = calculateDistance(location1, location2);
                totalDistance += distance;

                // Suma la distancia al total de 'car' o 'bicycle' dependiendo del tipo de vehículo
                if (vehicle.Vehicle === 'car') {
                    carDistance += distance;
                } else if (vehicle.Vehicle === 'bicycle') {
                    bicycleDistance += distance;
                }
            }
        }

        res.status(200).send({
            totalDistance: totalDistance,
            carDistance: carDistance,
            bicycleDistance: bicycleDistance
        });
    } catch (error) {
        console.error(`Error al calcular la distancia total: ${error.message}`);
        res.status(500).send({
            message: `Error al calcular la distancia total: ${error.message}`
        });
    }
};

exports.getLastJourney = async (req, res) => {
    try {
        const adminId = req.params.Admin_UID; // Asume que recibes el ID del administrador como parámetro

        // Busca todos los vehículos del administrador
        const vehicles = await Vehicles.findAll({
            where: { Admin_UID: adminId }
        });

        if (!vehicles || vehicles.length === 0) {
            return res.status(404).json({ message: 'No se encontró ningún vehículo para este administrador' });
        }

        let allTracks = [];

        // Itera sobre los vehículos del administrador y busca los tracks para cada uno
        for (let vehicle of vehicles) {
            const tracks = await Tracks.findAll({
                where: { Vehicle_UID: vehicle.UID },
                order: [['Date', 'ASC']]
            });

            allTracks = allTracks.concat(tracks);
        }

        let journeys = [];
        let currentJourney = [allTracks[0]];

        // Itera sobre los tracks del usuario
        for (let i = 1; i < allTracks.length; i++) {
            const currentTrack = allTracks[i];
            const previousTrack = allTracks[i - 1];

            // Calcula la diferencia de tiempo entre el track actual y el anterior
            const timeDifference = (new Date(currentTrack.Date) - new Date(previousTrack.Date)) / 1000;

            // Si la diferencia de tiempo es mayor a 5 segundos, considera que es un nuevo viaje
            if (timeDifference > 5) {
                journeys.push(currentJourney);
                currentJourney = [currentTrack];
            } else {
                currentJourney.push(currentTrack);
            }
        }

        // Asegúrate de agregar el último viaje
        journeys.push(currentJourney);

        // Obtiene el último viaje
        const lastJourney = journeys[journeys.length - 1];

        // Obtiene el primer y último track del último viaje
        const firstTrack = lastJourney[0];
        const lastTrack = lastJourney[lastJourney.length - 1];

        return res.json({ firstTrack, lastTrack });
    } catch (error) {
        console.error(`Error al buscar el último viaje: ${error}`);
        return res.status(500).json({ message: 'Hubo un error al buscar el último viaje' });
    }
};
