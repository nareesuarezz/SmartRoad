const db = require("../models");
const Routes = db.Routes;

exports.create = (req, res) => {
    const route = {
        from: req.body.from,
        to: req.body.to,
        AdminId: req.body.AdminId,
    };

    Routes.create(route)
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message: err.message || "Ocurrió un error al crear la ruta."
            });
        });
};

exports.findAll = (req, res) => {
    Routes.findAll()
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message: err.message || "Ocurrió un error al recuperar todas las rutas."
            });
        });
};

exports.findOne = (req, res) => {
    const id = req.params.id;

    Routes.findByPk(id)
        .then(data => {
            if (data) {
                res.send(data);
            } else {
                res.status(404).send({
                    message: `No se puede encontrar la ruta con id=${id}.`
                });
            }
        })
        .catch(err => {
            res.status(500).send({
                message: "Error al recuperar la ruta con id=" + id
            });
        });
};

exports.update = (req, res) => {
    const id = req.params.id;
    const updateRoute = {
        from: req.body.from,
        to: req.body.to,
        AdminId: req.body.AdminId,
    };

    Routes.findByPk(id)
        .then(route => {
            if (route) {
                res.send({
                    message: `La ruta se actualizó correctamente.`
                });
                return route.update(updateRoute);
            } else {
                res.send({
                    message: `No se puede actualizar la ruta con id=${id}. Tal vez la ruta no se encontró o req.body está vacío!`
                });
            }
        })
        .catch(err => {
            res.status(500).send({
                message: "Error al actualizar la ruta con id=" + id
            });
        });
};

exports.delete = (req, res) => {
    const id = req.params.id;

    Routes.findByPk(id)
        .then(route => {
            if (!route) {
                return res.status(404).send({
                    message: `Ruta con id=${id} no encontrada.`
                });
            }

            route.destroy()
                .then(() => {
                    res.send({
                        message: 'La ruta se eliminó correctamente.'
                    });
                })
                .catch(err => {
                    res.status(500).send({
                        message: `Error al eliminar la ruta con id=${id}: ${err.message}`
                    });
                });
        })
        .catch(err => {
            res.status(500).send({
                message: `Error al recuperar la ruta con id=${id}: ${err.message}`
            });
        });
};

exports.findByAdminId = (req, res) => {
    const adminId = req.params.AdminId
    Routes.findAll({ where: { AdminId: adminId } })
        .then(data => {
            res.send(data)
        })
        .catch(err => {
            res.status(500).send({
                message: err.message || "Ocurrió un error al recuperar las rutas"
            })
        })
};

exports.deleteAll = (req, res) => {
    Routes.findAll()
        .then(routes => {
            routes.forEach(route => {
                route.destroy()
                    .catch(err => {
                        console.error(`Error al eliminar la ruta con id=${route.id}: ${err.message}`);
                    });
            });

            return Routes.destroy({
                where: {},
                truncate: false
            });
        })
        .then(nums => {
            res.send({
                message: `${nums} Rutas se eliminaron correctamente!`
            });
        })
        .catch(err => {
            res.status(500).send({
                message: `Ocurrió un error al eliminar todas las rutas: ${err.message}`
            });
        });
};


