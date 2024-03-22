module.exports = (sequelize, Sequelize, models) => {
  const Vehicles = sequelize.define("Vehicles", {
    UID: {
      type: Sequelize.BIGINT,
      autoIncrement: true,
      primaryKey: true
    },
    Vehicle: {
      type: Sequelize.ENUM('car', 'bicycle')
    }
  });

  Vehicles.associate = models => {
    Vehicles.belongsTo(models.Admin, {
      foreignKey: 'Admin_UID',
      targetKey: 'UID',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });
  };


  return Vehicles;
};
