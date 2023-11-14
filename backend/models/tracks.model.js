module.exports = (sequelize, Sequelize) => {
  const Tracks = sequelize.define("Tracks", {
    ID: {
      type: Sequelize.BIGINT,
      autoIncrement: true,
      primaryKey: true
    },
    Location: {
      type: Sequelize.DataTypes.GEOMETRY('POINT'),
      allowNull: false,
    },
    Status: {
      type: Sequelize.ENUM('stopped', 'moving')
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
