const dbConfig = require("../config/db.config");
const Sequelize = require("sequelize");

const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  dialect: dbConfig.dialect,
  operatorsAliases: false,

  pool: {
    max: dbConfig.pool.max,
    min: dbConfig.pool.min,
    acquire: dbConfig.pool.acquire,
    idle: dbConfig.pool.idle
  }
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Importar y asociar todos los modelos
db.Vehicle = require("./vehicles.model.js")(sequelize, Sequelize);
db.Track = require("./tracks.model.js")(sequelize, Sequelize);
db.Admin = require("./admins.model.js")(sequelize, Sequelize);
db.Log = require("./logs.model.js")(sequelize, Sequelize);
db.Subscription = require("./subscription.model.js")(sequelize, Sequelize);

db.Log.belongsTo(db.Admin, { foreignKey: 'Admin_UID' });
db.Log.belongsTo(db.Track, { foreignKey: 'Track_ID' });
db.Track.belongsTo(db.Vehicle, { foreignKey: 'Vehicle_UID' });

module.exports = db;
