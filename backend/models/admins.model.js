module.exports = (sequelize, Sequelize) => {
    const Admins = sequelize.define("Admins", {
      UID: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true
      },
      Username: {
        type: Sequelize.STRING
      },
      Password: {
        type: Sequelize.STRING
      },
      filename: {
        type: Sequelize.STRING
      },
      Role: {
        type: Sequelize.ENUM('User','Admin')
      }
    });
  
    return Admins;
  };
  