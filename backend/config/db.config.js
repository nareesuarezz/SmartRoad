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

sequelize.authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });
