module.exports = (sequelize, Sequelize) => {
    const Vehicles = sequelize.define("Vehicles", {
      UID: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true
      },
      Vehicle: {
        type: Sequelize.STRING
      }
    });
  
    return Vehicles;
  };
  