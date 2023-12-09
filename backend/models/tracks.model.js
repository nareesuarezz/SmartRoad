module.exports = (sequelize, Sequelize) => {
  const Tracks = sequelize.define("Tracks", {
    ID: {
      type: Sequelize.BIGINT,
      autoIncrement: true,
      primaryKey: true
    },
    Location: {
      type: Sequelize.GEOMETRY('POINT'),
      allowNull: false,
    },
    Status: {
      type: Sequelize.ENUM('Stopped', 'Moving')
    },
    Speed: {
      type: Sequelize.DECIMAL
    },
    Extra: {
      type: Sequelize.JSON
    }
  });

  Tracks.associate = models => {
    Tracks.belongsTo(models.Vehicles, {
      foreignKey: 'Vehicle_UID',
      targetKey: 'UID',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });
  };

  return Tracks;
};
