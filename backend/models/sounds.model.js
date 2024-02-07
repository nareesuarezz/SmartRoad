module.exports = (sequelize, Sequelize) => {
    const Sounds = sequelize.define("Sounds", {
      filename: {
        type: Sequelize.STRING,
        allowNull: false,
      },
    });
  
    return Sounds;
  };
  