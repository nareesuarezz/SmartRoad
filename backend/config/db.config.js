const Sequelize = require("sequelize");

module.exports = {
  HOST: process.env.MYSQL_ADDON_HOST,
  USER: process.env.MYSQL_ADDON_USER,
  PASSWORD: process.env.MYSQL_ADDON_PASSWORD,
  DB: process.env.MYSQL_ADDON_DB,
  dialect: "mysql",
  dialectModule: require('mysql2'),
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
};

const sequelize = new Sequelize(module.exports.DB, module.exports.USER, module.exports.PASSWORD, {
  host: module.exports.HOST,
  dialect: module.exports.dialect,
  dialectModule: module.exports.dialectModule,
  pool: module.exports.pool
});

sequelize.authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });
